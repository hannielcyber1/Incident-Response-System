'use client'

import { useState } from 'react'
import { createUser } from '@/app/actions/admin'

export default function AddUserModal({ departments }: { departments: any[] }) {
  const [isOpen, setIsOpen] = useState(false)

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all"
      >
        + Add User
      </button>
    )
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-lg shadow-indigo-500/30 transition-all"
      >
        + Add User
      </button>

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-2xl p-6 w-full max-w-md relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] hover:text-[#1a1b2e] dark:text-[#dae2fd]"
          >
            ✕
          </button>
          
          <h2 className="text-xl font-bold text-[#1a1b2e] dark:text-[#dae2fd] mb-6">Add New User</h2>
          
          <form 
            action={async (fd) => {
              await createUser(fd)
              setIsOpen(false)
            }} 
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1.5">Full Name</label>
              <input 
                type="text" 
                name="name" 
                required 
                className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-[#8b8ca8]" 
                placeholder="e.g. John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1.5">Email</label>
              <input 
                type="email" 
                name="email" 
                required 
                className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-[#8b8ca8]" 
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1.5">Password</label>
              <input 
                type="text" 
                name="password" 
                required 
                className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-[#8b8ca8]" 
                placeholder="Initial password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1.5">Role</label>
              <select name="role" required className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="Employee" className="bg-white dark:bg-[#171f33]">Employee</option>
                <option value="Incident Handler" className="bg-white dark:bg-[#171f33]">Incident Handler</option>
                <option value="Department Head" className="bg-white dark:bg-[#171f33]">Department Head</option>
                <option value="Admin" className="bg-white dark:bg-[#171f33]">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8] mb-1.5">Department (Optional)</label>
              <select name="departmentId" className="w-full rounded-xl border border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="" className="bg-white dark:bg-[#171f33]">None</option>
                {departments.map(d => (
                  <option key={d.id} value={d.id} className="bg-white dark:bg-[#171f33]">{d.name}</option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button 
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-[#eef0fb] dark:bg-[#171f33] hover:bg-white/10 text-[#1a1b2e] dark:text-[#dae2fd] font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-[#1a1b2e] dark:text-[#dae2fd] font-medium py-2.5 px-4 rounded-xl transition-colors"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
