/**
 * PedidosPage — Gestión de pedidos y clientes
 * Consume MS2: GET /ms2/pedidos, POST /ms2/pedidos, GET /ms2/clientes
 *
 * MS2 OpenAPI payload para crear pedido:
 *   { clienteId, fecha, estado, total, direccionEnvio, metodoPago,
 *     items: [{ libroId, cantidad, precioUnitario }] }
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'
import { getPedidos, createPedido, getClientes } from '../services/ms2PedidosService'

const METODOS_PAGO = ['tarjeta', 'efectivo', 'transferencia', 'paypal']

const EMPTY_FORM = {
  clienteId: '', libroId: '', cantidad: '1', precioUnitario: '',
  direccionEnvio: '', metodoPago: 'tarjeta',
}

function normPedido(p) {
  return {
    id:         p.id,
    cliente:    p.cliente    || p.client       || p.cliente_nombre || p.clienteId || p.cliente_id || '—',
    estado:     p.estado     || p.status       || p.state         || '—',
    total:      p.total      ?? p.monto        ?? p.amount        ?? null,
    fecha:      p.fecha      || p.fecha_pedido || p.created_at    || p.date || null,
    items:      p.items      ?? p.productos    ?? p.detalles      ?? null,
  }
}

export default function PedidosPage() {
  const [pedidos,        setPedidos]        = useState([])
  const [clientes,       setClientes]       = useState([])
  // Los pedidos y los clientes se cargan de forma independiente para que
  // un timeout en /pedidos no bloquee la sección de clientes ni el formulario.
  const [loadingPedidos, setLoadingPedidos] = useState(true)
  const [loadingClientes, setLoadingClientes] = useState(true)
  const [errorPedidos,   setErrorPedidos]   = useState(null)
  const [errorClientes,  setErrorClientes]  = useState(null)
  const [showForm,       setShowForm]       = useState(false)
  const [form,           setForm]           = useState(EMPTY_FORM)
  const [formError,      setFormError]      = useState(null)
  const [submitting,     setSubmitting]     = useState(false)

  const fetchClientes = useCallback(async () => {
    setLoadingClientes(true)
    setErrorClientes(null)
    try {
      const data = await getClientes()
      setClientes(Array.isArray(data) ? data : [])
    } catch (err) {
      setErrorClientes(err.message)
    } finally {
      setLoadingClientes(false)
    }
  }, [])

  const fetchPedidos = useCallback(async () => {
    setLoadingPedidos(true)
    setErrorPedidos(null)
    try {
      const data = await getPedidos()
      setPedidos(Array.isArray(data) ? data : [])
    } catch (err) {
      setErrorPedidos(err.message)
    } finally {
      setLoadingPedidos(false)
    }
  }, [])

  useEffect(() => {
    fetchClientes()
    fetchPedidos()
  }, [fetchClientes, fetchPedidos])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!form.clienteId)                                   return setFormError('El cliente es requerido.')
    if (!form.cantidad || Number(form.cantidad) < 1)        return setFormError('La cantidad debe ser al menos 1.')
    if (!form.precioUnitario || Number(form.precioUnitario) <= 0) return setFormError('El precio unitario debe ser mayor a 0.')
    if (!form.direccionEnvio.trim())                       return setFormError('La dirección de envío es requerida.')

    const cantidad        = Number(form.cantidad)
    const precioUnitario  = Number(form.precioUnitario)

    const payload = {
      clienteId:      Number(form.clienteId),
      fecha:          new Date().toISOString().slice(0, 10),
      estado:         'pendiente',
      total:          Math.round(cantidad * precioUnitario * 100) / 100,
      direccionEnvio: form.direccionEnvio.trim(),
      metodoPago:     form.metodoPago,
      items: form.libroId
        ? [{ libroId: Number(form.libroId), cantidad, precioUnitario }]
        : [],
    }

    setSubmitting(true)
    try {
      await createPedido(payload)
      setForm(EMPTY_FORM)
      setShowForm(false)
      fetchPedidos()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const displayed = pedidos.map(normPedido)

  return (
    <div className="page-container">
      <div className="container">

        <div className="page-header">
          <div>
            <h1 className="page-title">🛒 Pedidos</h1>
            <p className="page-badge">MS2 · GET /ms2/pedidos · POST /ms2/pedidos</p>
          </div>
          <button className="btn btn--accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo pedido'}
          </button>
        </div>

        {/* ── Formulario de nuevo pedido ── */}
        {showForm && (
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <h2 className="form-card__title">Nuevo pedido</h2>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-grid">
              <label className="form-field">
                <span>Cliente *</span>
                {clientes.length > 0 ? (
                  <select name="clienteId" value={form.clienteId} onChange={handleChange} required>
                    <option value="">— Seleccionar cliente —</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre || c.name || c.email || c.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="clienteId" type="number" min="1"
                    value={form.clienteId} onChange={handleChange}
                    placeholder="ID del cliente" required
                  />
                )}
              </label>
              <label className="form-field">
                <span>ID del libro (opcional)</span>
                <input
                  name="libroId" type="number" min="1"
                  value={form.libroId} onChange={handleChange}
                  placeholder="ID del libro"
                />
              </label>
              <label className="form-field">
                <span>Cantidad *</span>
                <input
                  name="cantidad" type="number" min="1"
                  value={form.cantidad} onChange={handleChange}
                  placeholder="1" required
                />
              </label>
              <label className="form-field">
                <span>Precio unitario * ($)</span>
                <input
                  name="precioUnitario" type="number" step="0.01" min="0.01"
                  value={form.precioUnitario} onChange={handleChange}
                  placeholder="0.00" required
                />
              </label>
              <label className="form-field">
                <span>Método de pago *</span>
                <select name="metodoPago" value={form.metodoPago} onChange={handleChange}>
                  {METODOS_PAGO.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Dirección de envío *</span>
                <input
                  name="direccionEnvio" type="text"
                  value={form.direccionEnvio} onChange={handleChange}
                  placeholder="Calle, ciudad, país" required
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--accent" disabled={submitting}>
                {submitting ? 'Creando…' : 'Crear pedido'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* ── Clientes section ── */}
        {loadingClientes && <LoadingState message="Cargando clientes…" />}
        {!loadingClientes && errorClientes && (
          <ErrorState message={`Clientes: ${errorClientes}`} onRetry={fetchClientes} />
        )}
        {!loadingClientes && !errorClientes && clientes.length > 0 && (
          <details className="collapsible">
            <summary className="collapsible__summary">
              👥 Clientes cargados desde /ms2/clientes ({clientes.length})
            </summary>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map((c) => (
                    <tr key={c.id}>
                      <td className="td-id">{c.id}</td>
                      <td>{c.nombre || c.name || '—'}</td>
                      <td>{c.email || '—'}</td>
                      <td>
                        <Link to={`/clientes/${c.id}`} className="btn btn--ghost btn--sm">
                          Perfil
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}

        {/* ── Tabla de pedidos ── */}
        {loadingPedidos && <LoadingState message="Cargando pedidos desde MS2… (puede tardar hasta 30 s)" />}
        {!loadingPedidos && errorPedidos && (
          <ErrorState
            message={`Pedidos: ${errorPedidos}`}
            onRetry={fetchPedidos}
          />
        )}
        {!loadingPedidos && !errorPedidos && displayed.length === 0 && (
          <EmptyState message="No hay pedidos registrados." icon="🛒" />
        )}

        {!loadingPedidos && !errorPedidos && displayed.length > 0 && (
          <>
            <p className="table-count">{displayed.length} pedidos</p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Cliente</th>
                    <th>Estado</th>
                    <th>Total</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((p) => (
                    <tr key={p.id}>
                      <td className="td-id">{p.id}</td>
                      <td>{p.cliente}</td>
                      <td>
                        <span className={`badge badge--${p.estado}`}>{p.estado}</span>
                      </td>
                      <td>{p.total != null ? `$${Number(p.total).toFixed(2)}` : '—'}</td>
                      <td>{p.fecha ? new Date(p.fecha).toLocaleDateString() : '—'}</td>
                      <td>
                        <Link to={`/pedidos/${p.id}`} className="btn btn--ghost btn--sm">
                          Detalle
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
