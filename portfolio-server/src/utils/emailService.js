// src/utils/emailService.js

const { SESClient } = require("@aws-sdk/client-ses");
const nodemailer = require("nodemailer");

// 1. AWS SES Klientini .env fayldagi ma'lumotlar asosida sozlash
//    Bu klient bir marta yaratilib, butun ilova davomida qayta ishlatiladi.
const sesClient = new SESClient({
    region: process.env.AWS_SES_REGION, // .env faylidan olinadi
    credentials: {
        accessKeyId: process.env.AWS_SES_ACCESS_KEY, // .env faylidan olinadi
        secretAccessKey: process.env.AWS_SES_SECRET_KEY, // .env faylidan olinadi
    }
});

// 2. Nodemailer transportini AWS SES bilan bog'lash
//    Bu bizga Nodemailer'ning qulay sintaksisini AWS'ning kuchi bilan birlashtirish imkonini beradi.
const transporter = nodemailer.createTransport({
    SES: { ses: sesClient, aws: {} },
    sendingRate: 14 // AWS limitiga mos ravishda sekundiga 14 ta email
});

/**
 * Bitta email jo'natish uchun asosiy funksiya.
 * @param {object} mailData - {to, subject, text, html}
 * @returns {Promise<{success: boolean, to: string, info?: object, error?: Error}>}
 */
const sendEmail = async (mailData) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: mailData.to,
        subject: mailData.subject,
        text: mailData.text,
        html: mailData.html,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Email muvaffaqiyatli jo'natildi: ${mailData.to}`);
        return { success: true, to: mailData.to, messageId: info.messageId };
    } catch (error) {
        console.error(`Email jo'natishda xatolik (${mailData.to}):`, error);
        return { success: false, to: mailData.to, error: error.message };
    }
};

/**
 * Ko'p sonli emaillarni parallel ravishda, samarali jo'natadi.
 * Promise.allSettled yordamida bitta emaildagi xatolik boshqalariga ta'sir qilmaydi.
 * @param {Array<object>} emailTasks - Har birida {to, subject, text, html} bo'lgan massiv
 * @returns {Promise<object>} - Muvaffaqiyatli va xato bo'lgan jo'natmalar haqida to'liq hisobot.
 */
const sendBulkEmails = async (emailTasks) => {
    // Har bir email uchun jo'natish so'rovini (promise) yaratamiz
    const promises = emailTasks.map(task => sendEmail(task));

    // Barcha so'rovlarni parallel ravishda ishga tushiramiz va natijasini kutamiz
    const results = await Promise.allSettled(promises);

    const report = {
        total: emailTasks.length,
        successful: 0,
        failed: 0,
        successfulEmails: [],
        failedEmails: [],
    };

    results.forEach(result => {
        if (result.status === 'fulfilled' && result.value.success) {
            report.successful++;
            report.successfulEmails.push(result.value);
        } else {
            report.failed++;
            // Agar promise o'zi xato qaytarsa (fulfilled bo'lib ichida error bo'lsa) yoki butunlay reject bo'lsa
            const failedInfo = result.status === 'rejected' ? result.reason : result.value;
            report.failedEmails.push(failedInfo);
        }
    });

    return report;
};

module.exports = {
    sendEmail,       // Bitta email jo'natish uchun (masalan, Staff uchun)
    sendBulkEmails,  // Ommaviy jo'natish uchun (masalan, Students uchun)
};