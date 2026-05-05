/**
 * MS1 — Catálogo
 * Gestiona libros, autores, géneros y editoriales.
 *
 * Prefijo de ruta: /ms1
 * Endpoints: /libros, /autores, /generos, /editoriales
 * Swagger:   https://47c36x353h.execute-api.us-east-1.amazonaws.com/ms1/docs
 */

import apiClient from './apiClient'

const P = '/ms1'

// ── Libros ────────────────────────────────────────────────────────────────────

/** [Rúbrica MS1 · GET] Lista todos los libros del catálogo. */
export const getLibros = () => apiClient.get(`${P}/libros`)

/** Obtiene un libro por su ID. */
export const getLibroById = (id) => apiClient.get(`${P}/libros/${id}`)

/** [Rúbrica MS1 · POST] Crea un nuevo libro. */
export const createLibro = (data) => apiClient.post(`${P}/libros`, data)

/** Actualiza los datos de un libro existente. */
export const updateLibro = (id, data) => apiClient.put(`${P}/libros/${id}`, data)

/** Elimina un libro por su ID. */
export const deleteLibro = (id) => apiClient.delete(`${P}/libros/${id}`)

// ── Autores ───────────────────────────────────────────────────────────────────

/** Lista todos los autores. */
export const getAutores = () => apiClient.get(`${P}/autores`)

/** Obtiene un autor por su ID. */
export const getAutorById = (id) => apiClient.get(`${P}/autores/${id}`)

/** Crea un nuevo autor. */
export const createAutor = (data) => apiClient.post(`${P}/autores`, data)

// ── Géneros ───────────────────────────────────────────────────────────────────

/** Lista todos los géneros literarios. */
export const getGeneros = () => apiClient.get(`${P}/generos`)

// ── Editoriales ───────────────────────────────────────────────────────────────

/** Lista todas las editoriales. */
export const getEditoriales = () => apiClient.get(`${P}/editoriales`)
