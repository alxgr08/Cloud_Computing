/**
 * MS1 — Catálogo (servicio con patrón objeto)
 * Prefijo: /ms1  |  Swagger: /ms1/docs
 *
 * NOTA: FastAPI usa trailing slash en endpoints de colección.
 *   /libros/, /autores/, /generos/, /editoriales/  → con trailing slash
 *   /libros/{id}, /autores/{id}, /health           → sin trailing slash
 */
import { apiRequest } from './apiClient'

const MS1_PREFIX = '/ms1'

export const catalogoService = {
  /** Health check — GET /ms1/health */
  healthCheck:     ()          => apiRequest(`${MS1_PREFIX}/health`),

  /** [Rúbrica MS1 · GET] Lista todos los libros. */
  getLibros:       ()          => apiRequest(`${MS1_PREFIX}/libros/`),

  /** Obtiene un libro por ID. */
  getLibroById:    (id)        => apiRequest(`${MS1_PREFIX}/libros/${id}`),

  /** [Rúbrica MS1 · POST] Crea un nuevo libro. */
  createLibro:     (data)      => apiRequest(`${MS1_PREFIX}/libros/`,      { method: 'POST',  body: JSON.stringify(data) }),

  /** Actualiza un libro existente (PATCH según Swagger de MS1). */
  updateLibro:     (id, data)  => apiRequest(`${MS1_PREFIX}/libros/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  /** Elimina un libro por ID. */
  deleteLibro:     (id)        => apiRequest(`${MS1_PREFIX}/libros/${id}`, { method: 'DELETE' }),

  /** Lista todos los autores (para selects). */
  getAutores:      ()          => apiRequest(`${MS1_PREFIX}/autores/`),

  /** Lista todos los géneros (para selects). */
  getGeneros:      ()          => apiRequest(`${MS1_PREFIX}/generos/`),

  /** Lista todas las editoriales (para selects). */
  getEditoriales:  ()          => apiRequest(`${MS1_PREFIX}/editoriales/`),
}
