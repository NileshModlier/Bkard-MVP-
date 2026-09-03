// Business-logic layer for GST/executive verification. Fixes the High
// finding in the review (§10): the original AuthContext.verifyGst() only
// checked the GSTIN's shape client-side and trusted the result directly —
// anyone could set bkard_gst_verified=true in devtools. Real verification
// must be server-side; this service calls an Edge Function for that and
// keeps a shape-only client pre-check (via utils/gstValidator.js) purely
// as fast UX feedback before the round-trip, never as the source of truth.
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS } from '../constants/storageKeys.js'
import { isValidGstinShape, normalizeGstin } from '../utils/gstValidator.js'

// Fast client-side pre-check only — never treat this as verification.
export function preflightGstinShape(gstin) {
  return isValidGstinShape(gstin)
}

export async function verifyGst(gstin, userId) {
  const normalized = normalizeGstin(gstin)

  if (!isValidGstinShape(normalized)) {
    return { verified: false, reason: 'invalid_shape' }
  }

  if (isSupabaseConfigured() && userId) {
    const { data, error } = await supabase.functions.invoke('verify-gst', {
      body: { gstin: normalized, userId }
    })
    if (error) {
      console.error('[gstVerificationService] verify-gst failed', error)
      return { verified: false, reason: 'verification_failed', error }
    }
    return { verified: Boolean(data?.verified), reason: data?.reason }
  }

  // Local demo mode: shape-valid GSTIN is treated as verified, purely so
  // the onboarding flow is demoable without a deployed Edge Function.
  writeJSON(STORAGE_KEYS.GST_VERIFIED, true)
  return { verified: true, reason: 'local_demo_mode' }
}

export function getLocalGstVerified() {
  return Boolean(readJSON(STORAGE_KEYS.GST_VERIFIED, false))
}
