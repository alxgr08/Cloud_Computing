/**
 * MS3 — Reseñas
 * Gestiona reseñas de libros.
 *
 * IMPORTANTE: En el API Gateway de AWS, MS3 está montado en la raíz,
 * NO bajo el prefijo /ms3. Verificado en vivo:
 *   GET /resenas        → 200 ✔
 *   GET /health         → 200 {"status":"ok","vm":"vm2"} ✔
 *   GET /ms3/resenas    → 404 ✖
 *   GET /ms3/health     → 404 ✖
 * Swagger: https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms3/docs
 */

import apiClient from './apiClient'

// Prefijo vacío: MS3 responde en la raíz del API Gateway.
const P = ''

// ── Health ────────────────────────────────────────────────────────────────────

/** Health check — GET /resenas (MS3 montado en raíz). */
export const healthCheck = () => apiClient.get(`${P}/resenas`)

// ── Reseñas ───────────────────────────────────────────────────────────────────

/** [Rúbrica MS3 · GET] Lista todas las reseñas. */
export const getResenas = () => apiClient.get(`${P}/resenas`)

/** Obtiene una reseña por su ID. */
export const getResenaById = (id) => apiClient.get(`${P}/resenas/${id}`)

/** Reseñas filtradas por libro. */
export const getResenasPorLibro = (libroId) => apiClient.get(`${P}/resenas/libro/${libroId}`)

/** Reseñas filtradas por cliente. */
export const getResenasPorCliente = (clienteId) => apiClient.get(`${P}/resenas/cliente/${clienteId}`)

/** Rating promedio de un libro. */
export const getStatsLibro = (libroId) => apiClient.get(`${P}/resenas/stats/libro/${libroId}`)

/** [Rúbrica MS3 · POST] Crea una nueva reseña. */
export const createResena = (data) => apiClient.post(`${P}/resenas`, data)

/** Actualiza una reseña existente (PATCH según Swagger de MS3). */
export const updateResena = (id, data) => apiClient.patch(`${P}/resenas/${id}`, data)

/** Elimina una reseña por su ID. */
export const deleteResena = (id) => apiClient.delete(`${P}/resenas/${id}`)
