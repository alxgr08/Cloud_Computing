/**
 * MS4 — Agregador (servicio con patrón objeto)
 * API Gateway: SIN prefijo /ms4.
 * Rutas confirmadas:
 *   GET /detalle-libro/:id     ✔  (obtiene detalle de un libro específico)
 *   GET /libros?limit=1        ✔  (health check)
 *   GET /ms4/perfil-cliente/:id ✖ (404)
 * Swagger: https://6ksot1au1c.execute-api.us-east-1.amazonaws.com/ms4/docs
 */
import { apiRequest } from './apiClient'

export const agregadorService = {
  /** Health check — GET /libros?limit=1 (verifica conectividad con el agregador vía MS1). */
  healthCheck:         ()  => apiRequest(`/libros?limit=1`),

  /** Perfil completo de un cliente (datos + pedidos + reseñas). */
  getPerfilCliente:   (id) => apiRequest(`/perfil-cliente/${id}`),

  /** [Rúbrica MS4 · GET] Detalle completo de un libro con stats y reseñas. */
  getDetalleLibro:    (id) => apiRequest(`/detalle-libro/${id}`),

  /** Resumen completo de un pedido con cliente y libros. */
  getResumenPedido:   (id) => apiRequest(`/resumen-pedido/${id}`),

  /** [Rúbrica MS4 · GET] Catálogo enriquecido con estadísticas (timeout extendido a 45 s). */
  getCatalogoConStats: ()  => apiRequest(`/catalogo-con-stats`, { timeoutMs: 45_000 }),
}
