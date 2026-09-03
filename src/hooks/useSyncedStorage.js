// NEW hook — fixes the multi-tab consistency gap in the review (§8, §9):
// none of the existing contexts (Auth/Card/Premium) listen for the
// browser's `storage` event, so upgrading to Premium in one tab (or
// logging out) never updates state in another open tab until a full
// reload. This hook is a shared primitive any context can adopt to close
// that gap without writing bespoke listener code four times.
import { useCallback, useEffect, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage.js'

export function useSyncedStorage(key, initialValue) {
  const [value, setValue] = useState(() => readJSON(key, initialValue))

  useEffect(() => {
    function handleStorageEvent(e) {
      if (e.key !== key) return
      setValue(readJSON(key, initialValue))
    }
    window.addEventListener('storage', handleStorageEvent)
    return () => window.removeEventListener('storage', handleStorageEvent)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        writeJSON(key, resolved)
        return resolved
      })
    },
    [key]
  )

  return [value, set]
}
