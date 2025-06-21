// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import AgregarPerfume from './components/AgregarPerfume'
import Login from './pages/Login'
import { AdminRoute } from './components/AdminRoute'
import Tienda from './pages/Tienda'
import PerfumeDetail from './pages/PerfumeDetail' // ✅ Importar el nuevo componente de detalle

function App() {
  return (
    <Router>
      <Routes>
        {/* Página principal de la tienda */}
        <Route path="/" element={<Tienda />} />

        {/* Página de inicio de sesión */}
        <Route path="/login" element={<Login />} />

        {/* Área protegida del administrador */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AgregarPerfume />
            </AdminRoute>
          }
        />

        {/* ✅ Ruta para ver detalles individuales del perfume */}
        <Route path="/perfume/:id" element={<PerfumeDetail />} />
      </Routes>
    </Router>
  )
}

export default App
