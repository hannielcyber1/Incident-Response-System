'use client'

import { useState } from 'react'
import { updateUser, toggleUserActive, deleteUser } from '@/app/actions/admin'

type User = {
  id: string
  name: string
  email: string
  role: string
  isActive: boolean
  lastLogin: Date | null
  department: { id: string; name: string } | null
}

type Department = { id: string; name: string }

export function UserActions({ user, departments }: { user: User; departments: Department[] }) {
  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleToggle = async () => {
    setLoading(true)
    await toggleUserActive(user.id, !user.isActive)
    setLoading(false)
  }

  const handleDelete = async () => {
    setLoading(true)
    await deleteUser(user.id)
    setShowDelete(false)
    setLoading(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Edit */}
        <button
          onClick={() => setShowEdit(true)}
          className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 font-medium transition-colors"
        >
          Edit
        </button>

        {/* Deactivate / Activate */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-colors disabled:opacity-50 ${
            user.isActive
              ? 'bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/20 hover:bg-yellow-100 dark:hover:bg-yellow-500/20'
              : 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-500/20 hover:bg-green-100 dark:hover:bg-green-500/20'
          }`}
        >
          {user.isActive ? 'Deactivate' : 'Activate'}
        </button>

        {/* Delete */}
        <button
          onClick={() => setShowDelete(true)}
          className="text-xs px-2.5 py-1 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 font-medium transition-colors"
        >
          Delete
        </button>
      </div>

      {/* ── Edit Modal ── */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowEdit(false)} className="absolute top-4 right-4 text-[#8b8ca8] hover:text-[#5c5d7a] dark:hover:text-white text-xl">✕</button>
            <h2 className="text-lg font-bold text-[#1a1b2e] dark:text-[#dae2fd] mb-5">Edit User — {user.name}</h2>

            <form
              action={async (fd) => {
                fd.set('id', user.id)
                await updateUser(fd)
                setShowEdit(false)
              }}
              className="space-y-4"
            >
              <input type="hidden" name="id" value={user.id} />

              <div>
                <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1">Full Name</label>
                <input type="text" name="name" defaultValue={user.name} required
                  className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1">Email</label>
                <input type="email" name="email" defaultValue={user.email} required
                  className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1">New Password <span className="text-[#8b8ca8] font-normal">(leave blank to keep current)</span></label>
                <input type="text" name="password" placeholder="••••••••"
                  className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-[#8b8ca8]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1">Role</label>
                <select name="role" defaultValue={user.role} required
                  className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="Employee" className="bg-white dark:bg-[#171f33]">Employee</option>
                  <option value="Incident Handler" className="bg-white dark:bg-[#171f33]">Incident Handler</option>
                  <option value="Department Head" className="bg-white dark:bg-[#171f33]">Department Head</option>
                  <option value="Admin" className="bg-white dark:bg-[#171f33]">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1">Department</label>
                <select name="departmentId" defaultValue={user.department?.id ?? ''}
                  className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                  <option value="" className="bg-white dark:bg-[#171f33]">None</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id} className="bg-white dark:bg-[#171f33]">{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 bg-[#eef0fb] dark:bg-[#171f33] hover:bg-[#e4e6f8] dark:hover:bg-[#222a3d] text-[#1a1b2e] dark:text-[#c7c4d8] font-medium py-2.5 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 rounded-xl transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="text-4xl text-center mb-3">⚠️</div>
            <h2 className="text-lg font-bold text-[#1a1b2e] dark:text-[#dae2fd] text-center mb-2">Delete User</h2>
            <p className="text-sm text-[#5c5d7a] dark:text-[#c7c4d8] text-center mb-6">
              Are you sure you want to permanently delete <span className="font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">{user.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 bg-[#eef0fb] dark:bg-[#171f33] hover:bg-[#e4e6f8] dark:hover:bg-[#222a3d] text-[#1a1b2e] dark:text-[#c7c4d8] font-medium py-2.5 rounded-xl transition-colors">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={loading}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {loading ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
