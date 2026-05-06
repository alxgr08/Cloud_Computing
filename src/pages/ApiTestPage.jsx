/**
 * ApiTestPage — Evidencia técnica de conexión con los 5 microservicios
 * Ruta: /api-test
 *
 * Esta página prueba simultáneamente todos los microservicios y muestra
 * el resultado crudo en pantalla. Sirve como evidencia para la rúbrica.
 *
 * Rutas reales confirmadas (sin prefijos /ms1, /ms3, /ms4, /ms5):
 *   MS1: /libros, /autores, /generos
 *   MS2: /ms2/pedidos/1, /ms2/clientes/1    (MS2 sí usa prefijo)
 *   MS3: /resenas?libro_id=1
 *   MS4: /perfil-cliente/1, /detalle-libro/1
 *   MS5: /top-autores, /ventas-por-genero, /rating-por-genero, /libros-mas-vendidos
 */
import { useState, useCallback } from 'react'
import { apiRequest } from '../services/apiClient'

// ── Checks estándar ────────────────────────────────────────────────────────────
const CHECKS = [
  // MS1 — SIN prefijo /ms1
  { key: 'ms1_libros',        label: 'MS1 — GET /libros?limit=3',          fetch: () => apiRequest('/libros?limit=3'),              badge: 'MS1' },
  { key: 'ms1_autores',       label: 'MS1 — GET /autores?limit=3',         fetch: () => apiRequest('/autores?limit=3'),             badge: 'MS1' },
  { key: 'ms1_generos',       label: 'MS1 — GET /generos',                 fetch: () => apiRequest('/generos'),                    badge: 'MS1' },
  // MS2 — CON prefijo /ms2
  { key: 'ms2_pedido',        label: 'MS2 — GET /ms2/pedidos/1',           fetch: () => apiRequest('/ms2/pedidos/1'),               badge: 'MS2' },
  { key: 'ms2_cliente',       label: 'MS2 — GET /ms2/clientes/1',          fetch: () => apiRequest('/ms2/clientes/1'),              badge: 'MS2' },
  // MS3 — SIN prefijo /ms3
  { key: 'ms3_resenas',       label: 'MS3 — GET /resenas?libro_id=1',      fetch: () => apiRequest('/resenas?libro_id=1'),          badge: 'MS3' },
  // MS4 — SIN prefijo /ms4
  { key: 'ms4_perfil',        label: 'MS4 — GET /perfil-cliente/1',        fetch: () => apiRequest('/perfil-cliente/1'),            badge: 'MS4' },
  { key: 'ms4_detalle',       label: 'MS4 — GET /detalle-libro/1',         fetch: () => apiRequest('/detalle-libro/1'),             badge: 'MS4' },
  { key: 'ms4_catalogo',      label: 'MS4 — GET /catalogo-con-stats  [45 s]', fetch: () => apiRequest('/catalogo-con-stats', { timeoutMs: 45_000 }), badge: 'MS4' },
  // MS5 — SIN prefijo /ms5
  { key: 'ms5_top_autores',   label: 'MS5 — GET /top-autores',             fetch: () => apiRequest('/top-autores'),                badge: 'MS5' },
  { key: 'ms5_ventas',        label: 'MS5 — GET /ventas-por-genero',       fetch: () => apiRequest('/ventas-por-genero'),           badge: 'MS5' },
  { key: 'ms5_rating',        label: 'MS5 — GET /rating-por-genero',       fetch: () => apiRequest('/rating-por-genero'),           badge: 'MS5' },
  { key: 'ms5_libros',        label: 'MS5 — GET /libros-mas-vendidos',     fetch: () => apiRequest('/libros-mas-vendidos'),         badge: 'MS5' },
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
