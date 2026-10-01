'use client'
import Link from 'next/link'
import { useSidebar } from './SidebarContext'

type SidebarProps = {
  userName: string
  userRole: string
  isEmployee: boolean
  isAdmin: boolean
}

const NAV_ITEMS = [
  { href: '/dashboard', icon: 'dashboard', label: 'Dashboard', roles: ['all'] },
  { href: '/tickets', icon: 'confirmation_number', label: 'My Tickets', roles: ['employee'] },
  { href: '/admin/overview', icon: 'analytics', label: 'Overview', roles: ['admin'] },
  { href: '/admin/users', icon: 'group', label: 'User Management', roles: ['admin'] },
  { href: '/admin/audit-logs', icon: 'history', label: 'Audit Logs', roles: ['admin'] },
]

export function SidebarClient({ userName, userRole, isEmployee, isAdmin }: SidebarProps) {
  const { collapsed, setCollapsed } = useSidebar()

  const visibleItems = NAV_ITEMS.filter(item => {
    if (item.roles.includes('all')) return true
    if (item.roles.includes('employee') && isEmployee) return true
    if (item.roles.includes('admin') && isAdmin) return true
    if (!isEmployee && !item.roles.includes('employee') && !item.roles.includes('admin')) return false
    return false
  }).filter(item => {
    // hide My Tickets for non-employees, hide Report Incident for non-employees who are not admin
    if (item.href === '/tickets' && !isEmployee) return false
    return true
  })

  return (
    <aside className={`${
      collapsed ? 'w-[68px]' : 'w-64'
    } fixed top-0 left-0 h-screen flex flex-col bg-[#131b2e] dark:bg-[#131b2e] bg-white/95 border-r border-[#d0d1e6] dark:border-[#464555] hidden lg:flex z-50 transition-all duration-300 ease-in-out overflow-hidden shadow-lg shadow-black/5 dark:shadow-black/40`}>
      
      {/* Brand Header */}
      <div className={`flex items-center ${collapsed ? 'justify-center p-4' : 'justify-between px-4 py-4'} border-b border-[#d0d1e6] dark:border-[#464555]/60`}>
        {!collapsed && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4f46e5] flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <span className="material-symbols-outlined text-white text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-[#1a1b2e] dark:text-[#dae2fd] tracking-tight">Incident System</span>
            </div>
          </div>
        )}
        {collapsed && (
          <div className="w-9 h-9 rounded-xl bg-[#4f46e5] flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="material-symbols-outlined text-white text-[20px]" style={{fontVariationSettings: "'FILL' 1"}}>security</span>
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#5c5d7a] dark:text-[#c7c4d8] hover:text-[#1a1b2e] dark:hover:text-[#dae2fd] hover:bg-[#eef0fb] dark:hover:bg-[#222a3d] transition-colors"
            title="Collapse sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_left</span>
          </button>
        )}
      </div>

      {/* Quick CTA */}
      {!collapsed && (
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/tickets/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold transition-all shadow-md shadow-indigo-500/25"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Report Incident</span>
          </Link>
        </div>
      )}

      {/* Nav Links */}
      <nav className={`flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-0.5`}>
        {!collapsed && (
          <p className="px-3 py-1 text-[10px] font-bold text-[#5c5d7a] dark:text-[#464555] uppercase tracking-widest mb-1">Menu</p>
        )}
        {visibleItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            title={collapsed ? item.label : undefined}
            className={`flex items-center rounded-lg text-[#5c5d7a] dark:text-[#c7c4d8] hover:text-[#1a1b2e] dark:hover:text-[#dae2fd] hover:bg-[#eef0fb] dark:hover:bg-[#222a3d] transition-all duration-150 group ${
              collapsed ? 'justify-center p-2.5 my-0.5' : 'gap-3 px-3 py-2.5'
            }`}
          >
            <span className={`material-symbols-outlined transition-colors ${
              collapsed ? 'text-[22px]' : 'text-[20px]'
            } group-hover:text-indigo-500 dark:group-hover:text-[#c3c0ff]`}>{item.icon}</span>
            {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-2 pb-2">
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex justify-center py-2.5 text-[#5c5d7a] dark:text-[#c7c4d8] hover:text-[#1a1b2e] dark:hover:text-[#dae2fd] hover:bg-[#eef0fb] dark:hover:bg-[#222a3d] rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_right</span>
          </button>
        </div>
      )}

      {/* User profile footer */}
      <div className="border-t border-[#d0d1e6] dark:border-[#464555] p-3">
        {collapsed ? (
          <div className="w-9 h-9 mx-auto rounded-lg bg-[#eef0fb] dark:bg-[#222a3d] flex items-center justify-center text-[#4f46e5] font-bold text-sm border border-[#d0d1e6] dark:border-[#464555]" title={userName}>
            {userName.charAt(0)}
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-xl bg-[#eef0fb] dark:bg-[#171f33] hover:bg-[#e4e6f8] dark:hover:bg-[#222a3d] transition-colors">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#d0d1e6] dark:bg-[#2d3449] flex items-center justify-center text-[#4f46e5] font-bold text-sm shrink-0 border border-[#c3c0ff]/30">
                {userName.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-[#1a1b2e] dark:text-[#dae2fd] truncate">{userName}</span>
                <span className="text-[10px] font-mono text-[#5c5d7a] dark:text-[#c7c4d8]">{userRole}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
