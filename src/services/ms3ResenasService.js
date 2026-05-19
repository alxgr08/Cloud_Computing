/**
 * MS3 — Reseñas
 * API Gateway: SIN prefijo /ms3.
 * Rutas reales confirmadas:
 *   GET /resenas?libro_id=1 ✔  GET /resenas/{id} ✔
 *   GET /ms3/resenas ✖ (404)
 * Swagger: https://6ksot1au1c.execute-api.us-east-1.amazonaws.com/ms3/docs
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

/** Health check — GET /resenas?limit=1 */
export const healthCheck = () => apiClient.get(`/resenas?limit=1`)

// ── Reseñas ───────────────────────────────────────────────────────────────────

/** [Rúbrica MS3 · GET] Lista reseñas. Acepta params: { libro_id, cliente_id, rating, limit, skip }. */
export const getResenas = (params) => apiRequest(`/resenas${qs(params)}`)

/** Obtiene una reseña por su ID. */
export const getResenaById = (id) => apiClient.get(`/resenas/${id}`)

/** Reseñas filtradas por libro. */
export const getResenasPorLibro = (libroId) => apiClient.get(`/resenas/libro/${libroId}`)

/** Reseñas filtradas por cliente. */
export const getResenasPorCliente = (clienteId) => apiClient.get(`/resenas/cliente/${clienteId}`)

/** Rating promedio de un libro. */
export const getStatsLibro = (libroId) => apiClient.get(`/resenas/stats/libro/${libroId}`)

/** [Rúbrica MS3 · POST] Crea una nueva reseña. */
export const createResena = (data) => apiClient.post(`/resenas`, data)

/** Actualiza una reseña existente (PATCH). */
export const updateResena = (id, data) => apiClient.patch(`/resenas/${id}`, data)

/** Elimina una reseña por su ID. */
export const deleteResena = (id) => apiClient.delete(`/resenas/${id}`)
