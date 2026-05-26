import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar'
import usePageTitle from '../hooks/usePageTitle'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [articles, setArticles] = useState([])
  const [authors, setAuthors] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [activeTab, setActiveTab] = useState('articles')

  const readTime = (content) =>
    Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))

  usePageTitle(searchParams.get('q') ? `"${searchParams.get('q')}" — Search` : 'Search')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) { setQuery(q); runSearch(q) }
  }, [])

  const runSearch = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)

    const [{ data: articleData }, { data: authorData }] = await Promise.all([
      supabase
        .from('articles')
        .select('*, profiles(full_name, username)')
        .eq('published', true)
        .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
        .order('created_at', { ascending: false })
        .limit(20),

      supabase
        .from('profiles')
        .select('*')
        .or(`full_name.ilike.%${q}%,username.ilike.%${q}%,bio.ilike.%${q}%`)
        .limit(10)
    ])

    setArticles(articleData || [])
    setAuthors(authorData || [])
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchParams({ q: query })
    runSearch(query)
  }

  const totalResults = articles.length + authors.length

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search NyLo</h1>

        {/* Search box */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, authors, topics..."
            className="flex-1 border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-700 text-white px-5 py-3 rounded-xl text-sm font-medium hover:bg-purple-800 transition"
          >
            Search
          </button>
        </form>

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && searched && totalResults === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-600 font-medium mb-1">
              No results for "{searchParams.get('q')}"
            </p>
            <p className="text-gray-400 text-sm">
              Try different keywords or browse by category on the homepage.
            </p>
          </div>
        )}

        {!loading && searched && totalResults > 0 && (
          <div>
            {/* Result count */}
            <p className="text-sm text-gray-400 mb-5">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for{' '}
              <strong className="text-gray-700">"{searchParams.get('q')}"</strong>
            </p>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
              <button
                onClick={() => setActiveTab('articles')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'articles'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Articles ({articles.length})
              </button>
              <button
                onClick={() => setActiveTab('authors')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  activeTab === 'authors'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Authors ({authors.length})
              </button>
            </div>

            {/* Articles tab */}
            {activeTab === 'articles' && (
              <div className="flex flex-col gap-4">
                {articles.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No articles found. Try the Authors tab.
                  </p>
                ) : (
                  articles.map(article => (
                    <Link
                      key={article.id}
                      to={`/article/${article.id}`}
                      className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 block"
                    >
                      <div className="flex gap-4 p-5">
                        {article.cover_image && (
                          <img
                            src={article.cover_image}
                            alt={article.title}
                            className="w-24 h-20 object-cover rounded-xl flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          {article.category && (
                            <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                              {article.category}
                            </span>
                          )}
                          <h3 className="text-base font-semibold text-gray-900 mt-1 mb-1 line-clamp-2 leading-snug">
                            {article.title}
                          </h3>
                          <p className="text-sm text-gray-500 line-clamp-1">
                            {article.content}
                          </p>
                          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                            <span className="font-medium">
                              {article.profiles?.full_name || 'Anonymous'}
                            </span>
                            <span>{readTime(article.content)} min read</span>
                            <span>{article.views || 0} views</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            )}

            {/* Authors tab */}
            {activeTab === 'authors' && (
              <div className="flex flex-col gap-3">
                {authors.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No authors found. Try the Articles tab.
                  </p>
                ) : (
                  authors.map(author => (
                    <Link
                      key={author.id}
                      to={`/profile/${author.username}`}
                      className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-lg flex-shrink-0">
                        {author.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">
                          {author.full_name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-400">@{author.username}</p>
                        {author.bio && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                            {author.bio}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-purple-700 font-medium flex-shrink-0">
                        View profile →
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}