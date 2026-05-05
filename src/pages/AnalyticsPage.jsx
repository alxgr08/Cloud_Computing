/**
 * AnalyticsPage — Dashboard de métricas y estadísticas
 * Consume MS5: GET /ms5/ventas-por-genero, /top-autores, /top-clientes,
 *                   /rating-por-genero, /libros-mas-vendidos
 */
import { useEffect, useState, useCallback } from 'react'
import DataCard    from '../components/common/DataCard'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'
import {
  getVentasPorGenero,
  getTopAutores,
  getTopClientes,
  getRatingPorGenero,
  getLibrosMasVendidos,
} from '../services/ms5AnalyticsService'

function toArray(val) {
  if (!val) return []
  if (Array.isArray(val)) return val
  // Puede ser { data: [...] } o similar
  return val.data ?? val.items ?? val.results ?? Object.values(val)
}

function useMetric(fetchFn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      setData(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => { load() }, [load])
  return { data, loading, error, refetch: load }
}

/** Tabla genérica de métricas. */
function MetricTable({ rows, col1, col2, loading, error, emptyMsg, onRetry }) {
  if (loading) return <LoadingState message="Cargando…" />
  if (error)   return <ErrorState message={error} onRetry={onRetry} />
  if (!rows || rows.length === 0) return <EmptyState message={emptyMsg} icon="📭" />
  return (
    <div className="table-wrapper">
      <table className="data-table data-table--compact">
        <thead>
          <tr>
            <th>#</th>
            <th>{col1}</th>
            <th>{col2}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const [k, v] = Object.entries(row)
            return (
              <tr key={i}>
                <td className="td-id">{i + 1}</td>
                <td>{String(row[Object.keys(row)[0]] ?? '—')}</td>
                <td>{String(row[Object.keys(row)[1]] ?? '—')}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default function AnalyticsPage() {
  const ventas    = useMetric(getVentasPorGenero)
  const autores   = useMetric(getTopAutores)
  const clientes  = useMetric(getTopClientes)
  const rating    = useMetric(getRatingPorGenero)
  const masVend   = useMetric(getLibrosMasVendidos)

  const ventasArr  = toArray(ventas.data)
  const autoresArr = toArray(autores.data)
  const clientesArr = toArray(clientes.data)
  const ratingArr  = toArray(rating.data)
  const masVendArr = toArray(masVend.data)

  // Tarjetas de resumen (primera fila)
  const totalVentas = ventasArr.reduce((acc, r) => {
    const v = r.ventas ?? r.total ?? r.count ?? r.cantidad ?? 0
    return acc + Number(v)
  }, 0)

  return (
    <div className="page-container">
      <div className="container">

        <div className="page-header">
          <div>
            <h1 className="page-title">📈 Dashboard de Analytics</h1>
            <p className="page-badge">MS5 · /ms5/ventas-por-genero · /ms5/top-autores · /ms5/top-clientes · /ms5/rating-por-genero · /ms5/libros-mas-vendidos</p>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div className="kpi-grid">
          <DataCard
            title="Total de géneros"
            value={ventas.loading ? '…' : ventas.error ? '—' : ventasArr.length}
            icon="🏷️"
          />
          <DataCard
            title="Top autores"
            value={autores.loading ? '…' : autores.error ? '—' : autoresArr.length}
            icon="✍️"
          />
          <DataCard
            title="Clientes activos"
            value={clientes.loading ? '…' : clientes.error ? '—' : clientesArr.length}
            icon="👥"
          />
          <DataCard
            title="Libros más vendidos"
            value={masVend.loading ? '…' : masVend.error ? '—' : masVendArr.length}
            icon="🏆"
            accent
          />
        </div>

        {/* ── Grid de tablas ── */}
        <div className="analytics-grid">

          {/* Ventas por género */}
          <section className="analytics-section">
            <h2 className="analytics-section__title">🏷️ Ventas por género</h2>
            <p className="analytics-section__badge">GET /ms5/ventas-por-genero</p>
            {ventas.loading ? (
              <LoadingState message="Cargando…" />
            ) : ventas.error ? (
              <ErrorState message={ventas.error} onRetry={ventas.refetch} />
            ) : ventasArr.length === 0 ? (
              <EmptyState message="Sin datos de ventas." icon="🏷️" />
            ) : (
              <div className="table-wrapper">
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th>#</th>
                      {Object.keys(ventasArr[0]).map((k) => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {ventasArr.map((row, i) => (
                      <tr key={i}>
                        <td className="td-id">{i + 1}</td>
                        {Object.values(row).map((v, j) => <td key={j}>{v ?? '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Top autores */}
          <section className="analytics-section">
            <h2 className="analytics-section__title">✍️ Top autores</h2>
            <p className="analytics-section__badge">GET /ms5/top-autores</p>
            {autores.loading ? (
              <LoadingState message="Cargando…" />
            ) : autores.error ? (
              <ErrorState message={autores.error} onRetry={autores.refetch} />
            ) : autoresArr.length === 0 ? (
              <EmptyState message="Sin datos de autores." icon="✍️" />
            ) : (
              <div className="table-wrapper">
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th>#</th>
                      {Object.keys(autoresArr[0]).map((k) => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {autoresArr.map((row, i) => (
                      <tr key={i}>
                        <td className="td-id">{i + 1}</td>
                        {Object.values(row).map((v, j) => <td key={j}>{v ?? '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Top clientes */}
          <section className="analytics-section">
            <h2 className="analytics-section__title">👥 Top clientes</h2>
            <p className="analytics-section__badge">GET /ms5/top-clientes</p>
            {clientes.loading ? (
              <LoadingState message="Cargando…" />
            ) : clientes.error ? (
              <ErrorState message={clientes.error} onRetry={clientes.refetch} />
            ) : clientesArr.length === 0 ? (
              <EmptyState message="Sin datos de clientes." icon="👥" />
            ) : (
              <div className="table-wrapper">
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th>#</th>
                      {Object.keys(clientesArr[0]).map((k) => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {clientesArr.map((row, i) => (
                      <tr key={i}>
                        <td className="td-id">{i + 1}</td>
                        {Object.values(row).map((v, j) => <td key={j}>{v ?? '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Rating por género */}
          <section className="analytics-section">
            <h2 className="analytics-section__title">⭐ Rating por género</h2>
            <p className="analytics-section__badge">GET /ms5/rating-por-genero</p>
            {rating.loading ? (
              <LoadingState message="Cargando…" />
            ) : rating.error ? (
              <ErrorState message={rating.error} onRetry={rating.refetch} />
            ) : ratingArr.length === 0 ? (
              <EmptyState message="Sin datos de rating." icon="⭐" />
            ) : (
              <div className="table-wrapper">
                <table className="data-table data-table--compact">
                  <thead>
                    <tr>
                      <th>#</th>
                      {Object.keys(ratingArr[0]).map((k) => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {ratingArr.map((row, i) => (
                      <tr key={i}>
                        <td className="td-id">{i + 1}</td>
                        {Object.values(row).map((v, j) => <td key={j}>{v ?? '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Libros más vendidos */}
          <section className="analytics-section analytics-section--wide">
            <h2 className="analytics-section__title">🏆 Libros más vendidos</h2>
            <p className="analytics-section__badge">GET /ms5/libros-mas-vendidos</p>
            {masVend.loading ? (
              <LoadingState message="Cargando…" />
            ) : masVend.error ? (
              <ErrorState message={masVend.error} onRetry={masVend.refetch} />
            ) : masVendArr.length === 0 ? (
              <EmptyState message="Sin datos de libros más vendidos." icon="🏆" />
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      {Object.keys(masVendArr[0]).map((k) => <th key={k}>{k}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {masVendArr.map((row, i) => (
                      <tr key={i}>
                        <td className="td-id">{i + 1}</td>
                        {Object.values(row).map((v, j) => <td key={j}>{v ?? '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  )
}
