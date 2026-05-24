import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Navbar from '../components/Navbar'

export default function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = ['All', 'Politics', 'Technology', 'Culture', 'Education', 'Health', 'Business', 'Sports', 'Opinion']

  useEffect(() => {
    const load = async () => {
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

  const readTime = (content) => Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 200))

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-6">
          Uganda's home for <span className="text-purple-700">writers & thinkers</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          NyLo is a free platform where young Ugandans write, share, and discover stories that matter.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/register" className="bg-purple-700 text-white px-8 py-3 rounded-full text-base font-medium hover:bg-purple-800 transition">
            Start writing
          </Link>
          <a href="#articles" className="border border-gray-300 text-gray-700 px-8 py-3 rounded-full text-base font-medium hover:border-purple-700 hover:text-purple-700 transition">
            Explore articles
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-4xl mx-auto px-6 pb-6" id="articles">
        <div className="flex flex-wrap gap-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setLoading(true) }}
              className={`px-4 py-2 rounded-full text-sm transition ${
                activeCategory === cat
                  ? 'bg-purple-700 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100 hover:text-purple-700'
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
          <p className="text-gray-400 text-sm py-12 text-center">Loading articles...</p>
        ) : articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-sm">No articles yet in this category.</p>
            <Link to="/write" className="text-purple-700 text-sm font-medium hover:underline mt-2 inline-block">
              Be the first to write one →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            {articles.map(article => (
              <Link
                key={article.id}
                to={`/article/${article.id}`}
                className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition cursor-pointer block"
              >
                {/* Cover image — only shows if article has one */}
                {article.cover_image && (
                  <img
                    src={article.cover_image}
                    alt={article.title}
                    className="w-full h-44 object-cover"
                  />
                )}

                {/* Card content */}
                <div className="p-5">
                  <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
                    {article.category || 'General'}
                  </span>
                  <h3 className="text-base font-semibold text-gray-900 mt-3 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {article.content}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>{article.profiles?.full_name || 'Anonymous'}</span>
                    <span>{readTime(article.content)} min read · {article.views || 0} views</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}