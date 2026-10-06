const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL
    }
  }
})

async function main() {
  console.log('Seeding production data...')

  // Create Departments
  const depts = ['IT', 'Facilities', 'Finance', 'HR', 'Accounting']
  const deptMap = {}
  
  for (const name of depts) {
    const dept = await prisma.department.upsert({
      where: { name },
      update: {},
      create: { name }
    })
    deptMap[name] = dept.id
    console.log(`Created/Upserted Department: ${name}`)
  }

  // Users data
  const users = [
    { name: 'Hanniel Nyemitei', role: 'Admin', department: null, password: 'Z2#sW7!qLm85' },
    
    // IT
    { name: 'Owusu Ansah', role: 'Department Head', department: 'IT', password: 'K9@tR6!mXq41' },
    { name: 'Joy Adu', role: 'Incident Handler', department: 'IT', password: 'V7!qN4#zLp82' },
    { name: 'Daniel Boateng', role: 'Incident Handler', department: 'IT', password: 'Q8#vL2!mRx47' },
    { name: 'Sarah Mensima', role: 'Incident Handler', department: 'IT', password: 'T4@kN9#pWd63' },
    
    // Facilities
    { name: 'Nana Addai', role: 'Department Head', department: 'Facilities', password: 'P3#vL8@wNz57' },
    { name: 'Maise Wilson', role: 'Incident Handler', department: 'Facilities', password: 'Y6!bQ2$xHd94' },
    { name: 'Kojo Asare', role: 'Incident Handler', department: 'Facilities', password: 'B7!xR3@qLm82' },
    { name: 'Lydia Owusu', role: 'Incident Handler', department: 'Facilities', password: 'J5#nV8!cTk39' },
    
    // Finance
    { name: 'Emily Warona', role: 'Department Head', department: 'Finance', password: 'R8@kM5#pTs31' },
    { name: 'Emily Rapo', role: 'Incident Handler', department: 'Finance', password: 'F4!nX9@cJv76' },
    { name: 'Michael Antwi', role: 'Incident Handler', department: 'Finance', password: 'W6@pQ4#zHs71' },
    { name: 'Grace Ofori', role: 'Incident Handler', department: 'Finance', password: 'Y9!dK2@rXm54' },
    
    // HR
    { name: 'Uzziel Nyemitei', role: 'Department Head', department: 'HR', password: 'H5@dK8#rPx63' },
    { name: 'Jahaziel Nyemitei', role: 'Incident Handler', department: 'HR', password: 'M7!gT3@vQn29' },
    { name: 'Samuel Agyeman', role: 'Incident Handler', department: 'HR', password: 'F3#vT7!nLp86' },
    { name: 'Priscilla Boateng', role: 'Incident Handler', department: 'HR', password: 'M8@qR5#xJk42' },
    
    // Accounting
    { name: 'David Mensah', role: 'Department Head', department: 'Accounting', password: 'C9#xL4!bRw72' },
    { name: 'Akua Mensah', role: 'Incident Handler', department: 'Accounting', password: 'N6@pV2#yKs48' },
    { name: 'Kofi Mensah', role: 'Incident Handler', department: 'Accounting', password: 'C7!wN4@pVz95' },
    { name: 'Abigail Asante', role: 'Incident Handler', department: 'Accounting', password: 'R2#kL9!mQx67' },
  ]

  for (const u of users) {
    const email = u.name.toLowerCase().replace(/ /g, '.') + '@incident.local'
    const departmentId = u.department ? deptMap[u.department] : null

    await prisma.user.upsert({
      where: { email },
      update: {
        password: u.password,
        role: u.role,
        departmentId
      },
      create: {
        name: u.name,
        email,
        password: u.password,
        role: u.role,
        departmentId
      }
    })
    console.log(`Upserted User: ${u.name} (${u.role})`)
  }

  console.log('Seeding complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
