// Business-logic layer for card view tracking. Fixes the React-anti-pattern
// finding in the review (§6): the original CardShare.jsx counted views via
// a component-local useRef guard, which resets on every navigation/remount
// and double-counts under React 18 StrictMode in dev — trivially inflatable
// by refreshing the page. This service is the single call site for
// "record a view," so the dedupe strategy can be fixed in one place
// (e.g., a signed session cookie + a unique constraint server-side) without
// hunting through page components.
import { incrementView } from './cardService.js'

const viewedThisSession = new Set()

// Session-scoped dedupe only (resets on tab close) — a real production
// implementation should move this check server-side (e.g. a unique
// constraint on (card_id, visitor_hash, day) in an `analytics_events`
// table) so it can't be defeated by clearing sessionStorage. Flagged
// explicitly rather than silently shipped as if it were a complete fix.
export async function recordCardView(cardId) {
  if (viewedThisSession.has(cardId)) return false
  viewedThisSession.add(cardId)
  await incrementView(cardId)
  return true
}
