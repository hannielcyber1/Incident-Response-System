import nodemailer from 'nodemailer'

// Two transporters — one per account
const transporter1 = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hannielcurry@gmail.com',
    pass: 'qbkj loag nqmv zmxc'
  }
})

const transporter2 = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'omgddy@gmail.com',
    pass: 'tnzp wuoz umop otzr'
  }
})

// Fixed list of admin notification emails
export const ADMIN_EMAILS = ['hannielcurry@gmail.com', 'omgddy@gmail.com']

export async function sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
  const recipients = Array.isArray(to) ? to : [to]

  const results = await Promise.allSettled(
    recipients.map(async (recipient) => {
      // Pick which transporter based on recipient
      const transporter = recipient === 'omgddy@gmail.com' ? transporter2 : transporter1
      const fromAddr = recipient === 'omgddy@gmail.com' ? '"Incident System" <omgddy@gmail.com>' : '"Incident System" <hannielcurry@gmail.com>'

      const info = await transporter.sendMail({
        from: fromAddr,
        to: recipient,
        subject,
        html
      })
      console.log(`[EMAIL SENT] to ${recipient}: ${info.messageId}`)
    })
  )

  results.forEach((r, i) => {
    if (r.status === 'rejected') {
      console.error(`[EMAIL ERROR] failed to send to ${recipients[i]}:`, r.reason)
    }
  })

  return results.every(r => r.status === 'fulfilled')
}
