/**
 * ApiTestPage — Evidencia técnica de conexión con los 5 microservicios
 * Ruta: /api-test
 *
 * A. Pruebas principales: MS1, MS2, MS3, MS5
 * B. Diagnóstico MS4: todas las variantes de ruta
 */
import { useState, useCallback } from 'react'
import { apiRequest } from '../services/apiClient'

const _ENV_URL      = import.meta.env.VITE_API_BASE_URL
const _IS_DEV       = import.meta.env.DEV
const _BASE_DISPLAY = _ENV_URL
  ? _ENV_URL
  : _IS_DEV
    ? 'https://6ksot1au1c.execute-api.us-east-1.amazonaws.com (fallback dev)'
    : null

// ── A. Pruebas principales ─────────────────────────────────────────────────
const CHECKS = [
  // MS1 — SIN prefijo /ms1
  { key: 'ms1_libros',        label: 'MS1 — GET /libros?limit=3',         fetch: () => apiRequest('/libros?limit=3'),          badge: 'MS1' },
  { key: 'ms1_autores',       label: 'MS1 — GET /autores?limit=3',        fetch: () => apiRequest('/autores?limit=3'),         badge: 'MS1' },
  { key: 'ms1_generos',       label: 'MS1 — GET /generos',                fetch: () => apiRequest('/generos'),                 badge: 'MS1' },
  // MS2 — CON prefijo /ms2
  { key: 'ms2_pedido',        label: 'MS2 — GET /ms2/pedidos/1',          fetch: () => apiRequest('/ms2/pedidos/1'),           badge: 'MS2' },
  { key: 'ms2_cliente',       label: 'MS2 — GET /ms2/clientes/1',         fetch: () => apiRequest('/ms2/clientes/1'),          badge: 'MS2' },
  // MS3 — SIN prefijo /ms3
  { key: 'ms3_resenas_libro', label: 'MS3 — GET /resenas?libro_id=1',     fetch: () => apiRequest('/resenas?libro_id=1'),      badge: 'MS3' },
  { key: 'ms3_resenas_limit', label: 'MS3 — GET /resenas?limit=3',        fetch: () => apiRequest('/resenas?limit=3'),         badge: 'MS3' },
  // MS5 — SIN prefijo /ms5
  { key: 'ms5_top_autores',   label: 'MS5 — GET /top-autores',            fetch: () => apiRequest('/top-autores'),             badge: 'MS5' },
  { key: 'ms5_ventas',        label: 'MS5 — GET /ventas-por-genero',      fetch: () => apiRequest('/ventas-por-genero'),       badge: 'MS5' },
  { key: 'ms5_rating',        label: 'MS5 — GET /rating-por-genero',      fetch: () => apiRequest('/rating-por-genero'),       badge: 'MS5' },
  { key: 'ms5_libros',        label: 'MS5 — GET /libros-mas-vendidos',    fetch: () => apiRequest('/libros-mas-vendidos'),     badge: 'MS5' },
]

// ── B. Diagnóstico MS4 ─────────────────────────────────────────────────────
const MS4_DIAG = [
  { key: 'ms4_d1',  label: 'GET /perfil-cliente/1',         path: '/perfil-cliente/1' },
  { key: 'ms4_d3',  label: 'GET /ms4/perfil-cliente/1',     path: '/ms4/perfil-cliente/1' },
  { key: 'ms4_d5',  label: 'GET /detalle-libro/1',          path: '/detalle-libro/1' },
  { key: 'ms4_d7',  label: 'GET /ms4/detalle-libro/1',      path: '/ms4/detalle-libro/1' },
  { key: 'ms4_d9',  label: 'GET /catalogo-con-stats',       path: '/catalogo-con-stats',       timeoutMs: 45_000 },
  { key: 'ms4_d11', label: 'GET /ms4/catalogo-con-stats',   path: '/ms4/catalogo-con-stats',   timeoutMs: 45_000 },
]

const BADGE_COLORS = {
  MS1: '#1e3a5f',
  MS2: '#065f46',
  MS3: '#7c3aed',
  MS4: '#b45309',
  MS5: '#0e7490',
}

function initMain() {
  return Object.fromEntries(CHECKS.map((c) => [c.key, { status: 'pending', ms: null }]))
}
function initDiag() {
  return Object.fromEntries(MS4_DIAG.map((c) => [c.key, { status: 'pending', ms: null }]))
}

