import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { FullScreenLoader } from './LoadingScreens.jsx'

// Wrap any route element that requires an authenticated session.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <FullScreenLoader label="Verifying your session…" />

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  }

  return children
}
