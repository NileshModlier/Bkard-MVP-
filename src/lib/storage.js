// Thin, safe localStorage wrapper used as the source of truth (with an
// optional Supabase sync layer on top, wired in via context providers).

export function readJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key)
    if (raw === null || raw === undefined) return fallback
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`[storage] failed to read ${key}`, err)
    return fallback
  }
}

export function writeJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (err) {
    console.warn(`[storage] failed to write ${key}`, err)
    return false
  }
}

export function removeKey(key) {
  try {
    localStorage.removeItem(key)
  } catch (err) {
    console.warn(`[storage] failed to remove ${key}`, err)
  }
}

export function clearAllBkardKeys(keys) {
  Object.values(keys).forEach(removeKey)
}
