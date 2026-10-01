import { redirect } from 'next/navigation'
import { getUser } from '@/lib/auth'
import Link from 'next/link'

export default async function Home() {
  const user = await getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      
      <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Your Dashboard</h2>
        <p className="text-[#5c5d7a] dark:text-[#c7c4d8] mb-4">
          You are logged in as an <strong className="text-[#1a1b2e] dark:text-[#dae2fd]">{user.role}</strong>.
          {user.department && (
            <span> Your department is <strong className="text-[#1a1b2e] dark:text-[#dae2fd]">{user.department.name}</strong>.</span>
          )}
        </p>

        <div className="flex gap-4 mt-6">
          <Link href="/tickets/new" className="flex items-center gap-2 bg-[#4f46e5] hover:bg-[#4338ca] text-white px-4 py-2 rounded-lg font-semibold transition-all shadow-md shadow-indigo-500/20">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Report an Incident
          </Link>
          <Link href="/tickets" className="flex items-center gap-2 bg-white dark:bg-[#171f33] hover:bg-[#eef0fb] dark:hover:bg-[#222a3d] text-[#1a1b2e] dark:text-[#dae2fd] border border-[#d0d1e6] dark:border-[#464555] px-4 py-2 rounded-lg font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
            View My Tickets
          </Link>
        </div>
      </div>
    </div>
  )
}
