/**
 * MS4 — Agregador (servicio con patrón objeto)
 * Prefijo: /ms4  |  Swagger: /ms4/docs
 */
import { apiRequest } from './apiClient'

const MS4_PREFIX = '/ms4'

export const agregadorService = {
  /** Health check — GET /ms4/health */
  healthCheck:         ()  => apiRequest(`${MS4_PREFIX}/health`),

  /** Perfil completo de un cliente (datos + pedidos + reseñas). */
  getPerfilCliente:   (id) => apiRequest(`${MS4_PREFIX}/perfil-cliente/${id}`),

  /** [Rúbrica MS4 · GET] Detalle completo de un libro con stats y reseñas. */
  getDetalleLibro:    (id) => apiRequest(`${MS4_PREFIX}/detalle-libro/${id}`),

  /** Resumen completo de un pedido con cliente y libros. */
  getResumenPedido:   (id) => apiRequest(`${MS4_PREFIX}/resumen-pedido/${id}`),

  /** [Rúbrica MS4 · GET] Catálogo enriquecido con estadísticas (timeout extendido a 45 s por volumen de datos). */
  getCatalogoConStats: ()  => apiRequest(`${MS4_PREFIX}/catalogo-con-stats`, { timeoutMs: 45_000 }),
}
