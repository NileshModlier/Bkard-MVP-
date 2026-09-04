import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS, CARD_TEMPLATES } from '../lib/constants.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

const CardContext = createContext(null)

export function CardProvider({ children }) {
  const [cards, setCards] = useState(() => readJSON(STORAGE_KEYS.CARDS, []))

  useEffect(() => {
    writeJSON(STORAGE_KEYS.CARDS, cards)
  }, [cards])

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
    if (isSupabaseConfigured()) {
      supabase.from('cards').update(updates).eq('id', id)
    }
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
