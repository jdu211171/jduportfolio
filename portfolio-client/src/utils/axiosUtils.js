import axios from 'axios'

// Set the base URL for all axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Enable sending cookies with all requests
axios.defaults.withCredentials = true

// Add a request interceptor to include auth token
axios.interceptors.request.use(
	function (config) {
		const token = sessionStorage.getItem('token')
		if (token) {
			config.headers.Authorization = `Bearer ${token}`
		}
		return config
	},
	function (error) {
		return Promise.reject(error)
	}
)

axios.interceptors.response.use(
	function (response) {
		return response
	},
	function (error) {
		const originalRequest = error.config
		if (error.response.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true
			window.location.href = '/login'

			return axios(originalRequest)
		}
		return Promise.reject(error)
	}
)

export default axios
