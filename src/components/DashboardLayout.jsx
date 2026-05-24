import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function DashboardLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(profile)
      setIsAdmin(profile?.is_admin || false)

      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)
      setUnreadCount(count || 0)
    }
    load()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const navItems = [
    { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
    { label: 'Write', icon: '✏️', path: '/write' },
    {
      label: 'Notifications', icon: '🔔', path: '/notifications',
      badge: unreadCount > 0 ? unreadCount : null
    },
    { label: 'Bookmarks', icon: '🔖', path: '/bookmarks' },
    { label: 'Edit Profile', icon: '👤', path: '/edit-profile' },
    ...(isAdmin ? [{ label: 'Admin Panel', icon: '🔒', path: '/admin' }] : []),
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ── Mobile top bar ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-purple-700">NyLo</Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="w-9 h-9 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-gray-100"
        >
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-5 h-0.5 bg-gray-600 transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* ── Mobile menu overlay ── */}
      {menuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/30"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed top-0 left-0 h-full z-40 w-64 bg-white border-r border-gray-200
        flex flex-col px-4 py-6 transition-transform duration-300
        ${menuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <Link to="/" className="text-2xl font-bold text-purple-700 block mb-10 hidden lg:block">
          NyLo
        </Link>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 mt-12 lg:mt-0">
          {navItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition ${
                  isActive
                    ? 'bg-purple-50 text-purple-700 font-medium'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-purple-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom user section */}
        <div className="mt-auto pt-6 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <Link
                to={`/profile/${profile?.username}`}
                className="text-sm font-medium text-gray-800 hover:text-purple-700 truncate block"
              >
                {profile?.full_name || 'Writer'}
              </Link>
              <p className="text-xs text-gray-400 truncate">@{profile?.username || 'user'}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 lg:ml-64 pt-16 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
          {children}
        </div>
      </main>

    </div>
  )
}