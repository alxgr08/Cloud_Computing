/**
 * MS4 — Agregador
 * Orquesta y consolida datos de múltiples microservicios.
 *
 * Prefijo de ruta: /ms4
 * Endpoints: /perfil-cliente/{id}, /detalle-libro/{id},
 *            /resumen-pedido/{id}, /catalogo-con-stats
 * Swagger:   https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms4/docs
 */

import apiClient from './apiClient'

const P = '/ms4'

/** [Rúbrica MS4 · GET] Catálogo enriquecido con estadísticas. */
export const getCatalogoConStats = () => apiClient.get(`${P}/catalogo-con-stats`)

/** [Rúbrica MS4 · GET] Detalle completo de un libro (datos + autor + reseñas + stats). */
export const getDetalleLibro = (id) => apiClient.get(`${P}/detalle-libro/${id}`)

/** Perfil completo de un cliente (datos + pedidos + reseñas). */
export const getPerfilCliente = (id) => apiClient.get(`${P}/perfil-cliente/${id}`)

/** Resumen completo de un pedido con datos del cliente y libros. */
export const getResumenPedido = (id) => apiClient.get(`${P}/resumen-pedido/${id}`)
