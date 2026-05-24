import DashboardLayout from '../components/DashboardLayout'

export default function Bookmarks() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Bookmarks</h1>
      <p className="text-gray-500 text-sm mb-8">Articles you've saved to read later</p>

      <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
        <p className="text-4xl mb-4">🔖</p>
        <p className="text-gray-600 font-medium mb-1">No bookmarks yet</p>
        <p className="text-gray-400 text-sm">
          When you bookmark an article, it will appear here.
        </p>
      </div>
    </DashboardLayout>
  )
}