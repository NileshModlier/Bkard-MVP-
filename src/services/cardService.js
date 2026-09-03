// Business-logic layer for cards: decides Supabase-vs-localStorage exactly
// once, and is the ONLY place `owner_id` gets stamped onto a card — the
// direct fix for the Critical RLS-mismatch finding in the architecture
// review (§19), where the original CardContext.createCard omitted it.
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS } from '../constants/storageKeys.js'
import { isSupabaseConfigured } from '../lib/supabaseClient.js'
import {
  selectOwnedCards,
  selectPublicCardById,
  insertCard,
  updateCardRow,
  deleteCardRow,
  incrementCardViews
} from '../supabase/queries/cards.js'
import { CARD_TEMPLATES } from '../lib/constants.js'

function readLocalCards() {
  return readJSON(STORAGE_KEYS.CARDS, [])
}
function writeLocalCards(cards) {
  writeJSON(STORAGE_KEYS.CARDS, cards)
  return cards
}

export async function getOwnedCards(ownerId) {
  if (isSupabaseConfigured() && ownerId) {
    const { data, error } = await selectOwnedCards(ownerId)
    if (error) throw error
    return data
  }
  return readLocalCards()
}

// Fixes the most severe finding in the review (§19): a visitor on a
// different device/browser needs to be able to load a card by id WITHOUT
// depending on the owner's local `cards` array. This function is the data
// path behind the new hooks/usePublicCard.js.
export async function getPublicCard(id) {
  if (isSupabaseConfigured()) {
    const { data, error } = await selectPublicCardById(id)
    if (error) throw error
    return data
  }
  // Local-only fallback (demo mode): the only card store we have is this
  // browser's own localStorage.
  return readLocalCards().find((c) => c.id === id) || null
}

export async function createCard(draft, ownerId) {
  const templateId = draft.templateId || CARD_TEMPLATES[0].id
  const card = {
    id: crypto.randomUUID(),
    templateId,
    fullName: draft.fullName || '',
    jobTitle: draft.jobTitle || '',
    company: draft.company || '',
    email: draft.email || '',
    phone: draft.phone || '',
    website: draft.website || '',
    address: draft.address || '',
    bio: draft.bio || '',
    avatarUrl: draft.avatarUrl || '',
    socials: draft.socials || {},
    views: 0,
    connections: 0,
    createdAt: new Date().toISOString()
  }

  if (isSupabaseConfigured()) {
    if (!ownerId) throw new Error('createCard requires an authenticated ownerId when Supabase is configured')
    const { data, error } = await insertCard(card, ownerId)
    if (error) throw error
    return data
  }

  const cards = writeLocalCards([card, ...readLocalCards()])
  return cards[0]
}

export async function updateCard(id, updates) {
  if (isSupabaseConfigured()) {
    // Only forward columns that actually exist on `cards` — `connections`
    // is intentionally excluded; that count now lives in the `connections`
    // table via services/connectionService.js.
    const { connections, ...validColumns } = updates
    const { data, error } = await updateCardRow(id, validColumns)
    if (error) throw error
    return data
  }
  const next = readLocalCards().map((c) => (c.id === id ? { ...c, ...updates } : c))
  writeLocalCards(next)
  return next.find((c) => c.id === id)
}

export async function deleteCard(id) {
  if (isSupabaseConfigured()) {
    const { error } = await deleteCardRow(id)
    if (error) throw error
    return true
  }
  writeLocalCards(readLocalCards().filter((c) => c.id !== id))
  return true
}

export async function incrementView(id) {
  if (isSupabaseConfigured()) {
    const { error } = await incrementCardViews(id)
    if (error) throw error
    return true
  }
  const next = readLocalCards().map((c) => (c.id === id ? { ...c, views: (c.views || 0) + 1 } : c))
  writeLocalCards(next)
  return true
}
