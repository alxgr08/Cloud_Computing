function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="footer__top">
        <div className="container footer__grid">
          {/* Brand */}
          <div className="footer__col">
            <div className="footer__brand">
              <span className="footer__logo-icon">📚</span>
              <span className="footer__logo-text">
                Biblio<em>Mercado</em>
              </span>
            </div>
            <p className="footer__desc">
              Una plataforma creada para lectores, autores independientes
              y amantes de la lectura.
            </p>
          </div>

          {/* Navegación */}
          <div className="footer__col">
            <h4 className="footer__heading">Explorar</h4>
            <ul className="footer__links">
              <li><a href="#explorar">Catálogo de libros</a></li>
              <li><a href="#publicar">Publicar un libro</a></li>
              <li><a href="#carrito">Mi carrito</a></li>
            </ul>
          </div>

          {/* Cuenta */}
          <div className="footer__col">
            <h4 className="footer__heading">Mi cuenta</h4>
            <ul className="footer__links">
              <li><a href="#login">Iniciar sesión</a></li>
              <li><a href="#register">Registrarse</a></li>
            </ul>
          </div>

          {/* Info del proyecto */}
          <div className="footer__col">
            <h4 className="footer__heading">Proyecto</h4>
            <ul className="footer__links">
              <li><a href="#inicio">Cloud Computing – Entrega 1</a></li>
              <li><span>Frontend React + Vite</span></li>
              <li><span>Backend: REST API (próximamente)</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <p>© {year} BiblioMercado. Proyecto académico – Cloud Computing.</p>
          <p>Frontend desarrollado con React + Vite</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
