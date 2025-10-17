// const express = require('express')
// const passport = require('../passport/google-strategy')
// const AuthController = require('../controllers/authController')
// const router = express.Router()

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login to the system
 *     description: |
 *       Use this endpoint to authenticate and receive a token as a cookie.
 *       After successful login, the cookie will be sent automatically with subsequent requests.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Returns userType and userData
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userType:
 *                   type: string
 *                   example: Admin
 *                 userData:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     photo:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout from the system
 *     description: Clears authentication cookies and terminates the session
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Failed to logout
 */

// router.get(
//     '/google',
//     passport.authenticate('google', { scope: ['profile', 'email'], session: false })
// )
//
// router.get('/google/callback', (req, res, next) => {
//     passport.authenticate('google', { session: false }, (err, user, info) => {
//         if (err || !user) {
//             // return res.status(400).json({ error: 'Google autentifikatsiyasi muvaffaqiyatsiz yakunlandi' })
//             // Redirect to frontend login page with error if Google auth fails
//             return res.redirect('http://localhost:5173/login?error=notfound');
//         }
//         req.user = user
//         AuthController.googleCallback(req, res)
//     })(req, res, next)
// })
//
//
// // Login route
// router.post('/login', AuthController.login)
//
// // Logout route
// router.post('/logout', AuthController.logout)
//
// module.exports = router

const express = require('express')
const passport = require('../passport/google-strategy')
const AuthController = require('../controllers/authController')

const { Admin, Staff, Recruiter, Student } = require('../models')
const { sendEmail } = require('../utils/emailService')
const generatePassword = require('generate-password')
const authMiddleware = require('../middlewares/auth-middleware')
const router = express.Router()

// Lightweight in-memory throttling for forgot-password route
// Limits: per-IP (30s) and per-email (60s) cooldowns
const forgotIpLast = new Map()
const forgotEmailLast = new Map()
const IP_WINDOW_MS = parseInt(process.env.FORGOT_IP_WINDOW_MS || '30000', 10)
const EMAIL_WINDOW_MS = parseInt(
	process.env.FORGOT_EMAIL_WINDOW_MS || '60000',
	10
)

/**
 * @swagger
 * tags:
 *   - name: Auth
 *     description: Authentication management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login to the system
 *     description: |
 *       Use this endpoint to authenticate and receive a token as a cookie.
 *       After successful login, the cookie will be sent automatically with subsequent requests.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Returns userType and userData
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userType:
 *                   type: string
 *                   example: Admin
 *                 userData:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     photo:
 *                       type: string
 *       400:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout from the system
 *     description: Clears authentication cookies and terminates the session
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       500:
 *         description: Failed to logout
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Auth]
 *     summary: Get current user information
 *     description: Returns information about the currently authenticated user
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 studentId:
 *                   type: string
 *                 photo:
 *                   type: string
 *       401:
 *         description: Unauthorized - no valid token provided
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */

router.get(
	'/google',
	passport.authenticate('google', {
		scope: ['profile', 'email'],
		session: false,
	})
)

router.get('/google/callback', (req, res, next) => {
	passport.authenticate('google', { session: false }, (err, user, info) => {
		if (err || !user) {
			const frontendUrl = process.env.FRONTEND_URL
			// return res.redirect(
			// 				'https://portfolio.jdu.uz/login?error=notfound'
			// 			)
			return res.redirect(
				`${frontendUrl}/login?error=notfound` // Manzilni dinamik qilish
			)
		}
		req.user = user
		AuthController.googleCallback(req, res)
	})(req, res, next)
})

// Login route
router.post('/login', AuthController.login)

// Logout route
router.post('/logout', AuthController.logout)

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     tags: [Auth]
 *     summary: Generate and email a new password
 *     description: |
 *       Accepts an email address. If an account exists, generates a new password,
 *       stores it, and emails it using AWS SES. Responds with 200 regardless to
 *       avoid account enumeration.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: If an account exists, a new password has been sent
 */
