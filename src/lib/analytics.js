import { supabase, isSupabaseConfigured } from './supabaseClient.js'

const VISITOR_KEY = 'bkard_visitor_id'

function getVisitorHash() {
  try {
    let id = localStorage.getItem(VISITOR_KEY)
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem(VISITOR_KEY, id)
    }
    return id
  } catch {
    return crypto.randomUUID()
  }
}

export async function recordCardEvent(cardId, eventType) {
  if (!isSupabaseConfigured() || !cardId || !eventType) return false
  try {
    const { data, error } = await supabase.rpc('record_card_event', {
      p_card_id: cardId,
      p_event_type: eventType,
      p_visitor_hash: getVisitorHash()
    })
    if (error) {
      console.error('[Bkard] Failed to record analytics event', error)
      return false
    }
    return Boolean(data)
  } catch (err) {
    console.error('[Bkard] Failed to record analytics event', err)
    return false
  }
}
