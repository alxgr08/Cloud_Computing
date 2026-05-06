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
  titulo: '', precio: '', autor_id: '', genero_id: '', editorial_id: '',
  isbn: '', stock: '', año_publicacion: '', paginas: '', idioma: '',
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
  const [successMsg,  setSuccessMsg]  = useState(null)

  const [searchParams] = useSearchParams()

  const fetchAll = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // Libros es crítico; el resto son complementarios para los selects.
      // SIEMPRE usar ?limit=N: /libros sin query param devuelve 404 en este API Gateway.
      const [librosRes, autoresRes, generosRes, editorialesRes] =
        await Promise.allSettled([
          getLibros({ limit: 20 }),
          getAutores({ limit: 100 }),
          getGeneros(),
          getEditoriales({ limit: 100 }),
        ])

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
    if (!form.titulo.trim())                     return setFormError('El título es requerido.')
    if (!form.precio || Number(form.precio) <= 0) return setFormError('El precio debe ser mayor a 0.')
    if (!form.autor_id)                          return setFormError('El autor es requerido.')
    if (!form.editorial_id)                      return setFormError('La editorial es requerida.')
    if (!form.genero_id)                         return setFormError('El género es requerido.')

    setSubmitting(true)
    try {
      const payload = {
        titulo:          form.titulo.trim(),
        autor_id:        Number(form.autor_id),
        editorial_id:    Number(form.editorial_id),
        genero_id:       Number(form.genero_id),
        isbn:            form.isbn?.trim() || `ISBN-${Date.now()}`,
        precio:          Number(form.precio),
        stock:           Number(form.stock || 0),
        año_publicacion: Number(form.año_publicacion || new Date().getFullYear()),
        paginas:         Number(form.paginas || 1),
        idioma:          form.idioma?.trim() || 'Español',
      }
      console.log('[createLibro payload final]', payload)
      const response = await createLibro(payload)
      console.log('[createLibro response]', response)

      // Extraer el libro creado de la respuesta (varios formatos posibles)
      const createdBook = response?.libro ?? response?.item ?? response?.data ?? response

      setForm(EMPTY_FORM)
      setShowForm(false)
      setSuccessMsg(`Libro "${payload.titulo}" creado correctamente.`)

      if (createdBook && createdBook.id) {
        // Inserción optimista: evita duplicados por id o isbn
        setLibros((prev) => {
          const alreadyExists = prev.some(
            (l) => l.id === createdBook.id || (l.isbn && l.isbn === createdBook.isbn)
          )
          return alreadyExists ? prev : [createdBook, ...prev]
        })
      } else {
        // Backend no devolvió el libro: recargar con límite mayor para buscarlo
        await fetchAll()
      }
    } catch (err) {
      const msg = (err.type === 'CORS_OR_NETWORK' || err.type === 'NETWORK')
        ? `POST /libros fue bloqueado por CORS/preflight. Verifica que la URL sea /libros sin barra final y sin headers extra. Detalle: ${err.message}`
        : err.message
      setFormError(msg)
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
            <p className="page-badge">MS1 · GET /libros?limit=20 · POST /libros</p>
          </div>
          <button className="btn btn--accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nuevo libro'}
          </button>
        </div>

        {/* ── Banner de éxito ── */}
        {successMsg && (
          <div className="alert alert--success">
            ✅ {successMsg}&nbsp;
            <button className="btn btn--ghost btn--sm" onClick={() => setSuccessMsg(null)}>✕</button>
          </div>
        )}

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
              <label className="form-field">
                <span>ISBN</span>
                <input name="isbn" value={form.isbn} onChange={handleChange} placeholder="978-..." />
              </label>
              <label className="form-field">
                <span>Stock</span>
                <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange} placeholder="0" />
              </label>
              <label className="form-field">
                <span>Año de publicación</span>
                <input name="año_publicacion" type="number" min="1000" max="2100" value={form.año_publicacion} onChange={handleChange} placeholder={new Date().getFullYear()} />
              </label>
              <label className="form-field">
                <span>Páginas</span>
                <input name="paginas" type="number" min="1" value={form.paginas} onChange={handleChange} placeholder="1" />
              </label>
              <label className="form-field">
                <span>Idioma</span>
                <input name="idioma" value={form.idioma} onChange={handleChange} placeholder="Español" />
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
