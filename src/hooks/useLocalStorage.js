import { useCallback, useState } from 'react'
import { readJSON, writeJSON } from '../lib/storage.js'

// Generic localStorage-backed state hook for one-off UI state
// (e.g. wizard step, dismissed banners) that doesn't need a full context.
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => readJSON(key, initialValue))

  const set = useCallback((next) => {
    setValue((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next
      writeJSON(key, resolved)
      return resolved
    })
  }, [key])

  return [value, set]
}
