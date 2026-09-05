import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { readJSON, writeJSON, removeKey } from '../lib/storage.js'
import { STORAGE_KEYS } from '../lib/constants.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readJSON(STORAGE_KEYS.USER, null))
  const [gstVerified, setGstVerified] = useState(() => Boolean(readJSON(STORAGE_KEYS.GST_VERIFIED, false)))
  const [loading, setLoading] = useState(true)

  // Restore/refresh a Supabase session on load, if configured.
  useEffect(() => {
    let active = true
    async function init() {
      if (isSupabaseConfigured()) {
        const { data } = await supabase.auth.getSession()
        if (active && data?.session?.user) {
          const su = data.session.user
          const merged = {
            id: su.id,
            email: su.email,
            fullName: su.user_metadata?.full_name || user?.fullName || '',
            company: user?.company || '',
            jobTitle: user?.jobTitle || ''
          }
          setUser(merged)
          writeJSON(STORAGE_KEYS.USER, merged)
        }
      }
      if (active) setLoading(false)
    }
    init()
    return () => { active = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signup = useCallback(async ({ fullName, email, password, company, jobTitle }) => {
    console.log('[Bkard diag] signup() started')
    console.log('[Bkard diag] signup() isSupabaseConfigured()', isSupabaseConfigured())

    const record = {
      id: crypto.randomUUID(),
      fullName,
      email,
      company: company || '',
      jobTitle: jobTitle || '',
      createdAt: new Date().toISOString()
    }

    if (isSupabaseConfigured()) {
      console.log('[Bkard diag] signup() entering Supabase branch')
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } }
      })
      console.log('[Bkard diag] signup() signUp() result', { data, error })
      if (error) {
        console.error('[Bkard diag] signup() signUp() error', error)
        throw error
      }
      if (data?.user) record.id = data.user.id
      await supabase.from('profiles').upsert({
        id: record.id,
        full_name: fullName,
        email,
        company,
        job_title: jobTitle
      })
    }

    setUser(record)
    writeJSON(STORAGE_KEYS.USER, record)
    return record
  }, [])

  const login = useCallback(async ({ email, password }) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      const su = data.user
      const record = {
        id: su.id,
        email: su.email,
        fullName: su.user_metadata?.full_name || email.split('@')[0],
        company: '',
        jobTitle: ''
      }
      setUser(record)
      writeJSON(STORAGE_KEYS.USER, record)
      return record
    }

    // localStorage-only fallback login: accept any existing local user,
    // or create a lightweight session record so the app is usable
    // without a Supabase project configured.
    const existing = readJSON(STORAGE_KEYS.USER, null)
    const record = existing && existing.email === email
      ? existing
      : { id: crypto.randomUUID(), fullName: email.split('@')[0], email, company: '', jobTitle: '' }

    setUser(record)
    writeJSON(STORAGE_KEYS.USER, record)
    return record
  }, [])

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut()
    }
    setUser(null)
    removeKey(STORAGE_KEYS.USER)
  }, [])

  const updateProfile = useCallback((updates) => {
    setUser((prev) => {
      const next = { ...prev, ...updates }
      writeJSON(STORAGE_KEYS.USER, next)
      return next
    })
  }, [])

  const verifyGst = useCallback((gstNumber) => {
    // Deterministic mock-verification: valid-shaped GSTIN => verified.
    const isValidShape = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/.test(gstNumber.trim())
    setGstVerified(isValidShape)
    writeJSON(STORAGE_KEYS.GST_VERIFIED, isValidShape)
    return isValidShape
  }, [])

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    gstVerified,
    signup,
    login,
    logout,
    updateProfile,
    verifyGst
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider')
  return ctx
}
