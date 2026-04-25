import BookCard from './BookCard'

function BookList({ books, loading, error, fromMock, searchQuery }) {
  return (
    <section id="explorar" className="book-list">
      <div className="container">
        {/* Encabezado de sección */}
        <div className="book-list__header">
          <h2 className="section-title">
            {searchQuery ? `Resultados para "${searchQuery}"` : 'Catálogo de libros'}
          </h2>
          <p className="section-subtitle">
            {searchQuery
              ? 'Libros que coinciden con tu búsqueda'
              : 'Explora nuestra selección de títulos disponibles'}
          </p>

          {/* Aviso cuando se usan datos mock */}
          {fromMock && !loading && (
            <div className="book-list__alert" role="alert">
              <span>⚠️</span>
              <span>
                No se pudo conectar con el servidor. Mostrando libros de
                ejemplo – conecta el backend para ver datos reales.
              </span>
            </div>
          )}
        </div>

        {/* Estado: cargando */}
        {loading && (
          <div className="book-list__status">
            <span className="book-list__status-icon">📖</span>
            <p className="book-list__status-title">Cargando libros...</p>
            <p className="book-list__status-text">
              Por favor espera un momento.
            </p>
          </div>
        )}

        {/* Estado: error total (sin fallback) */}
        {!loading && error && (
          <div className="book-list__status book-list__status--error">
            <span className="book-list__status-icon">⚠️</span>
            <p className="book-list__status-title">{error}</p>
            <p className="book-list__status-text">
              Intenta refrescar la página o verifica tu conexión.
            </p>
          </div>
        )}

        {/* Estado: sin resultados */}
        {!loading && !error && books.length === 0 && (
          <div className="book-list__status">
            <span className="book-list__status-icon">🔍</span>
            <p className="book-list__status-title">
              No encontramos libros para tu búsqueda.
            </p>
            <p className="book-list__status-text">
              Intenta con otro término o explora el catálogo completo.
            </p>
          </div>
        )}

        {/* Conteo de resultados */}
        {!loading && !error && books.length > 0 && (
          <p className="book-list__count">
            {books.length} {books.length === 1 ? 'libro encontrado' : 'libros encontrados'}
          </p>
        )}

        {/* Grid de tarjetas */}
        {!loading && !error && books.length > 0 && (
          <div className="book-list__grid">
            {books.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

export default BookList
