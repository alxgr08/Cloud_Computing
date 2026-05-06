/**
 * PerfilClientePage — Perfil completo de un cliente
 * Consume MS4: GET /perfil-cliente/:id
 */
import { useParams, Link } from 'react-router-dom'
import { useApi }           from '../hooks/useApi'
import { getPerfilCliente } from '../services/ms4AgregadorService'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'

export default function PerfilClientePage() {
  const { id } = useParams()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, loading, error, refetch } = useApi(() => getPerfilCliente(id), [id])

  const cliente = data

  return (
    <div className="page-container">
      <div className="container">

        <div className="page-header">
          <div>
            <h1 className="page-title">👤 Perfil del cliente</h1>
            <p className="page-badge">MS4 · GET /perfil-cliente/{id}</p>
          </div>
          <Link to="/pedidos" className="btn btn--outline-dark">
            ← Volver a Pedidos
          </Link>
        </div>

        {loading && <LoadingState message="Cargando perfil del cliente…" />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && !cliente && (
          <EmptyState message="No se encontró el cliente solicitado." icon="👤" />
        )}

        {!loading && !error && cliente && (
          <div className="detail-layout">

            {/* ── Datos del cliente ── */}
            <div className="detail-card">
              <div className="detail-card__placeholder detail-card__placeholder--avatar">
                <span>👤</span>
              </div>
              <div className="detail-card__info">
                <h2 className="detail-card__title">
                  {cliente.nombre || cliente.name || `Cliente #${id}`}
                </h2>
                {(cliente.email) && (
                  <p className="detail-card__meta">✉️ {cliente.email}</p>
                )}
                {(cliente.telefono || cliente.phone) && (
                  <p className="detail-card__meta">📞 {cliente.telefono || cliente.phone}</p>
                )}
                {(cliente.direccion || cliente.address) && (
                  <p className="detail-card__meta">📍 {cliente.direccion || cliente.address}</p>
                )}
                {(cliente.fecha_registro || cliente.created_at) && (
                  <p className="detail-card__meta">
                    📅 Cliente desde {new Date(cliente.fecha_registro || cliente.created_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            {/* ── Resumen estadístico ── */}
            {(cliente.total_pedidos != null || cliente.total_resenas != null || cliente.total_gastado != null) && (
              <section className="detail-section">
                <h3 className="detail-section__title">📊 Resumen</h3>
                <div className="stats-row">
                  {cliente.total_pedidos != null && (
                    <div className="stat-chip">
                      <span className="stat-chip__label">Pedidos</span>
                      <span className="stat-chip__value">{cliente.total_pedidos}</span>
                    </div>
                  )}
                  {cliente.total_resenas != null && (
                    <div className="stat-chip">
                      <span className="stat-chip__label">Reseñas</span>
                      <span className="stat-chip__value">{cliente.total_resenas}</span>
                    </div>
                  )}
                  {cliente.total_gastado != null && (
                    <div className="stat-chip">
                      <span className="stat-chip__label">Total gastado</span>
                      <span className="stat-chip__value">${Number(cliente.total_gastado).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Historial de pedidos ── */}
            {Array.isArray(cliente.pedidos) && (
              <section className="detail-section">
                <h3 className="detail-section__title">🛒 Pedidos ({cliente.pedidos.length})</h3>
                {cliente.pedidos.length === 0 ? (
                  <p className="detail-empty">Sin pedidos registrados.</p>
                ) : (
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr><th>ID</th><th>Estado</th><th>Total</th><th>Fecha</th><th></th></tr>
                      </thead>
                      <tbody>
                        {cliente.pedidos.map((p, i) => (
                          <tr key={p.id ?? i}>
                            <td className="td-id">{p.id ?? i + 1}</td>
                            <td><span className={`badge badge--${p.estado || p.status}`}>{p.estado || p.status || '—'}</span></td>
                            <td>{(p.total ?? p.monto) != null ? `$${Number(p.total ?? p.monto).toFixed(2)}` : '—'}</td>
                            <td>{p.fecha || p.created_at ? new Date(p.fecha || p.created_at).toLocaleDateString() : '—'}</td>
                            <td>
                              {p.id && (
                                <Link to={`/pedidos/${p.id}`} className="btn btn--ghost btn--sm">
                                  Ver
                                </Link>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            )}

            {/* ── Reseñas del cliente ── */}
            {Array.isArray(cliente.resenas) && cliente.resenas.length > 0 && (
              <section className="detail-section">
                <h3 className="detail-section__title">⭐ Reseñas ({cliente.resenas.length})</h3>
                <div className="resenas-grid">
                  {cliente.resenas.map((r, i) => (
                    <article key={r.id ?? i} className="resena-card">
                      <header className="resena-card__header">
                        <span className="resena-card__libro">
                          📚 {r.libro || r.libro_titulo || r.libro_id || '—'}
                        </span>
                        <span className="resena-card__stars">
                          {'⭐'.repeat(Math.min(5, Math.max(1, Math.round(r.calificacion ?? r.rating ?? 3))))}
                        </span>
                      </header>
                      <p className="resena-card__comentario">{r.comentario || r.comment || '—'}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

          </div>
        )}
      </div>
    </div>
  )
}
