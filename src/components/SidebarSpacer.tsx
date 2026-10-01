'use client'

import { useSidebar } from './SidebarContext'

export function SidebarSpacer() {
  const { collapsed } = useSidebar()
  return (
    <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? 'w-[70px]' : 'w-64'}`} />
  )
}
