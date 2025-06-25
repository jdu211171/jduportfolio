const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { Admin, Staff, Recruiter, Student } = require('../models')

class AuthService {
    static async login(email, password, res) {
        const userTypes = [Admin, Staff, Recruiter, Student]

        for (const UserType of userTypes) {
            const user = await UserType.findOne({ where: { email } })
            if (user) {
                const isMatch = await bcrypt.compare(password, user.password)
                if (isMatch) {
                    const token = jwt.sign(
                        { id: user.id, userType: UserType.name },
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRATION }
                    )
                    AuthService.setAuthCookies(res, token, UserType.name)
                    return {
                        userType: UserType.name,
                        userData: {
                            id: user.id,
                            name: user.first_name + ' ' + user.last_name,
                            studentId: user.student_id,
                            photo: user.photo,
                        },
                    }
                }
            }
        }
        throw new Error('Invalid credentials')
    }

    static async loginWithGoogle(profile) {
        const email = profile.emails[0].value 
        const userTypes = [Admin, Staff, Recruiter, Student]

        for (const UserType of userTypes) {
            const user = await UserType.findOne({ where: { email } })
            if (user) {
                const token = jwt.sign(
                    { id: user.id, userType: UserType.name },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRATION }
                )
                return {
                    userType: UserType.name,
                    userData: {
                        id: user.id,
                        name: user.first_name + ' ' + user.last_name,
                        studentId: user.student_id,
                        photo: user.photo,
                    },
                    token,
                }
            }
        }
        throw new Error('Bu Google email bilan hisob topilmadi')
    }

    static setAuthCookies(res, token, userType) {
        res.cookie('token', token, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION) * 60 * 60 * 1000),
        })
        res.cookie('userType', userType, {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(Date.now() + parseInt(process.env.JWT_EXPIRATION) * 60 * 60 * 1000),
        })
    }

    static async logout(res) {
        res.clearCookie('token', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
        })
        res.clearCookie('userType', {
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
        })
    }
}

module.exports = AuthService