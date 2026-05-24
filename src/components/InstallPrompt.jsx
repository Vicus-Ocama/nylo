import { useEffect, useState } from 'react'

export default function InstallPrompt() {
  const [prompt, setPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true)
      return
    }

    const handler = (e) => {
      e.preventDefault()
      setPrompt(e)
      setShow(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!prompt) return
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
      setShow(false)
    }
    setPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    localStorage.setItem('pwa-dismissed', 'true')
  }

  // Don't show if dismissed before or already installed
  if (installed || !show) return null
  if (localStorage.getItem('pwa-dismissed')) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-5 flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-purple-700 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
          N
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Install NyLo</p>
          <p className="text-xs text-gray-500 mt-0.5">Add to your home screen for quick access — works offline too.</p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="bg-purple-700 text-white px-4 py-1.5 rounded-full text-xs font-medium hover:bg-purple-800 transition"
            >
              Install app
            </button>
            <button
              onClick={handleDismiss}
              className="text-gray-400 px-4 py-1.5 rounded-full text-xs hover:text-gray-600 transition"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}