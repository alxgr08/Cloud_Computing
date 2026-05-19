/**
 * HomePage — Página principal
 * Muestra el hero, estado de los 5 microservicios y accesos rápidos a módulos.
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import apiClient from '../services/apiClient'

// Health check paths verificados en vivo contra el API Gateway.
// MS1: usa /libros?limit=1 (no hay /health, /ms1/health → 404).
// MS2: usa /ms2/clientes/1 (registro individual, más ligero que la colección).
// MS3: montado en raíz, NO en /ms3 → usa /resenas?limit=1.
// MS4: usa /libros?limit=1 para health check (no hay /ms4/health → 404).
// MS5: usa /top-autores (no hay /ms5/health → 404).
const SERVICES = [
  { id: 'ms1', name: 'MS1 — Catálogo',  path: '/libros?limit=1',  icon: '📚' },
  { id: 'ms2', name: 'MS2 — Pedidos',   path: '/ms2/clientes/1',  icon: '🛒' },
  { id: 'ms3', name: 'MS3 — Reseñas',   path: '/resenas?limit=1', icon: '⭐' },
  { id: 'ms4', name: 'MS4 — Agregador', path: '/libros?limit=1',  icon: '🔗' },
  { id: 'ms5', name: 'MS5 — Analytics', path: '/top-autores',     icon: '📊' },
]

const MODULES = [
  { to: '/libros',    icon: '📚', title: 'Catálogo de libros',  desc: 'Explora, crea y gestiona libros (MS1)' },
  { to: '/pedidos',   icon: '🛒', title: 'Pedidos',             desc: 'Gestiona pedidos y clientes (MS2)' },
  { to: '/resenas',   icon: '⭐', title: 'Reseñas',             desc: 'Lee y escribe reseñas (MS3)' },
  { to: '/catalogo',  icon: '🔗', title: 'Catálogo con stats',  desc: 'Vista enriquecida del catálogo (MS4)' },
  { to: '/analytics', icon: '📈', title: 'Analytics',           desc: 'Dashboard de métricas y ventas (MS5)' },
]

function ServiceBadge({ service }) {
  // checking | ok | error (red/network) | console_error (HTTP 4xx/5xx)
  const [status, setStatus] = useState('checking')

  useEffect(() => {
    let cancelled = false
    apiClient.get(service.path)
      .then(() => {
        if (!cancelled) setStatus('ok')
      })
      .catch((err) => {
        if (!cancelled) {
          // HTTP errors (4xx/5xx) get their own label; network/timeout → 'Sin conexión'
          setStatus(err?.type === 'HTTP' ? 'console_error' : 'error')
        }
      })
    return () => { cancelled = true }
  }, [service.path])

  // Map 'console_error' to the 'error' CSS class to keep existing styles
  const cssState = status === 'console_error' ? 'error' : status
  const label =
    status === 'checking'      ? 'Verificando…'
    : status === 'ok'          ? '● Online'
    : status === 'console_error' ? '● Error: revisar consola'
    : '● Sin conexión'

  return (
    <div className="service-badge">
      <span className="service-badge__icon">{service.icon}</span>
      <div className="service-badge__info">
        <span className="service-badge__name">{service.name}</span>
        <span className={`service-badge__status service-badge__status--${cssState}`}>
          {label}
        </span>
      </div>
    </div>
  )
}

function HomePage() {
  const navigate = useNavigate()

  function handleSearch(query) {
    navigate(`/libros?search=${encodeURIComponent(query)}`)
  }

  return (
    <>
      <Hero onSearch={handleSearch} />

      {/* ── Estado de microservicios ──────────────────────────────────────── */}
      <section className="page-section">
        <div className="container">
          <h2 className="section-title">Estado de microservicios</h2>
          <p className="section-subtitle">
            Conexión en tiempo real con el API Gateway de AWS.
          </p>
          <div className="services-grid">
            {SERVICES.map((svc) => (
              <ServiceBadge key={svc.id} service={svc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Módulos del sistema ───────────────────────────────────────────── */}
      <section className="page-section page-section--alt">
        <div className="container">
          <h2 className="section-title">Módulos del sistema</h2>
          <p className="section-subtitle">
            Accede a cada sección de BiblioMercado.
          </p>
          <div className="modules-grid">
            {MODULES.map((mod) => (
              <Link key={mod.to} to={mod.to} className="module-card">
                <span className="module-card__icon">{mod.icon}</span>
                <h3 className="module-card__title">{mod.title}</h3>
                <p className="module-card__desc">{mod.desc}</p>
                <span className="module-card__arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}

export default HomePage
