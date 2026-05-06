/**
 * MS5 — Analytics (servicio con patrón objeto)
 * API Gateway: SIN prefijo /ms5.
 * Rutas reales confirmadas:
 *   GET /top-autores ✔  GET /ventas-por-genero ✔
 *   GET /rating-por-genero ✔  GET /libros-mas-vendidos ✔
 *   GET /ms5/top-autores ✖ (404)
 * Swagger: https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms5/docs
 */
import { apiRequest } from './apiClient'

export const analyticsService = {
  /** Health check — GET /top-autores */
  healthCheck:         () => apiRequest(`/top-autores`),

  /** [Rúbrica MS5 · GET] Ventas agrupadas por género literario. */
  getVentasPorGenero:  () => apiRequest(`/ventas-por-genero`),

  /** [Rúbrica MS5 · GET] Autores con mayor número de ventas. */
  getTopAutores:       () => apiRequest(`/top-autores`),

  /** Clientes con más compras realizadas. */
  getTopClientes:      () => apiRequest(`/top-clientes`),

  /** Rating promedio agrupado por género. */
  getRatingPorGenero:  () => apiRequest(`/rating-por-genero`),

  /** Libros con mayor número de ventas. */
  getLibrosMasVendidos: () => apiRequest(`/libros-mas-vendidos`),
}
