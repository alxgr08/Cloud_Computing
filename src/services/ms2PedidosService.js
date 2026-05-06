/**
 * MS2 — Pedidos
 * Gestiona pedidos y clientes.
 *
 * Prefijo de ruta: /ms2
 * Endpoints confirmados en Swagger:
 *   Pedidos:  GET /pedidos, POST /pedidos, GET /pedidos/{id},
 *             GET /pedidos/cliente/{clienteId}, PATCH /pedidos/{id}/estado
 *   Clientes: GET /clientes, POST /clientes, GET /clientes/{id}, DELETE /clientes/{id}
 * NOTA: MS2 no expone /health. Se usa GET /ms2/clientes como health check
 *       porque es más liviano que /pedidos (evita timeout).
 * Swagger: https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms2/docs
 */

import apiClient from './apiClient'

const P = '/ms2'

// ── Health ────────────────────────────────────────────────────────────────────

/** Health check — GET /ms2/clientes (más liviano que /pedidos). */
export const healthCheck = () => apiClient.get(`${P}/clientes`)

// ── Pedidos ───────────────────────────────────────────────────────────────────

/** [Rúbrica MS2 · GET] Lista todos los pedidos. */
export const getPedidos = () => apiClient.get(`${P}/pedidos`)

/** Obtiene un pedido por su ID. */
export const getPedidoById = (id) => apiClient.get(`${P}/pedidos/${id}`)

/** Pedidos de un cliente específico. */
export const getPedidosPorCliente = (clienteId) => apiClient.get(`${P}/pedidos/cliente/${clienteId}`)

/** [Rúbrica MS2 · POST] Crea un nuevo pedido. */
export const createPedido = (data) => apiClient.post(`${P}/pedidos`, data)

/** Actualiza el estado de un pedido (PATCH con query param). */
export const updateEstadoPedido = (id, estado) =>
  apiClient.patch(`${P}/pedidos/${id}/estado?estado=${encodeURIComponent(estado)}`, undefined)

// ── Clientes ──────────────────────────────────────────────────────────────────

/** Lista todos los clientes. */
export const getClientes = () => apiClient.get(`${P}/clientes`)

/** Obtiene un cliente por su ID. */
export const getClienteById = (id) => apiClient.get(`${P}/clientes/${id}`)

/** Crea un nuevo cliente. */
export const createCliente = (data) => apiClient.post(`${P}/clientes`, data)

/** Elimina un cliente por su ID. */
export const deleteCliente = (id) => apiClient.delete(`${P}/clientes/${id}`)
