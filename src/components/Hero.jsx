import SearchBar from './SearchBar'

function Hero({ onSearch }) {
  return (
    <section id="inicio" className="hero">
      {/* Radial glow decorations */}
      <div className="hero__glow hero__glow--left" aria-hidden="true" />
      <div className="hero__glow hero__glow--right" aria-hidden="true" />

      <div className="hero__content">
        <span className="hero__tagline">✦ Plataforma de libros digital</span>

        <h1 className="hero__title">
          Descubre, publica y compra libros
          <br />
          <em>en un solo lugar</em>
        </h1>

        <p className="hero__subtitle">
          Una plataforma creada para lectores, autores independientes
          y amantes de la lectura. Explora miles de títulos o comparte
          tu propia obra con el mundo.
        </p>

        <div className="hero__actions">
          <a href="#explorar" className="btn btn--accent btn--lg">
            Explorar libros
          </a>
          <a href="#publicar" className="btn btn--outline-hero btn--lg">
            Publicar un libro
          </a>
        </div>

        {/* Barra de búsqueda principal */}
        <div className="hero__search">
          <SearchBar onSearch={onSearch} />
        </div>
      </div>

      {/* Separador wave hacia la siguiente sección */}
      <div className="hero__wave" aria-hidden="true">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,40 C240,70 480,10 720,40 C960,70 1200,20 1440,40 L1440,70 L0,70 Z"
            fill="#f5f0e8"
          />
        </svg>
      </div>
    </section>
  )
}

export default Hero
