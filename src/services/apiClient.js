/**
 * Cliente HTTP centralizado para el API Gateway de BiblioMercado.
 * Todas las llamadas al backend deben pasar por este módulo.
 *
 * Variable de entorno requerida:
 *   VITE_API_BASE_URL=https://47c36x353h.execute-api.us-east-1.amazonaws.com
 */

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://47c36x353h.execute-api.us-east-1.amazonaws.com'

/** Tiempo máximo de espera por petición antes de abortar (15 s). */
const TIMEOUT_MS = 15_000

const isDev = import.meta.env.DEV

/**
 * Ejecuta una petición HTTP contra el API Gateway.
 * Lanza un error descriptivo (nunca el objeto crudo) ante cualquier fallo.
 *
 * @param {string} path  - Ruta relativa, ej. "/ms1/libros/"
 * @param {RequestInit} options - Opciones fetch adicionales
 */
async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const method = (options.method || 'GET').toUpperCase()

  // Solo se envía Content-Type cuando hay body para evitar preflight CORS innecesario en GET/DELETE.
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  }
  if (options.body) {
    headers['Content-Type'] = 'application/json'
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS)

  if (isDev) {
    console.log(`[apiClient] → ${method} ${url}`)
  }

  let response
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (networkError) {
    clearTimeout(timeoutId)
    if (networkError.name === 'AbortError') {
      const err = new Error(`Timeout: el servicio no respondió en ${TIMEOUT_MS / 1000} s.`)
      err.type = 'TIMEOUT'
      if (isDev) console.warn(`[apiClient] TIMEOUT → ${url}`)
      throw err
    }
    // Error de red o CORS
    const err = new Error(
      'No se pudo conectar con el servidor. Verifica tu conexión o que el servicio esté disponible.'
    )
    err.type = 'NETWORK'
    if (isDev) console.error(`[apiClient] NETWORK ERROR → ${url}`, networkError)
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
    if (response.status === 404)      message = 'Recurso no encontrado (404).'
    else if (response.status === 422)  message = 'Los datos enviados no son válidos (422).'
    else if (response.status >= 500)   message = 'Error interno del servidor. Intenta más tarde.'
    else                               message = `Error ${response.status}: ${response.statusText}`

    const err = new Error(message)
    err.status = response.status
    err.body = body
    err.type = 'HTTP'
    if (isDev) console.error(`[apiClient] HTTP ${response.status} → ${url}`, body)
    throw err
  }

  // Respuesta vacía (204 No Content, etc.)
  const text = await response.text()
  if (isDev && text) {
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
