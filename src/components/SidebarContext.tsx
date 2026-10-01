'use client'

import { createContext, useContext, useState } from 'react'

const SidebarContext = createContext<{
  collapsed: boolean
  setCollapsed: (v: boolean) => void
}>({ collapsed: false, setCollapsed: () => {} })

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
