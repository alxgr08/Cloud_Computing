/** Estado vacío reutilizable cuando no hay datos. */
function EmptyState({ message = 'No hay datos disponibles.', icon = '📭' }) {
  return (
    <div className="status-state">
      <span className="status-state__icon" aria-hidden="true">{icon}</span>
      <p className="status-state__title">Sin resultados</p>
      <p className="status-state__text">{message}</p>
    </div>
  )
}

export default EmptyState
