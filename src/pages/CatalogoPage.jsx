/**
 * CatalogoPage — Catálogo enriquecido con estadísticas
 * Consume MS4: GET /ms4/catalogo-con-stats
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApi } from '../hooks/useApi'
import { getCatalogoConStats } from '../services/ms4AgregadorService'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'

function normalizeItem(item) {
  return {
    id:        item.id,
    titulo:    item.titulo    || item.title    || item.nombre || '—',
    autor:     item.autor     || item.author   || item.autor_nombre  || '—',
    genero:    item.genero    || item.genre    || item.genero_nombre || '—',
    editorial: item.editorial || item.publisher || '—',
    precio:    item.precio    ?? item.price    ?? null,
    ventas:    item.ventas    ?? item.total_ventas ?? item.sales ?? null,
    rating:    item.rating    ?? item.promedio_rating ?? item.avg_rating ?? null,
  }
}

export default function CatalogoPage() {
  const [filter, setFilter] = useState('')
  const { data, loading, error, refetch } = useApi(getCatalogoConStats)

  // El endpoint puede devolver un array o un objeto { libros: [...], ... }
  const rawList = Array.isArray(data) ? data : (data?.libros ?? data?.items ?? [])
  const items = rawList.map(normalizeItem).filter((item) => {
    const q = filter.toLowerCase()
    return !q || item.titulo.toLowerCase().includes(q) || String(item.autor).toLowerCase().includes(q)
  })

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">🔗 Catálogo con estadísticas</h1>
            <p className="page-badge">MS4 · GET /ms4/catalogo-con-stats</p>
          </div>
          <Link to="/libros" className="btn btn--outline-dark">
            Ir a Libros (MS1)
          </Link>
        </div>

        <div className="search-row">
          <input
            className="search-input"
            type="search"
            placeholder="Buscar por título o autor…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button className="btn btn--ghost btn--sm" onClick={() => setFilter('')}>
              Limpiar
            </button>
          )}
        </div>

        {loading && <LoadingState message="Cargando catálogo enriquecido desde MS4…" />}
        {!loading && error && <ErrorState message={error} onRetry={refetch} />}
        {!loading && !error && items.length === 0 && (
          <EmptyState message="No se encontraron libros en el catálogo enriquecido." icon="🔗" />
        )}

        {!loading && !error && items.length > 0 && (
          <>
            <p className="table-count">{items.length} {items.length === 1 ? 'libro' : 'libros'}</p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Género</th>
                    <th>Precio</th>
                    <th>Ventas</th>
                    <th>Rating</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="td-id">{item.id}</td>
                      <td>
                        <Link to={`/libros/${item.id}`} className="link-primary">
                          {item.titulo}
                        </Link>
                      </td>
                      <td>{item.autor}</td>
                      <td>{item.genero}</td>
                      <td>{item.precio != null ? `$${Number(item.precio).toFixed(2)}` : '—'}</td>
                      <td>{item.ventas ?? '—'}</td>
                      <td>{item.rating != null ? Number(item.rating).toFixed(1) : '—'}</td>
                      <td>
                        <Link to={`/libros/${item.id}`} className="btn btn--ghost btn--sm">
                          Detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
