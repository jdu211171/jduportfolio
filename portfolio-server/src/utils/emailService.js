// // src/utils/emailService.js

// const nodemailer = require('nodemailer')

// const transporter = nodemailer.createTransport({
// 	host: process.env.EMAIL_HOST,
// 	port: process.env.EMAIL_PORT,
// 	secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
// 	auth: {
// 		user: process.env.EMAIL_USER,
// 		pass: process.env.EMAIL_PASS,
// 	},
// 	debug: true,
// 	tls: {
// 		rejectUnauthorized: false,
// 	},
// })

// const sendEmail = async (to, subject, text, html) => {
// 	const mailOptions = {
// 		from: process.env.EMAIL_FROM,
// 		to,
// 		subject,
// 		text,
// 		html,
// 	}

// 	try {
// 		const info = await transporter.sendMail(mailOptions)
// 		// console.log('Email sent: ' + info.response)
// 	} catch (error) {
// 		console.error('Error sending email: ' + error)
// 	}
// }

// module.exports = {
// 	sendEmail,
// }






    // ------ variant ------
 
const nodemailer = require('nodemailer');
const async = require('async');

// Nodemailer transporter sozlamalari
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  tls: {
    rejectUnauthorized: false,
  },
});

// Queue yaratish
const emailQueue = async.queue(async (task, callback) => {
  const { to, subject, text, html, retries = 0, maxRetries = 3 } = task;
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}`);
    callback(); // Vazifa muvaffaqiyatli bajarildi
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    if (retries < maxRetries) {
      // Qayta urinishlar sonini oshirish va kechikish qo'shish
      setTimeout(() => {
        emailQueue.push({ ...task, retries: retries + 1 });
        callback();
      }, 5000); // 5 soniya kechikish
    } else {
      console.error(`Max retries reached for ${to}`);
      callback(error); // Maksimal qayta urinishlar soniga yetdi
    }
  }
}, 1); // Concurrency = 1

// Queue ga email qo‘shish funksiyasi
const addToQueue = (to, subject, text, html, maxRetries = 3) => {
  emailQueue.push({ to, subject, text, html, retries: 0, maxRetries }, (err) => {
    if (err) {
      console.error('Queue error:', err);
    }
  });
};

module.exports = {
  addToQueue,
};







// --- variant ----

// const nodemailer = require('nodemailer');
// const async = require('async');
// const fs = require('fs').promises; // Xatolarni faylga yozish uchun

// // Nodemailer transporter sozlamalari
// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: process.env.EMAIL_SECURE === 'true',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
//   debug: true,
//   tls: {
//     rejectUnauthorized: false,
//   },
// });

// // Queue yaratish
// const emailQueue = async.queue(async (task, callback) => {
//   const { to, subject, text, html, retries = 0, maxRetries = 5 } = task;
//   const mailOptions = {
//     from: process.env.EMAIL_FROM,
//     to,
//     subject,
//     text,
//     html,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${to}`);
//     setTimeout(callback, 15000); // 15 soniya kechikish
//   } catch (error) {
//     console.error(`Error sending email to ${to}:`, error);
//     if (retries < maxRetries) {
//       // Qayta urinishlar sonini oshirish va kechikish qo'shish
//       setTimeout(() => {
//         emailQueue.push({ ...task, retries: retries + 1 });
//         callback();
//       }, 15000); // 15 soniya kechikish
//     } else {
//       console.error(`Max retries reached for ${to}`);
//       // Xatolikni faylga yozish
//       await fs.appendFile(
//         'failed_emails.log',
//         `${new Date().toISOString()} - Failed to send email to ${to}: ${error.message}\n`
//       );
//       callback(error);
//     }
//   }
// }, 1); // Concurrency = 1

// // Queue ga email qo‘shish funksiyasi
// const addToQueue = (to, subject, text, html, maxRetries = 5) => {
//   emailQueue.push({ to, subject, text, html, retries: 0, maxRetries }, (err) => {
//     if (err) {
//       console.error('Queue error:', err);
//     }
//   });
// };

// module.exports = {
//   addToQueue,
// };