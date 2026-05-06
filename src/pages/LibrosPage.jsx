/**
 * LibrosPage — Catálogo de libros
 * Consume MS1: GET /libros, POST /libros, DELETE /libros/:id
 * También consume /autores, /generos, /editoriales para los selects.
 */
import { useState, useEffect, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'
import {
  getLibros, createLibro, deleteLibro,
  getAutores, getGeneros, getEditoriales,
} from '../services/ms1CatalogoService'

const EMPTY_FORM = {
  titulo: '', precio: '', descripcion: '',
  autor_id: '', genero_id: '', editorial_id: '',
}

/** Normaliza un libro independientemente del naming del backend. */
function norm(libro) {
  return {
    id:        libro.id,
    titulo:    libro.titulo    || libro.title       || libro.nombre || '—',
    autor:     libro.autor     || libro.author      || libro.autor_nombre  || libro.autor_id || '—',
    genero:    libro.genero    || libro.genre       || libro.genero_nombre || libro.genero_id || '—',
    editorial: libro.editorial || libro.publisher   || libro.editorial_nombre || '—',
    precio:    libro.precio    ?? libro.price       ?? null,
    descripcion: libro.descripcion || libro.description || '',
  }
}

export default function LibrosPage() {
  const [libros,      setLibros]      = useState([])
  const [autores,     setAutores]     = useState([])
  const [generos,     setGeneros]     = useState([])
  const [editoriales, setEditoriales] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState(null)
  const [showForm,    setShowForm]    = useState(false)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [formError,   setFormError]   = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const [filter,      setFilter]      = useState('')

  const [searchParams] = useSearchParams()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Libros es crítico; el resto son complementarios para los selects
      const [librosRes, autoresRes, generosRes, editorialesRes] =
        await Promise.allSettled([getLibros(), getAutores(), getGeneros(), getEditoriales()])

      if (librosRes.status === 'rejected') throw librosRes.reason
      setLibros(Array.isArray(librosRes.value) ? librosRes.value : [])
      if (autoresRes.status     === 'fulfilled') setAutores(Array.isArray(autoresRes.value)     ? autoresRes.value     : [])
      if (generosRes.status     === 'fulfilled') setGeneros(Array.isArray(generosRes.value)     ? generosRes.value     : [])
      if (editorialesRes.status === 'fulfilled') setEditoriales(Array.isArray(editorialesRes.value) ? editorialesRes.value : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
    const q = searchParams.get('search')
    if (q) setFilter(q)
  }, [fetchAll, searchParams])

  const displayed = libros.filter((l) => {
    const q = filter.trim().toLowerCase()
    if (!q) return true
    const n = norm(l)
    return (
      n.titulo.toLowerCase().includes(q) ||
      String(n.autor).toLowerCase().includes(q) ||
      String(n.genero).toLowerCase().includes(q)
    )
  })

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!form.titulo.trim())              return setFormError('El título es requerido.')
    if (!form.precio || Number(form.precio) <= 0) return setFormError('El precio debe ser mayor a 0.')

    setSubmitting(true)
    try {
      const payload = {
        titulo:       form.titulo.trim(),
        descripcion:  form.descripcion.trim() || undefined,
        precio:       Number(form.precio),
        autor_id:     form.autor_id     ? Number(form.autor_id)     : undefined,
        genero_id:    form.genero_id    ? Number(form.genero_id)    : undefined,
        editorial_id: form.editorial_id ? Number(form.editorial_id) : undefined,
      }
      await createLibro(payload)
      setForm(EMPTY_FORM)
      setShowForm(false)
      await fetchAll()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id, titulo) {
    if (!window.confirm(`¿Eliminar "${titulo}"?`)) return
    try {
      await deleteLibro(id)
      setLibros((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  function labelFor(list, id, fallback) {
    const item = list.find((x) => String(x.id) === String(id))
    return item ? (item.nombre || item.name || item.id) : fallback || id
  }

  return (
    <div className="page-container">
      <div className="container">

        {/* ── Encabezado ── */}
        <div className="page-header">
          <div>
            <h1 className="page-title">📚 Catálogo de libros</h1>
            <p className="page-badge">MS1 · GET /libros · POST /libros</p>
          </div>
          <button className="btn btn--accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo libro'}
          </button>
        </div>

        {/* ── Formulario de creación ── */}
        {showForm && (
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <h2 className="form-card__title">Nuevo libro</h2>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-grid">
              <label className="form-field">
                <span>Título *</span>
                <input
                  name="titulo" value={form.titulo} onChange={handleChange}
                  placeholder="Título del libro" required
                />
              </label>
              <label className="form-field">
                <span>Precio *</span>
                <input
                  name="precio" type="number" step="0.01" min="0.01"
                  value={form.precio} onChange={handleChange}
                  placeholder="0.00" required
                />
              </label>
              <label className="form-field">
                <span>Autor</span>
                <select name="autor_id" value={form.autor_id} onChange={handleChange}>
                  <option value="">— Seleccionar autor —</option>
                  {autores.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre || a.name || a.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Género</span>
                <select name="genero_id" value={form.genero_id} onChange={handleChange}>
                  <option value="">— Seleccionar género —</option>
                  {generos.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.nombre || g.name || g.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span>Editorial</span>
                <select name="editorial_id" value={form.editorial_id} onChange={handleChange}>
                  <option value="">— Seleccionar editorial —</option>
                  {editoriales.map((ed) => (
                    <option key={ed.id} value={ed.id}>
                      {ed.nombre || ed.name || ed.id}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field form-field--full">
                <span>Descripción</span>
                <textarea
                  name="descripcion" value={form.descripcion} onChange={handleChange}
                  rows={3} placeholder="Descripción breve del libro"
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--accent" disabled={submitting}>
                {submitting ? 'Guardando…' : 'Guardar libro'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* ── Buscador ── */}
        <div className="search-row">
          <input
            className="search-input"
            type="search"
            placeholder="Buscar por título, autor o género…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
          {filter && (
            <button className="btn btn--ghost btn--sm" onClick={() => setFilter('')}>
              Limpiar
            </button>
          )}
        </div>

        {/* ── Estados ── */}
        {loading && <LoadingState message="Cargando catálogo desde MS1…" />}
        {!loading && error && <ErrorState message={error} onRetry={fetchAll} />}
        {!loading && !error && displayed.length === 0 && (
          <EmptyState message="No se encontraron libros." icon="📚" />
        )}

        {/* ── Tabla ── */}
        {!loading && !error && displayed.length > 0 && (
          <>
            <p className="table-count">
              {displayed.length} {displayed.length === 1 ? 'libro' : 'libros'}
            </p>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Autor</th>
                    <th>Género</th>
                    <th>Editorial</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((libro) => {
                    const n = norm(libro)
                    return (
                      <tr key={libro.id}>
                        <td className="td-id">{libro.id}</td>
                        <td>
                          <Link to={`/libros/${libro.id}`} className="link-primary">
                            {n.titulo}
                          </Link>
                        </td>
                        <td>{n.autor}</td>
                        <td>{n.genero}</td>
                        <td>{n.editorial}</td>
                        <td>{n.precio != null ? `$${Number(n.precio).toFixed(2)}` : '—'}</td>
                        <td>
                          <div className="table-actions">
                            <Link to={`/libros/${libro.id}`} className="btn btn--ghost btn--sm">
                              Ver
                            </Link>
                            <button
                              className="btn btn--danger btn--sm"
                              onClick={() => handleDelete(libro.id, n.titulo)}
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
