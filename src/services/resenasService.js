/**
 * MS3 — Reseñas (servicio con patrón objeto)
 * Swagger: /ms3/docs
 *
 * IMPORTANTE: En el API Gateway de AWS, MS3 está montado en la raíz,
 * NO bajo el prefijo /ms3. Verificado en vivo:
 *   GET /resenas        → 200 ✔
 *   GET /health         → 200 {"status":"ok","vm":"vm2"} ✔
 *   GET /ms3/resenas    → 404 ✖
 *   GET /ms3/health     → 404 ✖
 */
import { apiRequest } from './apiClient'

// Prefijo vacío: MS3 responde en la raíz del API Gateway.
const MS3_PREFIX = ''

export const resenasService = {
  /** Health check — GET /resenas (MS3 montado en raíz, no en /ms3). */
  healthCheck:          ()              => apiRequest(`${MS3_PREFIX}/resenas`),

  /** [Rúbrica MS3 · GET] Lista todas las reseñas. */
  getResenas:           ()              => apiRequest(`${MS3_PREFIX}/resenas`),

  /** Obtiene una reseña por ID. */
  getResenaById:        (id)            => apiRequest(`${MS3_PREFIX}/resenas/${id}`),

  /** Reseñas filtradas por libro. */
  getResenasPorLibro:   (libroId)       => apiRequest(`${MS3_PREFIX}/resenas/libro/${libroId}`),

  /** Reseñas filtradas por cliente. */
  getResenasPorCliente: (clienteId)     => apiRequest(`${MS3_PREFIX}/resenas/cliente/${clienteId}`),

  /** Rating promedio de un libro. */
  getStatsLibro:        (libroId)       => apiRequest(`${MS3_PREFIX}/resenas/stats/libro/${libroId}`),

  /** [Rúbrica MS3 · POST] Crea una nueva reseña. */
  createResena:         (data)          => apiRequest(`${MS3_PREFIX}/resenas`,       { method: 'POST',  body: JSON.stringify(data) }),

  /** Actualiza una reseña existente (PATCH según Swagger de MS3). */
  updateResena:         (id, data)      => apiRequest(`${MS3_PREFIX}/resenas/${id}`,  { method: 'PATCH', body: JSON.stringify(data) }),

  /** Elimina una reseña por ID. */
  deleteResena:         (id)            => apiRequest(`${MS3_PREFIX}/resenas/${id}`,  { method: 'DELETE' }),
}
