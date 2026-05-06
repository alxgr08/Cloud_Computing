/**
 * MS1 — Catálogo
 * API Gateway: SIN prefijo /ms1.
 * Rutas reales confirmadas: /libros, /autores, /generos, /editoriales
 *   GET /libros?limit=3 ✔  GET /autores?limit=3 ✔  GET /generos ✔
 * Swagger: https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms1/docs
 */

import apiClient, { apiRequest } from './apiClient'

/** Construye query string desde un objeto, omitiendo valores null/vacíos. */
function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return entries.length
    ? '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    : ''
}

// ── Health ────────────────────────────────────────────────────────────────────

/** Health check — GET /libros?limit=1 */
export const healthCheck = () => apiClient.get(`/libros?limit=1`)

// ── Libros ────────────────────────────────────────────────────────────────────

/** [Rúbrica MS1 · GET] Lista libros. Acepta params: { limit, skip }. */
export const getLibros = (params) => apiRequest(`/libros${qs(params)}`)

/** Obtiene un libro por su ID. */
export const getLibroById = (id) => apiClient.get(`/libros/${id}`)

/** [Rúbrica MS1 · POST] Crea un nuevo libro. */
export const createLibro = (data) => apiClient.post(`/libros`, data)

/** Actualiza los datos de un libro existente (PATCH). */
export const updateLibro = (id, data) => apiClient.patch(`/libros/${id}`, data)

/** Elimina un libro por su ID. */
export const deleteLibro = (id) => apiClient.delete(`/libros/${id}`)

// ── Autores ───────────────────────────────────────────────────────────────────

/** Lista autores. Acepta params: { limit, skip }. */
export const getAutores = (params) => apiRequest(`/autores${qs(params)}`)

/** Obtiene un autor por su ID. */
export const getAutorById = (id) => apiClient.get(`/autores/${id}`)

/** Crea un nuevo autor. */
export const createAutor = (data) => apiClient.post(`/autores`, data)

// ── Géneros ───────────────────────────────────────────────────────────────────

/** Lista todos los géneros literarios. */
export const getGeneros = () => apiClient.get(`/generos`)

// ── Editoriales ───────────────────────────────────────────────────────────────

/** Lista todas las editoriales. */
export const getEditoriales = (params) => apiRequest(`/editoriales${qs(params)}`)
