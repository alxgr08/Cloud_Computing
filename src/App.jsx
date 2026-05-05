import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar  from './components/Navbar'
import Footer  from './components/Footer'

// Páginas
import HomePage         from './pages/HomePage'
import LibrosPage       from './pages/LibrosPage'
import CatalogoPage     from './pages/CatalogoPage'
import PedidosPage      from './pages/PedidosPage'
import ResenasPage      from './pages/ResenasPage'
import AnalyticsPage    from './pages/AnalyticsPage'
import DetalleLibroPage from './pages/DetalleLibroPage'
import PerfilClientePage from './pages/PerfilClientePage'
import ApiTestPage       from './pages/ApiTestPage'

function NotFound() {
  return (
    <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
      <p style={{ fontSize: '3rem' }}>🔍</p>
      <h1 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>404 – Página no encontrada</h1>
      <a href="/" className="btn btn--accent">Volver al inicio</a>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/"              element={<HomePage />} />
          <Route path="/libros"        element={<LibrosPage />} />
          <Route path="/libros/:id"    element={<DetalleLibroPage />} />
          <Route path="/catalogo"      element={<CatalogoPage />} />
          <Route path="/pedidos"       element={<PedidosPage />} />
          <Route path="/pedidos/:id"   element={<PedidosPage />} />
          <Route path="/resenas"       element={<ResenasPage />} />
          <Route path="/analytics"     element={<AnalyticsPage />} />
          <Route path="/clientes/:id"  element={<PerfilClientePage />} />
          <Route path="/api-test"       element={<ApiTestPage />} />
          <Route path="*"              element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </BrowserRouter>
  )
}

export default App
