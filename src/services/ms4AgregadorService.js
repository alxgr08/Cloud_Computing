/**
 * MS4 — Agregador
 * API Gateway: SIN prefijo /ms4.
 * Rutas confirmadas:
 *   GET /detalle-libro/:id     ✔  (obtiene detalle de un libro específico)
 *   GET /libros?limit=1        ✔  (health check)
 *   GET /perfil-cliente/:id    ✖ 404
 *   GET /ms4/perfil-cliente/:id ✖ 404
 *   GET /catalogo-con-stats    ✖ 503 / error interno
 * Swagger: https://6ksot1au1c.execute-api.us-east-1.amazonaws.com/ms4/docs
 */

import apiClient, { apiRequest } from './apiClient'

/** Health check — GET /libros?limit=1 (verifica conectividad con el agregador vía MS1) */
export const healthCheck = () => apiClient.get(`/libros?limit=1`)

/** [Rúbrica MS4 · GET] Catálogo enriquecido con estadísticas (timeout extendido a 45 s). */
export const getCatalogoConStats = () =>
  apiRequest(`/catalogo-con-stats`, { timeoutMs: 45_000 })

/** [Rúbrica MS4 · GET] Detalle completo de un libro (datos + autor + reseñas + stats). */
export const getDetalleLibro = (id) => apiClient.get(`/detalle-libro/${id}`)

/** Perfil completo de un cliente (datos + pedidos + reseñas). */
export const getPerfilCliente = (id) => apiClient.get(`/perfil-cliente/${id}`)

/** Resumen completo de un pedido con datos del cliente y libros. */
export const getResumenPedido = (id) => apiClient.get(`/resumen-pedido/${id}`)
