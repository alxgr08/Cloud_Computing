/**
 * DetalleLibroPage — Detalle completo de un libro
 * Consume MS4: GET /detalle-libro/:id
 */
import { useParams, Link } from 'react-router-dom'
import { useApi }          from '../hooks/useApi'
import { getDetalleLibro } from '../services/ms4AgregadorService'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'

export default function DetalleLibroPage() {
  const { id } = useParams()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { data, loading, error, refetch } = useApi(() => getDetalleLibro(id), [id])

  function renderValue(val) {
    if (val == null) return '—'
    if (typeof val === 'object') return JSON.stringify(val)
    return String(val)
  }

  const libro = data

  return (
    <div className="page-container">
      <div className="container">

        <div className="page-header">
          <div>
            <h1 className="page-title">📖 Detalle del libro</h1>
            <p className="page-badge">MS4 · GET /detalle-libro/{id}</p>
          </div>
          <Link to="/libros" className="btn btn--outline-dark">
            ← Volver al catálogo
          </Link>
        </div>

        {loading && <LoadingState message="Cargando detalle del libro…" />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && !libro && (
          <EmptyState message="No se encontró el libro solicitado." icon="📖" />
        )}

        {!loading && !error && libro && (
          <div className="detail-layout">

            {/* ── Portada / encabezado ── */}
            <div className="detail-card">
              <div className="detail-card__cover">
                {libro.imagen || libro.image ? (
                  <img
                    src={libro.imagen || libro.image}
                    alt={`Portada de ${libro.titulo || libro.title}`}
                    className="detail-card__img"
                  />
                ) : (
                  <div className="detail-card__placeholder">
                    <span>📚</span>
                  </div>
                )}
              </div>
              <div className="detail-card__info">
                <h2 className="detail-card__title">
                  {libro.titulo || libro.title || libro.nombre || '—'}
                </h2>
                {(libro.autor || libro.author || libro.autor_nombre || libro.autor_id) && (
                  <p className="detail-card__meta">
                    ✍️ {libro.autor || libro.author || libro.autor_nombre || `Autor ID: ${libro.autor_id}`}
                  </p>
                )}
                {(libro.genero || libro.genre || libro.genero_nombre || libro.genero_id) && (
                  <p className="detail-card__meta">
                    🏷️ {libro.genero || libro.genre || libro.genero_nombre || `Género ID: ${libro.genero_id}`}
                  </p>
                )}
                {(libro.editorial || libro.editorial_nombre || libro.editorial_id) && (
                  <p className="detail-card__meta">
                    🏢 {libro.editorial || libro.editorial_nombre || `Editorial ID: ${libro.editorial_id}`}
                  </p>
                )}
                {(libro.precio ?? libro.price) != null && (
                  <p className="detail-card__price">
                    ${Number(libro.precio ?? libro.price).toFixed(2)}
                  </p>
                )}
                {(libro.descripcion || libro.description) && (
                  <p className="detail-card__desc">
                    {libro.descripcion || libro.description}
                  </p>
                )}
              </div>
            </div>

            {/* ── Estadísticas ── */}
            {(libro.ventas != null || libro.rating != null || libro.total_resenas != null) && (
              <section className="detail-section">
                <h3 className="detail-section__title">📊 Estadísticas</h3>
                <div className="stats-row">
                  {libro.ventas != null && (
                    <div className="stat-chip">
                      <span className="stat-chip__label">Ventas</span>
                      <span className="stat-chip__value">{libro.ventas}</span>
                    </div>
                  )}
                  {libro.rating != null && (
                    <div className="stat-chip">
                      <span className="stat-chip__label">Rating</span>
                      <span className="stat-chip__value">
                        {Number(libro.rating).toFixed(1)} ⭐
                      </span>
                    </div>
                  )}
                  {libro.total_resenas != null && (
                    <div className="stat-chip">
                      <span className="stat-chip__label">Reseñas</span>
                      <span className="stat-chip__value">{libro.total_resenas}</span>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* ── Reseñas incluidas por el agregador ── */}
            {Array.isArray(libro.resenas) && libro.resenas.length > 0 && (
              <section className="detail-section">
                <h3 className="detail-section__title">⭐ Reseñas</h3>
                <div className="resenas-grid">
                  {libro.resenas.map((r, i) => (
                    <article key={r.id ?? i} className="resena-card">
                      <header className="resena-card__header">
                        <span className="resena-card__stars">
                          {r.calificacion != null || r.rating != null
                            ? '⭐'.repeat(Math.min(5, Math.max(1, Math.round(r.calificacion ?? r.rating))))
                            : '—'}
                        </span>
                      </header>
                      <p className="resena-card__comentario">
                        {r.comentario || r.comment || '—'}
                      </p>
                      <footer className="resena-card__footer">
                        <span>👤 {r.cliente || r.user || r.cliente_id || '—'}</span>
                      </footer>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* ── Datos adicionales del agregador ── */}
            <section className="detail-section">
              <h3 className="detail-section__title">🔗 Datos del agregador (MS4)</h3>
              <div className="detail-extra">
                {Object.entries(libro)
                  .filter(([k]) => !['id','titulo','title','nombre','autor','author','autor_nombre','autor_id',
                    'genero','genre','genero_nombre','genero_id','editorial','editorial_nombre','editorial_id','precio','price',
                    'descripcion','description','imagen','image','resenas','ventas','rating','total_resenas'].includes(k))
                  .map(([k, v]) => (
                    <div key={k} className="detail-extra__row">
                      <span className="detail-extra__key">{k}</span>
                      <span className="detail-extra__val">{renderValue(v)}</span>
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
