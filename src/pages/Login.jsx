import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError('')
    if (!form.email || !form.password) return setError('Please fill in all fields.')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password
    })
    setLoading(false)
    if (error) return setError(error.message)
    navigate('/dashboard')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left branding panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 gradient-purple flex-col items-center justify-center p-12 text-white">
        <Link to="/" className="text-4xl font-bold mb-6">NyLo</Link>
        <h2 className="text-2xl font-semibold text-center mb-4 leading-snug">
          Your stories deserve to be read
        </h2>
        <p className="text-purple-200 text-center text-sm leading-relaxed max-w-xs">
          Join Uganda's growing community of writers, thinkers, and storytellers.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <Link to="/" className="text-2xl font-bold text-purple-700 block mb-10 lg:hidden">
            NyLo
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
          <p className="text-gray-500 text-sm mb-8">
            Sign in to continue writing
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Email address
              </label>
              <input
                name="email"
                onChange={handle}
                onKeyDown={handleKeyDown}
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Password
              </label>
              <input
                name="password"
                onChange={handle}
                onKeyDown={handleKeyDown}
                type="password"
                placeholder="••••••••"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-purple-700 text-white w-full py-3 rounded-xl text-sm font-medium hover:bg-purple-800 transition mt-2 disabled:opacity-50 shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : 'Sign in'}
            </button>
          </div>

          <p className="text-sm text-gray-500 text-center mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-purple-700 font-medium hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}