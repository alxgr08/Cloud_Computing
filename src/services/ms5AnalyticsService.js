/**
 * MS5 — Analytics
 * Proporciona métricas y estadísticas de la plataforma.
 *
 * Prefijo de ruta: /ms5
 * Endpoints: /ventas-por-genero, /top-autores, /top-clientes,
 *            /rating-por-genero, /libros-mas-vendidos
 * Swagger:   https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms5/docs
 */

import apiClient from './apiClient'

const P = '/ms5'

/** [Rúbrica MS5 · GET] Ventas agrupadas por género literario. */
export const getVentasPorGenero = () => apiClient.get(`${P}/ventas-por-genero`)

/** [Rúbrica MS5 · GET] Autores con mayor número de ventas. */
export const getTopAutores = () => apiClient.get(`${P}/top-autores`)

/** Clientes con más compras realizadas. */
export const getTopClientes = () => apiClient.get(`${P}/top-clientes`)

/** Rating promedio de libros agrupado por género. */
export const getRatingPorGenero = () => apiClient.get(`${P}/rating-por-genero`)

/** Libros con mayor número de ventas. */
export const getLibrosMasVendidos = () => apiClient.get(`${P}/libros-mas-vendidos`)
