// Re-exports the existing STORAGE_KEYS (src/lib/constants.js is left untouched)
// and adds the DRAFT_CARD key that the create wizard was already using as a
// stray string literal (`bkard_card_draft` in pages/create/Details.jsx and
// Templates.jsx) — centralizing it here removes that duplication risk.
import { STORAGE_KEYS as BASE_STORAGE_KEYS } from '../lib/constants.js'

export const STORAGE_KEYS = {
  ...BASE_STORAGE_KEYS,
  DRAFT_CARD: 'bkard_card_draft'
}
