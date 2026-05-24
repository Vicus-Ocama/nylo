import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function PrivateRoute({ children }) {
  const [user, setUser] = useState(undefined)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user ?? null)
    })
  }, [])

  // Still checking — show a spinner
  if (user === undefined) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (user === null) return <Navigate to="/login" replace />

  return children
}