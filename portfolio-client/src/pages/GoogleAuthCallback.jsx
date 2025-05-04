// import { useEffect, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { UserContext } from '../../src/contexts/UserContext';
//
// const GoogleAuthCallback = () => {
// 	const navigate = useNavigate();
// 	const { updateUser } = useContext(UserContext);
//
// 	useEffect(() => {
// 		// Try to fetch user info from the backend (cookies should be set)
// 		fetch('/api/auth/google/callback', {
// 			credentials: 'include',
// 		})
// 			.then(async (res) => {
// 				if (!res.ok) {
// 					// If backend returns error (e.g., not registered), redirect to login with error
// 					navigate('/login?error=notfound');
// 					return;
// 				}
// 				const data = await res.json();
// 				const { userType, userData } = data;
// 				const token = document.cookie
// 					.split('; ')
// 					.find((row) => row.startsWith('token='))?.split('=')[1];
// 				sessionStorage.setItem('token', token);
// 				sessionStorage.setItem('role', userType);
// 				sessionStorage.setItem('loginUser', JSON.stringify(userData));
//
// 				updateUser();
// 				navigate('/');
// 			})
// 			.catch(() => {
// 				navigate('/login?error=notfound');
// 			});
// 	}, [navigate, updateUser]);
//
// 	return <div>Logging in with Google...</div>;
// };
//
// export default GoogleAuthCallback;

import { useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { UserContext } from '../../src/contexts/UserContext';

const GoogleAuthCallback = () => {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const { updateUser } = useContext(UserContext);

	useEffect(() => {
		// Check if there's an error from the backend redirect
		const error = searchParams.get('error');
		if (error) {
			navigate('/login?error=notfound');
			return;
		}

		// Extract token and userType from cookies
		const getCookie = (name) => {
			const value = `; ${document.cookie}`;
			const parts = value.split(`; ${name}=`);
			if (parts.length === 2) return parts.pop().split(';').shift();
		};

		const token = getCookie('token');
		const userType = getCookie('userType');

		if (token && userType) {
			// Get user data from backend
			fetch('/api/auth/me', {
				credentials: 'include',
			})
				.then(async (res) => {
					if (res.ok) {
						const userData = await res.json();
						sessionStorage.setItem('token', token);
						sessionStorage.setItem('role', userType);
						sessionStorage.setItem('loginUser', JSON.stringify(userData));
						updateUser();
						navigate('/');
					} else {
						navigate('/login?error=notfound');
					}
				})
				.catch(() => {
					navigate('/login?error=notfound');
				});
		} else {
			// If no cookies found, redirect to login with error
			navigate('/login?error=notfound');
		}
	}, [navigate, searchParams, updateUser]);

	return <div>Logging in with Google...</div>;
};

export default GoogleAuthCallback;
