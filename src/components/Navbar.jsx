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

    // Listen for auth changes
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

  const initials =
    profile?.full_name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'U'

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link
        to="/"
        className="text-2xl font-bold text-purple-700 tracking-tight flex-shrink-0"
      >
        NyLo
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </form>

      {/* Right side */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {!checked ? (
          // Loading
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

            {/* Avatar dropdown */}
            <div className="relative group">
              <button
                className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm hover:bg-purple-200 transition"
                title={profile?.full_name}
              >
                {initials}
              </button>

              {/* Dropdown */}
              <div className="absolute right-0 top-11 bg-white border border-gray-200 rounded-xl shadow-lg py-1 w-44 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                <Link
                  to="/dashboard"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                >
                  Dashboard
                </Link>

                <Link
                  to={`/profile/${profile?.username}`}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                >
                  My profile
                </Link>

                <Link
                  to="/bookmarks"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                >
                  Bookmarks
                </Link>

                <div className="border-t border-gray-100 my-1" />

                <button
                  onClick={async () => {
                    await supabase.auth.signOut()
                    window.location.href = '/'
                  }}
                  className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                >
                  Sign out
                </button>
              </div>
            </div>
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