/**
 * PedidosPage — Gestión de pedidos y clientes
 * Consume MS2: GET /ms2/pedidos, POST /ms2/pedidos, GET /ms2/clientes
 */
import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'
import { getPedidos, createPedido, getClientes } from '../services/ms2PedidosService'

const EMPTY_FORM = {
  cliente_id: '', libro_id: '', cantidad: '1', total: '',
}

const ESTADOS = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado']

function normPedido(p) {
  return {
    id:         p.id,
    cliente:    p.cliente    || p.client       || p.cliente_nombre || p.cliente_id || '—',
    estado:     p.estado     || p.status       || p.state         || '—',
    total:      p.total      ?? p.monto        ?? p.amount        ?? null,
    fecha:      p.fecha      || p.fecha_pedido || p.created_at    || p.date || null,
    items:      p.items      ?? p.productos    ?? p.detalles      ?? null,
  }
}

export default function PedidosPage() {
  const [pedidos,    setPedidos]    = useState([])
  const [clientes,   setClientes]   = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formError,  setFormError]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [pedidosRes, clientesRes] = await Promise.allSettled([
        getPedidos(), getClientes()
      ])
      if (pedidosRes.status === 'rejected') throw pedidosRes.reason
      setPedidos(Array.isArray(pedidosRes.value) ? pedidosRes.value : [])
      if (clientesRes.status === 'fulfilled')
        setClientes(Array.isArray(clientesRes.value) ? clientesRes.value : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!form.cliente_id)                          return setFormError('El cliente es requerido.')
    if (!form.cantidad || Number(form.cantidad) < 1) return setFormError('La cantidad debe ser al menos 1.')

    setSubmitting(true)
    try {
      const payload = {
        cliente_id: Number(form.cliente_id),
        cantidad:   Number(form.cantidad),
        total:      form.total ? Number(form.total) : undefined,
        libro_id:   form.libro_id ? Number(form.libro_id) : undefined,
      }
      await createPedido(payload)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await fetchAll()
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
                  <select name="cliente_id" value={form.cliente_id} onChange={handleChange} required>
                    <option value="">— Seleccionar cliente —</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre || c.name || c.email || c.id}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name="cliente_id" type="number" min="1"
                    value={form.cliente_id} onChange={handleChange}
                    placeholder="ID del cliente" required
                  />
                )}
              </label>
              <label className="form-field">
                <span>Cantidad</span>
                <input
                  name="cantidad" type="number" min="1"
                  value={form.cantidad} onChange={handleChange}
                  placeholder="1"
                />
              </label>
              <label className="form-field">
                <span>Total ($)</span>
                <input
                  name="total" type="number" step="0.01" min="0"
                  value={form.total} onChange={handleChange}
                  placeholder="0.00"
                />
              </label>
              <label className="form-field">
                <span>ID del libro</span>
                <input
                  name="libro_id" type="number" min="1"
                  value={form.libro_id} onChange={handleChange}
                  placeholder="ID del libro (opcional)"
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
        {clientes.length > 0 && (
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
        {loading && <LoadingState message="Cargando pedidos desde MS2…" />}
        {!loading && error && <ErrorState message={error} onRetry={fetchAll} />}
        {!loading && !error && displayed.length === 0 && (
          <EmptyState message="No hay pedidos registrados." icon="🛒" />
        )}

        {!loading && !error && displayed.length > 0 && (
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
