/**
 * ApiTestPage — Evidencia técnica de conexión con los 5 microservicios
 * Ruta: /api-test
 *
 * Esta página prueba simultáneamente todos los microservicios y muestra
 * el resultado crudo en pantalla. Sirve como evidencia para la rúbrica.
 */
import { useEffect, useState } from 'react'
import { catalogoService }  from '../services/catalogoService'
import { pedidosService }   from '../services/pedidosService'
import { resenasService }   from '../services/resenasService'
import { agregadorService } from '../services/agregadorService'
import { analyticsService } from '../services/analyticsService'

const CHECKS = [
  {
    key:    'ms1_libros',
    label:  'MS1 — Catálogo: GET /ms1/libros',
    fetch:  () => catalogoService.getLibros(),
    badge:  'MS1',
  },
  {
    key:    'ms1_autores',
    label:  'MS1 — Catálogo: GET /ms1/autores',
    fetch:  () => catalogoService.getAutores(),
    badge:  'MS1',
  },
  {
    key:    'ms2_pedidos',
    label:  'MS2 — Pedidos: GET /ms2/pedidos',
    fetch:  () => pedidosService.getPedidos(),
    badge:  'MS2',
  },
  {
    key:    'ms2_clientes',
    label:  'MS2 — Pedidos: GET /ms2/clientes',
    fetch:  () => pedidosService.getClientes(),
    badge:  'MS2',
  },
  {
    key:    'ms3_resenas',
    label:  'MS3 — Reseñas: GET /ms3/resenas',
    fetch:  () => resenasService.getResenas(),
    badge:  'MS3',
  },
  {
    key:    'ms4_catalogo_stats',
    label:  'MS4 — Agregador: GET /ms4/catalogo-con-stats',
    fetch:  () => agregadorService.getCatalogoConStats(),
    badge:  'MS4',
  },
  {
    key:    'ms5_top_autores',
    label:  'MS5 — Analytics: GET /ms5/top-autores',
    fetch:  () => analyticsService.getTopAutores(),
    badge:  'MS5',
  },
  {
    key:    'ms5_ventas',
    label:  'MS5 — Analytics: GET /ms5/ventas-por-genero',
    fetch:  () => analyticsService.getVentasPorGenero(),
    badge:  'MS5',
  },
]

const BADGE_COLORS = {
  MS1: '#1e3a5f',
  MS2: '#065f46',
  MS3: '#7c3aed',
  MS4: '#b45309',
  MS5: '#0e7490',
}

export default function ApiTestPage() {
  const [results, setResults] = useState(() =>
    Object.fromEntries(CHECKS.map((c) => [c.key, { status: 'pending' }]))
  )

  useEffect(() => {
    async function run() {
      // Lanza todas las peticiones en paralelo
      await Promise.allSettled(
        CHECKS.map(async (check) => {
          try {
            const data = await check.fetch()
            setResults((prev) => ({
              ...prev,
              [check.key]: { status: 'ok', data },
            }))
          } catch (err) {
            setResults((prev) => ({
              ...prev,
              [check.key]: { status: 'error', error: err.message },
            }))
          }
        })
      )
    }
    run()
  }, [])

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
        </div>

        {/* ── Resumen ── */}
        <div className="apitest-summary">
          <div className="apitest-summary__chip apitest-summary__chip--ok">
            ✅ {ok} OK
          </div>
          <div className="apitest-summary__chip apitest-summary__chip--error">
            ❌ {errors} Error{errors !== 1 ? 'es' : ''}
          </div>
          {pending > 0 && (
            <div className="apitest-summary__chip apitest-summary__chip--pending">
              ⏳ {pending} pendiente{pending !== 1 ? 's' : ''}
            </div>
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
                className={`apitest-card${isOk ? ' apitest-card--ok' : isError ? ' apitest-card--error' : ''}`}
              >
                <div className="apitest-card__header">
                  <span
                    className="apitest-card__badge"
                    style={{ background: BADGE_COLORS[check.badge] }}
                  >
                    {check.badge}
                  </span>
                  <span className="apitest-card__label">{check.label}</span>
                  <span className="apitest-card__status">
                    {isPending ? '⏳' : isOk ? '✅' : '❌'}
                  </span>
                </div>

                {isPending && (
                  <p className="apitest-card__msg">Conectando…</p>
                )}

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
