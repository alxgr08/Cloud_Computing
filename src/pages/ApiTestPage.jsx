/**
 * ApiTestPage — Evidencia técnica de conexión con los 5 microservicios
 * Ruta: /api-test
 *
 * Esta página prueba simultáneamente todos los microservicios y muestra
 * el resultado crudo en pantalla. Sirve como evidencia para la rúbrica.
 *
 * MS3: se prueban 4 variantes de ruta para detectar el prefijo correcto.
 *   /ms3/health, /ms3/resenas  → pueden dar 404 si MS3 está en la raíz.
 *   /health, /resenas          → MS3 montado en raíz (verificado en producción).
 */
import { useState, useCallback } from 'react'
import { catalogoService }  from '../services/catalogoService'
import { pedidosService }   from '../services/pedidosService'
import { resenasService }   from '../services/resenasService'
import { agregadorService } from '../services/agregadorService'
import { analyticsService } from '../services/analyticsService'
import { apiRequest }       from '../services/apiClient'

// ── Checks estándar ────────────────────────────────────────────────────────────
const CHECKS = [
  // MS1
  { key: 'ms1_health',   label: 'MS1 — GET /ms1/health',         fetch: () => catalogoService.healthCheck(), badge: 'MS1' },
  { key: 'ms1_libros',   label: 'MS1 — GET /ms1/libros/',         fetch: () => catalogoService.getLibros(),    badge: 'MS1' },
  { key: 'ms1_autores',  label: 'MS1 — GET /ms1/autores/',        fetch: () => catalogoService.getAutores(),   badge: 'MS1' },
  // MS2
  { key: 'ms2_clientes', label: 'MS2 — GET /ms2/clientes  [health]', fetch: () => pedidosService.getClientes(), badge: 'MS2' },
  { key: 'ms2_pedidos',  label: 'MS2 — GET /ms2/pedidos',         fetch: () => pedidosService.getPedidos(),    badge: 'MS2' },
  // MS3 — diagnóstico de 4 variantes de ruta
  { key: 'ms3_root_health',  label: 'MS3 diag — GET /health  [raíz]',       fetch: () => apiRequest('/health'),            badge: 'MS3', diag: true },
  { key: 'ms3_root_resenas', label: 'MS3 diag — GET /resenas  [raíz]',      fetch: () => apiRequest('/resenas'),           badge: 'MS3', diag: true },
  { key: 'ms3_pfx_health',   label: 'MS3 diag — GET /ms3/health  [/ms3]',   fetch: () => apiRequest('/ms3/health'),        badge: 'MS3', diag: true },
  { key: 'ms3_pfx_resenas',  label: 'MS3 diag — GET /ms3/resenas  [/ms3]',  fetch: () => apiRequest('/ms3/resenas'),       badge: 'MS3', diag: true },
  { key: 'ms3_resenas',      label: 'MS3 — GET /resenas  [servicio]',        fetch: () => resenasService.getResenas(),      badge: 'MS3' },
  { key: 'ms3_stats',        label: 'MS3 — GET /resenas/stats/libro/1',      fetch: () => resenasService.getStatsLibro(1), badge: 'MS3' },
  // MS4
  { key: 'ms4_health',       label: 'MS4 — GET /ms4/health',                fetch: () => agregadorService.healthCheck(),           badge: 'MS4' },
  { key: 'ms4_catalogo',     label: 'MS4 — GET /ms4/catalogo-con-stats  [45 s]', fetch: () => agregadorService.getCatalogoConStats(), badge: 'MS4' },
  // MS5
  { key: 'ms5_health',       label: 'MS5 — GET /ms5/health',                fetch: () => analyticsService.healthCheck(),           badge: 'MS5' },
  { key: 'ms5_top_autores',  label: 'MS5 — GET /ms5/top-autores',           fetch: () => analyticsService.getTopAutores(),         badge: 'MS5' },
  { key: 'ms5_ventas',       label: 'MS5 — GET /ms5/ventas-por-genero',     fetch: () => analyticsService.getVentasPorGenero(),    badge: 'MS5' },
]

const BADGE_COLORS = {
  MS1: '#1e3a5f',
  MS2: '#065f46',
  MS3: '#7c3aed',
  MS4: '#b45309',
  MS5: '#0e7490',
}

function initResults() {
  return Object.fromEntries(CHECKS.map((c) => [c.key, { status: 'pending', ms: null }]))
}

