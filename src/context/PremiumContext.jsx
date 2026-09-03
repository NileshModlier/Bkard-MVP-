import { createContext, useContext, useState, useCallback } from 'react'
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS, FREE_DOWNLOAD_LIMIT } from '../lib/constants.js'
import { getDownloadCount, registerDownload as registerDownloadRaw } from '../lib/downloadManager.js'

const PremiumContext = createContext(null)

export function PremiumProvider({ children }) {
  const [isPremium, setIsPremium] = useState(() => Boolean(readJSON(STORAGE_KEYS.IS_PREMIUM, false)))
  const [downloadCount, setDownloadCount] = useState(() => getDownloadCount())

  const remaining = isPremium ? Infinity : Math.max(0, FREE_DOWNLOAD_LIMIT - downloadCount)
  const canDownload = isPremium || downloadCount < FREE_DOWNLOAD_LIMIT

  const registerDownload = useCallback(() => {
    if (isPremium) return true
    if (downloadCount >= FREE_DOWNLOAD_LIMIT) return false
    const next = registerDownloadRaw()
    setDownloadCount(next)
    return true
  }, [isPremium, downloadCount])

  const upgradeToPremium = useCallback(() => {
    setIsPremium(true)
    writeJSON(STORAGE_KEYS.IS_PREMIUM, true)
  }, [])

  const value = {
    isPremium,
    downloadCount,
    remaining,
    limit: FREE_DOWNLOAD_LIMIT,
    canDownload,
    registerDownload,
    upgradeToPremium
  }

  return <PremiumContext.Provider value={value}>{children}</PremiumContext.Provider>
}

export function usePremiumContext() {
  const ctx = useContext(PremiumContext)
  if (!ctx) throw new Error('usePremiumContext must be used within PremiumProvider')
  return ctx
}
