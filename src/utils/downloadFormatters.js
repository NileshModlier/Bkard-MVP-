// Display-string formatting for the free-tier download gate. Pure functions,
// no state, no storage access — consumed by PremiumBanner, CardShare, and
// the new useDownloadGuard hook so the "X of Y downloads remaining" copy
// lives in exactly one place.
import { FREE_DOWNLOAD_LIMIT } from '../constants/downloadLimits.js'

export function formatRemainingDownloads(downloadCount, isPremium) {
  if (isPremium) return 'Unlimited downloads'
  const remaining = Math.max(0, FREE_DOWNLOAD_LIMIT - downloadCount)
  return `${remaining} of ${FREE_DOWNLOAD_LIMIT} free downloads left`
}

export function downloadProgressPercent(downloadCount) {
  return Math.min(100, Math.round((downloadCount / FREE_DOWNLOAD_LIMIT) * 100))
}

export function isDownloadLimitReached(downloadCount, isPremium) {
  if (isPremium) return false
  return downloadCount >= FREE_DOWNLOAD_LIMIT
}
