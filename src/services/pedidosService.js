/**
 * MS2 — Pedidos (servicio con patrón objeto)
 * Prefijo: /ms2  |  Swagger: /ms2/docs
 *
 * NOTA: MS2 (Spring Boot) no expone /health dedicado.
 *       Se usa GET /ms2/clientes como health check porque es más liviano
 *       que /ms2/pedidos, que puede generar timeout al tener más datos.
 */
import { apiRequest } from './apiClient'

const MS2_PREFIX = '/ms2'

export const pedidosService = {
  /** Health check — GET /ms2/clientes (más liviano que /pedidos). */
  healthCheck:          ()            => apiRequest(`${MS2_PREFIX}/clientes`),

  /** [Rúbrica MS2 · GET] Lista todos los pedidos. */
  getPedidos:           ()            => apiRequest(`${MS2_PREFIX}/pedidos`),

  /** Obtiene un pedido por ID. */
  getPedidoById:        (id)          => apiRequest(`${MS2_PREFIX}/pedidos/${id}`),

  /** Pedidos de un cliente específico. */
  getPedidosPorCliente: (clienteId)   => apiRequest(`${MS2_PREFIX}/pedidos/cliente/${clienteId}`),

  /** [Rúbrica MS2 · POST] Crea un nuevo pedido. */
  createPedido:         (data)        => apiRequest(`${MS2_PREFIX}/pedidos`, { method: 'POST', body: JSON.stringify(data) }),

  /** Actualiza el estado de un pedido. */
  updateEstadoPedido:   (id, estado)  => apiRequest(`${MS2_PREFIX}/pedidos/${id}/estado?estado=${encodeURIComponent(estado)}`, { method: 'PATCH' }),

  /** Lista todos los clientes. */
  getClientes:          ()            => apiRequest(`${MS2_PREFIX}/clientes`),

  /** Obtiene un cliente por ID. */
  getClienteById:       (id)          => apiRequest(`${MS2_PREFIX}/clientes/${id}`),

  /** Crea un nuevo cliente. */
  createCliente:        (data)        => apiRequest(`${MS2_PREFIX}/clientes`, { method: 'POST', body: JSON.stringify(data) }),

  /** Elimina un cliente por ID. */
  deleteCliente:        (id)          => apiRequest(`${MS2_PREFIX}/clientes/${id}`, { method: 'DELETE' }),
}
