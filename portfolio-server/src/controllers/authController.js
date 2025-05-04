const AuthService = require('../services/authService')

class AuthController {
  static async login(req, res) {
    const { email, password } = req.body
    try {
      const { userType, userData } = await AuthService.login(email, password, res)
      res.json({ userType, userData })
    } catch (error) {
      res.status(400).json({ error: error.message })
    }
  }

  static async logout(req, res) {
    try {
      await AuthService.logout(res)
      res.json({ message: 'Logged out successfully' })
    } catch (error) {
      res.status(500).json({ error: 'Failed to logout' })
    }
  }

  static async googleCallback(req, res) {
    const { userType, userData, token } = req.user
    AuthService.setAuthCookies(res, token, userType)
    res.json({ userType, userData })
  }
}

module.exports = AuthController
