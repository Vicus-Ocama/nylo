import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', username: '', password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError('')
    if (!form.firstName || !form.email || !form.username || !form.password) {
      return setError('Please fill in all required fields.')
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.')
    }
    if (form.username.length < 3) {
      return setError('Username must be at least 3 characters.')
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`.trim(),
          username: form.username.replace('@', '').toLowerCase()
        }
      }
    })
    setLoading(false)
    if (error) return setError(error.message)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Left branding panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-purple flex-col items-center justify-center p-12 text-white">
        <Link to="/" className="text-4xl font-bold mb-6">NyLo</Link>
        <h2 className="text-2xl font-semibold text-center mb-4 leading-snug">
          Start your writing journey today
        </h2>
        <p className="text-purple-200 text-center text-sm leading-relaxed max-w-xs">
          Free forever. No ads. Just your words reaching the people who need to read them.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          <Link to="/" className="text-2xl font-bold text-purple-700 block mb-10 lg:hidden">
            NyLo
          </Link>

          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-gray-500 text-sm mb-8">
            Join Uganda's growing community of writers
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-4">
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  First name <span className="text-red-400">*</span>
                </label>
                <input
                  name="firstName"
                  onChange={handle}
                  type="text"
                  placeholder="Daniel"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-1.5">
                  Last name
                </label>
                <input
                  name="lastName"
                  onChange={handle}
                  type="text"
                  placeholder="Onen"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Email address <span className="text-red-400">*</span>
              </label>
              <input
                name="email"
                onChange={handle}
                type="email"
                placeholder="you@example.com"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Username <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">@</span>
                <input
                  name="username"
                  onChange={handle}
                  type="text"
                  placeholder="danielonen"
                  className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1.5">
                Password <span className="text-red-400">*</span>
              </label>
              <input
                name="password"
                onChange={handle}
                type="password"
                placeholder="At least 6 characters"
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
                  Creating account...
                </span>
              ) : 'Create free account'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              By signing up you agree to write respectfully and honestly.
            </p>
          </div>

          <p className="text-sm text-gray-500 text-center mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-700 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}