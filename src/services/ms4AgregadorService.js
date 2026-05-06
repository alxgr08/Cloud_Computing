/**
 * MS4 — Agregador
 * API Gateway: SIN prefijo /ms4.
 * Rutas reales (diagnóstico 2026-05):
 *   GET /detalle-libro/1       ✔  (healthCheck)
 *   GET /ms4/detalle-libro/1   ✔
 *   GET /perfil-cliente/1      ✖ 404
 *   GET /ms4/perfil-cliente/1  ✖ 404
 *   GET /catalogo-con-stats    ✖ 503 / error interno
 * Swagger: https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms4/docs
 */

import apiClient, { apiRequest } from './apiClient'

/** Health check — GET /detalle-libro/1 */
export const healthCheck = () => apiClient.get(`/detalle-libro/1`)

/** [Rúbrica MS4 · GET] Catálogo enriquecido con estadísticas (timeout extendido a 45 s). */
export const getCatalogoConStats = () =>
  apiRequest(`/catalogo-con-stats`, { timeoutMs: 45_000 })

/** [Rúbrica MS4 · GET] Detalle completo de un libro (datos + autor + reseñas + stats). */
export const getDetalleLibro = (id) => apiClient.get(`/detalle-libro/${id}`)

/** Perfil completo de un cliente (datos + pedidos + reseñas). */
export const getPerfilCliente = (id) => apiClient.get(`/perfil-cliente/${id}`)

/** Resumen completo de un pedido con datos del cliente y libros. */
export const getResumenPedido = (id) => apiClient.get(`/resumen-pedido/${id}`)
