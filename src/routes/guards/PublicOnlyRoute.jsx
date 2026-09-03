// NEW guard — the original build had no way to prevent an already-
// authenticated user from being shown /auth/login or onboarding again.
// This guard does the inverse of the existing ProtectedRoute
// (src/components/common/ProtectedRoute.jsx, left untouched): it redirects
// AWAY from public-only pages when a session already exists.
//
// This guard controls rendering only. It is not a security boundary.
// The security boundary is Supabase RLS policies in supabase/migrations/.
// Removing or bypassing this guard changes UX, not data access.
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { FullScreenLoader } from '../../components/common/LoadingScreens.jsx'
import { PATHS } from '../paths.js'

export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <FullScreenLoader label="Loading Bkard…" />
  if (isAuthenticated) return <Navigate to={PATHS.DASHBOARD} replace />

  return children
}
