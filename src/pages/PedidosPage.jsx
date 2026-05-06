/**
 * PedidosPage — Gestión de pedidos y clientes
 * Consume MS2: GET /ms2/pedidos/{id}, GET /ms2/pedidos/cliente/{id},
 *              GET /ms2/clientes/{id}, POST /ms2/pedidos
 *
 * MS2 OpenAPI payload para crear pedido:
 *   { clienteId, fecha, estado, total, direccionEnvio, metodoPago,
 *     items: [{ libroId, cantidad, precioUnitario }] }
 *
 * Estrategia de carga:
 *   - Al montar: GET /ms2/clientes/1 como health-check -> muestra "MS2 conectado".
 *   - Sección 1: buscar pedido por ID.
 *   - Sección 2: buscar pedidos de un cliente.
 *   - Sección 3: "Cargar todos" (puede tardar, 60 s timeout).
 */
import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'
import {
  getClienteById,
  getPedidoById,
  getPedidosPorCliente,
  getPedidos,
  createPedido,
} from '../services/ms2PedidosService'
import { apiRequest } from '../services/apiClient'

const METODOS_PAGO = ['tarjeta', 'efectivo', 'transferencia', 'paypal']

const EMPTY_FORM = {
  clienteId: '', libroId: '', cantidad: '1', precioUnitario: '',
  direccionEnvio: '', metodoPago: 'tarjeta',
}

function normPedido(p) {
  return {
    id:      p.id,
    cliente: p.cliente || p.client || p.cliente_nombre || p.clienteId || p.cliente_id || '—',
    estado:  p.estado  || p.status || p.state          || '—',
    total:   p.total   ?? p.monto  ?? p.amount          ?? null,
    fecha:   p.fecha   || p.fecha_pedido || p.created_at || p.date || null,
    items:   p.items   ?? p.productos ?? p.detalles      ?? null,
  }
}

function PedidoRow({ p }) {
  const n = normPedido(p)
  return (
    <tr>
      <td className="td-id">{n.id}</td>
      <td>{n.cliente}</td>
      <td><span className={`badge badge--${n.estado}`}>{n.estado}</span></td>
      <td>{n.total != null ? `$${Number(n.total).toFixed(2)}` : '—'}</td>
      <td>{n.fecha ? new Date(n.fecha).toLocaleDateString() : '—'}</td>
      <td>
        <Link to={`/pedidos/${n.id}`} className="btn btn--ghost btn--sm">Detalle</Link>
      </td>
    </tr>
  )
}

