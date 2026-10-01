import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'

// ── Badge helpers ─────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    LOW:      'bg-green-100 text-green-800',
    MEDIUM:   'bg-yellow-100 text-yellow-800',
    HIGH:     'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-400',
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[severity] ?? 'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]'}`}>
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
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map[status] ?? 'bg-[#eef0fb] dark:bg-[#131b2e] text-[#1a1b2e] dark:text-[#dae2fd]'}`}>
      {status.replace('_', ' ')}
    </span>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  color = 'text-[#1a1b2e] dark:text-[#dae2fd]',
}: {
  label: string
  value: number
  color?: string
}) {
  return (
    <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-xl border border-[#d0d1e6] dark:border-[#464555] shadow-sm px-6 py-4 flex flex-col gap-1">
      <span className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">{label}</span>
      <span className={`text-3xl font-bold ${color}`}>{value}</span>
    </div>
  )
}

// ── Tickets table ─────────────────────────────────────────────────────────────

type TicketRow = {
  id: string
  title: string
  severity: string
  status: string
  creator: { name: string }
  department?: { name: string }
  createdAt: Date
}

function TicketsTable({
  tickets,
  showDepartment = false,
}: {
  tickets: TicketRow[]
  showDepartment?: boolean
}) {
  if (tickets.length === 0) {
    return (
      <p className="text-center text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] py-12">No tickets found.</p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#d0d1e6] dark:border-[#464555] shadow-sm">
      <table className="min-w-full divide-y divide-[#d0d1e6] dark:divide-[#464555] text-sm">
        <thead className="bg-transparent">
          <tr>
            <th className="px-4 py-3 text-left font-semibold text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">ID</th>
            <th className="px-4 py-3 text-left font-semibold text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Title</th>
            {showDepartment && (
              <th className="px-4 py-3 text-left font-semibold text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Department</th>
            )}
            <th className="px-4 py-3 text-left font-semibold text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Severity</th>
            <th className="px-4 py-3 text-left font-semibold text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Status</th>
            <th className="px-4 py-3 text-left font-semibold text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Submitted By</th>
            <th className="px-4 py-3 text-left font-semibold text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Date</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl divide-y divide-[#e4e6f8]">
          {tickets.map((ticket) => (
            <tr key={ticket.id} className="hover:bg-transparent transition-colors">
              <td className="px-4 py-3 font-mono text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                <Link
                  href={`/dashboard/tickets/${ticket.id}`}
                  className="text-indigo-600 hover:underline"
                >
                  {ticket.id.slice(0, 8)}
                </Link>
              </td>
              <td className="px-4 py-3 max-w-xs truncate font-medium text-[#1a1b2e] dark:text-[#dae2fd]">
                <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline">
                  {ticket.title}
                </Link>
              </td>
              {showDepartment && (
                <td className="px-4 py-3 text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                  {ticket.department?.name ?? '—'}
                </td>
              )}
              <td className="px-4 py-3">
                <SeverityBadge severity={ticket.severity} />
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={ticket.status} />
              </td>
              <td className="px-4 py-3 text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">{ticket.creator.name}</td>
              <td className="px-4 py-3 text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const user = await getUser()
  if (!user) redirect('/login')
  if (user.role === 'Employee') redirect('/tickets')

  // ── Incident Handler ──────────────────────────────────────────────────────

  if (user.role === 'Incident Handler') {
    const tickets = await prisma.ticket.findMany({
      where: { departmentId: user.departmentId ?? '' },
      include: { creator: true },
      orderBy: { createdAt: 'desc' },
    })

    return (
      <main className="min-h-screen bg-transparent p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd]">Incident Handler Dashboard</h1>
            <p className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] mt-1">
              Department: <span className="font-medium">{user.department?.name ?? '—'}</span>
            </p>
          </div>
          <TicketsTable tickets={tickets} />
        </div>
      </main>
    )
  }

  // ── Department Head ───────────────────────────────────────────────────────

  if (user.role === 'Department Head') {
    const tickets = await prisma.ticket.findMany({
      where: { departmentId: user.departmentId ?? '' },
      include: { creator: true },
      orderBy: { createdAt: 'desc' },
    })

    const total    = tickets.length
    const open     = tickets.filter((t) => t.status === 'OPEN').length
    const critical = tickets.filter((t) => t.severity === 'CRITICAL').length

    return (
      <main className="min-h-screen bg-transparent p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd]">Department Head Dashboard</h1>
            <p className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] mt-1">
              Department: <span className="font-medium">{user.department?.name ?? '—'}</span>
            </p>
          </div>

          {/* Summary panel */}
          <div className="grid grid-cols-3 gap-4">
            <StatCard label="Total Tickets" value={total} />
            <StatCard label="Open" value={open} color="text-blue-600" />
            <StatCard label="Critical" value={critical} color="text-red-600" />
          </div>

          <TicketsTable tickets={tickets} />
        </div>
      </main>
    )
  }

  // ── Admin ─────────────────────────────────────────────────────────────────

  if (user.role === 'Admin') {
    const tickets = await prisma.ticket.findMany({
      include: { creator: true, department: true },
      orderBy: { createdAt: 'desc' },
    })

    const total    = tickets.length
    const open     = tickets.filter((t) => t.status === 'OPEN').length
    const critical = tickets.filter((t) => t.severity === 'CRITICAL').length
    const resolved = tickets.filter((t) => t.status === 'RESOLVED').length

    return (
      <main className="min-h-screen bg-transparent p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd]">Admin Dashboard</h1>
              <p className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] mt-1">All tickets across all departments</p>
            </div>
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
            >
              View Audit Logs
            </Link>
          </div>

          {/* Global stats bar */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard label="Total Tickets" value={total} />
            <StatCard label="Open" value={open} color="text-blue-600" />
            <StatCard label="Critical" value={critical} color="text-red-600" />
            <StatCard label="Resolved" value={resolved} color="text-green-600" />
          </div>

          <TicketsTable tickets={tickets} showDepartment />
        </div>
      </main>
    )
  }

  // Fallback (unknown role)
  redirect('/login')
}
