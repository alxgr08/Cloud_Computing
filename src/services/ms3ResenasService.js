/**
 * MS3 — Reseñas
 * Gestiona reseñas de libros.
 *
 * Prefijo de ruta: /ms3
 * Endpoints: /resenas
 * Swagger:   https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms3/docs
 */

import apiClient from './apiClient'

const P = '/ms3'

// ── Reseñas ───────────────────────────────────────────────────────────────────

/** [Rúbrica MS3 · GET] Lista todas las reseñas. */
export const getResenas = () => apiClient.get(`${P}/resenas`)

/** Obtiene una reseña por su ID. */
export const getResenaById = (id) => apiClient.get(`${P}/resenas/${id}`)

/** [Rúbrica MS3 · POST] Crea una nueva reseña. */
export const createResena = (data) => apiClient.post(`${P}/resenas`, data)

/** Actualiza una reseña existente. */
export const updateResena = (id, data) => apiClient.put(`${P}/resenas/${id}`, data)

/** Elimina una reseña por su ID. */
export const deleteResena = (id) => apiClient.delete(`${P}/resenas/${id}`)
