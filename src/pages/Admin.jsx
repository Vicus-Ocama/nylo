import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Admin() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState({ users: 0, articles: 0, comments: 0, views: 0 })
  const [users, setUsers] = useState([])
  const [articles, setArticles] = useState([])
  const [comments, setComments] = useState([])

  useEffect(() => {
    const load = async () => {
      // Check if current user is admin
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (!profile?.is_admin) { navigate('/'); return }

      await loadAll()
      setLoading(false)
    }
    load()
  }, [])

  const loadAll = async () => {
    // Load users
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(users || [])

    // Load articles
    const { data: articles } = await supabase
      .from('articles')
      .select('*, profiles(full_name, username)')
      .order('created_at', { ascending: false })
    setArticles(articles || [])

    // Load comments
    const { data: comments } = await supabase
      .from('comments')
      .select('*, profiles(full_name), articles(title)')
      .order('created_at', { ascending: false })
    setComments(comments || [])

    // Stats
    const totalViews = (articles || []).reduce((sum, a) => sum + (a.views || 0), 0)
    setStats({
      users: (users || []).length,
      articles: (articles || []).filter(a => a.published).length,
      comments: (comments || []).length,
      views: totalViews
    })
  }

  const deleteUser = async (userId) => {
    if (!confirm('Delete this user and all their content?')) return
    await supabase.from('profiles').delete().eq('id', userId)
    setUsers(users.filter(u => u.id !== userId))
    setArticles(articles.filter(a => a.author_id !== userId))
  }

  const deleteArticle = async (articleId) => {
    if (!confirm('Delete this article?')) return
    await supabase.from('articles').delete().eq('id', articleId)
    setArticles(articles.filter(a => a.id !== articleId))
  }

  const togglePublish = async (article) => {
    await supabase
      .from('articles')
      .update({ published: !article.published })
      .eq('id', article.id)
    setArticles(articles.map(a =>
      a.id === article.id ? { ...a, published: !a.published } : a
    ))
  }

  const deleteComment = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    await supabase.from('comments').delete().eq('id', commentId)
    setComments(comments.filter(c => c.id !== commentId))
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading admin panel...</p>
    </div>
  )

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: '👥 Users' },
    { id: 'articles', label: '📄 Articles' },
    { id: 'comments', label: '💬 Comments' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-gray-200 min-h-screen px-4 py-6 fixed">
        <Link to="/" className="text-2xl font-bold text-purple-700 block mb-2">NyLo</Link>
        <p className="text-xs text-red-500 font-semibold mb-8 px-1">ADMIN PANEL</p>

        <nav className="flex flex-col gap-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-left transition ${
                activeTab === tab.id
                  ? 'bg-purple-50 text-purple-700 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="absolute bottom-6 left-4 right-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-purple-700 transition"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 px-8 py-8">

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Overview</h1>
            <p className="text-gray-500 text-sm mb-8">Live stats for NyLo</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: 'Registered users', value: stats.users, icon: '👥' },
                { label: 'Published articles', value: stats.articles, icon: '📄' },
                { label: 'Total comments', value: stats.comments, icon: '💬' },
                { label: 'Total views', value: stats.views, icon: '👁️' },
              ].map(stat => (
                <div key={stat.label} className="bg-white border border-gray-200 rounded-2xl p-5">
                  <p className="text-2xl mb-1">{stat.icon}</p>
                  <p className="text-3xl font-bold text-purple-700">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Recent Articles */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Articles</h2>
              <div className="flex flex-col gap-3">
                {articles.slice(0, 5).map(article => (
                  <div key={article.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{article.title}</p>
                      <p className="text-xs text-gray-400">by {article.profiles?.full_name} · {article.views || 0} views</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      article.published ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                    }`}>
                      {article.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h2 className="text-base font-semibold text-gray-800 mb-4">Recent Users</h2>
              <div className="flex flex-col gap-3">
                {users.slice(0, 5).map(user => (
                  <div key={user.id} className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                      {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{user.full_name || 'Unnamed'}</p>
                      <p className="text-xs text-gray-400">@{user.username || 'no-username'}</p>
                    </div>
                    {user.is_admin && (
                      <span className="ml-auto text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Admin</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Users</h1>
            <p className="text-gray-500 text-sm mb-8">{users.length} registered users</p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">User</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Username</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Joined</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Articles</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Role</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(user => {
                    const userArticleCount = articles.filter(a => a.author_id === user.id).length
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                              {user.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                            </div>
                            <span className="font-medium text-gray-800">{user.full_name || 'Unnamed'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500">@{user.username || '—'}</td>
                        <td className="px-5 py-3 text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-5 py-3 text-gray-500">{userArticleCount}</td>
                        <td className="px-5 py-3">
                          {user.is_admin
                            ? <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium">Admin</span>
                            : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Writer</span>
                          }
                        </td>
                        <td className="px-5 py-3 text-right">
                          {!user.is_admin && (
                            <button
                              onClick={() => deleteUser(user.id)}
                              className="text-xs text-red-400 hover:text-red-600 transition font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Articles</h1>
            <p className="text-gray-500 text-sm mb-8">{articles.length} total articles</p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Title</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Author</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Category</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Views</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Status</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {articles.map(article => (
                    <tr key={article.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3">
                        <Link
                          to={`/article/${article.id}`}
                          className="font-medium text-gray-800 hover:text-purple-700 line-clamp-1"
                        >
                          {article.title}
                        </Link>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{article.profiles?.full_name || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{article.category || '—'}</td>
                      <td className="px-5 py-3 text-gray-500">{article.views || 0}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          article.published ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
                        }`}>
                          {article.published ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => togglePublish(article)}
                            className="text-xs text-purple-600 hover:text-purple-800 transition font-medium"
                          >
                            {article.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => deleteArticle(article.id)}
                            className="text-xs text-red-400 hover:text-red-600 transition font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Comments</h1>
            <p className="text-gray-500 text-sm mb-8">{comments.length} total comments</p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Comment</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Author</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">On Article</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500">Date</th>
                    <th className="px-5 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {comments.map(comment => (
                    <tr key={comment.id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 text-gray-700 max-w-xs">
                        <p className="line-clamp-2">{comment.content}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500">{comment.profiles?.full_name || '—'}</td>
                      <td className="px-5 py-3 text-gray-500 max-w-xs">
                        <p className="line-clamp-1">{comment.articles?.title || '—'}</p>
                      </td>
                      <td className="px-5 py-3 text-gray-500">
                        {new Date(comment.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}