import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hannielcurry@gmail.com',
    pass: 'qbkj loag nqmv zmxc'
  }
})

// Fixed list of admins to send to
export const ADMIN_EMAILS = ['hannielcurry@gmail.com', 'omgddy@gmail.com']

export async function sendEmail({ to, subject, html }: { to: string | string[], subject: string, html: string }) {
  try {
    const info = await transporter.sendMail({
      from: '"Incident System" <hannielcurry@gmail.com>',
      to: Array.isArray(to) ? to.join(', ') : to,
      subject,
      html
    })
    console.log(`[EMAIL SENT] to ${to}: ${info.messageId}`)
    return true
  } catch (error) {
    console.error(`[EMAIL ERROR] failed to send to ${to}:`, error)
    return false
  }
}
