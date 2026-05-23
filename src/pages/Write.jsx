import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Write() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [user, setUser] = useState(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) navigate('/login')
      setUser(user)
    })
  }, [])

  const saveArticle = async (published = false) => {
    if (!title.trim()) return alert('Please add a title first.')
    if (!content.trim()) return alert('Please write some content first.')
    if (published && !category) return alert('Please select a category before publishing.')

    published ? setPublishing(true) : setSaving(true)

    const { error } = await supabase.from('articles').insert({
      title: title.trim(),
      content: content.trim(),
      category,
      author_id: user.id,
      published
    })

    published ? setPublishing(false) : setSaving(false)

    if (error) return alert('Error saving article: ' + error.message)

    if (published) {
      navigate('/dashboard')
    } else {
      setSavedMessage('Draft saved!')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link to="/dashboard" className="text-2xl font-bold text-purple-700">NyLo</Link>
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>{wordCount} words · {readTime} min read</span>
          {savedMessage && <span className="text-green-600 font-medium">{savedMessage}</span>}
          <button
            onClick={() => saveArticle(false)}
            disabled={saving}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:border-purple-700 hover:text-purple-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save draft'}
          </button>
          <button
            onClick={() => saveArticle(true)}
            disabled={publishing}
            className="bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-800 transition disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="mb-6 text-sm border border-gray-200 rounded-full px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select a category</option>
          {['Politics', 'Technology', 'Culture', 'Education', 'Health', 'Business', 'Sports', 'Opinion'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Your article title..."
          rows={2}
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none resize-none mb-6 leading-tight"
        />

        <div className="border-t border-gray-100 mb-6" />

        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Tell your story..."
          rows={25}
          className="w-full text-lg text-gray-800 placeholder-gray-300 border-none outline-none resize-none leading-relaxed"
        />
      </div>
    </div>
  )
}