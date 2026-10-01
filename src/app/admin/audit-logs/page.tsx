import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ── Action badge ──────────────────────────────────────────────────────────────

function ActionBadge({ action }: { action: string }) {
  const map: Record<string, string> = {
    CREATED:         'bg-blue-100 text-blue-400',
    STATUS_CHANGED:  'bg-purple-100 text-purple-800',
    SEVERITY_CHANGED:'bg-yellow-100 text-yellow-800',
    REASSIGNED:      'bg-indigo-100 text-indigo-800',
    RESOLVED:        'bg-green-100 text-green-800',
    REOPENED:        'bg-orange-100 text-orange-800',
    CLOSED:          'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]',
  }
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${map[action] ?? 'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]'}`}
    >
      {action.replace(/_/g, ' ')}
    </span>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function AuditLogsPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  if (user.role !== 'Admin') redirect('/')

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      actor: true,
      ticket: {
        select: { id: true, title: true },
      },
    },
  })

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd]">Audit Logs</h1>
            <p className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] mt-1">
              {logs.length} events across all tickets
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Activity feed */}
        {logs.length === 0 ? (
          <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-2xl border border-[#d0d1e6] dark:border-[#464555] shadow-sm p-12 text-center text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
            No audit log entries yet.
          </div>
        ) : (
          <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-2xl border border-[#d0d1e6] dark:border-[#464555] shadow-sm divide-y divide-[#e4e6f8]">
            {logs.map((log) => {
              let details: Record<string, string> | null = null
              try {
                if (log.details) details = JSON.parse(log.details)
              } catch (_) {}

              return (
                <div
                  key={log.id}
                  className="flex items-start gap-4 px-6 py-4 hover:bg-transparent transition-colors"
                >
                  {/* Timeline dot */}
                  <div className="mt-1 h-3 w-3 rounded-full bg-indigo-400 shrink-0 ring-2 ring-indigo-100" />

                  <div className="flex-1 min-w-0 space-y-1">
                    {/* Action + ticket */}
                    <div className="flex flex-wrap items-center gap-2">
                      <ActionBadge action={log.action} />
                      <span className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">on</span>
                      <Link
                        href={`/dashboard/tickets/${log.ticket.id}`}
                        className="text-sm font-medium text-indigo-600 hover:underline truncate max-w-xs"
                      >
                        {log.ticket.title}
                      </Link>
                    </div>

                    {/* Details */}
                    {details && (
                      <p className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                        {details.from && details.to
                          ? `${details.from} → ${details.to}`
                          : details.assignedTo
                          ? `Assigned to user ${details.assignedTo}`
                          : JSON.stringify(details)}
                      </p>
                    )}

                    {/* Actor + time */}
                    <p className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                      By{' '}
                      <span className="font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">{log.actor.name}</span>
                      {' · '}
                      <time>{new Date(log.createdAt).toLocaleString()}</time>
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
