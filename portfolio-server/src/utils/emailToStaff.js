// const to = email
// 		const subject = 'Welcome to JDU'

// 		const text = `Hi ${firstName},\n\nWelcome to JDU. Your account has been created.\n\nYour login details are as follows:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease keep this information secure and do not share it with anyone.\n\nBest regards,\nJDU Team`

// 		const html = `
//       <!DOCTYPE html>
//       <html lang="ja">
//       <head>
//           <meta charset="UTF-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//           <title>アカウント情報</title>
//           <style>
//               body {
//                   font-family: Arial, sans-serif;
//                   background-color: #f4f4f4;
//                   margin: 0;
//                   padding: 0;
//               }
//               .email-container {
//                   max-width: 600px;
//                   margin: 0 auto;
//                   background-color: #ffffff;
//                   padding: 20px;
//                   border: 1px solid #e1e1e1;
//                   border-radius: 10px;
//               }
//               .header {
//                   text-align: center;
//                   padding: 10px 0;
//                   background-color: #4CAF50;
//                   color: #ffffff;
//                   border-radius: 10px 10px 0 0;
//               }
//               .content {
//                   padding: 20px;
//                   line-height: 1.6;
//               }
//               .content p {
//                   margin: 0 0 10px;
//               }
//               .content a {
//                   color: #4CAF50;
//                   text-decoration: none;
//               }
//               .content a:hover {
//                   text-decoration: underline;
//               }
//               .footer {
//                   text-align: center;
//                   padding: 10px;
//                   background-color: #f4f4f4;
//                   color: #666666;
//                   border-radius: 0 0 10px 10px;
//               }
//           </style>
//       </head>
//       <body>
//           <div class="email-container">
//               <div class="header">
//                   <h1>JDUへようこそ</h1>
//               </div>
//               <div class="content">
//                   <p>${firstName} ${lastName} 様,</p>
//                   <p>私たちのチームに加わっていただき、ありがとうございます！以下があなたのアカウント情報です。</p>
//                   <p><strong>メールアドレス:</strong> ${email}</p>
//                   <p><strong>パスワード:</strong> ${password}</p>
//                   <p>この情報は安全に保管し、他の人と共有しないでください。</p>
//                   <p>下記のリンクをクリックしてアカウントにログインできます：</p>
//                   <p><a href="https://portfolio.jdu.uz/login">アカウントにログインする</a></p>
//                   <p>ご質問がある場合やサポートが必要な場合は、いつでもサポートチームまでご連絡ください。</p>
//                   <p>よろしくお願いいたします。</p>
//                   <p>JDUチーム</p>
//               </div>
//               <div class="footer">
//                   <p>&copy; ${new Date().getFullYear()} JDU. All rights reserved.</p>
//                   <p>JDU住所</p>
//               </div>
//           </div>
//       </body>
//       </html>
//         `


// utils/emailToStaff.js
const { sendEmail } = require('./emailService');

const formatStaffWelcomeEmail = (email, password, firstName, lastName) => {
    const to = email;
    const subject = 'JDU Portfolio tizimiga xush kelibsiz';
    const text = `Assalomu alaykum ${firstName} ${lastName},\n\nJDU Portfolio tizimida siz uchun hisob yaratildi.\n\nLogin ma'lumotlaringiz:\n\nEmail: ${email}\nParol: ${password}\n\nIltimos, ushbu ma'lumotlarni xavfsiz joyda saqlang.\n\nHurmat bilan,\nJDU Ma'muriyati`;
    const html = `
    <!DOCTYPE html>
    <html lang="uz">
    <head><title>JDUga xush kelibsiz</title></head>
    <body>
        <p>Assalomu alaykum, ${firstName} ${lastName}!</p>
        <p>JDU Portfolio tizimida siz uchun hisob yaratildi.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Parol:</strong> ${password}</p>
        <p><a href="https://portfolio.jdu.uz/login">Tizimga kirish</a></p>
        <p>Hurmat bilan,<br>JDU Ma'muriyati</p>
    </body>
    </html>`;
    return { to, subject, text, html };
};

const sendStaffWelcomeEmail = async (email, password, firstName, lastName) => {
    const mailData = formatStaffWelcomeEmail(email, password, firstName, lastName);
    await sendEmail(mailData);
};

module.exports = { formatStaffWelcomeEmail, sendStaffWelcomeEmail };