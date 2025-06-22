// utils/emailToRecruiter.js
const { sendEmail } = require('./emailService');

const formatRecruiterWelcomeEmail = (email, password, firstName, lastName) => {
    const to = email;
    const subject = 'JDU Portfolio tizimiga xush kelibsiz';
    const text = `Hurmatli ${firstName} ${lastName},\n\nJDU Portfolio tizimida kompaniyangiz uchun hisob yaratildi.\n\nLogin ma'lumotlaringiz:\n\nEmail: ${email}\nParol: ${password}\n\nHurmat bilan,\nJDU Ma'muriyati`;
    const html = `
    <!DOCTYPE html>
    <html lang="uz">
    <head><title>JDUga xush kelibsiz</title></head>
    <body>
        <p>Hurmatli, ${firstName} ${lastName}!</p>
        <p>JDU Portfolio tizimida kompaniyangiz uchun hisob yaratildi.</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Parol:</strong> ${password}</p>
        <p><a href="https://portfolio.jdu.uz/login">Tizimga kirish</a></p>
        <p>Hurmat bilan,<br>JDU Ma'muriyati</p>
    </body>
    </html>`;
    return { to, subject, text, html };
};

const sendRecruiterWelcomeEmail = async (email, password, firstName, lastName) => {
    const mailData = formatRecruiterWelcomeEmail(email, password, firstName, lastName);
    await sendEmail(mailData);
};

module.exports = { formatRecruiterWelcomeEmail, sendRecruiterWelcomeEmail };