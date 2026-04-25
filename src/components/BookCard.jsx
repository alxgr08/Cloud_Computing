import { useState } from 'react'

const CATEGORY_STYLES = {
  Literatura:  { badge: { background: '#e8f5e9', color: '#2e7d32' }, gradient: 'linear-gradient(135deg, #2d6a4f 0%, #1b4332 100%)' },
  Clásico:     { badge: { background: '#fff3e0', color: '#e65100' }, gradient: 'linear-gradient(135deg, #92400e 0%, #78350f 100%)' },
  Autoayuda:   { badge: { background: '#e3f2fd', color: '#1565c0' }, gradient: 'linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%)' },
  Finanzas:    { badge: { background: '#f3e5f5', color: '#6a1b9a' }, gradient: 'linear-gradient(135deg, #5b21b6 0%, #3b0764 100%)' },
  Ciencia:     { badge: { background: '#e0f7fa', color: '#00695c' }, gradient: 'linear-gradient(135deg, #0e7490 0%, #164e63 100%)' },
  Historia:    { badge: { background: '#fce4ec', color: '#c62828' }, gradient: 'linear-gradient(135deg, #9f1239 0%, #881337 100%)' },
}

const DEFAULT_STYLE = {
  badge: { background: '#f3f4f6', color: '#374151' },
  gradient: 'linear-gradient(135deg, #374151 0%, #1f2937 100%)',
}

function getCategoryStyle(category) {
  return CATEGORY_STYLES[category] || DEFAULT_STYLE
}

function BookCard({ book }) {
  const [imgError, setImgError] = useState(false)
  const style = getCategoryStyle(book.category)

  function handleAddToCart() {
    // TODO: conectar con POST /cart/items cuando el backend esté listo
    alert(`"${book.title}" agregado al carrito (funcionalidad próximamente disponible)`)
  }

  function handleViewDetail() {
    // TODO: navegar a /books/:id cuando se implemente el router
    alert(`Detalle de "${book.title}" – próximamente disponible`)
  }

  return (
    <article className="book-card">
      {/* Portada */}
      <div className="book-card__cover">
        {book.image && !imgError ? (
          <img
            src={book.image}
            alt={`Portada de ${book.title}`}
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div
            className="book-card__placeholder"
            style={{ background: style.gradient }}
            aria-label={`Portada de ${book.title}`}
          >
            <span className="book-card__placeholder-letter">
              {book.title.charAt(0)}
            </span>
            <span className="book-card__placeholder-title">{book.title}</span>
          </div>
        )}
      </div>

      {/* Cuerpo */}
      <div className="book-card__body">
        <span className="book-card__category" style={style.badge}>
          {book.category}
        </span>
        <h3 className="book-card__title">{book.title}</h3>
        <p className="book-card__author">por {book.author}</p>
        <p className="book-card__description">{book.description}</p>
      </div>

      {/* Footer con precio y botones */}
      <div className="book-card__footer">
        <span className="book-card__price">
          ${book.price.toFixed(2)}
        </span>
        <div className="book-card__actions">
          <button
            className="btn btn--ghost btn--sm"
            onClick={handleViewDetail}
          >
            Ver detalle
          </button>
          <button
            className="btn btn--accent btn--sm"
            onClick={handleAddToCart}
          >
            🛒 Agregar
          </button>
        </div>
      </div>
    </article>
  )
}

export default BookCard
