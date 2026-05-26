import { Link } from 'react-router-dom'
import usePageTitle from '../hooks/usePageTitle'

export default function NotFound() {
  usePageTitle('Page not found')

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      <Link to="/" className="text-2xl font-bold text-purple-700 mb-16 block">
        NyLo
      </Link>

      <p className="text-8xl font-bold text-gray-100 mb-2">404</p>
      <h1 className="text-2xl font-bold text-gray-900 mb-3">
        Page not found
      </h1>
      <p className="text-gray-500 text-sm mb-10 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          to="/"
          className="bg-purple-700 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-purple-800 transition"
        >
          Go home
        </Link>
        <Link
          to="/search"
          className="border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full text-sm font-medium hover:border-purple-700 hover:text-purple-700 transition"
        >
          Search articles
        </Link>
      </div>
    </div>
  )
}