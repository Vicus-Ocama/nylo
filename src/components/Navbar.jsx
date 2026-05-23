import { Link } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-purple-700 tracking-tight">
        NyLo
      </Link>
      <div className="flex items-center gap-4">
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