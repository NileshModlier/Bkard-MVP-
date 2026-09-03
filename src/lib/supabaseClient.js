import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase is optional at runtime — the app fully works on localStorage
// if these env vars are not configured. When configured, hooks/context
// transparently sync to Supabase in addition to localStorage.
export const supabase = url && anonKey ? createClient(url, anonKey) : null

export const isSupabaseConfigured = () => Boolean(supabase)
