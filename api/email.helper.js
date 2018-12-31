const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

class Email {
    constructor(recipients, subject, body) {
        this.transporter = transporter

        const textBody = body +
        '\n---' +
        '\nThanks for using our app. You can reply to this email if you need help.'
        
        this.options = {
            from: '"A friendly app" <support@example.com>',
            to: recipients.join(', '),
            subject,
            text: textBody
        }
    }

    send() {
        return new Promise((resolve, reject) => {
            this.transporter.sendMail(this.options, (error, info) => {
                if (error) {
                    return reject(error)
                }

                return resolve(info)
            })
        })
    }
}

module.exports = Email