import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import {
  updateTicketStatus,
  updateTicketSeverity,
  reassignTicket,
  escalateTicket,
} from '@/app/actions/dashboard'

// ── Badge helpers ─────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    LOW:      'bg-green-100 text-green-800',
    MEDIUM:   'bg-yellow-100 text-yellow-800',
    HIGH:     'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-400',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[severity] ?? 'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]'}`}>
      {severity}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    OPEN:        'bg-blue-100 text-blue-400',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    RESOLVED:    'bg-green-100 text-green-800',
    CLOSED:      'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]',
    REOPENED:    'bg-orange-100 text-orange-800',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${map[status] ?? 'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ── Detail row ────────────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-3 border-b border-[#e4e6f8] last:border-0">
      <span className="text-sm font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] sm:w-36 shrink-0">{label}</span>
      <div className="text-sm text-[#1a1b2e] dark:text-[#dae2fd]">{children}</div>
    </div>
  )
}

// ── Audit log ─────────────────────────────────────────────────────────────────

type AuditLogEntry = {
  id: string
  action: string
  details: string | null
  createdAt: Date
  actor: { name: string }
}

function AuditLogList({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return <p className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">No audit log entries.</p>
  }
  return (
    <ol className="relative border-l border-[#d0d1e6] dark:border-[#464555] ml-2 space-y-6">
      {logs.map((log) => {
        let details: Record<string, string> | null = null
        try {
          if (log.details) details = JSON.parse(log.details)
        } catch (_) {}

        return (
          <li key={log.id} className="ml-6">
            <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 ring-2 ring-white">
              <span className="block h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">
                {log.action.replace(/_/g, ' ')}
                <span className="ml-2 font-normal text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">by {log.actor.name}</span>
              </p>
              {details && (
                <p className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                  {details.from && details.to
                    ? `${details.from} → ${details.to}`
                    : JSON.stringify(details)}
                </p>
              )}
              <time className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                {new Date(log.createdAt).toLocaleString()}
              </time>
            </div>
          </li>
        )
      })}
    </ol>
  )
}

// ── Handler action buttons ─────────────────────────────────────────────────────

function EscalateForm({ ticketId, escalateTo }: { ticketId: string, escalateTo: string }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-900/50 p-4 space-y-3 w-full mt-4">
      <h3 className="text-sm font-semibold text-red-800 dark:text-red-400">Escalate Ticket to {escalateTo}</h3>
      <form
        action={async (fd: FormData) => {
          'use server'
          const reason = fd.get('reason') as string
          await escalateTicket(ticketId, reason)
        }}
        className="flex gap-2"
      >
        <input
          name="reason"
          required
          placeholder="Reason for escalation..."
          className="flex-1 text-sm rounded-lg border border-red-200 dark:border-red-900/50 bg-white dark:bg-[#171f33] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 text-[#1a1b2e] dark:text-[#dae2fd]"
        />
        <button
          type="submit"
          className="px-3 py-2 text-sm font-medium rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
        >
          Escalate
        </button>
      </form>
    </div>
  )
}

function HandlerActions({ ticketId, status, hideEscalate = false }: { ticketId: string; status: string; hideEscalate?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-3">
        {status !== 'IN_PROGRESS' && (
          <form
            action={async () => {
              'use server'
              await updateTicketStatus(ticketId, 'IN_PROGRESS')
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors"
            >
              Mark as In Progress
            </button>
          </form>
        )}
        {status !== 'RESOLVED' && (
          <form
            action={async () => {
              'use server'
              await updateTicketStatus(ticketId, 'RESOLVED')
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              Mark as Resolved
            </button>
          </form>
        )}
      </div>
      {!hideEscalate && <EscalateForm ticketId={ticketId} escalateTo="Department Head" />}
    </div>
  )
}

// ── Department Head action panels ─────────────────────────────────────────────

type Handler = { id: string; name: string }

function HeadActions({
  ticketId,
  status,
  severity,
  handlers,
}: {
  ticketId: string
  status: string
  severity: string
  handlers: Handler[]
}) {
  return (
    <div className="space-y-4">
      {/* Inherited handler buttons */}
      <HandlerActions ticketId={ticketId} status={status} hideEscalate={true} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        {/* Severity selector */}
        <div className="bg-transparent rounded-xl border border-[#d0d1e6] dark:border-[#464555] p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#1a1b2e] dark:text-[#c7c4d8]">Update Severity</h3>
          <form
            action={async (fd: FormData) => {
              'use server'
              const sev = fd.get('severity') as string
              await updateTicketSeverity(ticketId, sev)
            }}
            className="flex gap-2"
          >
            <select
              name="severity"
              defaultValue={severity}
              className="flex-1 text-sm rounded-lg border border-[#d0d1e6] dark:border-[#464555] bg-white dark:bg-[#171f33] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#1a1b2e] dark:text-[#dae2fd]"
            >
              {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((s) => (
                <option key={s} value={s} className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">{s}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Update
            </button>
          </form>
        </div>

        {/* Reassign dropdown */}
        <div className="bg-transparent rounded-xl border border-[#d0d1e6] dark:border-[#464555] p-4 space-y-3">
          <h3 className="text-sm font-semibold text-[#1a1b2e] dark:text-[#c7c4d8]">Reassign Ticket</h3>
          <form
            action={async (fd: FormData) => {
              'use server'
              const responderId = fd.get('responderId') as string
              await reassignTicket(ticketId, responderId)
            }}
            className="flex gap-2"
          >
            <select
              name="responderId"
              className="flex-1 text-sm rounded-lg border border-[#d0d1e6] dark:border-[#464555] bg-white dark:bg-[#171f33] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-[#1a1b2e] dark:text-[#dae2fd]"
            >
              {handlers.length === 0 ? (
                <option value="" className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">No handlers available</option>
              ) : (
                handlers.map((h) => (
                  <option key={h.id} value={h.id} className="bg-white dark:bg-[#171f33] text-[#1a1b2e] dark:text-[#dae2fd]">{h.name}</option>
                ))
              )}
            </select>
            <button
              type="submit"
              disabled={handlers.length === 0}
              className="px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              Reassign
            </button>
          </form>
        </div>
      </div>
      
      {/* Escalate to Admin */}
      <EscalateForm ticketId={ticketId} escalateTo="Admin" />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardTicketPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const user = await getUser()
  if (!user) redirect('/login')

  // Employees have no access to this route
  if (user.role === 'Employee') redirect('/tickets')

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      category:   true,
      department: true,
      creator:    true,
      responder:  true,
      auditLogs: {
        include: { actor: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!ticket) notFound()

  // Department scoping for non-Admins
  if (user.role !== 'Admin' && ticket.departmentId !== user.departmentId) {
    redirect('/dashboard')
  }

  // Load handlers for reassignment (Dept Head only)
  let handlers: Handler[] = []
  if (user.role === 'Department Head') {
    handlers = await prisma.user.findMany({
      where: { departmentId: ticket.departmentId, role: 'Incident Handler' },
      select: { id: true, name: true },
    })
  }

  const canMutate = user.role === 'Incident Handler' || user.role === 'Department Head'

  return (
    <main className="min-h-screen bg-transparent p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] flex items-center gap-2">
          <Link href="/dashboard" className="hover:underline text-indigo-600">Dashboard</Link>
          <span>/</span>
          <span className="text-[#1a1b2e] dark:text-[#c7c4d8] font-medium truncate">{ticket.title}</span>
        </nav>

        {/* Header card */}
        <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-2xl border border-[#d0d1e6] dark:border-[#464555] shadow-sm p-6 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-[#1a1b2e] dark:text-[#dae2fd]">{ticket.title}</h1>
              <p className="text-xs text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] font-mono mt-1">{ticket.id}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SeverityBadge severity={ticket.severity} />
              <StatusBadge status={ticket.status} />
            </div>
          </div>

          {/* Detail grid */}
          <div className="divide-y divide-[#e4e6f8]">
            <DetailRow label="Description">
              <pre className="whitespace-pre-wrap font-sans">{ticket.description}</pre>
            </DetailRow>
            <DetailRow label="Department">{ticket.department.name}</DetailRow>
            <DetailRow label="Category">{ticket.category.name}</DetailRow>
            <DetailRow label="Submitted By">{ticket.creator.name}</DetailRow>
            <DetailRow label="Assigned To">{ticket.responder?.name ?? <span className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Unassigned</span>}</DetailRow>
            <DetailRow label="Created">
              {new Date(ticket.createdAt).toLocaleString()}
            </DetailRow>
            <DetailRow label="Last Updated">
              {new Date(ticket.updatedAt).toLocaleString()}
            </DetailRow>
          </div>
        </div>

        {/* Action panel */}
        {canMutate && (
          <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-2xl border border-[#d0d1e6] dark:border-[#464555] shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">Actions</h2>
            {user.role === 'Department Head' ? (
              <HeadActions
                ticketId={ticket.id}
                status={ticket.status}
                severity={ticket.severity}
                handlers={handlers}
              />
            ) : (
              <HandlerActions ticketId={ticket.id} status={ticket.status} />
            )}
          </div>
        )}

        {/* Audit log */}
        <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-2xl border border-[#d0d1e6] dark:border-[#464555] shadow-sm p-6 space-y-4">
          <h2 className="text-base font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">Audit Log</h2>
          <AuditLogList logs={ticket.auditLogs} />
        </div>
      </div>
    </main>
  )
}
