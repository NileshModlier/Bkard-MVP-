import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS, CARD_TEMPLATES } from '../lib/constants.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { useAuth } from '../hooks/useAuth.js'

const CardContext = createContext(null)

function mapRowToCard(row) {
  return {
    id: row.id,
    templateId: row.template_id,
    fullName: row.full_name,
    jobTitle: row.job_title,
    company: row.company || '',
    email: row.email || '',
    phone: row.phone || '',
    website: row.website || '',
    address: row.address || '',
    bio: row.bio || '',
    avatarUrl: row.avatar_url || '',
    socials: row.socials && typeof row.socials === 'object' ? row.socials : {},
    views: row.views || 0,
    connections: 0,
    createdAt: row.created_at || new Date().toISOString()
  }
}

function mapCardUpdatesToRow(updates) {
  const row = {}
  if ('templateId' in updates) row.template_id = updates.templateId
  if ('fullName' in updates) row.full_name = updates.fullName
  if ('jobTitle' in updates) row.job_title = updates.jobTitle
  if ('company' in updates) row.company = updates.company
  if ('email' in updates) row.email = updates.email
  if ('phone' in updates) row.phone = updates.phone
  if ('website' in updates) row.website = updates.website
  if ('address' in updates) row.address = updates.address
  if ('bio' in updates) row.bio = updates.bio
  if ('avatarUrl' in updates) row.avatar_url = updates.avatarUrl
  if ('socials' in updates) row.socials = updates.socials
  if ('views' in updates) row.views = updates.views
  if ('isPublic' in updates) row.is_public = updates.isPublic
  return row
}

export function CardProvider({ children }) {
  const { isAuthenticated, user, loading } = useAuth()
  const [cards, setCards] = useState(() => readJSON(STORAGE_KEYS.CARDS, []))

  useEffect(() => {
    writeJSON(STORAGE_KEYS.CARDS, cards)
  }, [cards])

  useEffect(() => {
    if (loading) return undefined
    if (!isSupabaseConfigured() || !isAuthenticated) return undefined

    let cancelled = false

    async function loadOwnedCards() {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) {
          console.error('[Bkard] Failed to resolve Supabase user for card load', authError)
          return
        }

        const ownerId = authData?.user?.id
        if (!ownerId) return

        const { data, error } = await supabase
          .from('cards')
          .select('*')
          .eq('owner_id', ownerId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[Bkard] Failed to load cards from Supabase', error)
          return
        }

        if (!cancelled && Array.isArray(data)) {
          setCards(data.map(mapRowToCard))
        }
      } catch (err) {
        console.error('[Bkard] Failed to load cards from Supabase', err)
      }
    }

    loadOwnedCards()
    return () => {
      cancelled = true
    }
  }, [loading, isAuthenticated, user?.id])

  const createCard = useCallback(async (draft) => {
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

    setCards((prev) => [card, ...prev])

    if (isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError) {
          console.error('[Bkard] Failed to resolve Supabase user for card insert', authError)
        }
        const ownerId = authData?.user?.id
        if (ownerId) {
          const { error: insertError } = await supabase.from('cards').insert({
            id: card.id,
            owner_id: ownerId,
            template_id: card.templateId,
            full_name: card.fullName,
            job_title: card.jobTitle,
            company: card.company,
            email: card.email,
            phone: card.phone,
            website: card.website,
            address: card.address,
            bio: card.bio,
            avatar_url: card.avatarUrl,
            socials: card.socials
          }).select()
          if (insertError) {
            console.error('[Bkard] Failed to insert card into Supabase', insertError)
          }
        }
      } catch (err) {
        console.error('[Bkard] Failed to insert card into Supabase', err)
      }
    }

    return card
  }, [])

  const updateCard = useCallback((id, updates) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))

    if (!isSupabaseConfigured()) return

    const row = mapCardUpdatesToRow(updates)
    if (Object.keys(row).length === 0) return

    supabase
      .from('cards')
      .update(row)
      .eq('id', id)
      .then(({ error }) => {
        if (error) console.error('[Bkard] Failed to update card in Supabase', error)
      })
      .catch((err) => {
        console.error('[Bkard] Failed to update card in Supabase', err)
      })
  }, [])

  const deleteCard = useCallback((id) => {
    setCards((prev) => prev.filter((c) => c.id !== id))
    if (isSupabaseConfigured()) {
      supabase.from('cards').delete().eq('id', id)
    }
  }, [])

  const incrementView = useCallback((id) => {
    setCards((prev) => prev.map((c) => (c.id === id ? { ...c, views: (c.views || 0) + 1 } : c)))
  }, [])

  const getCardById = useCallback((id) => cards.find((c) => c.id === id) || null, [cards])

  const value = { cards, createCard, updateCard, deleteCard, incrementView, getCardById, templates: CARD_TEMPLATES }

  return <CardContext.Provider value={value}>{children}</CardContext.Provider>
}

export function useCardContext() {
  const ctx = useContext(CardContext)
  if (!ctx) throw new Error('useCardContext must be used within CardProvider')
  return ctx
}
