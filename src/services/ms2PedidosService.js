/**
 * MS2 — Pedidos
 * Gestiona pedidos y clientes.
 *
 * Prefijo de ruta: /ms2
 * Endpoints: /pedidos, /clientes
 * Swagger:   https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms2/docs
 */

import apiClient from './apiClient'

const P = '/ms2'

// ── Pedidos ───────────────────────────────────────────────────────────────────

/** [Rúbrica MS2 · GET] Lista todos los pedidos. */
export const getPedidos = () => apiClient.get(`${P}/pedidos`)

/** Obtiene un pedido por su ID. */
export const getPedidoById = (id) => apiClient.get(`${P}/pedidos/${id}`)

/** [Rúbrica MS2 · POST] Crea un nuevo pedido. */
export const createPedido = (data) => apiClient.post(`${P}/pedidos`, data)

/** Actualiza el estado de un pedido. */
export const updatePedido = (id, data) => apiClient.put(`${P}/pedidos/${id}`, data)

// ── Clientes ──────────────────────────────────────────────────────────────────

/** Lista todos los clientes. */
export const getClientes = () => apiClient.get(`${P}/clientes`)

/** Obtiene un cliente por su ID. */
export const getClienteById = (id) => apiClient.get(`${P}/clientes/${id}`)

/** Crea un nuevo cliente. */
export const createCliente = (data) => apiClient.post(`${P}/clientes`, data)
