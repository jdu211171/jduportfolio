const { sendEmail } = require('./emailService');

class EmailService {
  static async EmailToStudent(email, password, firstName, lastName) {
    const to = email;
    const subject = 'Welcome to JDU';

    const text = `Dear ${firstName} ${lastName},\n\nWelcome to JDU Portfolio System! Your account has been created.\n\nYour login details are as follows:\n\nEmail: ${email}\nPassword: ${password}\n\nPlease keep this information secure and do not share it with anyone.\n\nAdditionally, please log into the portfolio and fill in your information on the "自己PR" and "Q&A" pages.\n\nBest regards,\nJDU Team`;

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
                  background-color: #4CAF50;
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
                  color: #4CAF50;
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
                  <h1>JDUへようこそ</h1>
              </div>
              <div class="content">
                  <p>${firstName} ${lastName} 様,</p>
                  <p>私たちのチームに加わっていただき、ありがとうございます！以下があなたのアカウント情報です。</p>
                  <p><strong>メールアドレス:</strong> ${email}</p>
                  <p><strong>パスワード:</strong> ${password}</p>
                  <p>この情報は安全に保管し、他の人と共有しないでください。</p>
                  <p>下記のリンクをクリックしてアカウントにログインできます：</p>
                  <p><a href="https://portfolio.jdu.uz/login">アカウントにログインする</a></p>
                  <p>また、ポートフォリオにログインし、「自己PR」および「Q&A」ページにあなたの情報を入力してください。</p>
                  <p>ご質問がある場合やサポートが必要な場合は、いつでもサポートチームまでご連絡ください。</p>
                  <p>よろしくお願いいたします。</p>
                  <p>JDUチーム</p>
              </div>
              <div class="footer">
                  <p>&copy; ${new Date().getFullYear()} JDU. All rights reserved.</p>
                  <p>JDU住所</p>
              </div>
          </div>
      </body>
      </html>
    `;

    await sendEmail(to, subject, text, html);

    return "Email sent successfully";
  }
}

module.exports = EmailService;