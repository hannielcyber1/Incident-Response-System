'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/app/actions/notifications'

type Notification = {
  id: string
  title: string
  message: string
  type: string
  isRead: boolean
  ticketId: string | null
  createdAt: Date
}

export function NotificationDropdown({ initialNotifications }: { initialNotifications: Notification[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState(initialNotifications)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setNotifications(initialNotifications)
  }, [initialNotifications])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = notifications.filter(n => !n.isRead).length

  const handleRead = async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
    await markNotificationAsRead(id)
  }

  const handleReadAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    await markAllNotificationsAsRead()
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center bg-[#eef0fb] dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] text-[#5c5d7a] dark:text-[#c7c4d8] hover:text-[#4f46e5] dark:hover:text-[#c3c0ff] transition-colors"
        title="Notifications"
      >
        <span className="material-symbols-outlined text-[19px]">notifications</span>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-y-auto bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] rounded-xl shadow-xl z-50">
          <div className="sticky top-0 bg-white dark:bg-[#171f33] border-b border-[#d0d1e6] dark:border-[#464555] p-3 flex items-center justify-between z-10">
            <h3 className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleReadAll}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="divide-y divide-[#d0d1e6] dark:divide-[#464555]">
            {notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-[#8b8ca8] dark:text-[#c7c4d8]">No notifications</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-3 ${!n.isRead ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">{n.title}</span>
                    <span className="text-[10px] text-[#8b8ca8] dark:text-[#c7c4d8] whitespace-nowrap ml-2">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8] mb-2">{n.message}</p>
                  <div className="flex gap-2">
                    {n.ticketId && (
                      <Link
                        href={`/dashboard/tickets/${n.ticketId}`}
                        onClick={() => handleRead(n.id)}
                        className="text-xs text-indigo-600 hover:underline font-medium"
                      >
                        View Ticket
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => handleRead(n.id)}
                        className="text-xs text-[#8b8ca8] hover:text-indigo-600 font-medium ml-auto"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
