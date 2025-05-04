const express = require('express')
const passport = require('../passport/google-strategy')
const AuthController = require('../controllers/authController')
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
			return res
				.status(400)
				.json({ error: 'Google autentifikatsiyasi muvaffaqiyatsiz yakunlandi' })
		}
		req.user = user
		AuthController.googleCallback(req, res)
	})(req, res, next)
})

// Login route
router.post('/login', AuthController.login)

// Logout route
router.post('/logout', AuthController.logout)

module.exports = router
