// Small helpers for building/reading dynamic route segments, consumed by
// routes/paths.js and any component that needs the current share URL.
export function buildShareUrl(cardId, origin = window.location.origin) {
  return `${origin}/cards/share/${cardId}`
}

export function extractCardIdFromShareUrl(url) {
  const match = String(url).match(/\/cards\/share\/([^/?#]+)/)
  return match ? match[1] : null
}
