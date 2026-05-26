import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import usePageTitle from '../hooks/usePageTitle'
import Toast from '../components/Toast'
import useToast from '../hooks/useToast'

const CATEGORIES = [
  'Politics', 'Technology', 'Culture',
  'Education', 'Health', 'Business', 'Sports', 'Opinion'
]

export default function Write() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const editId = searchParams.get('edit')

  const [user, setUser] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('')
  const [coverImage, setCoverImage] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')
  const [existingCover, setExistingCover] = useState('')
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savedMessage, setSavedMessage] = useState('')
  const [isEdit, setIsEdit] = useState(false)
  const [showCategoryMenu, setShowCategoryMenu] = useState(false)
  const titleRef = useRef(null)
  const contentRef = useRef(null)

  const wordCount = content.trim() === '' ? 0 : content.trim().split(/\s+/).length
  const readTime = Math.max(1, Math.ceil(wordCount / 200))
  const { toast, showToast, hideToast } = useToast()

  usePageTitle(isEdit ? 'Edit Article' : 'Write')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }
      setUser(user)

      if (editId) {
        const { data: article, error } = await supabase
          .from('articles')
          .select('*')
          .eq('id', editId)
          .eq('author_id', user.id)
          .single()

        if (error || !article) {
          showToast('Article not found or you do not have permission to edit it.', 'error')
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

  const autoResize = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }

  const handleImageSelect = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      showToast('Please select an image file.', 'error')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('Image must be under 5MB.', 'error')
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
      showToast('Failed to upload image: ' + error.message, 'error')
      return null
    }

    const { data: { publicUrl } } = supabase.storage
      .from('covers')
      .getPublicUrl(fileName)

    return publicUrl
  }

  const saveArticle = async (published = false) => {
    if (!title.trim()) {
      showToast('Please add a title first.', 'error')
      return
    }
    if (!content.trim()) {
      showToast('Please write some content first.', 'error')
      return
    }
    if (published && !category) {
      showToast('Please select a category before publishing.', 'error')
      return
    }

    published ? setPublishing(true) : setSaving(true)

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
      const { error: updateError } = await supabase
        .from('articles')
        .update(articleData)
        .eq('id', editId)
        .eq('author_id', user.id)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from('articles')
        .insert({ ...articleData, author_id: user.id })
      error = insertError
    }

    published ? setPublishing(false) : setSaving(false)

    if (error) {
      showToast('Error saving article: ' + error.message, 'error')
      return
    }

    if (published) {
      navigate('/dashboard')
    } else {
      setSavedMessage(isEdit ? 'Changes saved!' : 'Draft saved!')
      showToast(isEdit ? 'Changes saved!' : 'Draft saved!', 'success')
      setTimeout(() => setSavedMessage(''), 3000)
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <header className="border-b border-gray-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link to="/dashboard" className="text-xl font-bold text-purple-700">NyLo</Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs text-gray-400 hidden sm:block">
            {wordCount} words · {readTime} min read
          </span>

          {savedMessage && (
            <span className="text-green-600 text-xs font-medium">{savedMessage}</span>
          )}

          <button
            onClick={() => saveArticle(false)}
            disabled={saving || uploadingImage}
            className="border border-gray-200 text-gray-600 px-3 sm:px-4 py-2 rounded-full text-sm hover:border-purple-700 hover:text-purple-700 transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save draft'}
          </button>

          <button
            onClick={() => saveArticle(true)}
            disabled={publishing || uploadingImage}
            className="bg-purple-700 text-white px-3 sm:px-4 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition disabled:opacity-50"
          >
            {publishing ? 'Publishing...' : uploadingImage ? 'Uploading...' : 'Publish'}
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">

        {/* Edit banner */}
        {isEdit && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm text-blue-700 flex items-center gap-2">
            ✏️ <span>Editing an existing article. Changes update the published version.</span>
          </div>
        )}

        {/* Category selector */}
        <div className="relative mb-6">
          <button
            onClick={() => setShowCategoryMenu(!showCategoryMenu)}
            className={`flex items-center gap-2 text-sm border rounded-full px-4 py-2 transition ${
              category
                ? 'border-purple-300 text-purple-700 bg-purple-50'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {category || 'Select a category'}
            <span className="text-xs">{showCategoryMenu ? '▲' : '▼'}</span>
          </button>

          {showCategoryMenu && (
            <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 py-1 min-w-40">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => { setCategory(cat); setShowCategoryMenu(false) }}
                  className={`w-full text-left px-4 py-2 text-sm transition hover:bg-purple-50 hover:text-purple-700 ${
                    category === cat ? 'text-purple-700 font-medium' : 'text-gray-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cover image */}
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
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition group">
              <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🖼️</span>
              <span className="text-sm text-gray-500">Add a cover image</span>
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
          ref={titleRef}
          value={title}
          onChange={e => { setTitle(e.target.value); autoResize(titleRef) }}
          placeholder="Your article title..."
          rows={2}
          className="w-full text-3xl sm:text-4xl font-bold text-gray-900 placeholder-gray-200 border-none outline-none resize-none mb-4 leading-tight font-reading"
        />

        {title && !content && (
          <p className="text-sm text-gray-300 mb-4 -mt-2">
            Click below to start writing your story...
          </p>
        )}

        <div className="border-t border-gray-100 mb-6" />

        {/* Content */}
        <textarea
          ref={contentRef}
          value={content}
          onChange={e => { setContent(e.target.value); autoResize(contentRef) }}
          placeholder="Tell your story..."
          rows={20}
          className="w-full text-lg text-gray-800 placeholder-gray-200 border-none outline-none resize-none leading-relaxed article-body"
        />

        {/* Bottom word count for mobile */}
        <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400 sm:hidden">
          <span>{wordCount} words</span>
          <span>{readTime} min read</span>
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

    </div>
  )
}