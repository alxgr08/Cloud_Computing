/**
 * MS3 — Reseñas (servicio con patrón objeto)
 * Prefijo: /ms3  |  Swagger: /ms3/docs
 */
import { apiRequest } from './apiClient'

const MS3_PREFIX = '/ms3'

export const resenasService = {
  /** [Rúbrica MS3 · GET] Lista todas las reseñas. */
  getResenas:     ()          => apiRequest(`${MS3_PREFIX}/resenas`),

  /** Obtiene una reseña por ID. */
  getResenaById:  (id)        => apiRequest(`${MS3_PREFIX}/resenas/${id}`),

  /** [Rúbrica MS3 · POST] Crea una nueva reseña. */
  createResena:   (data)      => apiRequest(`${MS3_PREFIX}/resenas`,     { method: 'POST',   body: JSON.stringify(data) }),

  /** Actualiza una reseña existente. */
  updateResena:   (id, data)  => apiRequest(`${MS3_PREFIX}/resenas/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),

  /** Elimina una reseña por ID. */
  deleteResena:   (id)        => apiRequest(`${MS3_PREFIX}/resenas/${id}`, { method: 'DELETE' }),
}
