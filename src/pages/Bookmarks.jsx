import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import DashboardLayout from '../components/DashboardLayout'
import usePageTitle from '../hooks/usePageTitle'

export default function Bookmarks() {
  const navigate = useNavigate()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  usePageTitle('Bookmarks')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      const { data } = await supabase
        .from('bookmarks')
        .select('*, articles(*, profiles(full_name, username))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setBookmarks(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const removeBookmark = async (bookmarkId) => {
    await supabase.from('bookmarks').delete().eq('id', bookmarkId)
    setBookmarks(prev => prev.filter(b => b.id !== bookmarkId))
  }

  const readTime = (content) =>
    Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bookmarks</h1>
      <p className="text-gray-500 text-sm mb-8">
        Articles you've saved to read later
      </p>

      {bookmarks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <p className="text-4xl mb-4">🔖</p>
          <p className="text-gray-600 font-medium mb-1">No bookmarks yet</p>
          <p className="text-gray-400 text-sm mb-6">
            When you save an article, it will appear here.
          </p>
          <Link
            to="/"
            className="inline-flex bg-purple-700 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-purple-800 transition"
          >
            Browse articles
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {bookmarks.map(bookmark => {
            const article = bookmark.articles
            if (!article) return null
            return (
              <div
                key={bookmark.id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition-all duration-200"
              >
                {article.cover_image && (
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full sm:w-40 h-36 sm:h-auto object-cover flex-shrink-0"
                  />
                )}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    {article.category && (
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                        {article.category}
                      </span>
                    )}
                    <Link
                      to={`/article/${article.id}`}
                      className="block mt-2 mb-1"
                    >
                      <h3 className="text-base font-semibold text-gray-900 hover:text-purple-700 transition leading-snug">
                        {article.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500 line-clamp-2">
                      {article.content}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                    <div className="flex items-center gap-3">
                      <Link
                        to={`/profile/${article.profiles?.username}`}
                        className="hover:text-purple-700 font-medium"
                      >
                        {article.profiles?.full_name || 'Anonymous'}
                      </Link>
                      <span>{readTime(article.content)} min read</span>
                    </div>
                    <button
                      onClick={() => removeBookmark(bookmark.id)}
                      className="text-red-400 hover:text-red-600 transition"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </DashboardLayout>
  )
}