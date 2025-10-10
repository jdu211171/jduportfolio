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
const authMiddleware = require('../middlewares/auth-middleware')
const router = express.Router()

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
