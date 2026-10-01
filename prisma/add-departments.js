const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Adding Finance and Accounting departments...')

  const finance = await prisma.department.upsert({
    where: { name: 'Finance' },
    update: {},
    create: { name: 'Finance' }
  })

  const accounting = await prisma.department.upsert({
    where: { name: 'Accounting' },
    update: {},
    create: { name: 'Accounting' }
  })

  const categories = [
    { name: 'Budget Approval', departmentId: finance.id },
    { name: 'Expense Claims', departmentId: finance.id },
    { name: 'Invoice Processing', departmentId: accounting.id },
    { name: 'Audit Query', departmentId: accounting.id },
  ]

  for (const cat of categories) {
    const exists = await prisma.category.findFirst({ where: { name: cat.name, departmentId: cat.departmentId } })
    if (!exists) await prisma.category.create({ data: cat })
  }

  console.log('Done! Added Finance and Accounting departments with categories.')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
