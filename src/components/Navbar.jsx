import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',          label: 'Inicio' },
  { to: '/libros',    label: '📚 Libros' },
  { to: '/catalogo',  label: '🔗 Catálogo stats' },
  { to: '/pedidos',   label: '🛒 Pedidos' },
  { to: '/resenas',   label: '⭐ Reseñas' },
  { to: '/analytics', label: '📈 Analytics' },
  { to: '/api-test',  label: '🔌 API Test' },
]

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  function closeMenu() {
    setMenuOpen(false)
  }

  return (
    <header className="navbar">
      <div className="navbar__container">
        {/* Logo */}
        <Link to="/" className="navbar__brand" onClick={closeMenu}>
          <span className="navbar__logo-icon">📚</span>
          <span className="navbar__logo-text">
            Biblio<em>Mercado</em>
          </span>
        </Link>

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
            {NAV_LINKS.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) => isActive ? 'navbar__link--active' : ''}
                  onClick={closeMenu}
                >
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
