import { useState, useEffect } from 'react'
import { supabase } from '@/supabase/supabaseClient'
import AgregarPerfume from '@/components/AgregarPerfume'

export default function Admin() {
  const [auth, setAuth] = useState(false)
  const [password, setPassword] = useState('')
  const [perfumes, setPerfumes] = useState([])

  const handleLogin = () => {
    if (password === '1234') setAuth(true)
    else alert('Contraseña incorrecta')
  }

  const cargarPerfumes = async () => {
    const { data, error } = await supabase.from('perfumes').select('*')
    if (!error) setPerfumes(data)
  }

  const eliminar = async (id) => {
    await supabase.from('perfumes').delete().eq('id', id)
    cargarPerfumes()
  }

  const marcarSinStock = async (id) => {
    await supabase.from('perfumes').update({ stock: false }).eq('id', id)
    cargarPerfumes()
  }

  useEffect(() => {
    if (auth) cargarPerfumes()
  }, [auth])

  if (!auth) {
    return (
      <div className="h-screen flex flex-col justify-center items-center bg-gray-100">
        <h1 className="text-xl font-bold mb-4">Acceso al Panel</h1>
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 border rounded mb-4"
        />
        <button
          onClick={handleLogin}
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Entrar
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-center">Panel de Administración</h1>
      
      <AgregarPerfume onPerfumeAgregado={cargarPerfumes} />

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-4">Perfumes registrados</h2>
        {perfumes.map((p) => (
          <div key={p.id} className="flex justify-between items-center border-b py-2">
            <div>
              <p className="font-bold">{p.nombre} - {p.marca}</p>
              <p>${p.precio}</p>
              <p className={`text-sm ${p.stock ? 'text-green-600' : 'text-red-600'}`}>
                {p.stock ? 'En stock' : 'Sin stock'}
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => eliminar(p.id)} className="text-red-600">Eliminar</button>
              <button onClick={() => marcarSinStock(p.id)} className="text-yellow-600">Sin stock</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
