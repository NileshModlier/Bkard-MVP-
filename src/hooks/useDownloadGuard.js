// NEW hook — extracts the paywall-gating logic that currently lives inline
// inside pages/CardShare.jsx's guardDownload() closure, so it's testable in
// isolation and reusable anywhere a download action is triggered. Calls
// the new services/downloadService.js (server-enforced limit) instead of
// PremiumContext's client-only counter, addressing the Critical
// bypassable-download-limit finding (§12).
import { useCallback, useState } from 'react'
import { useAuth } from './useAuth.js'
import { usePremium } from './usePremium.js'
import { registerDownload } from '../services/downloadService.js'

export function useDownloadGuard() {
  const { user } = useAuth()
  const { isPremium } = usePremium()
  const [paywallOpen, setPaywallOpen] = useState(false)

  // Wrap any export action (PNG/PDF/vCard). Runs `action()` only if the
  // download is allowed; otherwise opens the paywall and skips it.
  const guardDownload = useCallback(
    async (cardId, format, action) => {
      const { allowed } = await registerDownload({
        cardId,
        ownerId: user?.id,
        format,
        isPremium
      })

      if (!allowed) {
        setPaywallOpen(true)
        return false
      }

      await action()
      return true
    },
    [user?.id, isPremium]
  )

  return { guardDownload, paywallOpen, setPaywallOpen }
}
