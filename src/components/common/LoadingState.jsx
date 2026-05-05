/** Indicador de carga reutilizable. */
function LoadingState({ message = 'Cargando datos...' }) {
  return (
    <div className="status-state">
      <div className="status-state__spinner" aria-hidden="true" />
      <p className="status-state__text">{message}</p>
    </div>
  )
}

export default LoadingState
