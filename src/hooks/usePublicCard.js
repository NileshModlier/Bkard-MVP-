// NEW hook — the critical fix for the review's §19 finding. CardShare.jsx
// currently calls useCards().getCardById(id), which only searches the
// CURRENT BROWSER's in-memory cards array. A visitor on a different
// device/browser scanning a QR code gets "Card not found" even when
// Supabase is fully configured, because nothing ever fetches by id.
//
// This hook is deliberately independent of CardContext/useCards — it talks
// directly to cardService.getPublicCard(), which queries Supabase's
// `cards` table via the public RLS policy (is_public = true), with no
// dependency on the viewer having an authenticated session or any local
// cards state at all.
import { useEffect, useState, useCallback } from 'react'
import { getPublicCard } from '../services/cardService.js'

export function usePublicCard(id) {
  const [card, setCard] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refetch = useCallback(async () => {
    if (!id) return
    setLoading(true)
    setError(null)
    try {
      const result = await getPublicCard(id)
      setCard(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    refetch()
  }, [refetch])

  return { card, loading, error, refetch }
}
