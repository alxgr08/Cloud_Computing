/**
 * HomePage — Página principal
 * Muestra el hero, estado de los 5 microservicios y accesos rápidos a módulos.
 */
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Hero from '../components/Hero'
import apiClient from '../services/apiClient'

const SERVICES = [
  { id: 'ms1', name: 'MS1 — Catálogo',  path: '/ms1/libros',             icon: '📚' },
  { id: 'ms2', name: 'MS2 — Pedidos',   path: '/ms2/pedidos',            icon: '🛒' },
  { id: 'ms3', name: 'MS3 — Reseñas',   path: '/ms3/resenas',            icon: '⭐' },
  { id: 'ms4', name: 'MS4 — Agregador', path: '/ms4/catalogo-con-stats', icon: '🔗' },
  { id: 'ms5', name: 'MS5 — Analytics', path: '/ms5/ventas-por-genero',  icon: '📊' },
]

const MODULES = [
  { to: '/libros',    icon: '📚', title: 'Catálogo de libros',  desc: 'Explora, crea y gestiona libros (MS1)' },
  { to: '/pedidos',   icon: '🛒', title: 'Pedidos',             desc: 'Gestiona pedidos y clientes (MS2)' },
  { to: '/resenas',   icon: '⭐', title: 'Reseñas',             desc: 'Lee y escribe reseñas (MS3)' },
  { to: '/catalogo',  icon: '🔗', title: 'Catálogo con stats',  desc: 'Vista enriquecida del catálogo (MS4)' },
  { to: '/analytics', icon: '📈', title: 'Analytics',           desc: 'Dashboard de métricas y ventas (MS5)' },
]

function ServiceBadge({ service }) {
  const [status, setStatus] = useState('checking') // checking | ok | error

  useEffect(() => {
    let cancelled = false
    apiClient.get(service.path)
      .then(() => { if (!cancelled) setStatus('ok') })
      .catch(() => { if (!cancelled) setStatus('error') })
    return () => { cancelled = true }
  }, [service.path])

  return (
    <div className="service-badge">
      <span className="service-badge__icon">{service.icon}</span>
      <div className="service-badge__info">
        <span className="service-badge__name">{service.name}</span>
        <span className={`service-badge__status service-badge__status--${status}`}>
          {status === 'checking' ? 'Verificando…' : status === 'ok' ? '● Online' : '● Sin conexión'}
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
