'use client'
import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }
  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#d0d1e6] dark:border-[#464555] hover:bg-[#eef0fb] dark:hover:bg-[#171f33] text-sm text-[#5c5d7a] dark:text-[#c7c4d8] hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 dark:hover:border-red-500/30 transition-all font-medium"
    >
      <span className="material-symbols-outlined text-[16px]">logout</span>
      <span>Logout</span>
    </button>
  )
}
