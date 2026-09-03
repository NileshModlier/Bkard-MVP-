// NEW guard — fixes the routing gap in the review (§4): a returning user
// who already completed onboarding (bkard_onboarded=true, written by
// pages/onboarding/Verification.jsx) had no guard preventing them from
// being routed back through the three onboarding screens on every visit.
//
// This guard controls rendering only. It is not a security boundary.
// The security boundary is Supabase RLS policies in supabase/migrations/.
import { Navigate } from 'react-router-dom'
import { readJSON } from '../../lib/storage.js'
import { STORAGE_KEYS } from '../../constants/storageKeys.js'
import { PATHS } from '../paths.js'

export default function RequireOnboarded({ children, redirectTo = PATHS.DASHBOARD }) {
  const onboarded = Boolean(readJSON(STORAGE_KEYS.ONBOARDED, false))

  // Only redirect AWAY from onboarding if already onboarded — this guard
  // is meant to wrap the /onboarding/* routes themselves.
  if (onboarded) return <Navigate to={redirectTo} replace />

  return children
}
