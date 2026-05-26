import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar'
import usePageTitle from '../hooks/usePageTitle'

export default function Profile() {
  const { username } = useParams()
  const [profile, setProfile] = useState(null)
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  usePageTitle(profile?.full_name || 'Profile')

  useEffect(() => {
    const load = async () => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error || !profile) { setNotFound(true); setLoading(false); return }
      setProfile(profile)

      const { data: articles } = await supabase
        .from('articles')
        .select('*')
        .eq('author_id', profile.id)
        .eq('published', true)
        .order('created_at', { ascending: false })

      setArticles(articles || [])
      setLoading(false)
    }
    load()
  }, [username])

  const readTime = (content) =>
    Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))

  const initials = profile?.full_name
    ?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0)

  if (loading) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-2xl font-bold text-gray-800">Profile not found</p>
        <Link to="/" className="text-purple-700 text-sm hover:underline">
          ← Back to home
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Profile header */}
        <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-10 border-b border-gray-100">
          <div className="w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-2xl flex-shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
            <p className="text-gray-400 text-sm mb-3">@{profile.username}</p>
            {profile.bio && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {profile.bio}
              </p>
            )}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-500">
              <span>
                <strong className="text-gray-900">{articles.length}</strong> articles
              </span>
              <span>
                <strong className="text-gray-900">{totalViews}</strong> total views
              </span>
              <span>
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long'
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Articles */}
        <h2 className="text-base font-semibold text-gray-800 mb-6">
          Published articles
        </h2>

        {articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">✍️</p>
            <p className="text-gray-400 text-sm">
              This writer hasn't published anything yet.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {articles.map(article => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 block"
              >
                {article.cover_image && (
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-40 object-cover"
                  />
                )}
                <div className="p-5">
                  {article.category && (
                    <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                      {article.category}
                    </span>
                  )}
                  <h3 className="text-base font-semibold text-gray-900 mt-2 mb-1 leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {article.content}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>
                      {new Date(article.created_at).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      })}
                    </span>
                    <span>{readTime(article.content)} min read</span>
                    <span>{article.views || 0} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}