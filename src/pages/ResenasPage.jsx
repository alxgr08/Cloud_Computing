/**
 * ResenasPage — Gestión de reseñas
 * Consume MS3: GET /resenas, POST /resenas, DELETE /resenas/:id
 */
import { useState, useEffect, useCallback } from 'react'
import LoadingState from '../components/common/LoadingState'
import ErrorState   from '../components/common/ErrorState'
import EmptyState   from '../components/common/EmptyState'
import { getResenas, createResena, deleteResena } from '../services/ms3ResenasService'

const EMPTY_FORM = {
  libro_id: '', cliente_id: '', titulo: '', rating: '5', comentario: '',
}

const STARS = [1, 2, 3, 4, 5]

function normResena(r) {
  return {
    id:           r.id,
    libro:        r.libro        || r.libro_titulo   || r.book  || r.libro_id  || '—',
    cliente:      r.cliente      || r.cliente_nombre || r.user  || r.cliente_id || '—',
    calificacion: r.rating       ?? r.calificacion   ?? r.score ?? null,
    titulo:       r.titulo       || '',
    comentario:   r.comentario   || r.comment        || r.texto || '',
    fecha:        r.fecha        || r.created_at     || r.date  || null,
  }
}

export default function ResenasPage() {
  const [resenas,    setResenas]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showForm,   setShowForm]   = useState(false)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [formError,  setFormError]  = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const fetchResenas = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getResenas({})  // GET /resenas (all)
      setResenas(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchResenas() }, [fetchResenas])

  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)

    const rat = Number(form.rating)
    if (!form.libro_id)                          return setFormError('El ID del libro es requerido.')
    if (!form.cliente_id)                        return setFormError('El ID del cliente es requerido.')
    if (!form.titulo.trim())                     return setFormError('El título de la reseña es requerido.')
    if (isNaN(rat) || rat < 1 || rat > 5)        return setFormError('La calificación debe estar entre 1 y 5.')
    if (!form.comentario.trim())                 return setFormError('El comentario es requerido.')

    setSubmitting(true)
    try {
      const payload = {
        libro_id:   Number(form.libro_id),
        cliente_id: Number(form.cliente_id),
        titulo:     form.titulo.trim(),
        rating:     rat,
        comentario: form.comentario.trim(),
      }
      const created = await createResena(payload)
      // Optimistic update: add new review to top of list immediately
      if (created && created.id) {
        setResenas((prev) => [created, ...prev.filter((r) => r.id !== created.id)])
      }
      setForm(EMPTY_FORM)
      setShowForm(false)
      // Background re-fetch to sync with server
      fetchResenas()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar esta reseña?')) return
    try {
      await deleteResena(id)
      setResenas((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  const displayed = resenas.map(normResena)

  return (
    <div className="page-container">
      <div className="container">

        <div className="page-header">
          <div>
            <h1 className="page-title">⭐ Reseñas</h1>
            <p className="page-badge">MS3 · GET /resenas · POST /resenas</p>
          </div>
          <button className="btn btn--accent" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : '+ Nueva reseña'}
          </button>
        </div>

        {/* ── Formulario de nueva reseña ── */}
        {showForm && (
          <form className="form-card" onSubmit={handleSubmit} noValidate>
            <h2 className="form-card__title">Nueva reseña</h2>
            {formError && <p className="form-error">{formError}</p>}
            <div className="form-grid">
              <label className="form-field">
                <span>ID del libro *</span>
                <input
                  name="libro_id" type="number" min="1"
                  value={form.libro_id} onChange={handleChange}
                  placeholder="ID del libro a reseñar" required
                />
              </label>
              <label className="form-field">
                <span>ID del cliente *</span>
                <input
                  name="cliente_id" type="number" min="1"
                  value={form.cliente_id} onChange={handleChange}
                  placeholder="ID del cliente" required
                />
              </label>
              <label className="form-field form-field--full">
                <span>Título de la reseña *</span>
                <input
                  name="titulo" type="text"
                  value={form.titulo} onChange={handleChange}
                  placeholder="Escribe un título breve para tu reseña" required
                />
              </label>
              <label className="form-field">
                <span>Calificación * (1 – 5)</span>
                <select name="rating" value={form.rating} onChange={handleChange}>
                  {STARS.map((s) => (
                    <option key={s} value={s}>{'⭐'.repeat(s)} ({s})</option>
                  ))}
                </select>
              </label>
              <label className="form-field form-field--full">
                <span>Comentario *</span>
                <textarea
                  name="comentario" value={form.comentario} onChange={handleChange}
                  rows={4} placeholder="Escribe tu reseña…" required
                />
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn--accent" disabled={submitting}>
                {submitting ? 'Publicando…' : 'Publicar reseña'}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowForm(false)}>
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* ── Estados ── */}
        {loading && <LoadingState message="Cargando reseñas desde MS3…" />}
        {!loading && error && <ErrorState message={error} onRetry={fetchResenas} />}
        {!loading && !error && displayed.length === 0 && (
          <EmptyState message="No hay reseñas publicadas todavía." icon="⭐" />
        )}

        {/* ── Tarjetas de reseñas ── */}
        {!loading && !error && displayed.length > 0 && (
          <>
            <p className="table-count">{displayed.length} reseñas</p>
            <div className="resenas-grid">
              {displayed.map((r) => (
                <article key={r.id} className="resena-card">
                  <header className="resena-card__header">
                    <span className="resena-card__libro">📚 {r.libro}</span>
                    <span className="resena-card__stars">
                      {r.calificacion != null
                        ? '⭐'.repeat(Math.min(5, Math.max(1, Math.round(r.calificacion))))
                        : '—'}
                    </span>
                  </header>
                  <p className="resena-card__comentario">{r.comentario || '—'}</p>
                  <footer className="resena-card__footer">
                    <span>👤 {r.cliente}</span>
                    {r.fecha && <span>{new Date(r.fecha).toLocaleDateString()}</span>}
                    <button
                      className="btn btn--danger btn--sm"
                      onClick={() => handleDelete(r.id)}
                    >
                      Eliminar
                    </button>
                  </footer>
                </article>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
