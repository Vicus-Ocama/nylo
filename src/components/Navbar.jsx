import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [checked, setChecked] = useState(false)

  useEffect(() => {
    // Get current session
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setUser(user)
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, full_name')
          .eq('id', user.id)
          .single()
        setProfile(profile)
      }
      setChecked(true)
    })

    // Listen for auth changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, full_name')
            .eq('id', session.user.id)
            .single()
          setProfile(profile)
        } else {
          setProfile(null)
        }
      }
    )
    return () => subscription.unsubscribe()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-purple-700 tracking-tight flex-shrink-0">
        NyLo
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </form>

      {/* Right side — changes based on auth state */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {!checked ? (
          // Still loading — show nothing to avoid flicker
          <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
        ) : user ? (
          // Logged in
          <>
            <Link
              to="/write"
              className="text-sm text-gray-600 hover:text-purple-700 font-medium hidden sm:block"
            >
              Write
            </Link>
            <Link
              to="/notifications"
              className="text-sm text-gray-600 hover:text-purple-700"
              title="Notifications"
            >
              🔔
            </Link>
            <Link
              to="/dashboard"
              className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm hover:bg-purple-200 transition"
              title={`Go to dashboard — ${profile?.full_name}`}
            >
              {initials}
            </Link>
          </>
        ) : (
          // Logged out
          <>
            <Link
              to="/login"
              className="text-gray-600 hover:text-purple-700 text-sm font-medium"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition"
            >
              Get started
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}