import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AddUserModal from './AddUserModal'
import { UserActions } from './UserActions'

export default async function AdminUsersPage() {
  const user = await getUser()
  if (!user || user.role !== 'Admin') redirect('/login')

  const users = await prisma.user.findMany({
    include: { department: true }
  })
  users.sort((a, b) => a.name.localeCompare(b.name))

  const departments = await prisma.department.findMany({ orderBy: { name: 'asc' } })

  const formatLastLogin = (date: Date | null) => {
    if (!date) return 'Never'
    return new Date(date).toLocaleString()
  }

  const activeCount = users.filter(u => u.isActive).length

  return (
    <div className="max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd]">User Management</h1>
          <p className="text-sm text-[#5c5d7a] dark:text-[#c7c4d8] mt-1">
            {users.length} total · {activeCount} active · {users.length - activeCount} deactivated
          </p>
        </div>
        <AddUserModal departments={departments} />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#e4e6f8] dark:divide-[#464555]">
            <thead className="bg-[#eef0fb] dark:bg-[#171f33]">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-wider">Department</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-wider">Last Login</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e4e6f8] dark:divide-[#464555]">
              {users.map((u) => (
                <tr key={u.id} className={`transition-colors hover:bg-[#eef0fb] dark:hover:bg-[#222a3d] ${!u.isActive ? 'opacity-50' : ''}`}>

                  {/* User */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${
                        u.isActive ? 'bg-gradient-to-br from-indigo-500 to-purple-600' : 'bg-gray-400'
                      }`}>
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">{u.name}</p>
                        <p className="text-xs text-[#8b8ca8]">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td className="px-5 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
                      {u.role}
                    </span>
                  </td>

                  {/* Department */}
                  <td className="px-5 py-4 text-sm text-[#5c5d7a] dark:text-[#c7c4d8]">
                    {u.department?.name || <span className="text-[#8b8ca8]">—</span>}
                  </td>

                  {/* Status */}
                  <td className="px-5 py-4">
                    {u.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-[#eef0fb] dark:bg-gray-500/10 text-[#5c5d7a] dark:text-[#c7c4d8] border border-[#d0d1e6] dark:border-gray-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Last Login */}
                  <td className="px-5 py-4 text-xs text-[#5c5d7a] dark:text-[#c7c4d8] font-mono">
                    {formatLastLogin(u.lastLogin)}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <UserActions user={u} departments={departments} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
