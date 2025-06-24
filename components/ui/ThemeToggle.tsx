'use client'

import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const root = window.document.documentElement
    if (isDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [isDark])

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="rounded p-2 border border-gray-300 dark:border-gray-600"
      aria-label="Toggle Theme"
    >
      {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-gray-800" />}
    </button>
  )
}
