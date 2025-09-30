import { Outlet } from 'react-router-dom'
import PropTypes from 'prop-types'
import ProtectedRoute from './ProtectedRoute'

const ProtectedLayout = ({ allowedRoles }) => {
	return (
		<ProtectedRoute allowedRoles={allowedRoles}>
			<Outlet />
		</ProtectedRoute>
	)
}

ProtectedLayout.propTypes = {
	allowedRoles: PropTypes.arrayOf(PropTypes.string),
}

export default ProtectedLayout
