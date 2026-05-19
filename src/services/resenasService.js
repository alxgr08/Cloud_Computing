/**
 * MS3 — Reseñas (servicio con patrón objeto)
 * API Gateway: SIN prefijo /ms3.
 * Rutas reales confirmadas:
 *   GET /resenas?libro_id=1 ✔  GET /resenas/{id} ✔
 *   GET /ms3/resenas ✖ (404)
 * Swagger: https://6ksot1au1c.execute-api.us-east-1.amazonaws.com/ms3/docs
 */
import { apiRequest } from './apiClient'

/** Construye query string desde un objeto, omitiendo valores null/vacíos. */
function qs(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '')
  return entries.length
    ? '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&')
    : ''
}

export const resenasService = {
  /** Health check — GET /resenas?limit=1 */
  healthCheck:          ()              => apiRequest(`/resenas?limit=1`),

  /** [Rúbrica MS3 · GET] Lista reseñas. Acepta params: { libro_id, cliente_id, rating, limit, skip }. */
  getResenas:           (params)        => apiRequest(`/resenas${qs(params)}`),

  /** Obtiene una reseña por ID. */
  getResenaById:        (id)            => apiRequest(`/resenas/${id}`),

  /** Reseñas filtradas por libro. */
  getResenasPorLibro:   (libroId)       => apiRequest(`/resenas/libro/${libroId}`),

  /** Reseñas filtradas por cliente. */
  getResenasPorCliente: (clienteId)     => apiRequest(`/resenas/cliente/${clienteId}`),

  /** Rating promedio de un libro. */
  getStatsLibro:        (libroId)       => apiRequest(`/resenas/stats/libro/${libroId}`),

  /** [Rúbrica MS3 · POST] Crea una nueva reseña. */
  createResena:         (data)          => apiRequest(`/resenas`,        { method: 'POST',  body: JSON.stringify(data) }),

  /** Actualiza una reseña existente (PATCH). */
  updateResena:         (id, data)      => apiRequest(`/resenas/${id}`,  { method: 'PATCH', body: JSON.stringify(data) }),

  /** Elimina una reseña por ID. */
  deleteResena:         (id)            => apiRequest(`/resenas/${id}`,  { method: 'DELETE' }),
}
