'use client'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false)
  const { theme, setTheme } = useTheme()
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-9 h-9" />

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#eef0fb] dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] text-[#5c5d7a] dark:text-[#c7c4d8] hover:text-[#4f46e5] dark:hover:text-[#c3c0ff] transition-colors"
      title="Toggle theme"
    >
      <span className="material-symbols-outlined text-[19px]">{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
    </button>
  )
}
