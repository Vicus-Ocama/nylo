import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    setError('')
    if (!form.firstName || !form.email || !form.username || !form.password) {
      return setError('Please fill in all fields.')
    }
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: `${form.firstName} ${form.lastName}`,
          username: form.username
        }
      }
    })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 p-8">
        <Link to="/" className="text-2xl font-bold text-purple-700 block mb-8">NyLo</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
        <p className="text-gray-500 text-sm mb-8">Join thousands of Ugandan writers</p>

        {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}

        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">First name</label>
              <input name="firstName" onChange={handle} type="text" placeholder="Daniel"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 block mb-1">Last name</label>
              <input name="lastName" onChange={handle} type="text" placeholder="Onen"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input name="email" onChange={handle} type="email" placeholder="you@example.com"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
            <input name="username" onChange={handle} type="text" placeholder="@danielonen"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input name="password" onChange={handle} type="password" placeholder="••••••••"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <button onClick={handleSubmit} disabled={loading}
            className="bg-purple-700 text-white w-full py-3 rounded-xl text-sm font-medium hover:bg-purple-800 transition mt-2 disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </div>
        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-700 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}