/**
 * Cliente HTTP centralizado para el API Gateway de BiblioMercado.
 * Todas las llamadas al backend deben pasar por este módulo.
 *
 * Variable de entorno requerida:
 *   VITE_API_BASE_URL=https://47c36x353h.execute-api.us-east-1.amazonaws.com
 */

// Elimina la barra final de BASE_URL para no producir doble slash.
const BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  'https://47c36x353h.execute-api.us-east-1.amazonaws.com'
).replace(/\/$/, '')

/** Timeout por defecto (30 s). Se puede sobreescribir por petición con la opción timeoutMs. */
const DEFAULT_TIMEOUT_MS = 30_000

const isDev = import.meta.env.DEV

/**
 * Ejecuta una petición HTTP contra el API Gateway.
 * Lanza un error descriptivo (nunca el objeto crudo) ante cualquier fallo.
 *
 * @param {string} path  - Ruta relativa, ej. "/ms1/libros/"
 * @param {object} options - Opciones fetch + opción extra `timeoutMs`
 */
async function request(path, options = {}) {
  // Asegura slash inicial en path para evitar doble slash o ruta relativa mal formada.
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${BASE_URL}${normalizedPath}`
  const method = (options.method || 'GET').toUpperCase()

  // Extrae timeoutMs de las opciones antes de pasarlas a fetch.
  const { timeoutMs: customTimeout, ...fetchOptions } = options
  const timeoutMs = customTimeout ?? DEFAULT_TIMEOUT_MS

  // Solo se envía Content-Type cuando hay body para evitar preflight CORS innecesario en GET/DELETE.
  const headers = {
    Accept: 'application/json',
    ...(fetchOptions.headers || {}),
  }
  if (fetchOptions.body) {
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  if (isDev) {
    console.log(`[apiClient] → ${method} ${url}${fetchOptions.body ? ` BODY: ${String(fetchOptions.body).slice(0, 200)}` : ''}`)
  }

  let response
  try {
    response = await fetch(url, {
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })
  } catch (networkError) {
    clearTimeout(timeoutId)
    if (networkError.name === 'AbortError') {
      const err = new Error(`Timeout: el servicio no respondió en ${timeoutMs / 1000} s.`)
      err.type = 'TIMEOUT'
      err.url = url
      err.method = method
      if (isDev) console.warn(`[apiClient] TIMEOUT (${timeoutMs / 1000}s) → ${method} ${url}`)
      throw err
    }

    // Detectar posible Mixed Content: ocurre cuando API Gateway redirige a http://ALB
    // y el navegador bloquea la petición porque la página está en HTTPS.
    // En JS no se puede obtener la URL de redirección, pero podemos dar el hint.
    const isFromHttps = typeof window !== 'undefined' && window.location?.protocol === 'https:'
    const netMsg = networkError?.message || ''
    const isMixedContent = isFromHttps && (
      netMsg.toLowerCase().includes('mixed') ||
      netMsg.toLowerCase().includes('blocked') ||
      netMsg.toLowerCase().includes('insecure')
    )

    const isMutating = ['POST', 'PUT', 'PATCH'].includes(method)

    let friendlyMessage
    if (isMixedContent) {
      friendlyMessage =
        `Contenido mixto bloqueado (${method} ${url}). ` +
        `El API Gateway puede estar redirigiendo a un endpoint HTTP (ALB). ` +
        `Desde Amplify (HTTPS) el navegador bloquea esas redirecciones. Requiere corrección en backend/API Gateway.`
    } else if (isMutating) {
      friendlyMessage =
        `Solicitud bloqueada por CORS o preflight (${method} ${url}). ` +
        `El API Gateway/backend no permite este método desde este origen. ` +
        `Revisa Access-Control-Allow-Origin y Access-Control-Allow-Methods.`
    } else {
      friendlyMessage =
        `No se pudo conectar con el servidor (${method} ${url}). ` +
        `Causas posibles: CORS bloqueado, Mixed Content (redirect a HTTP/ALB), o servicio inaccesible.`
    }

    const err = new Error(friendlyMessage)
    err.type = isMixedContent ? 'MIXED_CONTENT' : (isMutating ? 'CORS_OR_NETWORK' : 'NETWORK')
    err.url = url
    err.method = method
    err.isMixedContent = isMixedContent
    if (isDev) {
      console.error(
        `[apiClient] NETWORK ERROR → ${method} ${url}`,
        networkError.message,
        isMixedContent ? '(posible Mixed Content / HTTP ALB redirect)' : ''
      )
    }
    throw err
  }

  clearTimeout(timeoutId)

  if (isDev) {
    console.log(`[apiClient] ← ${method} ${response.status} ${url}`)
  }

  if (!response.ok) {
    let body = ''
    try {
      body = await response.text()
    } catch {
      // ignorar
    }
    let message
    if (response.status === 404)      message = `Recurso no encontrado (404): ${method} ${url}`
    else if (response.status === 422)  message = 'Los datos enviados no son válidos (422). Revisa los campos del formulario.'
    else if (response.status === 403)  message = 'Acceso denegado (403). Verifica permisos o CORS en API Gateway.'
    else if (response.status >= 500)   message = 'Error interno del servidor. Intenta más tarde.'
    else                               message = `Error ${response.status}: ${response.statusText} (${method} ${url})`

    const err = new Error(message)
    err.status = response.status
    err.url = url
    err.method = method
    err.body = body.slice(0, 500)
    err.type = 'HTTP'
    if (isDev) console.error(`[apiClient] HTTP ${response.status} → ${method} ${url}`, body.slice(0, 300))
    throw err
  }

  // Respuesta vacía (204 No Content)
  if (response.status === 204) return null

  const text = await response.text()
  if (!text || !text.trim()) return null

  if (isDev) {
    console.log(`[apiClient] BODY ← ${url}:`, text.slice(0, 300) + (text.length > 300 ? '…' : ''))
  }
  if (!text || !text.trim()) return null

  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

const apiClient = {
  get:    (path)       => request(path, { method: 'GET' }),
  post:   (path, body) => request(path, { method: 'POST',   body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT',    body: JSON.stringify(body) }),
  patch:  (path, body) => request(path, { method: 'PATCH',  body: JSON.stringify(body) }),
  delete: (path)       => request(path, { method: 'DELETE' }),
}

/**
 * Alias funcional compatible con el patrón de la guía del proyecto.
 * Permite importar: import { apiRequest } from "./apiClient"
 */
export async function apiRequest(endpoint, options = {}) {
  return request(endpoint, options)
}

export default apiClient
