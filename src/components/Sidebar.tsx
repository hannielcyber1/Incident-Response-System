import { getUser } from '@/lib/auth'
import { SidebarClient } from './SidebarClient'

export async function Sidebar() {
  const user = await getUser()
  if (!user) return null

  return (
    <SidebarClient
      userName={user.name}
      userRole={user.role}
      isEmployee={user.role === 'Employee'}
      isAdmin={user.role === 'Admin'}
    />
  )
}
