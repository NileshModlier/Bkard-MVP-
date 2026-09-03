// Bkard/India-business-specific GSTIN shape validation. Pulled out of
// AuthContext.jsx (which is left untouched) so the same rule can be
// referenced from services/gstVerificationService.js as a client-side
// pre-check, without duplicating the regex in two files that could drift.
//
// NOTE: this is a SHAPE check only, not a real verification — it confirms
// the string looks like a GSTIN, it does not confirm the business exists.
// Real verification must happen server-side (see services/gstVerificationService.js).

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/

export function isValidGstinShape(gstin) {
  if (typeof gstin !== 'string') return false
  return GSTIN_PATTERN.test(gstin.trim().toUpperCase())
}

export function normalizeGstin(gstin) {
  return typeof gstin === 'string' ? gstin.trim().toUpperCase() : ''
}
