import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import DashboardLayout from '../components/DashboardLayout'

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
    if (!form.full_name.trim()) return setError('Full name is required.')
    if (!form.username.trim()) return setError('Username is required.')
    if (form.username.length < 3) return setError('Username must be at least 3 characters.')

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
    setSuccess('Profile updated successfully!')
    setTimeout(() => navigate('/dashboard'), 1500)
  }

  if (loading) return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    </DashboardLayout>
  )

  return (
    <DashboardLayout>
      <div className="max-w-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Edit profile</h1>
        <p className="text-gray-500 text-sm mb-8">
          Update your public writer profile
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 rounded-xl mb-6">
            {success}
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-5">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">
              Full name <span className="text-red-400">*</span>
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handle}
              type="text"
              placeholder="Your full name"
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
                value={form.username}
                onChange={handle}
                type="text"
                placeholder="yourhandle"
                className="w-full border border-gray-200 rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Your profile will be at nylo.app/@{form.username || 'yourhandle'}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Bio</label>
            <textarea
              name="bio"
              value={form.bio}
              onChange={handle}
              rows={4}
              placeholder="Tell readers a bit about yourself..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
            />
            <p className="text-xs text-gray-400 mt-1">
              {form.bio.length}/160 characters
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-700 text-white w-full py-3 rounded-xl text-sm font-medium hover:bg-purple-800 transition disabled:opacity-50"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : 'Save changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}