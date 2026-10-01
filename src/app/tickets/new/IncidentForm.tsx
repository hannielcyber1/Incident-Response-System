'use client'

import { useState } from 'react'
import { createTicket } from '@/app/actions/tickets'

const IT_QUICK_TICKETS = [
  {
    label: '🌐 Internet is down',
    title: 'Internet Connection Down',
    description: 'I am unable to connect to the internet. Both Wi-Fi and ethernet seem to be affected.',
    severity: 'HIGH'
  },
  {
    label: '🖨️ Printer not working',
    title: 'Office Printer Offline',
    description: 'The main office printer is showing an offline error and will not print.',
    severity: 'LOW'
  },
  {
    label: '🔑 Password Reset',
    title: 'System Password Reset Required',
    description: 'I am locked out of my account and need a password reset.',
    severity: 'MEDIUM'
  }
]

export default function IncidentForm({ categories }: { categories: any[] }) {
  const [severity, setSeverity] = useState('MEDIUM')
  const [categoryId, setCategoryId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const selectedCategory = categories.find(c => c.id === categoryId)
  const isIT = selectedCategory?.department?.name === 'IT'

  const applyQuickTicket = (qt: typeof IT_QUICK_TICKETS[0]) => {
    setTitle(qt.title)
    setDescription(qt.description)
    setSeverity(qt.severity)
  }

  return (
    <form action={createTicket} className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl p-6 rounded-lg shadow space-y-5">
      
      <div>
        <label htmlFor="categoryId" className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8]">Category</label>
        <select 
          name="categoryId" 
          id="categoryId" 
          required
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="mt-1 block w-full rounded-md border-[#d0d1e6] dark:border-[#464555] shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="" className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">Select a category...</option>
          {categories.map(c => (
            <option key={c.id} value={c.id} className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">
              {c.name} ({c.department.name})
            </option>
          ))}
        </select>
        <p className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] mt-1">The system will automatically route your ticket to the correct department.</p>
      </div>

      {isIT && (
        <div className="bg-blue-900/20 border-blue-500/20 border border-blue-100 rounded-md p-4">
          <p className="text-sm font-semibold text-blue-400 mb-2">Frequently Reported IT Issues:</p>
          <div className="flex flex-wrap gap-2">
            {IT_QUICK_TICKETS.map(qt => (
              <button
                key={qt.title}
                type="button"
                onClick={() => applyQuickTicket(qt)}
                className="text-xs bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl border border-blue-200 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded shadow-sm transition-colors"
              >
                {qt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8]">Incident Title</label>
        <input 
          type="text" 
          name="title" 
          id="title" 
          required 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-[#d0d1e6] dark:border-[#464555] shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500" 
          placeholder="e.g., Laptop screen flickering" 
        />
      </div>

      <div>
        <label htmlFor="severity" className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8]">Severity</label>
        <select 
          name="severity" 
          id="severity" 
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="mt-1 block w-full rounded-md border-[#d0d1e6] dark:border-[#464555] shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="LOW" className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">Low</option>
          <option value="MEDIUM" className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">Medium</option>
          <option value="HIGH" className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">High</option>
          <option value="CRITICAL" className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">Critical</option>
        </select>
      </div>

      {severity === 'CRITICAL' && (
        <div className="bg-red-900/20 border-red-500/20 p-4 border border-red-200 rounded-md">
          <label htmlFor="criticalReason" className="block text-sm font-medium text-red-400">
            Why is this critical? Please explain urgently:
          </label>
          <textarea 
            name="criticalReason" 
            id="criticalReason" 
            required
            rows={2} 
            className="mt-1 block w-full rounded-md border-red-300 shadow-sm p-2 border focus:border-red-500 focus:ring-red-500 bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd] placeholder-gray-500"
            placeholder="e.g., System is completely down, blocking all users..."
          />
        </div>
      )}

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-[#1a1b2e] dark:text-[#c7c4d8]">Detailed Description</label>
        <textarea 
          name="description" 
          id="description" 
          rows={4} 
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 block w-full rounded-md border-[#d0d1e6] dark:border-[#464555] shadow-sm p-2 border focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="Please provide as much detail as possible..."
        />
      </div>

      <button 
        type="submit" 
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-[#1a1b2e] dark:text-[#dae2fd] font-bold py-2.5 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      >
        Submit Ticket
      </button>
    </form>
  )
}
