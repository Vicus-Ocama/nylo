import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import DashboardLayout from '../components/DashboardLayout'
import usePageTitle from '../hooks/usePageTitle'

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  usePageTitle('Notifications')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { navigate('/login'); return }

      const { data } = await supabase
        .from('notifications')
        .select('*, actor:profiles!notifications_actor_id_fkey(full_name, username), articles(id, title)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      setNotifications(data || [])

      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false)

      setLoading(false)
    }
    load()
  }, [])

  const getIcon = (type) => {
    if (type === 'like') return '❤️'
    if (type === 'comment') return '💬'
    if (type === 'follow') return '👤'
    return '🔔'
  }

  const getMessage = (n) => {
    const name = n.actor?.full_name || 'Someone'
    if (n.type === 'like') return `${name} liked your article`
    if (n.type === 'comment') return `${name} commented on your article`
    if (n.type === 'follow') return `${name} started following you`
    return `${name} interacted with your content`
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Notifications</h1>
      <p className="text-gray-500 text-sm mb-8">
        Activity on your articles and profile
      </p>

      {notifications.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
          <p className="text-4xl mb-4">🔔</p>
          <p className="text-gray-500 text-sm">No notifications yet.</p>
          <p className="text-gray-400 text-xs mt-1">
            When someone likes or comments on your article, it will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {notifications.map((n, i) => (
            <Link
              key={n.id}
              to={n.articles?.id
                ? `/article/${n.articles.id}`
                : `/profile/${n.actor?.username}`}
              className={`flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition block ${
                i !== notifications.length - 1 ? 'border-b border-gray-100' : ''
              } ${!n.read ? 'bg-purple-50' : ''}`}
            >
              <span className="text-xl mt-0.5">{getIcon(n.type)}</span>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{getMessage(n)}</p>
                {n.articles?.title && (
                  <p className="text-xs text-purple-700 mt-0.5 font-medium">
                    "{n.articles.title}"
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                </p>
              </div>
              {!n.read && (
                <div className="w-2 h-2 rounded-full bg-purple-600 mt-2 flex-shrink-0" />
              )}
            </Link>
          ))}
        </div>
      )}
    </DashboardLayout>
  )
}