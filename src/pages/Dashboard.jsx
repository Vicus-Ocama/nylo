import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUser(user)

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profile)

      const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false })
      setArticles(articles || [])
      setLoading(false)
    }
    load()
  }, [])

  const deleteArticle = async (id) => {
    if (!confirm('Delete this article?')) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles(articles.filter(a => a.id !== id))
  }

  const publishedCount = articles.filter(a => a.published).length
  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0)
  const firstName = profile?.full_name?.split(' ')[0] || 'Writer'
  const initials = profile?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading your dashboard...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 min-h-screen px-4 py-6 fixed">
        <Link to="/" className="text-2xl font-bold text-purple-700 block mb-10">NyLo</Link>
        <nav className="flex flex-col gap-1">
          {[
            { label: 'Dashboard', icon: '🏠', path: '/dashboard' },
            { label: 'Write', icon: '✏️', path: '/write' },
            { label: 'My Articles', icon: '📄', path: '/my-articles' },
            { label: 'Profile', icon: '👤', path: '/profile' },
            { label: 'Settings', icon: '⚙️', path: '/settings' },
          ].map(item => (
            <Link key={item.label} to={item.path}
              className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition">
              <span>{item.icon}</span><span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="absolute bottom-6 left-4 right-4">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm">
              {initials}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{profile?.full_name || 'Writer'}</p>
              <p className="text-xs text-gray-400">@{profile?.username || 'user'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back, {firstName} 👋</h1>
            <p className="text-gray-500 text-sm mt-1">Ready to write something great today?</p>
          </div>
          <Link to="/write"
            className="bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-purple-800 transition">
            + New article
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Articles published', value: publishedCount },
            { label: 'Total views', value: totalViews },
            { label: 'Total articles', value: articles.length },
          ].map(stat => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-3xl font-bold text-purple-700">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Articles list */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">Your articles</h2>
          {articles.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-4xl mb-4">✏️</p>
              <p className="text-gray-500 text-sm">You haven't written anything yet.</p>
              <Link to="/write" className="text-purple-700 text-sm font-medium hover:underline mt-2 inline-block">
                Write your first article →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {articles.map(article => (
                <div key={article.id} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50 transition">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{article.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${article.published ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {article.published ? 'Published' : 'Draft'}
                      </span>
                      {article.category && (
                        <span className="text-xs text-gray-400">{article.category}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(article.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition ml-4">
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}