import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar'

const CATEGORIES = [
  'All', 'Politics', 'Technology', 'Culture',
  'Education', 'Health', 'Business', 'Sports', 'Opinion'
]

function ArticleSkeleton() {
  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden">
      <div className="skeleton h-44 w-full" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-5 w-full" />
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
      </div>
    </div>
  )
}

export default function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      let query = supabase
        .from('articles')
        .select('*, profiles(full_name, username)')
        .eq('published', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (activeCategory !== 'All') {
        query = query.eq('category', activeCategory)
      }

      const { data } = await query
      setArticles(data || [])
      setLoading(false)
    }
    load()
  }, [activeCategory])

  const readTime = (content) =>
    Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 text-xs font-medium px-4 py-2 rounded-full mb-8 border border-purple-100">
          <span className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse" />
          Uganda's writing platform
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 leading-[1.1] mb-6 tracking-tight">
          Where Ugandan voices <span className="text-purple-700">come alive</span>
        </h1>

        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
          NyLo is a free platform where young Ugandans write, share,
          and discover stories that matter.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            to="/register"
            className="bg-purple-700 text-white px-8 py-3.5 rounded-full text-base font-medium hover:bg-purple-800 transition shadow-lg shadow-purple-200"
          >
            Start writing free
          </Link>
          <Link
            to="/#articles"
            className="border border-gray-200 text-gray-700 px-8 py-3.5 rounded-full text-base font-medium hover:border-purple-700 hover:text-purple-700 transition"
          >
            Explore articles
          </Link>
        </div>

        <p className="text-sm text-gray-400 mt-8">
          Free forever · No ads · Just great writing
        </p>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* Categories */}
      <section className="max-w-4xl mx-auto px-6 py-6" id="articles">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                activeCategory === cat
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Articles */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => <ArticleSkeleton key={i} />)}
          </div>
        ) : articles.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">✍️</p>
            <p className="text-gray-600 font-medium mb-2">
              No articles yet in {activeCategory}
            </p>
            <p className="text-gray-400 text-sm mb-6">
              Be the first writer in this category
            </p>
            <Link
              to="/write"
              className="inline-flex bg-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-purple-800 transition"
            >
              Write the first one →
            </Link>
          </div>
        ) : (
          <>
            {/* Featured first article */}
            {articles[0] && (
              <Link
                to={`/article/${articles[0].id}`}
                className="block mb-6 border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
              >
                {articles[0].cover_image ? (
                  <img
                    src={articles[0].cover_image}
                    alt={articles[0].title}
                    className="w-full h-64 object-cover"
                  />
                ) : (
                  <div className="w-full h-40 bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                      {articles[0].category || 'General'}
                    </span>
                    <span className="text-xs text-gray-400">Featured</span>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">
                    {articles[0].title}
                  </h2>
                  <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                    {articles[0].content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                        {articles[0].profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <span className="font-medium text-gray-600">
                        {articles[0].profiles?.full_name || 'Anonymous'}
                      </span>
                    </div>
                    <span>
                      {readTime(articles[0].content)} min read · {articles[0].views || 0} views
                    </span>
                  </div>
                </div>
              </Link>
            )}

            {/* Remaining articles grid */}
            {articles.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {articles.slice(1).map(article => (
                  <Link
                    key={article.id}
                    to={`/article/${article.id}`}
                    className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 block"
                  >
                    {article.cover_image ? (
                      <img
                        src={article.cover_image}
                        alt={article.title}
                        className="w-full h-40 object-cover"
                      />
                    ) : (
                      <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                        <span className="text-2xl">📝</span>
                      </div>
                    )}
                    <div className="p-5">
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                        {article.category || 'General'}
                      </span>
                      <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2 line-clamp-2 leading-snug">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {article.content}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                            {article.profiles?.full_name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <span>{article.profiles?.full_name || 'Anonymous'}</span>
                        </div>
                        <span>{readTime(article.content)} min read</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-12">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <Link to="/" className="text-xl font-bold text-purple-700">NyLo</Link>
            <p className="text-xs text-gray-400 mt-1">
              Uganda's home for writers & thinkers
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/register" className="hover:text-purple-700 transition">Write</Link>
            <Link to="/search" className="hover:text-purple-700 transition">Search</Link>
            <Link to="/login" className="hover:text-purple-700 transition">Sign in</Link>
          </div>
          <p className="text-xs text-gray-400">
            © {new Date().getFullYear()} NyLo
          </p>
        </div>
      </footer>
    </div>
  )
}