// Forgot password: generate and email a new password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body || {}
    if (!email) {
      return res.status(400).json({ error: 'Email is required' })
    }

    const now = Date.now()
    const ipRaw = (req.headers['x-forwarded-for'] || req.ip || '').toString()
    const ip = ipRaw.split(',')[0].trim()

    // IP-level cooldown to deter spamming
    const lastIp = forgotIpLast.get(ip)
    if (lastIp && now - lastIp < IP_WINDOW_MS) {
      const retryAfter = Math.ceil((IP_WINDOW_MS - (now - lastIp)) / 1000)
      return res.status(200).json({
        message: 'If an account exists, a new password has been sent',
        rateLimited: true,
        retryAfter,
      })
    }

    // Find user by email across all user types
    const userTypes = [Admin, Staff, Recruiter, Student]
    let foundUser = null
    let ModelRef = null

    for (const M of userTypes) {
      // eslint-disable-next-line no-await-in-loop
      const u = await M.findOne({ where: { email } })
      if (u) {
        foundUser = u
        ModelRef = M
        break
      }
    }

    // To avoid account enumeration, respond success even if not found
    if (!foundUser) {
      // Update IP timestamp to slow down repeated requests
      forgotIpLast.set(ip, now)
      return res.status(200).json({ message: 'If an account exists, a new password has been sent' })
    }

    // Per-email cooldown to prevent rapid repeated resets
    const emailKey = String(email).toLowerCase().trim()
    const lastEmail = forgotEmailLast.get(emailKey)
    if (lastEmail && now - lastEmail < EMAIL_WINDOW_MS) {
      forgotIpLast.set(ip, now)
      const retryAfter = Math.ceil(
        (EMAIL_WINDOW_MS - (now - lastEmail)) / 1000
      )
      return res.status(200).json({
        message: 'If an account exists, a new password has been sent',
        rateLimited: true,
        retryAfter,
      })
    }

    // Generate a strong password
    const newPassword = generatePassword.generate({
      length: 12,
      numbers: true,
      uppercase: true,
      lowercase: true,
      symbols: true,
      strict: true,
    })
    
    // Keep previous hash to revert on failure
    const prevHash = foundUser.password

    // Update password (hooks hash on save)
    foundUser.password = newPassword
    await foundUser.save()

    // Prepare and send email via existing SES integration
    const appUrl = process.env.FRONTEND_URL || 'https://portfolio.jdu.uz'
    const fullName = `${foundUser.first_name || ''} ${foundUser.last_name || ''}`.trim()
    const to = email
    const subject = 'Your new JDU Portfolio password'
    const text = `Hello ${fullName || ''},\n\nA new password has been generated for your JDU Portfolio account.\n\nEmail: ${email}\nNew Password: ${newPassword}\n\nYou can log in here: ${appUrl}/login\n\nIf you did not request this, please contact support immediately.`
    const html = `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Password Reset</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin:0; padding:0; }
          .container { max-width:600px; margin:0 auto; background:#fff; border:1px solid #e1e1e1; border-radius:10px; }
          .header { background:#4CAF50; color:#fff; padding:14px 20px; border-radius:10px 10px 0 0; }
          .content { padding:20px; color:#333; line-height:1.6; }
          .content p { margin:0 0 12px; }
          .footer { text-align:center; color:#666; background:#f4f4f4; padding:12px; border-radius:0 0 10px 10px; }
          .btn { display:inline-block; background:#4CAF50; color:#fff !important; padding:10px 16px; border-radius:6px; text-decoration:none; }
          code { background:#f7f7f7; padding:2px 6px; border-radius:4px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header"><h2>Password Reset</h2></div>
          <div class="content">
            <p>${fullName ? `${fullName},` : 'Hello,'}</p>
            <p>We generated a new password for your JDU Portfolio account.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>New Password:</strong> <code>${newPassword}</code></p>
            <p>Please use the button below to log in.</p>
            <p><a class="btn" href="${appUrl}/login">Log In</a></p>
            <p>If you did not request this, please contact support immediately.</p>
          </div>
          <div class="footer">&copy; ${new Date().getFullYear()} JDU</div>
        </div>
      </body>
      </html>`

    try {
      await sendEmail({ to, subject, text, html })
    } catch (emailErr) {
      console.error('SES send failed, reverting password change:', emailErr)
      try {
        // Revert to previous hash without triggering hashing hooks
        await ModelRef.update(
          { password: prevHash },
          { where: { id: foundUser.id }, hooks: false }
        )
      } catch (revertErr) {
        console.error('Failed to revert password after email failure:', revertErr)
      }
      // Generic success response to avoid enumeration
      forgotIpLast.set(ip, now)
      return res
        .status(200)
        .json({ message: 'If an account exists, a new password has been sent' })
    }

    // Update cooldown trackers on success
    forgotIpLast.set(ip, now)
    forgotEmailLast.set(emailKey, now)

    return res.status(200).json({ message: 'If an account exists, a new password has been sent' })
  } catch (error) {
    console.error('Forgot password error:', error)
    // For security, avoid leaking details
    return res.status(200).json({ message: 'If an account exists, a new password has been sent' })
  }
})

// Get current user info
router.get('/me', authMiddleware, async (req, res) => {
	try {
		const UserType = {
			Admin,
			Staff,
			Recruiter,
			Student,
		}[req.user.userType]

		const user = await UserType.findByPk(req.user.id)
		if (!user) {
			return res.status(404).json({ error: 'User not found' })
		}

		res.json({
			id: user.id,
			name: user.first_name + ' ' + user.last_name,
			studentId: user.student_id,
			photo: user.photo,
		})
	} catch (error) {
		res.status(500).json({ error: 'Failed to fetch user data' })
	}
})

module.exports = router
