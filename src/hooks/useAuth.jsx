// src/hooks/useAuth.jsx
import { useEffect, useState } from 'react'
import { supabase } from '@/supabase/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error
      } = await supabase.auth.getSession()

      if (error) {
        console.error('Error al obtener sesión:', error.message)
        setUser(null)
      } else {
        setUser(session?.user || null)
      }

      setLoading(false)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
    })

    getSession()

    return () => {
      listener?.subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}
