import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

// ── Helpers ──────────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, iconBg, sub, subColor }: {
  label: string; value: number | string; icon: string; iconBg: string; sub: string; subColor?: string
}) {
  return (
    <div className="p-4 rounded-xl bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] flex flex-col justify-between hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all group shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5c5d7a] dark:text-[#c7c4d8]">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center group-hover:scale-105 transition-transform`}>
          <span className="material-symbols-outlined text-[18px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-3xl font-bold text-[#1a1b2e] dark:text-[#dae2fd]">{value}</div>
        <div className={`text-xs mt-1 ${subColor ?? 'text-[#5c5d7a] dark:text-[#c7c4d8]'}`}>{sub}</div>
      </div>
    </div>
  )
}

function MiniStatCard({ label, value, icon, iconBg, valueColor }: {
  label: string; value: number | string; icon: string; iconBg: string; valueColor?: string
}) {
  return (
    <div className="p-3.5 rounded-xl bg-[#eef0fb] dark:bg-[#131b2e] border border-[#d0d1e6] dark:border-[#464555] flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
      </div>
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#5c5d7a] dark:text-[#c7c4d8]">{label}</span>
        <div className={`text-xl font-bold leading-tight ${valueColor ?? 'text-[#1a1b2e] dark:text-[#dae2fd]'}`}>{value}</div>
      </div>
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function AdminOverviewPage() {
  const user = await getUser()
  if (!user || user.role !== 'Admin') redirect('/login')

  const [allTickets, allUsers, departments, recentLogs] = await Promise.all([
    prisma.ticket.findMany({
      include: { department: true, creator: true, responder: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.findMany({ include: { department: true } }),
    prisma.department.findMany({ include: { tickets: true, users: true } }),
    prisma.auditLog.findMany({
      include: { actor: true, ticket: true },
      orderBy: { createdAt: 'desc' },
      take: 6,
    }),
  ])

  // ── Compute stats ──
  const total = allTickets.length
  const open = allTickets.filter(t => t.status === 'OPEN').length
  const inProgress = allTickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolved = allTickets.filter(t => t.status === 'RESOLVED').length
  const critical = allTickets.filter(t => t.severity === 'CRITICAL').length
  const unassigned = allTickets.filter(t => !t.responderId).length
  const totalUsers = allUsers.length
  const activeUsers = allUsers.filter(u => u.lastLogin !== null).length
  const resRate = total ? Math.round((resolved / total) * 100) : 0

  const severityData = [
    { label: 'LOW', count: allTickets.filter(t => t.severity === 'LOW').length, color: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-400', border: 'hover:border-emerald-400/50' },
    { label: 'MEDIUM', count: allTickets.filter(t => t.severity === 'MEDIUM').length, color: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-400', border: 'hover:border-amber-400/50' },
    { label: 'HIGH', count: allTickets.filter(t => t.severity === 'HIGH').length, color: 'text-orange-600 dark:text-orange-400', dot: 'bg-orange-400', border: 'hover:border-orange-400/50' },
    { label: 'CRITICAL', count: allTickets.filter(t => t.severity === 'CRITICAL').length, color: 'text-red-600 dark:text-red-400', dot: 'bg-red-500 animate-pulse', border: 'hover:border-red-400/50' },
  ]

  const deptStats = departments.map(d => ({
    name: d.name,
    total: d.tickets.length,
    open: d.tickets.filter(t => t.status === 'OPEN').length,
    inProgress: d.tickets.filter(t => t.status === 'IN_PROGRESS').length,
    resolved: d.tickets.filter(t => t.status === 'RESOLVED').length,
    users: d.users.length,
  })).sort((a, b) => b.total - a.total)

  const recentTickets = allTickets.slice(0, 5)

  const statusPill = (status: string) => {
    const m: Record<string, string> = {
      OPEN: 'bg-sky-100 dark:bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-500/30',
      IN_PROGRESS: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30',
      RESOLVED: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30',
      REOPENED: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/30',
      CLOSED: 'bg-[#eef0fb] dark:bg-gray-500/15 text-[#5c5d7a] dark:text-[#c7c4d8] border border-[#d0d1e6] dark:border-gray-500/30',
    }
    return m[status] ?? m.OPEN
  }

  const severityPill = (sev: string) => {
    const m: Record<string, string> = {
      LOW: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40',
      MEDIUM: 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-500/40',
      HIGH: 'bg-orange-100 dark:bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-300 dark:border-orange-500/40',
      CRITICAL: 'bg-red-100 dark:bg-red-500/15 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-500/40',
    }
    return m[sev] ?? m.LOW
  }

  const dotColor = (status: string) => {
    const m: Record<string, string> = {
      OPEN: 'bg-sky-400', IN_PROGRESS: 'bg-amber-400',
      RESOLVED: 'bg-emerald-400', REOPENED: 'bg-orange-400', CLOSED: 'bg-gray-400',
    }
    return m[status] ?? 'bg-gray-400'
  }

  const timeAgo = (date: Date) => {
    const diff = Date.now() - new Date(date).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    return `${Math.floor(h / 24)}d ago`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-5">

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1b2e] dark:text-[#dae2fd] tracking-tight">System Overview</h1>
          <p className="text-sm text-[#5c5d7a] dark:text-[#c7c4d8] mt-0.5">Analytics and operational statistics across all enterprise departments</p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/dashboard" className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-white dark:bg-[#171f33] hover:bg-[#eef0fb] dark:hover:bg-[#222a3d] border border-[#d0d1e6] dark:border-[#464555] text-sm text-[#1a1b2e] dark:text-[#dae2fd] font-medium transition-colors">
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            <span>All Tickets</span>
          </Link>
          <Link href="/tickets/new" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold transition-all shadow-md shadow-indigo-500/20">
            <span className="material-symbols-outlined text-[16px]">add</span>
            <span>Report Incident</span>
          </Link>
        </div>
      </div>

      {/* ── Critical Triage Banner (only if unassigned > 0) ── */}
      {unassigned > 0 && (
        <div className="w-full rounded-xl bg-white dark:bg-[#171f33] border-l-4 border-l-red-500 border border-[#d0d1e6] dark:border-[#464555] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd] flex items-center gap-2">
                {unassigned} Unassigned Ticket{unassigned > 1 ? 's' : ''} Pending Triage
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 tracking-widest">ACTION REQUIRED</span>
              </div>
              <p className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8] mt-0.5">These tickets need to be assigned to an incident handler</p>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold transition-colors self-end sm:self-center whitespace-nowrap">
            <span>Review Tickets</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* ── Primary KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tickets" value={total} icon="confirmation_number" iconBg="bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-[#c3c0ff]" sub="All time · 100% indexed" subColor="text-indigo-500 dark:text-indigo-400" />
        <StatCard label="Open" value={open} icon="folder_open" iconBg="bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300" sub={`${inProgress} in progress · Active flow`} subColor="text-amber-600 dark:text-amber-400" />
        <StatCard label="Resolved" value={resolved} icon="check_circle" iconBg="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-300" sub={`${resRate}% resolution rate`} subColor="text-emerald-600 dark:text-emerald-400" />
        <StatCard label="Critical" value={critical} icon="crisis_alert" iconBg="bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300" sub={`${unassigned} unassigned · Needs owner`} subColor="text-red-600 dark:text-red-400" />
      </div>

      {/* ── Secondary KPI Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MiniStatCard label="Total Users" value={totalUsers} icon="groups" iconBg="bg-indigo-100 dark:bg-[#222a3d] text-indigo-600 dark:text-[#c3c0ff]" />
        <MiniStatCard label="Active Users" value={activeUsers} icon="person_check" iconBg="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" />
        <MiniStatCard label="Departments" value={departments.length} icon="domain" iconBg="bg-indigo-100 dark:bg-[#222a3d] text-indigo-500 dark:text-[#c3c0ff]" />
        <MiniStatCard label="Unassigned" value={unassigned} icon="report_problem" iconBg="bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-300" valueColor={unassigned > 0 ? 'text-amber-600 dark:text-amber-300' : 'text-[#1a1b2e] dark:text-[#dae2fd]'} />
      </div>

      {/* ── Analytics 2-col ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* Department Breakdown — 7 cols */}
        <div className="lg:col-span-7 rounded-xl bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#d0d1e6] dark:border-[#464555]">
            <div>
              <h3 className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">Tickets by Department</h3>
              <p className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8]">Active workload distribution and team capacities</p>
            </div>
          </div>

          <div className="flex flex-col gap-5 mt-4 flex-1">
            {deptStats.slice(0, 8).map(dept => {
              const openW = dept.total ? Math.round((dept.open / dept.total) * 100) : 0
              const ipW = dept.total ? Math.round((dept.inProgress / dept.total) * 100) : 0
              const resW = dept.total ? Math.round((dept.resolved / dept.total) * 100) : 0
              return (
                <div key={dept.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dept.total > 0 ? 'bg-indigo-500' : 'bg-[#d0d1e6] dark:bg-[#464555]'}`} />
                      <span className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">{dept.name}</span>
                    </div>
                    <span className="text-xs font-mono text-[#5c5d7a] dark:text-[#c7c4d8]">{dept.total} tickets · {dept.users} users</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#eef0fb] dark:bg-[#131b2e] overflow-hidden flex border border-[#d0d1e6] dark:border-[#464555]/50">
                    {dept.open > 0 && <div className="bg-sky-400 h-full transition-all" style={{ width: `${openW}%` }} title={`Open: ${dept.open}`} />}
                    {dept.inProgress > 0 && <div className="bg-amber-400 h-full transition-all" style={{ width: `${ipW}%` }} title={`In Progress: ${dept.inProgress}`} />}
                    {dept.resolved > 0 && <div className="bg-emerald-400 h-full transition-all" style={{ width: `${resW}%` }} title={`Resolved: ${dept.resolved}`} />}
                    {dept.total === 0 && <div className="bg-[#d0d1e6] dark:bg-[#2d3449] h-full w-full" />}
                  </div>
                  <div className="flex gap-4 mt-1 text-[10px] font-mono text-[#5c5d7a] dark:text-[#c7c4d8]">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-400 inline-block" />{dept.open} open</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />{dept.inProgress} in progress</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />{dept.resolved} resolved</span>
                    {dept.total === 0 && <span className="text-emerald-500 ml-auto">Idle / Available</span>}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-4 pt-3 border-t border-[#d0d1e6] dark:border-[#464555] flex items-center justify-between text-xs">
            <span className="text-[#5c5d7a] dark:text-[#c7c4d8]">{departments.length} total departments</span>
            <Link href="/dashboard" className="text-indigo-600 dark:text-[#c3c0ff] hover:underline font-medium flex items-center gap-0.5">
              View All <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            </Link>
          </div>
        </div>

        {/* Severity Distribution — 5 cols */}
        <div className="lg:col-span-5 rounded-xl bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] p-5 flex flex-col shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-[#d0d1e6] dark:border-[#464555]">
            <div>
              <h3 className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">Severity Distribution</h3>
              <p className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8]">Live breakdown of reported risk categories</p>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#eef0fb] dark:bg-[#222a3d] text-[#5c5d7a] dark:text-[#c7c4d8] border border-[#d0d1e6] dark:border-[#464555]">{total} Total</span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            {severityData.map(s => (
              <div key={s.label} className={`p-3.5 rounded-xl bg-[#eef0fb] dark:bg-[#131b2e] border border-[#d0d1e6] dark:border-[#464555] ${s.border} transition-colors`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-wider">{s.label}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${s.dot}`} />
                </div>
                <div className={`mt-2 text-2xl font-bold ${s.color}`}>{s.count}</div>
                <div className="text-[10px] font-mono text-[#5c5d7a] dark:text-[#c7c4d8] mt-0.5">
                  {total ? Math.round((s.count / total) * 100) : 0}% of queue
                </div>
              </div>
            ))}
          </div>

          {/* Resolution Rate metric */}
          <div className="mt-4 p-3 rounded-lg bg-[#eef0fb] dark:bg-[#131b2e] border border-[#d0d1e6] dark:border-[#464555] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-emerald-500 dark:text-emerald-400">speed</span>
              <span className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8]">Resolution Rate</span>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-600 dark:text-emerald-400">{resRate}%</span>
          </div>

          {/* In Progress metric */}
          <div className="mt-2 p-3 rounded-lg bg-[#eef0fb] dark:bg-[#131b2e] border border-[#d0d1e6] dark:border-[#464555] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px] text-amber-500 dark:text-amber-400">pending</span>
              <span className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8]">In Progress</span>
            </div>
            <span className="text-sm font-mono font-bold text-amber-600 dark:text-amber-400">{inProgress}</span>
          </div>
        </div>
      </div>

      {/* ── Recent Incidents Table ── */}
      <div className="rounded-xl bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#d0d1e6] dark:border-[#464555] flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">Recent Incidents</h3>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#eef0fb] dark:bg-[#222a3d] text-[#5c5d7a] dark:text-[#c7c4d8] border border-[#d0d1e6] dark:border-[#464555]">{recentTickets.length} Loaded</span>
          </div>
          <Link href="/dashboard" className="text-indigo-600 dark:text-[#c3c0ff] text-sm font-medium hover:underline">View All Tickets →</Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#d0d1e6] dark:border-[#464555] bg-[#eef0fb] dark:bg-[#131b2e] text-[10px] font-mono font-bold text-[#5c5d7a] dark:text-[#c7c4d8] uppercase tracking-widest">
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Ticket & Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Assignee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d0d1e6] dark:divide-[#464555]/60 text-sm">
              {recentTickets.length === 0 && (
                <tr><td colSpan={7} className="py-10 text-center text-[#5c5d7a] dark:text-[#c7c4d8] text-sm">No tickets yet.</td></tr>
              )}
              {recentTickets.map(t => (
                <tr key={t.id} className="hover:bg-[#eef0fb] dark:hover:bg-[#222a3d]/60 transition-colors">
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${severityPill(t.severity)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${t.severity === 'LOW' ? 'bg-emerald-400' : t.severity === 'MEDIUM' ? 'bg-amber-400' : t.severity === 'HIGH' ? 'bg-orange-400' : 'bg-red-500 animate-pulse'}`} />
                      {t.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-[#c3c0ff]">{t.id.slice(0, 8).toUpperCase()}</span>
                        <span className="font-semibold text-[#1a1b2e] dark:text-[#dae2fd] truncate max-w-[180px]">{t.title}</span>
                      </div>
                      <span className="text-[11px] text-[#5c5d7a] dark:text-[#c7c4d8] truncate max-w-[280px]">{t.description.slice(0, 60)}{t.description.length > 60 ? '…' : ''}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-[#5c5d7a] dark:text-[#c7c4d8] text-xs">{t.department.name}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    {t.responder ? (
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-[#222a3d] text-indigo-600 dark:text-[#c3c0ff] text-[10px] font-bold flex items-center justify-center">{t.responder.name.charAt(0)}</div>
                        <span className="text-xs font-medium text-[#1a1b2e] dark:text-[#dae2fd]">{t.responder.name}</span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-red-600 dark:text-red-400 font-semibold px-2 py-0.5 rounded bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30">
                        <span className="material-symbols-outlined text-[13px]">person_off</span>
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${statusPill(t.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${dotColor(t.status)}`} />
                      {t.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-[10px] font-mono text-[#5c5d7a] dark:text-[#c7c4d8]">{timeAgo(t.createdAt)}</td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right">
                    <Link
                      href={`/dashboard/tickets/${t.id}`}
                      className="px-2.5 py-1 rounded bg-[#eef0fb] dark:bg-[#222a3d] hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-[11px] font-semibold text-[#1a1b2e] dark:text-[#dae2fd] border border-[#d0d1e6] dark:border-[#464555] transition-colors"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-[#d0d1e6] dark:border-[#464555] flex items-center justify-between text-xs bg-[#eef0fb] dark:bg-[#131b2e]">
          <span className="text-[#5c5d7a] dark:text-[#c7c4d8] font-mono">Showing {recentTickets.length} of {total} incidents</span>
          <Link href="/dashboard" className="text-indigo-600 dark:text-[#c3c0ff] hover:underline font-medium">View all →</Link>
        </div>
      </div>

      {/* ── Recent Activity Feed ── */}
      <div className="rounded-xl bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-[#1a1b2e] dark:text-[#dae2fd]">Recent Activity</h3>
            <p className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8]">Latest system audit events</p>
          </div>
          <Link href="/admin/audit-logs" className="text-indigo-600 dark:text-[#c3c0ff] text-xs font-medium hover:underline">View all →</Link>
        </div>
        <ol className="relative border-l border-[#d0d1e6] dark:border-[#464555] ml-2 space-y-4">
          {recentLogs.length === 0 && <p className="text-sm text-[#5c5d7a] dark:text-[#c7c4d8] ml-4">No activity yet.</p>}
          {recentLogs.map(log => (
            <li key={log.id} className="ml-5">
              <span className="absolute -left-2 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/40 ring-2 ring-white dark:ring-[#171f33]">
                <span className="block h-1.5 w-1.5 rounded-full bg-indigo-500" />
              </span>
              <p className="text-sm text-[#1a1b2e] dark:text-[#dae2fd]">
                <span className="font-semibold">{log.actor.name}</span>
                <span className="text-[#5c5d7a] dark:text-[#c7c4d8]"> · {log.action.replace(/_/g, ' ')}</span>
              </p>
              <p className="text-xs text-[#5c5d7a] dark:text-[#c7c4d8] truncate">{log.ticket.title}</p>
              <time className="text-[10px] font-mono text-[#5c5d7a] dark:text-[#464555]">{new Date(log.createdAt).toLocaleString()}</time>
            </li>
          ))}
        </ol>
      </div>

    </div>
  )
}
