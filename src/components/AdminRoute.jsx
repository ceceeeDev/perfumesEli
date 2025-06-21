// src/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth()
  const adminEmail = 'administrador@perfumes.com' // Reemplaza con el real

  if (loading) return <p className="text-center mt-10">Cargando...</p>

  if (!user) return <Navigate to="/login" />
  if (user.email !== adminEmail) return <Navigate to="/" />

  return children
}
