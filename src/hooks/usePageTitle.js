import { useEffect } from 'react'

export default function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title

    document.title = title
      ? `${title} — NyLo`
      : "NyLo — Uganda's home for writers & thinkers"

    return () => {
      document.title = previous
    }
  }, [title])
}