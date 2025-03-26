const express = require('express')
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

// Login route
router.post('/login', AuthController.login)

// Logout route
router.post('/logout', AuthController.logout)

module.exports = router
