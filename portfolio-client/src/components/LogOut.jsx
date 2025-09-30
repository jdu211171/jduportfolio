import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from '../utils/axiosUtils'
import Cookies from 'js-cookie'

const Logout = () => {
	const navigate = useNavigate()
	useEffect(() => {
		const handleLogout = async () => {
			try {
				await axios.post('/api/auth/logout')

				// Remove auth cookies and client-side session
				try {
					Cookies.remove('token', { path: '/' })
					Cookies.remove('userType', { path: '/' })
				} catch {}
				sessionStorage.clear()

				navigate('/login')
			} catch (error) {
				console.error('Logout error:', error)
			}
		}

		handleLogout()
	}, [navigate])

	return <></>
}

export default Logout
