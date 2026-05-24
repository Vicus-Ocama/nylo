import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')

  const handleSearch = (e) => {
    e.preventDefault()
    if (!query.trim()) return
    navigate(`/search?q=${encodeURIComponent(query.trim())}`)
    setQuery('')
  }

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-purple-700 tracking-tight flex-shrink-0">
        NyLo
      </Link>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex-1 max-w-sm mx-6">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </form>

      <div className="flex items-center gap-4 flex-shrink-0">
        <Link to="/explore" className="text-gray-600 hover:text-purple-700 text-sm font-medium">
          Explore
        </Link>
        <Link to="/login" className="text-gray-600 hover:text-purple-700 text-sm font-medium">
          Sign in
        </Link>
        <Link to="/register" className="bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition">
          Get started
        </Link>
      </div>
    </nav>
  )
}