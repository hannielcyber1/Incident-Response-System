import { getUser } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { redirect } from 'next/navigation'
import IncidentForm from './IncidentForm'

export default async function NewTicketPage() {
  const user = await getUser()
  if (!user) redirect('/login')

  if (user.role === 'Department Head') {
    return (
      <div className="container mx-auto p-8 max-w-2xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-red-500">Access Denied</h1>
        <p className="text-[#8b8ca8] dark:text-[#c7c4d8] dark:text-[#c7c4d8]">Department Heads are not allowed to create incidents.</p>
      </div>
    )
  }

  const categories = await prisma.category.findMany({
    include: { department: true },
    orderBy: { department: { name: 'asc' } }
  })

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Report an Incident</h1>
      <IncidentForm categories={categories} />
    </div>
  )
}
