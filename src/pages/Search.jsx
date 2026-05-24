import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const readTime = (content) => Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) {
      setQuery(q)
      runSearch(q)
    }
  }, [])

  const runSearch = async (q) => {
    if (!q.trim()) return
    setLoading(true)
    setSearched(true)

    const { data } = await supabase
      .from('articles')
      .select('*, profiles(full_name, username)')
      .eq('published', true)
      .or(`title.ilike.%${q}%,content.ilike.%${q}%`)
      .order('created_at', { ascending: false })
      .limit(20)

    setResults(data || [])
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearchParams({ q: query })
    runSearch(query)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link to="/" className="text-2xl font-bold text-purple-700">NyLo</Link>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm text-gray-600 hover:text-purple-700">Sign in</Link>
          <Link to="/register" className="bg-purple-700 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-800 transition">
            Get started
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-14">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search NyLo</h1>

        {/* Search Box */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search articles, topics, authors..."
            className="flex-1 border border-gray-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <button
            type="submit"
            className="bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-purple-800 transition"
          >
            Search
          </button>
        </form>

        {/* Results */}
        {loading && (
          <p className="text-gray-400 text-sm text-center py-12">Searching...</p>
        )}

        {!loading && searched && results.length === 0 && (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-gray-600 font-medium mb-1">No results found for "{searchParams.get('q')}"</p>
            <p className="text-gray-400 text-sm">Try different keywords or browse by category on the homepage.</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div>
            <p className="text-sm text-gray-400 mb-6">
              {results.length} result{results.length !== 1 ? 's' : ''} for "<strong className="text-gray-700">{searchParams.get('q')}</strong>"
            </p>
            <div className="flex flex-col gap-5">
              {results.map(article => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="border border-gray-200 rounded-2xl p-5 hover:shadow-md transition block"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      {article.category && (
                        <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                          {article.category}
                        </span>
                      )}
                      <h3 className="text-base font-semibold text-gray-900 mt-2 mb-1">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">{article.content}</p>
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <Link
                          to={`/profile/${article.profiles?.username}`}
                          onClick={e => e.stopPropagation()}
                          className="hover:text-purple-700 font-medium"
                        >
                          {article.profiles?.full_name || 'Anonymous'}
                        </Link>
                        <span>{readTime(article.content)} min read</span>
                        <span>{article.views || 0} views</span>
                        <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}