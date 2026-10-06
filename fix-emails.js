const { PrismaClient } = require('@prisma/client')
require('dotenv').config()
const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL } }
})

async function main() {
  // Now that unique constraint is removed, update emails
  const userEmailMap = {
    'Owusu Ansah': 'hannielcurry@gmail.com',
    'Joy Adu': 'hannielcurry@gmail.com',
    'Daniel Boateng': 'hannielcurry@gmail.com',
    'Sarah Mensima': 'hannielcurry@gmail.com',
    'Nana Addai': 'hannielcurry@gmail.com',
    'Maise Wilson': 'hannielcurry@gmail.com',
    'Kojo Asare': 'hannielcurry@gmail.com',
    'Lydia Owusu': 'hannielcurry@gmail.com',
    'Emily Warona': 'hannielcurry@gmail.com',
    'Emily Rapo': 'omgddy@gmail.com',
    'Michael Antwi': 'omgddy@gmail.com',
    'Grace Ofori': 'omgddy@gmail.com',
    'Uzziel Nyemitei': 'omgddy@gmail.com',
    'Jahaziel Nyemitei': 'omgddy@gmail.com',
    'Samuel Agyeman': 'omgddy@gmail.com',
    'Priscilla Boateng': 'omgddy@gmail.com',
    'David Mensah': 'omgddy@gmail.com',
    'Akua Mensah': 'omgddy@gmail.com',
    'Kofi Mensah': 'omgddy@gmail.com',
    'Abigail Asante': 'omgddy@gmail.com',
  }

  for (const [name, email] of Object.entries(userEmailMap)) {
    const user = await prisma.user.findFirst({ where: { name } })
    if (user) {
      await prisma.user.update({ where: { id: user.id }, data: { email } })
      console.log(`✓ ${name} → ${email}`)
    } else {
      console.log(`✗ Not found: ${name}`)
    }
  }
  console.log('\nDone!')
}
main().catch(console.error).finally(() => prisma.$disconnect())
