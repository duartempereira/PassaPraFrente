import path from 'node:path'
import { fileURLToPath } from 'node:url' // <-- IMPORTANTE
import ejs from 'ejs'
import nodemailer from 'nodemailer'

import { SMTP_HOST, SMTP_MAIL, SMTP_PASSWORD, SMTP_PORT, SMTP_SERVICE } from '../../config.js'

// Obter __dirname estilo ES Module
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

class EmailService {
  static async sendEmail (options) {
    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      service: SMTP_SERVICE,
      auth: {
        user: SMTP_MAIL,
        pass: SMTP_PASSWORD
      }
    })

    const { email, subject, template, emailData } = options

    const templatePath = path.join(__dirname, '../mails', template)

    const html = await ejs.renderFile(templatePath, emailData)

    const mailOptions = {
      from: SMTP_MAIL,
      to: email,
      subject,
      html
    }

    await transporter.sendMail(mailOptions)
  }
}

export default EmailService
