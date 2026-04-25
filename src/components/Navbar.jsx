import { useState } from 'react'

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <div className="navbar__brand">
          <span className="navbar__logo-icon">📚</span>
          <span className="navbar__logo-text">
            Biblio<em>Mercado</em>
          </span>
        </div>

        {/* Hamburger (mobile) */}
        <button
          className={`navbar__toggle ${menuOpen ? 'navbar__toggle--open' : ''}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú de navegación"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>

        {/* Links */}
        <nav className={`navbar__nav ${menuOpen ? 'navbar__nav--open' : ''}`}>
          <ul className="navbar__links">
            <li>
              <a href="#inicio" onClick={closeMenu}>
                Inicio
              </a>
            </li>
            <li>
              <a href="#explorar" onClick={closeMenu}>
                Explorar libros
              </a>
            </li>
            <li>
              <a href="#publicar" className="navbar__link--accent" onClick={closeMenu}>
                Publicar libro
              </a>
            </li>
            <li>
              <a href="#carrito" onClick={closeMenu}>
                🛒&nbsp;Carrito
              </a>
            </li>
          </ul>

          <div className="navbar__auth">
            <a href="#login" className="btn btn--outline-nav" onClick={closeMenu}>
              Iniciar sesión
            </a>
            <a href="#register" className="btn btn--accent" onClick={closeMenu}>
              Registrarse
            </a>
          </div>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
