import { useState } from 'react'

function SearchBar({ onSearch, initialValue = '' }) {
  const [query, setQuery] = useState(initialValue)

  function handleSubmit(e) {
    e.preventDefault()
    onSearch(query.trim())
  }

  function handleClear() {
    setQuery('')
    onSearch('')
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search" aria-label="Buscar libros">
      <div className="search-bar__input-wrapper">
        <svg
          className="search-bar__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>

        <input
          type="text"
          className="search-bar__input"
          placeholder="Buscar por título, autor o categoría..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Texto de búsqueda"
        />

        {query && (
          <button
            type="button"
            className="search-bar__clear"
            onClick={handleClear}
            aria-label="Limpiar búsqueda"
          >
            ✕
          </button>
        )}
      </div>

      <button type="submit" className="btn btn--accent search-bar__btn">
        Buscar
      </button>
    </form>
  )
}

export default SearchBar
