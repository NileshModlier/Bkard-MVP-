// Business-logic layer for premium status. This is the fix for the
// split-brain state finding (§8): the original build had TWO independent
// implementations of "is this user premium" — one in PremiumContext's own
// useState, one in lib/downloadManager.js's getIsPremium(). This service
// is now the single place that decides the answer.
//
// Deliberately exports NO client-callable "setPremium(true)" that writes
// directly — real upgrades must be written by a trusted server context
// (Stripe webhook -> Edge Function using the service_role key). The one
// exception is the explicit local-demo-mode path, clearly isolated below,
// which only ever runs when Supabase isn't configured at all.
import { isSupabaseConfigured } from '../lib/supabaseClient.js'
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS } from '../constants/storageKeys.js'
import { selectProfile } from '../supabase/queries/profiles.js'

export async function getPremiumStatus(userId) {
  if (isSupabaseConfigured() && userId) {
    const { data, error } = await selectProfile(userId)
    if (error) throw error
    return Boolean(data?.is_premium)
  }
  return Boolean(readJSON(STORAGE_KEYS.IS_PREMIUM, false))
}

// Local-demo-mode only. In a real deployment this function should never be
// called — premium status flips automatically when the Stripe webhook
// updates `profiles.is_premium`, and the client just re-reads it via
// getPremiumStatus() above (ideally via the realtime channel or a refetch
// after returning from Stripe Checkout).
export function upgradeToPremium_localDemoOnly() {
  if (isSupabaseConfigured()) {
    throw new Error(
      'upgradeToPremium_localDemoOnly() must not be called when Supabase is configured — ' +
        'premium status must be set by a server-side Stripe webhook, not the client.'
    )
  }
  writeJSON(STORAGE_KEYS.IS_PREMIUM, true)
  return true
}
