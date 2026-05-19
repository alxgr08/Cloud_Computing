/**
 * MS1 — Catálogo (servicio con patrón objeto)
 * API Gateway: SIN prefijo /ms1.
 * Rutas reales confirmadas: /libros, /autores, /generos, /editoriales
 *   GET /libros?limit=3 ✔  GET /autores?limit=3 ✔  GET /generos ✔
 * Swagger: https://6ksot1au1c.execute-api.us-east-1.amazonaws.com/ms1/docs
 */
import { apiRequest } from './apiClient'

/** Construye query string desde un objeto, omitiendo valores null/vacíos. */
function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return entries.length
    ? '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    : ''
}

export const catalogoService = {
  /** Health check — GET /libros?limit=1 */
  healthCheck:     ()          => apiRequest(`/libros?limit=1`),

  /** [Rúbrica MS1 · GET] Lista libros. Acepta params: { limit, skip }. */
  getLibros:       (params)    => apiRequest(`/libros${qs(params)}`),

  /** Obtiene un libro por ID. */
  getLibroById:    (id)        => apiRequest(`/libros/${id}`),

  /** [Rúbrica MS1 · POST] Crea un nuevo libro. */
  createLibro:     (data)      => apiRequest(`/libros`, { method: 'POST',  body: JSON.stringify(data) }),

  /** Actualiza un libro existente (PATCH). */
  updateLibro:     (id, data)  => apiRequest(`/libros/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  /** Elimina un libro por ID. */
  deleteLibro:     (id)        => apiRequest(`/libros/${id}`, { method: 'DELETE' }),

  /** Lista autores. Acepta params: { limit, skip }. */
  getAutores:      (params)    => apiRequest(`/autores${qs(params)}`),

  /** Lista géneros. */
  getGeneros:      ()          => apiRequest(`/generos`),

  /** Lista editoriales. Acepta params: { limit, skip }. */
  getEditoriales:  (params)    => apiRequest(`/editoriales${qs(params)}`),
}
