import { readJSON, writeJSON } from './storage.js'
import { STORAGE_KEYS, FREE_DOWNLOAD_LIMIT } from './constants.js'

// Central gate for every "download" action (PNG, PDF, vCard) so the
// free-tier limit and premium bypass logic live in exactly one place.

export function getDownloadCount() {
  return readJSON(STORAGE_KEYS.DOWNLOAD_COUNT, 0) || 0
}

export function getIsPremium() {
  return Boolean(readJSON(STORAGE_KEYS.IS_PREMIUM, false))
}

export function getRemainingDownloads() {
  if (getIsPremium()) return Infinity
  return Math.max(0, FREE_DOWNLOAD_LIMIT - getDownloadCount())
}

export function canDownload() {
  if (getIsPremium()) return true
  return getDownloadCount() < FREE_DOWNLOAD_LIMIT
}

export function registerDownload() {
  const current = getDownloadCount()
  const next = current + 1
  writeJSON(STORAGE_KEYS.DOWNLOAD_COUNT, next)
  return next
}

export function setPremium(value) {
  writeJSON(STORAGE_KEYS.IS_PREMIUM, value)
}
