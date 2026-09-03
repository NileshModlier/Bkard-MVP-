// Bkard-specific card display helpers. Pure functions — no React, no fetch.
import { CARD_TEMPLATES } from '../lib/constants.js'

export function templateForId(templateId) {
  return CARD_TEMPLATES.find((t) => t.id === templateId) || CARD_TEMPLATES[0]
}

export function cardInitial(card) {
  return (card?.company || card?.fullName || 'B').trim().slice(0, 1).toUpperCase()
}

export function formatCardSubtitle(card) {
  if (!card) return ''
  return [card.jobTitle, card.company].filter(Boolean).join(' · ')
}

export function isCardComplete(card) {
  return Boolean(card?.fullName?.trim() && card?.jobTitle?.trim() && card?.email?.trim())
}