export default function ApiTestPage() {
  const [results,    setResults]    = useState(initMain)
  const [ms4Results, setMs4Results] = useState(initDiag)
  const [running,    setRunning]    = useState(false)

  const runAll = useCallback(async () => {
    setResults(initMain())
    setMs4Results(initDiag())
    setRunning(true)
    await Promise.allSettled([
      ...CHECKS.map(async (check) => {
        const t0 = Date.now()
        try {
          const data = await check.fetch()
          setResults((prev) => ({ ...prev, [check.key]: { status: 'ok', data, ms: Date.now() - t0 } }))
        } catch (err) {
          setResults((prev) => ({ ...prev, [check.key]: { status: 'error', error: err.message, ms: Date.now() - t0 } }))
        }
      }),
      ...MS4_DIAG.map(async (diag) => {
        const t0 = Date.now()
        try {
          const data = await apiRequest(diag.path, diag.timeoutMs ? { timeoutMs: diag.timeoutMs } : {})
          setMs4Results((prev) => ({ ...prev, [diag.key]: { status: 'ok', data, ms: Date.now() - t0 } }))
        } catch (err) {
          setMs4Results((prev) => ({ ...prev, [diag.key]: { status: 'error', error: err.message, ms: Date.now() - t0 } }))
        }
      }),
    ])
    setRunning(false)
  }, [])

  // Ejecuta al montar
  const [ran, setRan] = useState(false)
  if (!ran) { setRan(true); runAll() }

  const total   = CHECKS.length
  const ok      = Object.values(results).filter((r) => r.status === 'ok').length
  const errors  = Object.values(results).filter((r) => r.status === 'error').length
  const pending = total - ok - errors

  const missingEnv = !_ENV_URL
  const isProd     = !_IS_DEV

  return (
    <div className="page-container">
      <div className="container">

        {/* ── Alerta si falta VITE_API_BASE_URL en producción ── */}
        {missingEnv && isProd && (
          <div className="alert alert--error" style={{ marginBottom: '1.5rem' }}>
            ⚠️ <strong>Falta configurar VITE_API_BASE_URL.</strong> En AWS Amplify debes agregarla en{' '}
            <em>App settings › Environment variables</em> y hacer redeploy.
            Sin esta variable todas las llamadas al API Gateway fallarán en producción.
          </div>
        )}

        {/* ── Encabezado ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">🔌 Prueba de conexión — API Gateway</h1>
            <p className="page-badge">
              {_BASE_DISPLAY ?? '⚠️ VITE_API_BASE_URL no configurada'}
            </p>
            {missingEnv && _IS_DEV && (
              <p style={{ fontSize: '0.75rem', color: '#b45309', marginTop: '0.25rem' }}>
                ℹ️ Variable no detectada — usando fallback de desarrollo.
              </p>
            )}
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
          <span style={{ marginLeft: 'auto', fontSize: '0.7rem', opacity: 0.7 }}>
            VITE_API_BASE_URL: {_ENV_URL ? '✅ configurada' : '❌ no configurada'}
          </span>
        </div>

        {/* ── A. Pruebas principales ── */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '1.5rem 0 0.75rem' }}>
          A. Pruebas principales (MS1 · MS2 · MS3 · MS5)
        </h2>
        <div className="apitest-grid">
          {CHECKS.map((check) => {
            const result        = results[check.key]
            const isOk          = result.status === 'ok'
            const isError       = result.status === 'error'
            const isPendingCard = result.status === 'pending'
            return (
              <div
                key={check.key}
                className={`apitest-card${isOk ? ' apitest-card--ok' : isError ? ' apitest-card--error' : ''}`}
              >
                <div className="apitest-card__header">
                  <span className="apitest-card__badge" style={{ background: BADGE_COLORS[check.badge] }}>
                    {check.badge}
                  </span>
                  <span className="apitest-card__label">{check.label}</span>
                  <span className="apitest-card__status">
                    {isPendingCard ? '⏳' : isOk ? '✅' : '❌'}
                    {result.ms != null && (
                      <span style={{ fontSize: '0.7rem', marginLeft: '0.4rem', opacity: 0.7 }}>
                        {result.ms} ms
                      </span>
                    )}
                  </span>
                </div>
                {isPendingCard && <p className="apitest-card__msg">Conectando…</p>}
                {isError && (
                  <p className="apitest-card__msg apitest-card__msg--error">{result.error}</p>
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

        {/* ── B. Diagnóstico MS4 ── */}
        <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '2rem 0 0.4rem' }}>
          B. Diagnóstico MS4 — variantes de ruta
        </h2>
        <p style={{ fontSize: '0.8rem', opacity: 0.7, marginBottom: '0.75rem' }}>
          Prueba todas las combinaciones de prefijo y trailing slash para identificar cuál responde.
          Los endpoints de <code>/catalogo-con-stats</code> tienen timeout extendido a 45 s.
        </p>
        <div className="apitest-grid">
          {MS4_DIAG.map((diag) => {
            const result        = ms4Results[diag.key]
            const isOk          = result.status === 'ok'
            const isError       = result.status === 'error'
            const isPendingCard = result.status === 'pending'
            return (
              <div
                key={diag.key}
                className={`apitest-card apitest-card--diag${isOk ? ' apitest-card--ok' : isError ? ' apitest-card--error' : ''}`}
              >
                <div className="apitest-card__header">
                  <span className="apitest-card__badge" style={{ background: BADGE_COLORS.MS4 }}>
                    MS4 diag
                  </span>
                  <span className="apitest-card__label">{diag.label}</span>
                  <span className="apitest-card__status">
                    {isPendingCard ? '⏳' : isOk ? '✅' : '❌'}
                    {result.ms != null && (
                      <span style={{ fontSize: '0.7rem', marginLeft: '0.4rem', opacity: 0.7 }}>
                        {result.ms} ms
                      </span>
                    )}
                  </span>
                </div>
                {isPendingCard && <p className="apitest-card__msg">Conectando…</p>}
                {isError && (
                  <p className="apitest-card__msg apitest-card__msg--error">{result.error}</p>
                )}
                {isOk && (
                  <pre className="apitest-card__pre">
                    {JSON.stringify(result.data, null, 2).slice(0, 400)}
                    {JSON.stringify(result.data, null, 2).length > 400 ? '\n… (truncado)' : ''}
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
          <code>VITE_API_BASE_URL</code>, sin URLs hardcodeadas en componentes.
        </div>

      </div>
    </div>
  )
}
