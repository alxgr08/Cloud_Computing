/**
 * MS4 — Agregador (servicio con patrón objeto)
 * API Gateway: SIN prefijo /ms4.
 * Rutas reales confirmadas:
 *   GET /perfil-cliente/1 ✔  GET /detalle-libro/1 ✔
 *   GET /ms4/perfil-cliente/1 ✖ (404)
 * Swagger: https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms4/docs
 */
import { apiRequest } from './apiClient'

export const agregadorService = {
  /** Health check — GET /detalle-libro/1 (comprueba conexión con MS4). */
  healthCheck:         ()  => apiRequest(`/detalle-libro/1`),

  /** Perfil completo de un cliente (datos + pedidos + reseñas). */
  getPerfilCliente:   (id) => apiRequest(`/perfil-cliente/${id}`),

  /** [Rúbrica MS4 · GET] Detalle completo de un libro con stats y reseñas. */
  getDetalleLibro:    (id) => apiRequest(`/detalle-libro/${id}`),

  /** Resumen completo de un pedido con cliente y libros. */
  getResumenPedido:   (id) => apiRequest(`/resumen-pedido/${id}`),

  /** [Rúbrica MS4 · GET] Catálogo enriquecido con estadísticas (timeout extendido a 45 s). */
  getCatalogoConStats: ()  => apiRequest(`/catalogo-con-stats`, { timeoutMs: 45_000 }),
}
