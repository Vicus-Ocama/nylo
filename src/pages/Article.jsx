import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import usePageTitle from '../hooks/usePageTitle'

export default function Article() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [author, setAuthor] = useState(null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [liking, setLiking] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [bookmarking, setBookmarking] = useState(false)
  const [following, setFollowing] = useState(false)
  const [followLoading, setFollowLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)
  
  usePageTitle(article?.title || 'Article') 

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const { data: article, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single()

      if (error || !article) { setNotFound(true); setLoading(false); return }

      await supabase
        .from('articles')
        .update({ views: (article.views || 0) + 1 })
        .eq('id', id)

      setArticle({ ...article, views: (article.views || 0) + 1 })

      const { data: author } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', article.author_id)
        .single()
      setAuthor(author)

      // Likes
      const { data: likes } = await supabase
        .from('likes')
        .select('*')
        .eq('article_id', id)
      setLikeCount(likes?.length || 0)

      // Followers count
      const { data: followers } = await supabase
        .from('follows')
        .select('*')
        .eq('following_id', article.author_id)
      setFollowerCount(followers?.length || 0)

      if (user) {
        setLiked(likes?.some(l => l.user_id === user.id))

        // Check bookmark
        const { data: bookmark } = await supabase
          .from('bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('article_id', id)
          .single()
        setBookmarked(!!bookmark)

        // Check follow
        const { data: follow } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', article.author_id)
          .single()
        setFollowing(!!follow)
      }

      await loadComments()
      setLoading(false)
    }
    load()
  }, [id])

  const loadComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('*, profiles(full_name, username)')
      .eq('article_id', id)
      .order('created_at', { ascending: true })
    setComments(data || [])
  }

  const toggleLike = async () => {
    if (!currentUser) return alert('Please sign in to like articles.')
    if (liking) return
    setLiking(true)
    if (liked) {
      await supabase.from('likes').delete()
        .eq('article_id', id).eq('user_id', currentUser.id)
      setLiked(false)
      setLikeCount(prev => prev - 1)
    } else {
      await supabase.from('likes').insert({ article_id: id, user_id: currentUser.id })
      setLiked(true)
      setLikeCount(prev => prev + 1)
      if (article.author_id !== currentUser.id) {
        await supabase.from('notifications').insert({
          user_id: article.author_id,
          actor_id: currentUser.id,
          type: 'like',
          article_id: id
        })
      }
    }
    setLiking(false)
  }

  const toggleBookmark = async () => {
    if (!currentUser) return alert('Please sign in to bookmark articles.')
    if (bookmarking) return
    setBookmarking(true)
    if (bookmarked) {
      await supabase.from('bookmarks').delete()
        .eq('user_id', currentUser.id).eq('article_id', id)
      setBookmarked(false)
    } else {
      await supabase.from('bookmarks').insert({
        user_id: currentUser.id,
        article_id: id
      })
      setBookmarked(true)
    }
    setBookmarking(false)
  }

  const toggleFollow = async () => {
    if (!currentUser) return alert('Please sign in to follow authors.')
    if (followLoading) return
    if (currentUser.id === author?.id) return
    setFollowLoading(true)
    if (following) {
      await supabase.from('follows').delete()
        .eq('follower_id', currentUser.id)
        .eq('following_id', author.id)
      setFollowing(false)
      setFollowerCount(prev => prev - 1)
    } else {
      await supabase.from('follows').insert({
        follower_id: currentUser.id,
        following_id: author.id
      })
      setFollowing(true)
      setFollowerCount(prev => prev + 1)
      await supabase.from('notifications').insert({
        user_id: author.id,
        actor_id: currentUser.id,
        type: 'follow'
      })
    }
    setFollowLoading(false)
  }

  const submitComment = async () => {
    if (!newComment.trim()) return
    if (!currentUser) return alert('Please sign in to comment.')
    setSubmitting(true)
    const { error } = await supabase.from('comments').insert({
      content: newComment.trim(),
      article_id: id,
      author_id: currentUser.id
    })
    if (!error && article.author_id !== currentUser.id) {
      await supabase.from('notifications').insert({
        user_id: article.author_id,
        actor_id: currentUser.id,
        type: 'comment',
        article_id: id
      })
    }
    setSubmitting(false)
    if (error) return alert('Error posting comment: ' + error.message)
    setNewComment('')
    await loadComments()
  }

  const articleUrl = window.location.href
  const shareText = `"${article?.title}" on NyLo`

  const copyLink = async () => {
    await navigator.clipboard.writeText(articleUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  const shareWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + '\n' + articleUrl)}`, '_blank')
  }

  const shareTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(articleUrl)}`, '_blank')
  }

  const shareNative = async () => {
    if (navigator.share) {
      await navigator.share({ title: article?.title, text: shareText, url: articleUrl })
    }
  }

  const wordCount = article?.content?.trim().split(/\s+/).length || 0
  const readTime = Math.max(1, Math.ceil(wordCount / 200))

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-purple-700 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (notFound) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="text-2xl font-bold text-gray-800">Article not found</p>
      <Link to="/" className="text-purple-700 text-sm hover:underline">← Back to home</Link>
    </div>
  )

  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <nav className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 bg-white z-50">
        <Link to="/" className="text-2xl font-bold text-purple-700">NyLo</Link>
        <div className="flex items-center gap-3">
          {/* Bookmark button in navbar */}
          {currentUser && (
            <button
              onClick={toggleBookmark}
              disabled={bookmarking}
              className={`text-sm px-3 py-1.5 rounded-full border transition ${
                bookmarked
                  ? 'bg-purple-50 border-purple-200 text-purple-700'
                  : 'border-gray-200 text-gray-500 hover:border-purple-300'
              }`}
            >
              {bookmarked ? '🔖 Saved' : '🔖 Save'}
            </button>
          )}
          {currentUser ? (
            <Link
              to="/dashboard"
              className="text-sm text-gray-600 hover:text-purple-700"
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-purple-700">
                Sign in
              </Link>
              <Link
                to="/register"
                className="bg-purple-700 text-white px-4 py-2 rounded-full text-sm hover:bg-purple-800 transition"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Cover image */}
      {article.cover_image && (
        <div className="w-full max-h-[480px] overflow-hidden">
          <img
            src={article.cover_image}
            alt={article.title}
            className="w-full max-h-[480px] object-cover"
          />
        </div>
      )}

      {/* Article */}
      <article className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {article.category && (
          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-3 py-1 rounded-full">
            {article.category}
          </span>
        )}

        <h1 className="text-3xl sm:text-5xl font-bold text-gray-900 leading-tight mt-4 mb-6 tracking-tight font-reading">
          {article.title}
        </h1>

        {/* Author row */}
        <div className="flex items-center justify-between gap-3 mb-10 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-sm flex-shrink-0">
              {author?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
            </div>
            <div>
              <Link
                to={`/profile/${author?.username}`}
                className="text-sm font-medium text-gray-900 hover:text-purple-700"
              >
                {author?.full_name || 'Anonymous'}
              </Link>
              <p className="text-xs text-gray-400">
                {followerCount} followers ·{' '}
                {new Date(article.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
                {' · '}{readTime} min read
              </p>
            </div>
          </div>

          {/* Follow button — only show if not own article */}
          {currentUser && currentUser.id !== article.author_id && (
            <button
              onClick={toggleFollow}
              disabled={followLoading}
              className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border font-medium transition ${
                following
                  ? 'bg-purple-700 text-white border-purple-700 hover:bg-purple-800'
                  : 'border-gray-300 text-gray-700 hover:border-purple-700 hover:text-purple-700'
              }`}
            >
              {followLoading ? '...' : following ? 'Following' : 'Follow'}
            </button>
          )}
        </div>

        {/* Article body */}
        <div className="article-body whitespace-pre-wrap">
          {article.content}
        </div>

        {/* Like + Share + Bookmark Bar */}
        <div className="mt-12 flex items-center justify-between flex-wrap gap-3 py-5 border-t border-b border-gray-100">
          <div className="flex items-center gap-2">
            {/* Like */}
            <button
              onClick={toggleLike}
              disabled={liking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
                liked
                  ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>{liked ? '❤️' : '🤍'}</span>
              <span>{likeCount}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={toggleBookmark}
              disabled={bookmarking}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition ${
                bookmarked
                  ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <span>🔖</span>
              <span>{bookmarked ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          {/* Share */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">Share:</span>
            <button
              onClick={shareWhatsApp}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition"
            >
              <span>💬</span> WhatsApp
            </button>
            <button
              onClick={shareTwitter}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition"
            >
              <span>𝕏</span> Twitter
            </button>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition ${
                copied
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              <span>{copied ? '✅' : '🔗'}</span>
              {copied ? 'Copied!' : 'Copy'}
            </button>
            {typeof navigator !== 'undefined' && navigator.share && (
              <button
                onClick={shareNative}
                className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition"
              >
                ↗️ More
              </button>
            )}
          </div>
        </div>

        {/* Author card */}
        <div className="mt-10 bg-gray-50 rounded-2xl p-6 flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xl flex-shrink-0">
            {author?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <Link
                  to={`/profile/${author?.username}`}
                  className="font-semibold text-gray-900 hover:text-purple-700"
                >
                  {author?.full_name || 'Anonymous'}
                </Link>
                <p className="text-xs text-gray-400 mt-0.5">
                  {followerCount} followers
                </p>
              </div>
              {currentUser && currentUser.id !== article.author_id && (
                <button
                  onClick={toggleFollow}
                  disabled={followLoading}
                  className={`text-sm px-4 py-1.5 rounded-full border font-medium transition ${
                    following
                      ? 'bg-purple-700 text-white border-purple-700 hover:bg-purple-800'
                      : 'border-gray-300 text-gray-700 hover:border-purple-700 hover:text-purple-700'
                  }`}
                >
                  {followLoading ? '...' : following ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            {author?.bio && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {author.bio}
              </p>
            )}
          </div>
        </div>

        {/* Comments */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-6">
            Comments ({comments.length})
          </h2>

          {currentUser ? (
            <div className="mb-8">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
              <button
                onClick={submitComment}
                disabled={submitting || !newComment.trim()}
                className="mt-2 bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-purple-800 transition disabled:opacity-50"
              >
                {submitting ? 'Posting...' : 'Post comment'}
              </button>
            </div>
          ) : (
            <div className="mb-8 bg-gray-50 rounded-xl px-5 py-4 text-sm text-gray-500">
              <Link to="/login" className="text-purple-700 font-medium hover:underline">
                Sign in
              </Link> to leave a comment.
            </div>
          )}

          {comments.length === 0 ? (
            <p className="text-gray-400 text-sm">No comments yet. Be the first!</p>
          ) : (
            <div className="flex flex-col gap-5">
              {comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs flex-shrink-0">
                    {comment.profiles?.full_name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {comment.profiles?.full_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
          <Link to="/" className="text-sm text-purple-700 hover:underline">
            ← More articles
          </Link>
          <Link
            to="/register"
            className="text-sm bg-purple-700 text-white px-4 py-2 rounded-full hover:bg-purple-800 transition"
          >
            Start writing on NyLo
          </Link>
        </div>
      </article>
    </div>
  )
}