export default function PedidosPage() {
  const [ms2Status,       setMs2Status]       = useState('checking')
  const [pedidoIdInput,   setPedidoIdInput]   = useState('1')
  const [pedidoResult,    setPedidoResult]    = useState(null)
  const [loadingPedidoId, setLoadingPedidoId] = useState(false)
  const [errorPedidoId,   setErrorPedidoId]   = useState(null)
  const [clienteIdInput,  setClienteIdInput]  = useState('1')
  const [pedidosCliente,  setPedidosCliente]  = useState(null)
  const [loadingCliente,  setLoadingCliente]  = useState(false)
  const [errorCliente,    setErrorCliente]    = useState(null)
  const [allPedidos,      setAllPedidos]      = useState(null)
  const [loadingAll,      setLoadingAll]      = useState(false)
  const [errorAll,        setErrorAll]        = useState(null)
  const [clienteIdBInput, setClienteIdBInput] = useState('1')
  const [clienteResult,   setClienteResult]   = useState(null)
  const [loadingClienteB, setLoadingClienteB] = useState(false)
  const [errorClienteB,   setErrorClienteB]   = useState(null)
  const [showForm,        setShowForm]        = useState(false)
  const [form,            setForm]            = useState(EMPTY_FORM)
  const [formError,       setFormError]       = useState(null)
  const [submitting,      setSubmitting]      = useState(false)
  const [createSuccess,   setCreateSuccess]   = useState(null)

  useEffect(() => {
    getClienteById(1)
      .then(() => setMs2Status('ok'))
      .catch(() => setMs2Status('error'))
  }, [])

  async function handleBuscarPedido(e) {
    e.preventDefault()
    if (!pedidoIdInput) return
    setLoadingPedidoId(true); setErrorPedidoId(null); setPedidoResult(null)
    try { setPedidoResult(await getPedidoById(Number(pedidoIdInput))) }
    catch (err) { setErrorPedidoId(err.message) }
    finally { setLoadingPedidoId(false) }
  }

  async function handleBuscarClienteById(e) {
    e.preventDefault()
    if (!clienteIdBInput) return
    setLoadingClienteB(true); setErrorClienteB(null); setClienteResult(null)
    try { setClienteResult(await getClienteById(Number(clienteIdBInput))) }
    catch (err) { setErrorClienteB(err.message) }
    finally { setLoadingClienteB(false) }
  }

  async function handleBuscarPorCliente(e) {
    e.preventDefault()
    if (!clienteIdInput) return
    setLoadingCliente(true); setErrorCliente(null); setPedidosCliente(null)
    try {
      const data = await getPedidosPorCliente(Number(clienteIdInput))
      setPedidosCliente(Array.isArray(data) ? data : [])
    } catch (err) { setErrorCliente(err.message) }
    finally { setLoadingCliente(false) }
  }

  async function handleCargarTodos() {
    setLoadingAll(true); setErrorAll(null); setAllPedidos(null)
    try {
      const data = await apiRequest('/ms2/pedidos', { timeoutMs: 60_000 })
      setAllPedidos(Array.isArray(data) ? data : [])
    } catch (err) { setErrorAll(err.message) }
    finally { setLoadingAll(false) }
  }

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault(); setFormError(null); setCreateSuccess(null)
    if (!form.clienteId) return setFormError('El cliente es requerido.')
    if (!form.cantidad || Number(form.cantidad) < 1) return setFormError('La cantidad debe ser al menos 1.')
    if (!form.precioUnitario || Number(form.precioUnitario) <= 0) return setFormError('El precio unitario debe ser mayor a 0.')
    if (!form.direccionEnvio.trim()) return setFormError('La dirección de envío es requerida.')
    const cantidad = Number(form.cantidad); const precioUnitario = Number(form.precioUnitario)
    const payload = {
      clienteId: Number(form.clienteId),
      fecha: new Date().toISOString().slice(0, 10),
      estado: 'pendiente',
      total: Math.round(cantidad * precioUnitario * 100) / 100,
      direccionEnvio: form.direccionEnvio.trim(),
      metodoPago: form.metodoPago,
      items: form.libroId ? [{ libroId: Number(form.libroId), cantidad, precioUnitario }] : [],
    }
    setSubmitting(true)
    try { setCreateSuccess(await createPedido(payload)); setForm(EMPTY_FORM); setShowForm(false) }
    catch (err) { setFormError(err.message) }
    finally { setSubmitting(false) }
  }

  const THEAD = <thead><tr><th>ID</th><th>Cliente</th><th>Estado</th><th>Total</th><th>Fecha</th><th></th></tr></thead>

  return (
    <div className="page-container">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">🛒 Pedidos</h1>
            <p className="page-badge">MS2 · GET /ms2/pedidos/{"{id}"} · POST /ms2/pedidos</p>
            <p className="page-sub">
              Estado MS2:&nbsp;
              {ms2Status === 'checking' && <span className="status-dot">verificando…</span>}
              {ms2Status === 'ok'       && <span className="status-dot status-dot--ok">● conectado</span>}
              {ms2Status === 'error'    && <span className="status-dot status-dot--error">● sin conexión</span>}
            </p>
          </div>
          <button className="btn btn--accent" onClick={() => { setShowForm(!showForm); setFormError(null) }}>
            {showForm ? 'Cancelar' : '+ Nuevo pedido'}
          </button>
        </div>

        {createSuccess && (
          <div className="alert alert--success">
            ✅ Pedido creado con ID: <strong>{createSuccess.id ?? '—'}</strong>&nbsp;·&nbsp;
            <button className="btn btn--ghost btn--sm" onClick={() => {
              setPedidoIdInput(String(createSuccess.id)); setPedidoResult(createSuccess); setCreateSuccess(null)
            }}>Ver detalle</button>
          </div>
        )}

        {showForm && (
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <h2 className="form-card__title">Nuevo pedido</h2>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-grid">
              <label className="form-field"><span>Cliente ID *</span>
                <input name="clienteId" type="number" min="1" value={form.clienteId} onChange={handleChange} placeholder="ID del cliente" required />
              </label>
              <label className="form-field"><span>ID del libro (opcional)</span>
                <input name="libroId" type="number" min="1" value={form.libroId} onChange={handleChange} placeholder="ID del libro" />
              </label>
              <label className="form-field"><span>Cantidad *</span>
                <input name="cantidad" type="number" min="1" value={form.cantidad} onChange={handleChange} placeholder="1" required />
              </label>
              <label className="form-field"><span>Precio unitario * ($)</span>
                <input name="precioUnitario" type="number" step="0.01" min="0.01" value={form.precioUnitario} onChange={handleChange} placeholder="0.00" required />
              </label>
              <label className="form-field"><span>Método de pago *</span>
                <select name="metodoPago" value={form.metodoPago} onChange={handleChange}>
                  {METODOS_PAGO.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </label>
              <label className="form-field"><span>Dirección de envío *</span>
                <input name="direccionEnvio" type="text" value={form.direccionEnvio} onChange={handleChange} placeholder="Calle, ciudad, país" required />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--accent" disabled={submitting}>{submitting ? 'Creando…' : 'Crear pedido'}</button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancelar</button>
            </div>
          </form>
        )}

        <section className="search-section">
          <h2 className="section-title">🔍 Buscar pedido por ID</h2>
          <form className="search-inline" onSubmit={handleBuscarPedido}>
            <input type="number" min="1" value={pedidoIdInput} onChange={(e) => setPedidoIdInput(e.target.value)} placeholder="ID del pedido" className="input-inline" />
            <button type="submit" className="btn btn--primary" disabled={loadingPedidoId}>{loadingPedidoId ? 'Buscando…' : 'Buscar pedido'}</button>
          </form>
          {loadingPedidoId && <LoadingState message="Cargando pedido…" />}
          {!loadingPedidoId && errorPedidoId && <ErrorState message={errorPedidoId} onRetry={handleBuscarPedido} />}
          {!loadingPedidoId && pedidoResult && (
            <div className="table-wrapper"><table className="data-table">{THEAD}<tbody><PedidoRow p={pedidoResult} /></tbody></table></div>
          )}
        </section>

        <section className="search-section">
          <h2 className="section-title">🪪 Buscar cliente por ID</h2>
          <form className="search-inline" onSubmit={handleBuscarClienteById}>
            <input type="number" min="1" value={clienteIdBInput} onChange={(e) => setClienteIdBInput(e.target.value)} placeholder="ID del cliente" className="input-inline" />
            <button type="submit" className="btn btn--primary" disabled={loadingClienteB}>{loadingClienteB ? 'Buscando…' : 'Buscar cliente'}</button>
          </form>
          {loadingClienteB && <LoadingState message="Cargando cliente…" />}
          {!loadingClienteB && errorClienteB && <ErrorState message={errorClienteB} />}
          {!loadingClienteB && clienteResult && (
            <pre className="apitest-card__pre" style={{ marginTop: '0.75rem' }}>
              {JSON.stringify(clienteResult, null, 2).slice(0, 1000)}
            </pre>
          )}
        </section>

        <section className="search-section">
          <h2 className="section-title">👤 Pedidos de un cliente</h2>
          <form className="search-inline" onSubmit={handleBuscarPorCliente}>
            <input type="number" min="1" value={clienteIdInput} onChange={(e) => setClienteIdInput(e.target.value)} placeholder="ID del cliente" className="input-inline" />
            <button type="submit" className="btn btn--primary" disabled={loadingCliente}>{loadingCliente ? 'Cargando…' : 'Ver pedidos del cliente'}</button>
          </form>
          {loadingCliente && <LoadingState message="Cargando pedidos del cliente…" />}
          {!loadingCliente && errorCliente && <ErrorState message={errorCliente} onRetry={handleBuscarPorCliente} />}
          {!loadingCliente && pedidosCliente !== null && pedidosCliente.length === 0 && <EmptyState message="Este cliente no tiene pedidos." icon="📭" />}
          {!loadingCliente && pedidosCliente && pedidosCliente.length > 0 && (
            <div className="table-wrapper"><table className="data-table">{THEAD}<tbody>{pedidosCliente.map((p) => <PedidoRow key={p.id} p={p} />)}</tbody></table></div>
          )}
        </section>

        <section className="search-section">
          <h2 className="section-title">📋 Todos los pedidos</h2>
          <p className="search-section__warning">⚠️ Este endpoint carga toda la tabla y puede tardar hasta 60 s.</p>
          {!loadingAll && allPedidos === null && (
            <button className="btn btn--ghost" onClick={handleCargarTodos}>Cargar todos (puede tardar)</button>
          )}
          {loadingAll && <LoadingState message="Cargando todos los pedidos… (hasta 60 s)" />}
          {!loadingAll && errorAll && <ErrorState message={errorAll} onRetry={handleCargarTodos} />}
          {!loadingAll && allPedidos !== null && allPedidos.length === 0 && <EmptyState message="No hay pedidos registrados." icon="🛒" />}
          {!loadingAll && allPedidos && allPedidos.length > 0 && (
            <>
              <p className="table-count">{allPedidos.length} pedidos</p>
              <div className="table-wrapper"><table className="data-table">{THEAD}<tbody>{allPedidos.map((p) => <PedidoRow key={p.id} p={p} />)}</tbody></table></div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

