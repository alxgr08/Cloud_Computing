/**
 * MS2 — Pedidos (servicio con patrón objeto)
 * Prefijo: /ms2  |  Swagger: /ms2/docs
 */
import { apiRequest } from './apiClient'

const MS2_PREFIX = '/ms2'

export const pedidosService = {
  /** [Rúbrica MS2 · GET] Lista todos los pedidos. */
  getPedidos:     ()       => apiRequest(`${MS2_PREFIX}/pedidos`),

  /** Obtiene un pedido por ID. */
  getPedidoById:  (id)     => apiRequest(`${MS2_PREFIX}/pedidos/${id}`),

  /** [Rúbrica MS2 · POST] Crea un nuevo pedido. */
  createPedido:   (data)   => apiRequest(`${MS2_PREFIX}/pedidos`, { method: 'POST', body: JSON.stringify(data) }),

  /** Lista todos los clientes. */
  getClientes:    ()       => apiRequest(`${MS2_PREFIX}/clientes`),

  /** Obtiene un cliente por ID. */
  getClienteById: (id)     => apiRequest(`${MS2_PREFIX}/clientes/${id}`),
}
