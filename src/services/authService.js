// Business-logic layer for authentication. AuthContext.jsx (existing, left
// untouched) currently calls supabase.auth.* directly — this service exists
// so that call surface can be migrated into ONE place over time, and so the
// production/no-Supabase guard (architecture review §10, Critical) lives in
// code, not just as a documented convention.
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { readJSON, writeJSON, clearAllBkardKeys } from '../lib/storage.js'
import { STORAGE_KEYS } from '../constants/storageKeys.js'
import { selectProfile, upsertProfile } from '../supabase/queries/profiles.js'

function assertProductionSafety() {
  if (import.meta.env.PROD && !isSupabaseConfigured()) {
    // Refuse to run the no-password localStorage fallback in a real
    // production build — this is the fix for the Critical finding that
    // login() would accept any password for any email if Supabase env
    // vars were missing on a live deploy.
    throw new Error(
      'Bkard cannot start: Supabase is not configured in a production build. ' +
        'Refusing to fall back to insecure local-only authentication.'
    )
  }
}

export async function signUp({ fullName, email, password, company, jobTitle }) {
  assertProductionSafety()

  const record = {
    id: crypto.randomUUID(),
    fullName,
    email,
    company: company || '',
    jobTitle: jobTitle || '',
    createdAt: new Date().toISOString()
  }

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
    if (error) throw error
    if (data?.user) record.id = data.user.id

    const { error: profileError } = await upsertProfile(record.id, {
      full_name: fullName,
      email,
      company: company || '',
      job_title: jobTitle || ''
    })
    if (profileError) throw profileError
  }

  writeJSON(STORAGE_KEYS.USER, record)
  return record
}

export async function signIn({ email, password }) {
  assertProductionSafety()

  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    const su = data.user

    const { data: profile } = await selectProfile(su.id)
    const record = {
      id: su.id,
      email: su.email,
      fullName: profile?.full_name || su.user_metadata?.full_name || email.split('@')[0],
      company: profile?.company || '',
      jobTitle: profile?.job_title || ''
    }
    writeJSON(STORAGE_KEYS.USER, record)
    return { record, gstVerified: Boolean(profile?.gst_verified), isPremium: Boolean(profile?.is_premium) }
  }

  // Local-only demo mode (dev only — assertProductionSafety() above blocks
  // this path in a production build).
  const existing = readJSON(STORAGE_KEYS.USER, null)
  const record = existing && existing.email === email
    ? existing
    : { id: crypto.randomUUID(), fullName: email.split('@')[0], email, company: '', jobTitle: '' }

  writeJSON(STORAGE_KEYS.USER, record)
  return { record, gstVerified: Boolean(readJSON(STORAGE_KEYS.GST_VERIFIED, false)), isPremium: Boolean(readJSON(STORAGE_KEYS.IS_PREMIUM, false)) }
}

export async function signOut() {
  if (isSupabaseConfigured()) {
    await supabase.auth.signOut()
  }
  // Fixes the Critical localStorage-sync finding (§9): the original
  // logout() only removed bkard_user, leaving cards/premium/download-count/
  // GST status behind for the next person on a shared device.
  clearAllBkardKeys(STORAGE_KEYS)
}

export async function getSession() {
  if (!isSupabaseConfigured()) return null
  const { data } = await supabase.auth.getSession()
  return data?.session || null
}

// Fixes the Critical auth finding (§11): the original AuthContext never
// subscribed to auth state changes after the initial mount, so an expired
// or revoked session would silently keep rendering as "authenticated."
// Returns an unsubscribe function.
export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured()) return () => {}
  const { data } = supabase.auth.onAuthStateChange((event, session) => callback(event, session))
  return () => data?.subscription?.unsubscribe()
}

export async function refreshProfile(userId) {
  if (!isSupabaseConfigured()) return null
  const { data, error } = await selectProfile(userId)
  if (error) throw error
  return data
}
