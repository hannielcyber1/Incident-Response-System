const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Updating emails for Handlers and Department Heads...')

  const users = await prisma.user.findMany({
    where: { 
      role: { in: ['Incident Handler', 'Department Head'] } 
    }
  })

  for (let i = 0; i < users.length; i++) {
    const baseEmail = i % 2 === 0 ? 'omgddy' : 'hannielcurry'
    const email = `${baseEmail}+${users[i].name.replace(/\s+/g, '').toLowerCase()}@gmail.com`
    await prisma.user.update({
      where: { id: users[i].id },
      data: { email }
    })
  }

  console.log(`Updated ${users.length} users with the real emails!`)
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
