/**
 * MS5 — Analytics
 * API Gateway: SIN prefijo /ms5.
 * Rutas reales confirmadas:
 *   GET /top-autores ✔  GET /ventas-por-genero ✔
 *   GET /rating-por-genero ✔  GET /libros-mas-vendidos ✔
 *   GET /ms5/top-autores ✖ (404)
 * Swagger: https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms5/docs
 */

import apiClient from './apiClient'

/** Health check — GET /top-autores */
export const healthCheck = () => apiClient.get(`/top-autores`)

/** [Rúbrica MS5 · GET] Ventas agrupadas por género literario. */
export const getVentasPorGenero = () => apiClient.get(`/ventas-por-genero`)

/** [Rúbrica MS5 · GET] Autores con mayor número de ventas. */
export const getTopAutores = () => apiClient.get(`/top-autores`)

/** Clientes con más compras realizadas. */
export const getTopClientes = () => apiClient.get(`/top-clientes`)

/** Rating promedio de libros agrupado por género. */
export const getRatingPorGenero = () => apiClient.get(`/rating-por-genero`)

/** Libros con mayor número de ventas. */
export const getLibrosMasVendidos = () => apiClient.get(`/libros-mas-vendidos`)
