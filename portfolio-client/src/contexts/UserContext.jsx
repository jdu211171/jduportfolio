import { createContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import Cookies from 'js-cookie'

export const UserContext = createContext()

export const UserProvider = ({ children }) => {
	const [role, setRole] = useState(null)
	const [userId, setUserId] = useState(null)
	const [activeUser, setActiveUser] = useState(null)
	const [language, setLanguage] = useState(localStorage.getItem('language') || 'ja')
	const [isInitializing, setIsInitializing] = useState(true)

	const fetchAndSetUser = async () => {
		const userRole = sessionStorage.getItem('role')
		const loginUser = sessionStorage.getItem('loginUser')

		// If sessionStorage is empty but cookies exist, sync from backend
		if ((!userRole || !loginUser) && Cookies.get('token') && Cookies.get('userType')) {
			try {
				const response = await fetch('/api/auth/me', {
					credentials: 'include',
				})
				if (response.ok) {
					const userData = await response.json()
					const cookieUserType = Cookies.get('userType')

					// Populate sessionStorage from cookies and API response
					sessionStorage.setItem('role', cookieUserType)
					sessionStorage.setItem('loginUser', JSON.stringify(userData))
					sessionStorage.setItem('token', Cookies.get('token'))

					setRole(cookieUserType)
					setUserId(userData.id)
					setActiveUser(userData)
					setIsInitializing(false)
					return userData
				}
			} catch (error) {
				console.error('Failed to sync user from cookies:', error)
			}
		}

		// Use existing sessionStorage data
		const parsedUser = loginUser ? JSON.parse(loginUser) : null
		const parsedUserId = parsedUser ? parsedUser.id : null
		setActiveUser(parsedUser)
		setRole(userRole)
		setUserId(parsedUserId)
		setIsInitializing(false)
		return parsedUser
	}

	useEffect(() => {
		fetchAndSetUser()
	}, [])

	const updateUser = () => {
		return fetchAndSetUser()
	}

	const changeLanguage = lang => {
		setLanguage(lang)
		localStorage.setItem('language', lang)
	}

	return <UserContext.Provider value={{ role, userId, activeUser, updateUser, language, changeLanguage, isInitializing }}>{children}</UserContext.Provider>
}

UserProvider.propTypes = {
	children: PropTypes.node.isRequired,
}
