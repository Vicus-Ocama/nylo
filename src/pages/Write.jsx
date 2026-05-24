import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'

const CATEGORIES = [
  'Politics', 'Technology', 'Culture',
  'Education', 'Health', 'Business', 'Sports', 'Opinion'
]

export default function Write() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit') // /write?edit=ARTICLE_ID

  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState(null)      // File object
  const [coverPreview, setCoverPreview] = useState('')    // URL for preview
  const [existingCover, setExistingCover] = useState('') // Already saved URL
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [isEdit, setIsEdit] = useState(false)

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUser(user)

      // If editing, load the existing article
      if (editId) {
        const { data: article, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', editId)
          .eq('author_id', user.id) // Security: only own articles
          .single()

        if (error || !article) {
          alert('Article not found or you do not have permission to edit it.')
          navigate('/dashboard')
          return
        }

        setTitle(article.title)
        setContent(article.content)
        setCategory(article.category || '')
        setExistingCover(article.cover_image || '')
        setCoverPreview(article.cover_image || '')
        setIsEdit(true)
      }
    }
    load()
  }, [editId])

  // Handle cover image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image must be under 5MB.')
      return
    }

    setCoverImage(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const removeCover = () => {
    setCoverImage(null)
    setCoverPreview('')
    setExistingCover('')
  }

  // Upload image to Supabase Storage
  const uploadCoverImage = async () => {
    if (!coverImage) return existingCover || null

    setUploadingImage(true)
    const fileExt = coverImage.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error } = await supabase.storage
      .from('covers')
      .upload(fileName, coverImage, { upsert: true })

    setUploadingImage(false)

    if (error) {
      alert('Failed to upload image: ' + error.message)
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const saveArticle = async (published = false) => {
    if (!title.trim()) return alert('Please add a title first.')
    if (!content.trim()) return alert('Please write some content first.')
    if (published && !category) return alert('Please select a category before publishing.')

    published ? setPublishing(true) : setSaving(true)

    // Upload cover image if one was selected
    const coverUrl = await uploadCoverImage()

    const articleData = {
      title: title.trim(),
      content: content.trim(),
      category,
      published,
      cover_image: coverUrl,
    }

    let error

    if (isEdit) {
      // UPDATE existing article
      const { error: updateError } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editId)
        .eq('author_id', user.id)
      error = updateError
    } else {
      // INSERT new article
      const { error: insertError } = await supabase
        .from('articles')
        .insert({ ...articleData, author_id: user.id })
      error = insertError
    }

    published ? setPublishing(false) : setSaving(false)

    if (error) return alert('Error saving article: ' + error.message)

    if (published) {
      navigate('/dashboard')
    } else {
      setSavedMessage(isEdit ? 'Changes saved!' : 'Draft saved!')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link to="/dashboard" className="text-2xl font-bold text-purple-700">NyLo</Link>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-400 hidden sm:block">
            {wordCount} words · {readTime} min read
          </span>
          {savedMessage && (
            <span className="text-green-600 font-medium">{savedMessage}</span>
          )}
          <button
            onClick={() => saveArticle(false)}
            disabled={saving || uploadingImage}
            className="border border-gray-200 text-gray-700 px-4 py-2 rounded-full hover:border-purple-700 hover:text-purple-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : isEdit ? 'Save changes' : 'Save draft'}
          </button>
          <button
            onClick={() => saveArticle(true)}
            disabled={publishing || uploadingImage}
            className="bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-800 transition disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : uploadingImage ? 'Uploading...' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Edit mode banner */}
        {isEdit && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
            ✏️ <span>You are editing an existing article. Changes will update the published version.</span>
          </div>
        )}

        {/* Category selector */}
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="mb-6 text-sm border border-gray-200 rounded-full px-4 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select a category</option>
          {CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Cover image section */}
        <div className="mb-8">
          {coverPreview ? (
            <div className="relative rounded-2xl overflow-hidden">
              <img
                src={coverPreview}
                alt="Cover"
                className="w-full h-56 object-cover"
              />
              <button
                onClick={removeCover}
                className="absolute top-3 right-3 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full hover:bg-black/80 transition"
              >
                Remove cover
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition">
              <span className="text-2xl mb-2">🖼️</span>
              <span className="text-sm text-gray-500">Click to add a cover image</span>
              <span className="text-xs text-gray-400 mt-1">JPG, PNG or WebP · Max 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Title */}
        <textarea
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Your article title..."
          rows={2}
          className="w-full text-4xl font-bold text-gray-900 placeholder-gray-300 border-none outline-none resize-none mb-6 leading-tight"
        />

        <div className="border-t border-gray-100 mb-6" />

        {/* Content */}
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