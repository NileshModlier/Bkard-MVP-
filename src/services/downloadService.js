// Business-logic layer for the free-tier download gate. This is the fix
// for the Critical finding in the review (§12): the original build
// enforced the 15-download limit ENTIRELY client-side via a localStorage
// counter, resettable by clearing storage, with no server enforcement
// despite a `downloads` table already existing in the schema.
//
// Production path: calls a Supabase Edge Function that atomically checks
// the caller's current download count and inserts a row in one transaction
// (closing the race condition where two rapid downloads both read
// count = 14 client-side and both succeed). The Edge Function itself is
// server infrastructure (supabase/functions/register-download/) and is
// out of scope for this frontend gap-fill — this service calls it and
// degrades gracefully if it isn't deployed yet.
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS } from '../constants/storageKeys.js'
import { FREE_DOWNLOAD_LIMIT } from '../constants/downloadLimits.js'

function readLocalCount() {
  return readJSON(STORAGE_KEYS.DOWNLOAD_COUNT, 0) || 0
}

export async function getDownloadCount(ownerId) {
  if (isSupabaseConfigured() && ownerId) {
    const { count, error } = await supabase
      .from('downloads')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', ownerId)
    if (error) throw error
    return count || 0
  }
  return readLocalCount()
}

// Returns { allowed: boolean, count: number }. Throws only on unexpected
// errors — a denied download is a normal, expected `allowed: false` return,
// not an exception.
export async function registerDownload({ cardId, ownerId, format, isPremium }) {
  if (isPremium) return { allowed: true, count: null }

  if (isSupabaseConfigured() && ownerId) {
    const { data, error } = await supabase.functions.invoke('register-download', {
      body: { cardId, format }
    })
    if (error) {
      // Edge Function not deployed yet, or a genuine failure — fail closed
      // (deny) rather than silently falling back to the bypassable
      // client-side counter, since that fallback is exactly the hole this
      // service exists to close.
      console.error('[downloadService] register-download failed', error)
      return { allowed: false, count: null, error }
    }
    return { allowed: data.allowed, count: data.count }
  }

  // Local-only demo mode: same rule, enforced client-side, clearly scoped
  // to non-production use via authService's assertProductionSafety guard
  // already covering the broader "no Supabase configured" case.
  const current = readLocalCount()
  if (current >= FREE_DOWNLOAD_LIMIT) return { allowed: false, count: current }
  const next = current + 1
  writeJSON(STORAGE_KEYS.DOWNLOAD_COUNT, next)
  return { allowed: true, count: next }
}
