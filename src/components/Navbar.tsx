import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { LogoutButton } from './LogoutButton'
import { ThemeToggle } from './ThemeToggle'
import { NotificationDropdown } from './NotificationDropdown'

export async function Navbar() {
  const user = await getUser()
  let notifications: any[] = []
  
  if (user) {
    notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 dark:bg-[#0b1326]/90 backdrop-blur-md border-b border-[#d0d1e6] dark:border-[#464555]">
      <div className="flex justify-between items-center h-14 px-4 lg:px-6 w-full">
        {/* Left: Breadcrumb */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-[#5c5d7a] dark:text-[#c7c4d8]">Pages</span>
            <span className="text-[#d0d1e6] dark:text-[#464555]">/</span>
            <span className="text-[#1a1b2e] dark:text-[#dae2fd] font-semibold">Dashboard</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5">
          {/* Live telemetry dot */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#eef0fb] dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-mono font-semibold text-emerald-600 dark:text-emerald-400 tracking-widest">LIVE</span>
          </div>

          <div className="h-4 w-px bg-[#d0d1e6] dark:bg-[#464555] hidden md:block" />

          {user && <NotificationDropdown initialNotifications={notifications} />}
          <ThemeToggle />

          {user && <LogoutButton />}
        </div>
      </div>
    </header>
  )
}
