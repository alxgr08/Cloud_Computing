// ─────────────────────────────────────────────────────────────────────────────
// CONFIGURACIÓN DEL BACKEND
// Cuando tengas la URL real, crea un archivo .env (basado en .env.example) con:
//   VITE_API_BASE_URL=https://tu-api.amazonaws.com/prod
// ─────────────────────────────────────────────────────────────────────────────
import { mockBooks } from '../data/mockBooks'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const defaultHeaders = {
  'Content-Type': 'application/json',
}

// ── Libros ────────────────────────────────────────────────────────────────────

/** GET /books – Obtiene todos los libros disponibles. */
export async function getBooks() {
  try {
    const response = await fetch(`${API_BASE_URL}/books`, {
      method: 'GET',
      headers: defaultHeaders,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return { data: await response.json(), fromMock: false }
  } catch {
    // Backend no disponible: se usan datos de ejemplo
    return { data: mockBooks, fromMock: true }
  }
}

/**
 * GET /books?search=query – Busca libros por texto.
 * Si el backend falla, filtra los datos mock localmente.
 */
export async function searchBooks(query) {
  if (!query || query.trim() === '') return getBooks()

  const encoded = encodeURIComponent(query.trim())

  try {
    const response = await fetch(`${API_BASE_URL}/books?search=${encoded}`, {
      method: 'GET',
      headers: defaultHeaders,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return { data: await response.json(), fromMock: false }
  } catch {
    // Filtrado local como respaldo cuando el backend no responde
    const lower = query.toLowerCase()
    const filtered = mockBooks.filter(
      (b) =>
        b.title.toLowerCase().includes(lower) ||
        b.author.toLowerCase().includes(lower) ||
        b.category.toLowerCase().includes(lower)
    )
    return { data: filtered, fromMock: true }
  }
}

/** GET /books/:id – Obtiene el detalle de un libro por ID. */
export async function getBookById(id) {
  try {
    const response = await fetch(`${API_BASE_URL}/books/${id}`, {
      method: 'GET',
      headers: defaultHeaders,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return { data: await response.json(), fromMock: false }
  } catch {
    const book = mockBooks.find((b) => b.id === Number(id)) || null
    return { data: book, fromMock: true }
  }
}

// ── Usuarios ──────────────────────────────────────────────────────────────────
// Endpoints preparados para conectar con el backend real.

/** POST /users/register */
export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/users/register`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(userData),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/** POST /users/login */
export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/users/login`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(credentials),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

// ── Carrito ───────────────────────────────────────────────────────────────────
// Endpoints preparados para conectar con el backend real.

/** GET /cart */
export async function getCart() {
  const response = await fetch(`${API_BASE_URL}/cart`, {
    method: 'GET',
    headers: defaultHeaders,
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/** POST /cart/items */
export async function addToCart(item) {
  const response = await fetch(`${API_BASE_URL}/cart/items`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(item),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/** PUT /cart/items/:itemId */
export async function updateCartItem(itemId, data) {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'PUT',
    headers: defaultHeaders,
    body: JSON.stringify(data),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/** DELETE /cart/items/:itemId */
export async function removeCartItem(itemId) {
  const response = await fetch(`${API_BASE_URL}/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: defaultHeaders,
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}

/** POST /books – Publica un nuevo libro. */
export async function publishBook(bookData) {
  const response = await fetch(`${API_BASE_URL}/books`, {
    method: 'POST',
    headers: defaultHeaders,
    body: JSON.stringify(bookData),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json()
}
