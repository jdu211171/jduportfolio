const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Admin, Staff, Recruiter, Student } = require('../models');

class AuthService {
  static async login(email, password, res) {
    const userTypes = [Admin, Staff, Recruiter, Student];

    for (const UserType of userTypes) {
      const user = await UserType.findOne({ where: { email } });
      if (user) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          const token = jwt.sign(
            { id: user.id, userType: UserType.name },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
          );

          // Set the JWT token and userType as cookies
          res.cookie('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION) * 60 * 60 * 1000), // Convert expiresIn to milliseconds
          });

          // Also set userType as a separate cookie
          res.cookie('userType', UserType.name, {
            httpOnly: false, // Can be accessed on the client-side
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION) * 60 * 60 * 1000), // Convert expiresIn to milliseconds
          });
          return { userType: UserType.name, userData: { id: user.id, name: user.first_name + " " + user.last_name, studentId: user.student_id, photo: user.photo } };
        }
      }
    }

    throw new Error('Invalid credentials');
  }

  static async logout(res) {
    // Clear cookies by setting them to empty and setting expiry in the past
    res.clearCookie('token', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
    });
    res.clearCookie('userType', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0),
    });
  }
}

module.exports = AuthService;
