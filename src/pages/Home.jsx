import { useState, useEffect, useCallback } from 'react'
import Hero from '../components/Hero'
import BookList from '../components/BookList'
import { getBooks, searchBooks } from '../services/api'

// Estadísticas visuales de la plataforma (valores fijos para el demo)
const STATS = [
  { icon: '📚', value: '1,200+', label: 'Libros disponibles' },
  { icon: '✍️', value: '680+',   label: 'Autores registrados' },
  { icon: '👥', value: '15K+',   label: 'Lectores activos' },
]

// Características destacadas de la plataforma
const FEATURES = [
  {
    icon: '🔍',
    title: 'Descubre miles de títulos',
    desc: 'Explora un catálogo creciente de libros de todos los géneros: novela, ciencia, autoayuda, historia y más.',
  },
  {
    icon: '✍️',
    title: 'Publica tus propios libros',
    desc: 'Sube tu obra, define el precio y llega a miles de lectores. El proceso es rápido y sencillo.',
  },
  {
    icon: '🛒',
    title: 'Gestiona tu biblioteca',
    desc: 'Agrega libros al carrito, compra con seguridad y accede a tu historial de compras desde cualquier dispositivo.',
  },
]

function Home() {
  const [books, setBooks]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [fromMock, setFromMock]     = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const loadBooks = useCallback(async (query = '') => {
    setLoading(true)
    setError(null)
    try {
      const result = query ? await searchBooks(query) : await getBooks()
      setBooks(result.data)
      setFromMock(result.fromMock)
    } catch {
      setError('No se pudo cargar el catálogo. Intenta nuevamente.')
      setBooks([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Carga inicial al montar la página
  useEffect(() => {
    loadBooks()
  }, [loadBooks])

  function handleSearch(query) {
    setSearchQuery(query)
    loadBooks(query)
    // Desplaza al catálogo automáticamente al buscar
    document.getElementById('explorar')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      {/* Hero con búsqueda integrada */}
      <Hero onSearch={handleSearch} />

      {/* Barra de estadísticas */}
      <div className="stats-bar">
        <div className="container stats-bar__grid">
          {STATS.map((stat) => (
            <div key={stat.label} className="stats-bar__item">
              <span className="stats-bar__icon">{stat.icon}</span>
              <strong className="stats-bar__value">{stat.value}</strong>
              <span className="stats-bar__label">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Catálogo de libros */}
      <BookList
        books={books}
        loading={loading}
        error={error}
        fromMock={fromMock}
        searchQuery={searchQuery}
      />

      {/* Sección de características – inspirada en el layout de index2 */}
      <section id="publicar" className="features">
        <div className="container">
          <h2 className="section-title">Todo lo que necesitas</h2>
          <p className="section-subtitle">
            BiblioMercado conecta lectores y autores en una sola plataforma,
            simple y segura.
          </p>
          <div className="features__grid">
            {FEATURES.map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-card__icon">{f.icon}</span>
                <h3 className="feature-card__title">{f.title}</h3>
                <p className="feature-card__desc">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA – Publicar libro / Registrarse */}
      <section className="cta-section">
        <div className="container cta-section__inner">
          <h2 className="cta-section__title">¿Tienes un libro para compartir?</h2>
          <p className="cta-section__subtitle">
            Únete a nuestra comunidad de autores y llega a miles de lectores.
          </p>
          <div className="cta-section__actions">
            <a href="#register" className="btn btn--accent btn--lg">
              Crear cuenta gratis
            </a>
            <a href="#explorar" className="btn btn--outline-dark btn--lg">
              Explorar catálogo
            </a>
          </div>
        </div>
      </section>
    </>
  )
}

export default Home
