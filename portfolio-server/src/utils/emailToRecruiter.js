// utils/emailToRecruiter.js
const { sendEmail } = require('./emailService')

const formatRecruiterWelcomeEmail = (email, password, firstName, lastName) => {
	// Send to fixed address instead of recruiter themselves
	const to = 'jin@digital-knowledge.co.jp'

	// Yangi, professional Subject (Yapon tilida)
	const subject = 'JDUポートフォリオのアカウント開設のお知らせ' // JDU Portfolio akkaunti ochilganligi haqida bildirishnoma

	// Yangi oddiy matn (text)
	const text = `Hi ${firstName},\n\nAn account for your company has been created on the JDU Portfolio system.\n\nYour login details are as follows:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease keep this information secure.\n\nBest regards,\nJDU Team`

	// Yangi, stillangan HTML andoza (Rekruter uchun moslashtirilgan)
	const html = `
     <!DOCTYPE html>
     <html lang="ja">
     <head>
         <meta charset="UTF-8">
         <meta name="viewport" content="width=device-width, initial-scale=1.0">
         <title>アカウント情報</title>
         <style>
             body {
                 font-family: Arial, sans-serif;
                 background-color: #f4f4f4;
                 margin: 0;
                 padding: 0;
             }
             .email-container {
                 max-width: 600px;
                 margin: 0 auto;
                 background-color: #ffffff;
                 padding: 20px;
                 border: 1px solid #e1e1e1;
                 border-radius: 10px;
             }
             .header {
                 text-align: center;
                 padding: 10px 0;
                 background-color: #0056b3; /* Rekruter uchun boshqacharoq rang */
                 color: #ffffff;
                 border-radius: 10px 10px 0 0;
             }
             .content {
                 padding: 20px;
                 line-height: 1.6;
             }
             .content p {
                 margin: 0 0 10px;
             }
             .content a {
                 color: #0056b3;
                 text-decoration: none;
             }
             .content a:hover {
                 text-decoration: underline;
             }
             .footer {
                 text-align: center;
                 padding: 10px;
                 background-color: #f4f4f4;
                 color: #666666;
                 border-radius: 0 0 10px 10px;
             }
         </style>
     </head>
     <body>
         <div class="email-container">
             <div class="header">
                 <h1>JDUポートフォリオへようこそ</h1>
             </div>
             <div class="content">
                 <p>${lastName} ${firstName} 様,</p>
                 <p>JDUポートフォリオに、貴社のアカウントが開設されました。下記が貴社のアカウント情報です。</p>
                 <p><strong>メールアドレス:</strong> ${email}</p>
                 <p><strong>パスワード:</strong> ${password}</p>
                 <p>この情報は安全に保管し、他の人と共有しないでください。</p>
                 <p>下記のリンクをクリックしてアカウントにログインできます：</p>
                 <p><a href="https://portfolio.jdu.uz/login">アカウントにログインする</a></p>
                 <p>ご質問がある場合やサポートが必要な場合は、いつでもご連絡ください。</p>
                 <p>敬具</p>
                 <p>JDU管理者</p>
             </div>
             <div class="footer">
                 <p>&copy; ${new Date().getFullYear()} JDU. All rights reserved.</p>
                 <p>JDU住所</p>
             </div>
         </div>
     </body>
     </html>
    `

	return { to, subject, text, html }
}

const sendRecruiterWelcomeEmail = async (email, password, firstName, lastName) => {
	console.log(`[EMAIL] Preparing welcome email for recruiter: ${email}`)
	console.log(`[EMAIL] Target recipient (fixed): boysoatov-asilbek@digital-knowledge.co.jp`)
	
	const mailData = formatRecruiterWelcomeEmail(email, password, firstName, lastName)
	
	console.log(`[EMAIL] Mail data prepared:`, {
		to: mailData.to,
		subject: mailData.subject,
		from: process.env.EMAIL_FROM
	})
	
	const result = await sendEmail(mailData)
	
	if (result.success) {
		console.log(`[EMAIL] Successfully sent welcome email. MessageId: ${result.messageId}`)
	} else {
		console.error(`[EMAIL] Failed to send welcome email:`, result.error)
		throw new Error(`Email sending failed: ${result.error}`)
	}
	
	return result
}

module.exports = { formatRecruiterWelcomeEmail, sendRecruiterWelcomeEmail }
