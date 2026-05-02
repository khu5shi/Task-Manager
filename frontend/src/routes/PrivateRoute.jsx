import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const PrivateRoute = ({ allowedRoles }) => {
  const { user, initialized } = useAuth()

  if (!initialized) {
    return null
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const fallback = user.role === 'admin' ? '/admin/dashboard' : '/user/dashboard'
    return <Navigate to={fallback} replace />
  }

  return <Outlet />
}

export default PrivateRoute
