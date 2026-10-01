import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function TicketsPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  const tickets = await prisma.ticket.findMany({
    where: { creatorId: user.id },
    include: { category: true, department: true, responder: true },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="container mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Tickets</h1>
        <Link href="/tickets/new" className="bg-blue-600 hover:bg-blue-700 text-[#1a1b2e] dark:text-[#dae2fd] px-4 py-2 rounded">
          Report New Incident
        </Link>
      </div>
      
      <div className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl rounded-lg shadow overflow-hidden">
        {tickets.length === 0 ? (
          <div className="p-6 text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] text-center">You haven't submitted any tickets yet.</div>
        ) : (
          <table className="min-w-full divide-y divide-[#d0d1e6] dark:divide-[#464555]">
            <thead className="bg-transparent">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] uppercase tracking-wider">Severity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8] uppercase tracking-wider">Responder</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-[#171f33] border border-[#d0d1e6] dark:border-[#464555] shadow-2xl divide-y divide-[#d0d1e6] dark:divide-[#464555]">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-transparent transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                    {ticket.id.split('-')[0]}...
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link
                      href={`/tickets/${ticket.id}`}
                      className="text-sm font-medium text-blue-700 hover:text-blue-900 hover:underline"
                    >
                      {ticket.title}
                    </Link>
                    <div className="text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">{ticket.category.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${ticket.severity === 'CRITICAL' ? 'bg-red-100 text-red-400' : ticket.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : ticket.severity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {ticket.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      ticket.status === 'OPEN'        ? 'bg-blue-100 text-blue-400'   :
                      ticket.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                      ticket.status === 'RESOLVED'    ? 'bg-green-100 text-green-800'  :
                      ticket.status === 'REOPENED'    ? 'bg-orange-100 text-orange-800' :
                      /* CLOSED */                       'bg-[#eef0fb] dark:bg-[#131b2e] text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                    {ticket.department.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">
                    {ticket.responder ? ticket.responder.name : <span className="italic text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Unassigned</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
