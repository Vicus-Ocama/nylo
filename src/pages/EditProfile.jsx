import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function EditProfile() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ full_name: '', username: '', bio: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        setForm({
          full_name: profile.full_name || '',
          username: profile.username || '',
          bio: profile.bio || ''
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (!form.full_name.trim() || !form.username.trim()) {
      return setError('Name and username are required.')
    }
    setSaving(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: form.full_name.trim(),
        username: form.username.trim().replace('@', '').toLowerCase(),
        bio: form.bio.trim()
      })
      .eq('id', user.id)

    setSaving(false)
    if (error) return setError(error.message)
    setSuccess('Profile updated!')
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-2xl border border-gray-200 p-8">
        <Link to="/dashboard" className="text-2xl font-bold text-purple-700 block mb-8">NyLo</Link>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit profile</h1>
        <p className="text-gray-500 text-sm mb-8">Update your public writer profile</p>

        {error && <p className="text-red-500 text-sm bg-red-50 px-4 py-3 rounded-xl mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm bg-green-50 px-4 py-3 rounded-xl mb-4">{success}</p>}

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full name</label>
            <input name="full_name" value={form.full_name} onChange={handle} type="text"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Username</label>
            <input name="username" value={form.username} onChange={handle} type="text"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Bio</label>
            <textarea name="bio" value={form.bio} onChange={handle} rows={4}
              placeholder="Tell readers a bit about yourself..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none" />
          </div>
          <button onClick={handleSave} disabled={saving}
            className="bg-purple-700 text-white w-full py-3 rounded-xl text-sm font-medium hover:bg-purple-800 transition mt-2 disabled:opacity-50">
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  )
}