import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { reopenTicket } from '@/app/actions/tickets'

// ─── Helpers ────────────────────────────────────────────────────────────────

function severityBadge(severity: string) {
  const styles: Record<string, string> = {
    CRITICAL: 'bg-red-100 text-red-400 ring-1 ring-red-300',
    HIGH:     'bg-orange-100 text-orange-800 ring-1 ring-orange-300',
    MEDIUM:   'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-300',
    LOW:      'bg-green-100 text-green-800 ring-1 ring-green-300',
  }
  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[severity] ?? 'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]'}`}>
      {severity}
    </span>
  )
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    OPEN:        'bg-blue-100 text-blue-400',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
    RESOLVED:    'bg-green-100 text-green-800',
    REOPENED:    'bg-orange-100 text-orange-800',
    CLOSED:      'bg-[#eef0fb] dark:bg-[#131b2e] text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]',
  }
  return (
    <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${styles[status] ?? 'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    year:   'numeric',
    month:  'short',
    day:    '2-digit',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date))
}

function actionLabel(action: string) {
  const labels: Record<string, string> = {
    CREATED:          'Ticket Created',
    ASSIGNED:         'Assigned to Responder',
    SEVERITY_CHANGED: 'Severity Changed',
    STATUS_CHANGED:   'Status Updated',
    RESOLVED:         'Ticket Resolved',
    REOPENED:         'Ticket Reopened',
    CLOSED:           'Ticket Closed',
    COMMENTED:        'Comment Added',
  }
  return labels[action] ?? action
}

function actionIcon(action: string) {
  const icons: Record<string, string> = {
    CREATED:          '🆕',
    ASSIGNED:         '👤',
    SEVERITY_CHANGED: '⚠️',
    STATUS_CHANGED:   '🔄',
    RESOLVED:         '✅',
    REOPENED:         '🔓',
    CLOSED:           '🔒',
    COMMENTED:        '💬',
  }
  return icons[action] ?? '📋'
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default async function TicketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      category:   true,
      department: true,
      creator:    true,
      responder:  true,
      auditLogs: {
        include: { actor: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!ticket) {
    return (
      <div className="container mx-auto p-8 text-center">
        <p className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] text-lg">Ticket not found.</p>
        <Link href="/tickets" className="text-blue-600 hover:underline mt-4 inline-block">
          ← Back to My Tickets
        </Link>
      </div>
    )
  }

  // ── Role-based access control ──────────────────────────────────────────────
  let accessDenied = false

  if (user.role === 'Employee') {
    // Employees may only view their own tickets
    if (ticket.creatorId !== user.id) accessDenied = true
  } else if (user.role === 'Incident Handler' || user.role === 'Department Head') {
    // Dept-scoped roles may only view tickets in their department
    if (ticket.departmentId !== user.departmentId) accessDenied = true
  }
  // Admin: full access — no restriction

  if (accessDenied) {
    return (
      <div className="container mx-auto p-8">
        <div className="bg-red-900/20 border-red-500/20 border border-red-200 rounded-lg p-8 text-center">
          <p className="text-red-700 text-xl font-semibold mb-2">Access Denied</p>
          <p className="text-red-600 text-sm mb-4">You do not have permission to view this ticket.</p>
          <Link href="/tickets" className="text-blue-600 hover:underline">
            ← Back to My Tickets
          </Link>
        </div>
      </div>
    )
  }

  const isCreator  = ticket.creatorId === user.id
  const canReopen  = ticket.status === 'RESOLVED' && isCreator

  // Bind ticket ID into the server action
  const reopenWithId = reopenTicket.bind(null, ticket.id)

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      {/* Back link */}
      <Link href="/tickets" className="text-blue-600 hover:underline text-sm mb-6 inline-block">
        ← Back to My Tickets
      </Link>

      {/* Header card */}
      <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-lg shadow p-6 mb-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd] mb-1">{ticket.title}</h1>
            <p className="text-xs font-mono text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">{ticket.id}</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {severityBadge(ticket.severity)}
            {statusBadge(ticket.status)}
          </div>
        </div>

        {/* Meta grid */}
        <dl className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <dt className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] font-medium">Category</dt>
            <dd className="text-[#1a1b2e] dark:text-[#dae2fd] mt-0.5">{ticket.category.name}</dd>
          </div>
          <div>
            <dt className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] font-medium">Department</dt>
            <dd className="text-[#1a1b2e] dark:text-[#dae2fd] mt-0.5">{ticket.department.name}</dd>
          </div>
          <div>
            <dt className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] font-medium">Submitted by</dt>
            <dd className="text-[#1a1b2e] dark:text-[#dae2fd] mt-0.5">{ticket.creator.name}</dd>
          </div>
          <div>
            <dt className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] font-medium">Responder</dt>
            <dd className="text-[#1a1b2e] dark:text-[#dae2fd] mt-0.5">
              {ticket.responder ? ticket.responder.name : (
                <span className="italic text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Unassigned</span>
              )}
            </dd>
          </div>
          <div className="col-span-2 md:col-span-2">
            <dt className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] font-medium">Opened</dt>
            <dd className="text-[#1a1b2e] dark:text-[#dae2fd] mt-0.5">{formatDate(ticket.createdAt)}</dd>
          </div>
          <div className="col-span-2 md:col-span-2">
            <dt className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] font-medium">Last updated</dt>
            <dd className="text-[#1a1b2e] dark:text-[#dae2fd] mt-0.5">{formatDate(ticket.updatedAt)}</dd>
          </div>
        </dl>

        {/* Description */}
        <div className="mt-6">
          <h2 className="text-sm font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] mb-2">Description</h2>
          <div className="bg-transparent rounded-md p-4 text-sm text-[#1a1b2e] dark:text-[#dae2fd] whitespace-pre-wrap leading-relaxed">
            {ticket.description}
          </div>
        </div>

        {/* Reopen action */}
        {canReopen && (
          <div className="mt-6 pt-6 border-t border-[#e4e6f8] flex justify-end">
            <form action={reopenWithId}>
              <button
                type="submit"
                className="bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-[#1a1b2e] dark:text-[#dae2fd] text-sm font-medium px-5 py-2 rounded-lg transition-colors"
              >
                🔓 Reopen Ticket
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Audit log timeline */}
      <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-[#1a1b2e] dark:text-[#dae2fd] mb-6">Activity Timeline</h2>

        {ticket.auditLogs.length === 0 ? (
          <p className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] text-sm italic">No activity recorded yet.</p>
        ) : (
          <ol className="relative border-l border-[#d0d1e6] dark:border-[#464555] space-y-6 ml-2">
            {ticket.auditLogs.map((log) => {
              let parsedDetails: Record<string, string> | null = null
              try {
                if (log.details) parsedDetails = JSON.parse(log.details)
              } catch {
                // details is plain text
              }

              return (
                <li key={log.id} className="ml-6">
                  {/* Circle dot */}
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 rounded-full bg-blue-900/20 border-blue-500/20 ring-4 ring-white text-sm">
                    {actionIcon(log.action)}
                  </span>

                  <div className="bg-transparent rounded-lg p-4">
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">
                        {actionLabel(log.action)}
                      </p>
                      <time className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </time>
                    </div>
                    <p className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                      By <span className="font-medium text-[#1a1b2e] dark:text-[#c7c4d8]">{log.actor.name}</span>
                    </p>
                    {parsedDetails ? (
                      <ul className="mt-2 text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] space-y-0.5">
                        {Object.entries(parsedDetails).map(([k, v]) => (
                          <li key={k}>
                            <span className="font-medium capitalize">{k.replace(/([A-Z])/g, ' $1')}:</span>{' '}
                            {v}
                          </li>
                        ))}
                      </ul>
                    ) : log.details ? (
                      <p className="mt-2 text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">{log.details}</p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </div>
    </div>
  )
}
