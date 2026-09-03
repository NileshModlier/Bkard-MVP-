// NEW guard — route-level premium gate. No page currently requires this,
// but the architecture calls for it to exist so adding a premium-only
// route later (e.g. an advanced analytics page) is a one-line addition
// to routeConfig rather than another bespoke check inline in a page.
//
// This guard controls rendering only. It is not a security boundary.
// Server-side enforcement (RLS + the register-download Edge Function,
// per services/downloadService.js) is what actually protects premium-only
// data — this guard only prevents showing a page's UI shell to a
// non-premium user before they hit a real paywall.
import { Navigate } from 'react-router-dom'
import { usePremium } from '../../hooks/usePremium.js'
import { PATHS } from '../paths.js'

// NOTE: the existing PremiumContext (untouched) does not currently expose a
// `loading` flag — it seeds synchronously from localStorage. Once
// premiumService.getPremiumStatus() is wired in (an async Supabase read),
// PremiumContext should gain a `loading` state and this guard should show
// a loader while it resolves, the same way ProtectedRoute does for auth.
export default function RequirePremium({ children, redirectTo = PATHS.PAYMENT }) {
  const { isPremium } = usePremium()

  if (!isPremium) return <Navigate to={redirectTo} replace />

  return children
}
