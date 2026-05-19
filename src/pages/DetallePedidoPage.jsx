/**
 * DetallePedidoPage — Detalle de un pedido
 * Consume MS2: GET /ms2/pedidos/:id
 */
import { useParams, Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { getPedidoById } from '../services/ms2PedidosService'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'

const ESTADO_CLASS = {
  pendiente:  'badge--Pendiente',
  entregado:  'badge--Entregado',
  cancelado:  'badge--Cancelado',
  enviado:    'badge--Enviado',
  procesando: 'badge--Procesando',
}

function estadoClass(e) {
  return ESTADO_CLASS[(e || '').toLowerCase()] ?? 'badge--default'
}

export default function DetallePedidoPage() {
  const { id } = useParams()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, loading, error, refetch } = useApi(() => getPedidoById(Number(id)), [id])

  const pedido = data

  return (
    <div className="page-container">
      <div className="container">

        <div className="page-header">
          <div>
            <h1 className="page-title">🛒 Detalle del pedido</h1>
            <p className="page-badge">MS2 · GET /ms2/pedidos/{id}</p>
          </div>
          <Link to="/pedidos" className="btn btn--outline-dark">
            ← Volver a pedidos
          </Link>
        </div>

        {loading && <LoadingState message="Cargando detalle del pedido…" />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && !pedido && (
          <EmptyState message="No se encontró el pedido solicitado." icon="🛒" />
        )}

        {!loading && !error && pedido && (
          <div className="detail-layout">

            {/* ── Información general ── */}
            <div className="detail-card">
              <div className="detail-card__cover" style={{ background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '3rem' }}>🛒</span>
              </div>
              <div className="detail-card__info">
                <h2 className="detail-card__title">Pedido #{pedido.id}</h2>

                <p className="detail-card__meta">
                  👤 Cliente:{' '}
                  <Link to={`/clientes/${pedido.clienteId ?? pedido.cliente_id ?? pedido.cliente}`} className="link-primary">
                    {pedido.clienteId ?? pedido.cliente_id ?? pedido.cliente ?? '—'}
                  </Link>
                </p>

                <p className="detail-card__meta">
                  📅 Fecha:{' '}
                  {pedido.fecha || pedido.fecha_pedido || pedido.created_at
                    ? new Date(pedido.fecha ?? pedido.fecha_pedido ?? pedido.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                    : '—'}
                </p>

                {(pedido.estado || pedido.status) && (
                  <p className="detail-card__meta">
                    📦 Estado:{' '}
                    <span className={`badge ${estadoClass(pedido.estado ?? pedido.status)}`}>
                      {pedido.estado ?? pedido.status}
                    </span>
                  </p>
                )}

                {(pedido.total ?? pedido.monto) != null && (
                  <p className="detail-card__price">
                    ${Number(pedido.total ?? pedido.monto).toFixed(2)}
                  </p>
                )}

                {(pedido.direccionEnvio || pedido.direccion_envio) && (
                  <p className="detail-card__meta">
                    📍 Envío: {pedido.direccionEnvio ?? pedido.direccion_envio}
                  </p>
                )}

                {(pedido.metodoPago || pedido.metodo_pago) && (
                  <p className="detail-card__meta">
                    💳 Pago: {pedido.metodoPago ?? pedido.metodo_pago}
                  </p>
                )}
              </div>
            </div>

            {/* ── Items del pedido ── */}
            {Array.isArray(pedido.items ?? pedido.productos ?? pedido.detalles) &&
              (pedido.items ?? pedido.productos ?? pedido.detalles).length > 0 && (
              <section className="detail-section">
                <h3 className="detail-section__title">📚 Libros del pedido</h3>
                <div className="table-wrapper">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Libro ID</th>
                        <th>Cantidad</th>
                        <th>Precio unitario</th>
                        <th>Subtotal</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(pedido.items ?? pedido.productos ?? pedido.detalles).map((item, i) => {
                        const libroId = item.libroId ?? item.libro_id ?? item.id_libro
                        const cantidad = item.cantidad ?? item.quantity ?? 1
                        const precio   = item.precioUnitario ?? item.precio_unitario ?? item.precio ?? null
                        return (
                          <tr key={libroId ?? i}>
                            <td className="td-id">{libroId ?? '—'}</td>
                            <td>{cantidad}</td>
                            <td>{precio != null ? `$${Number(precio).toFixed(2)}` : '—'}</td>
                            <td>{precio != null ? `$${(Number(precio) * Number(cantidad)).toFixed(2)}` : '—'}</td>
                            <td>
                              {libroId && (
                                <Link to={`/libros/${libroId}`} className="btn btn--ghost btn--sm">
                                  Ver libro
                                </Link>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* ── Datos adicionales ── */}
            <section className="detail-section">
              <h3 className="detail-section__title">🔗 Datos completos (MS2)</h3>
              <div className="detail-extra">
                {Object.entries(pedido)
                  .filter(([k]) => !['items', 'productos', 'detalles'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="detail-extra__row">
                      <span className="detail-extra__key">{k}</span>
                      <span className="detail-extra__val">
                        {v == null ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v)}
                      </span>
                    </div>
                  ))}
              </div>
            </section>

          </div>
        )}
      </div>
    </div>
  )
}
