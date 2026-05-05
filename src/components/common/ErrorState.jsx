/** Indicador de error reutilizable con botón opcional de reintento. */
function ErrorState({ message, onRetry }) {
  return (
    <div className="status-state status-state--error">
      <span className="status-state__icon" aria-hidden="true">⚠️</span>
      <p className="status-state__title">Ocurrió un error</p>
      <p className="status-state__text">
        {message || 'No se pudo cargar la información. Intenta de nuevo.'}
      </p>
      {onRetry && (
        <button className="btn btn--accent btn--sm" onClick={onRetry}>
          Reintentar
        </button>
      )}
    </div>
  )
}

export default ErrorState
