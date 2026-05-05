/**
 * Tarjeta de dato/métrica reutilizable para dashboards.
 *
 * @param {string}  title     - Etiqueta descriptiva
 * @param {*}       value     - Valor principal a mostrar
 * @param {string}  [subtitle]- Texto secundario opcional
 * @param {string}  [icon]    - Emoji o ícono
 * @param {boolean} [accent]  - Aplica variante con acento dorado
 */
function DataCard({ title, value, subtitle, icon, accent = false }) {
  return (
    <div className={`data-card${accent ? ' data-card--accent' : ''}`}>
      {icon && <span className="data-card__icon" aria-hidden="true">{icon}</span>}
      <div className="data-card__body">
        <p className="data-card__title">{title}</p>
        <p className="data-card__value">{value ?? '—'}</p>
        {subtitle && <p className="data-card__subtitle">{subtitle}</p>}
      </div>
    </div>
  )
}

export default DataCard
