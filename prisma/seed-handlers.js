const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Seeding additional Incident Handlers...')

  const usersData = [
    { name: 'Daniel Boateng', role: 'Incident Handler', deptName: 'IT', pass: 'Q8#vL2!mRx47' },
    { name: 'Sarah Mensima', role: 'Incident Handler', deptName: 'IT', pass: 'T4@kN9#pWd63' },
    { name: 'Kojo Asare', role: 'Incident Handler', deptName: 'Facilities', pass: 'B7!xR3@qLm82' },
    { name: 'Lydia Owusu', role: 'Incident Handler', deptName: 'Facilities', pass: 'J5#nV8!cTk39' },
    { name: 'Michael Antwi', role: 'Incident Handler', deptName: 'Finance', pass: 'W6@pQ4#zHs71' },
    { name: 'Grace Ofori', role: 'Incident Handler', deptName: 'Finance', pass: 'Y9!dK2@rXm54' },
    { name: 'Samuel Agyeman', role: 'Incident Handler', deptName: 'HR', pass: 'F3#vT7!nLp86' },
    { name: 'Priscilla Boateng', role: 'Incident Handler', deptName: 'HR', pass: 'M8@qR5#xJk42' },
    { name: 'Kofi Mensah', role: 'Incident Handler', deptName: 'Accounting', pass: 'C7!wN4@pVz95' },
    { name: 'Abigail Asante', role: 'Incident Handler', deptName: 'Accounting', pass: 'R2#kL9!mQx67' }
  ]

  for (const u of usersData) {
    let dept = null;
    
    if (u.deptName) {
      dept = await prisma.department.findUnique({ where: { name: u.deptName } })
      if (!dept) {
        dept = await prisma.department.create({ data: { name: u.deptName } })
      }
    }

    const email = `${u.name.replace(/\s+/g, '.').toLowerCase()}@company.com`
    
    const existing = await prisma.user.findFirst({ where: { name: u.name } })
    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          password: u.pass,
          role: u.role,
          departmentId: dept ? dept.id : null
        }
      })
    } else {
      await prisma.user.create({
        data: {
          name: u.name,
          email,
          password: u.pass,
          role: u.role,
          departmentId: dept ? dept.id : null
        }
      })
    }
  }

  console.log('Successfully added the additional 10 Incident Handlers!')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(async () => await prisma.$disconnect())