export default function ApiTestPage() {
  const [results, setResults] = useState(initResults)
  const [running, setRunning] = useState(false)

  const runAll = useCallback(async () => {
    setResults(initResults())
    setRunning(true)
    await Promise.allSettled(
      CHECKS.map(async (check) => {
        const t0 = Date.now()
        try {
          const data = await check.fetch()
          setResults((prev) => ({
            ...prev,
            [check.key]: { status: 'ok', data, ms: Date.now() - t0 },
          }))
        } catch (err) {
          setResults((prev) => ({
            ...prev,
            [check.key]: { status: 'error', error: err.message, ms: Date.now() - t0 },
          }))
        }
      })
    )
    setRunning(false)
  }, [])

  // Ejecuta al montar
  const [ran, setRan] = useState(false)
  if (!ran) { setRan(true); runAll() }

  const total   = CHECKS.length
  const ok      = Object.values(results).filter((r) => r.status === 'ok').length
  const errors  = Object.values(results).filter((r) => r.status === 'error').length
  const pending = total - ok - errors

  return (
    <div className="page-container">
      <div className="container">

        {/* ── Encabezado ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">🔌 Prueba de conexión — API Gateway</h1>
            <p className="page-badge">
              {import.meta.env.VITE_API_BASE_URL || 'VITE_API_BASE_URL no configurada'}
            </p>
          </div>
          <button
            className="btn btn--accent"
            onClick={runAll}
            disabled={running}
          >
            {running ? '⏳ Probando…' : '↺ Re-ejecutar'}
          </button>
        </div>

        {/* ── Resumen ── */}
        <div className="apitest-summary">
          <div className="apitest-summary__chip apitest-summary__chip--ok">✅ {ok} OK</div>
          <div className="apitest-summary__chip apitest-summary__chip--error">❌ {errors} Error{errors !== 1 ? 'es' : ''}</div>
          {pending > 0 && (
            <div className="apitest-summary__chip apitest-summary__chip--pending">⏳ {pending} pendiente{pending !== 1 ? 's' : ''}</div>
          )}
          <span className="apitest-summary__total">Total: {total} endpoints</span>
        </div>

        {/* ── Nota MS3 ── */}
        <div className="apitest-note" style={{ marginBottom: '1rem', borderLeft: '4px solid #7c3aed', paddingLeft: '0.75rem' }}>
          <strong>Diagnóstico MS3:</strong> se prueban 4 variantes de ruta para detectar el prefijo correcto.
          Las filas marcadas con <em>diag</em> son exploratorias; el resultado determina qué prefijo usar
          en <code>resenasService</code>. Si <code>/resenas</code> retorna 200 y <code>/ms3/resenas</code> retorna 404,
          el prefijo correcto es vacío (MS3 montado en raíz del API Gateway).
        </div>

        {/* ── Resultados ── */}
        <div className="apitest-grid">
          {CHECKS.map((check) => {
            const result = results[check.key]
            const isOk      = result.status === 'ok'
            const isError   = result.status === 'error'
            const isPending = result.status === 'pending'

            return (
              <div
                key={check.key}
                className={`apitest-card${isOk ? ' apitest-card--ok' : isError ? ' apitest-card--error' : ''}${check.diag ? ' apitest-card--diag' : ''}`}
              >
                <div className="apitest-card__header">
                  <span
                    className="apitest-card__badge"
                    style={{ background: BADGE_COLORS[check.badge] }}
                  >
                    {check.badge}{check.diag ? ' diag' : ''}
                  </span>
                  <span className="apitest-card__label">{check.label}</span>
                  <span className="apitest-card__status">
                    {isPending ? '⏳' : isOk ? '✅' : '❌'}
                    {result.ms != null && (
                      <span style={{ fontSize: '0.7rem', marginLeft: '0.4rem', opacity: 0.7 }}>
                        {result.ms} ms
                      </span>
                    )}
                  </span>
                </div>

                {isPending && <p className="apitest-card__msg">Conectando…</p>}

                {isError && (
                  <p className="apitest-card__msg apitest-card__msg--error">
                    {result.error}
                  </p>
                )}

                {isOk && (
                  <pre className="apitest-card__pre">
                    {JSON.stringify(result.data, null, 2).slice(0, 800)}
                    {JSON.stringify(result.data, null, 2).length > 800 ? '\n… (truncado)' : ''}
                  </pre>
                )}
              </div>
            )
          })}
        </div>

        {/* ── Nota de rúbrica ── */}
        <div className="apitest-note">
          <strong>Evidencia de rúbrica:</strong> esta página demuestra que el frontend
          consume los 5 microservicios (MS1–MS5) a través del API Gateway HTTPS.
          Todas las peticiones usan la variable de entorno{' '}
          <code>VITE_API_BASE_URL</code>, sin URLs hardcodeadas.
        </div>

      </div>
    </div>
  )
}
