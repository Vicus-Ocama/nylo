import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Admin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [articles, setArticles] = useState([])
  const [users, setUsers] = useState([])
  const [stats, setStats] = useState({ articles: 0, users: 0, published: 0 })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      // Check admin flag
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) {
        // Not admin — redirect silently
        navigate('/')
        return
      }

      setIsAdmin(true)

      // Load all articles
      const { data: allArticles } = await supabase
        .from('articles')
        .select('*, profiles(full_name, username)')
        .order('created_at', { ascending: false })
        .limit(50)

      // Load all profiles
      const { data: allUsers } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      setArticles(allArticles || [])
      setUsers(allUsers || [])
      setStats({
        articles: allArticles?.length || 0,
        users: allUsers?.length || 0,
        published: allArticles?.filter(a => a.published).length || 0
      })

      setLoading(false)
    }
    load()
  }, [])

  const deleteArticle = async (id) => {
    if (!confirm('Permanently delete this article?')) return
    await supabase.from('articles').delete().eq('id', id)
    setArticles(articles.filter(a => a.id !== id))
  }

  const togglePublished = async (article) => {
    await supabase
      .from('articles')
      .update({ published: !article.published })
      .eq('id', article.id)
    setArticles(articles.map(a =>
      a.id === article.id ? { ...a, published: !a.published } : a
    ))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!isAdmin) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-purple-700">NyLo</Link>
        <span className="text-xs font-medium bg-red-100 text-red-700 px-3 py-1 rounded-full">
          Admin Panel
        </span>
        <Link to="/dashboard" className="text-sm text-gray-500 hover:text-purple-700">
          ← Back to Dashboard
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-500 text-sm mb-8">Manage all content and users on NyLo</p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: 'Total users', value: stats.users },
            { label: 'Total articles', value: stats.articles },
            { label: 'Published', value: stats.published },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5">
              <p className="text-3xl font-bold text-purple-700">{s.value}</p>
              <p className="text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Articles Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-8">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Articles</h2>
          <div className="flex flex-col gap-2">
            {articles.map(article => (
              <div key={article.id}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50">
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-gray-900 truncate">{article.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by {article.profiles?.full_name || 'Unknown'} ·{' '}
                    {new Date(article.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => togglePublished(article)}
                    className={`text-xs px-3 py-1 rounded-full font-medium border transition ${
                      article.published
                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                    }`}
                  >
                    {article.published ? 'Published' : 'Draft'}
                  </button>
                  <button
                    onClick={() => deleteArticle(article.id)}
                    className="text-xs text-red-400 hover:text-red-600 transition px-2"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Users</h2>
          <div className="flex flex-col gap-2">
            {users.map(user => (
              <div key={user.id}
                className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-3 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                    {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.full_name || 'No name'}</p>
                    <p className="text-xs text-gray-400">@{user.username || 'no-username'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {user.is_admin && (
                    <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  )}
                  <Link
                    to={`/profile/${user.username}`}
                    className="text-xs text-purple-700 hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}