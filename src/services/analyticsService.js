/**
 * MS5 — Analytics (servicio con patrón objeto)
 * Prefijo: /ms5  |  Swagger: /ms5/docs
 */
import { apiRequest } from './apiClient'

const MS5_PREFIX = '/ms5'

export const analyticsService = {
  /** [Rúbrica MS5 · GET] Ventas agrupadas por género literario. */
  getVentasPorGenero:  () => apiRequest(`${MS5_PREFIX}/ventas-por-genero`),

  /** [Rúbrica MS5 · GET] Autores con mayor número de ventas. */
  getTopAutores:       () => apiRequest(`${MS5_PREFIX}/top-autores`),

  /** Clientes con más compras realizadas. */
  getTopClientes:      () => apiRequest(`${MS5_PREFIX}/top-clientes`),

  /** Rating promedio agrupado por género. */
  getRatingPorGenero:  () => apiRequest(`${MS5_PREFIX}/rating-por-genero`),

  /** Libros con mayor número de ventas. */
  getLibrosMasVendidos: () => apiRequest(`${MS5_PREFIX}/libros-mas-vendidos`),
}
