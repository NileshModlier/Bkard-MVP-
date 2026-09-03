// Business-logic layer for professional-networking connection requests.
// Fixes the schema/UI mismatch found in the review (§19): the original
// CardShare.jsx incremented a non-existent `cards.connections` column via
// updateCard(). This service writes real rows to the `connections` table
// (which the schema already defined) and derives the count from it.
import { isSupabaseConfigured } from '../lib/supabaseClient.js'
import { readJSON, writeJSON } from '../lib/storage.js'
import { STORAGE_KEYS } from '../constants/storageKeys.js'
import { insertConnectionRequest, countConnectionsForCard } from '../supabase/queries/connections.js'

const LOCAL_CONNECTIONS_KEY = 'bkard_connections' // local-demo-mode only, not a shared STORAGE_KEYS
                                                    // entry since it models a table, not a top-level app key

function readLocalConnections() {
  return readJSON(LOCAL_CONNECTIONS_KEY, [])
}

export async function requestConnection({ cardId, requesterId, requesterName, requesterEmail }) {
  if (isSupabaseConfigured()) {
    const { data, error } = await insertConnectionRequest({ cardId, requesterId, requesterName, requesterEmail })
    if (error) throw error
    return data
  }

  const record = {
    id: crypto.randomUUID(),
    cardId,
    requesterId: requesterId || null,
    requesterName: requesterName || null,
    requesterEmail: requesterEmail || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  }
  writeJSON(LOCAL_CONNECTIONS_KEY, [record, ...readLocalConnections()])
  return record
}

export async function getConnectionCount(cardId) {
  if (isSupabaseConfigured()) {
    const { count, error } = await countConnectionsForCard(cardId)
    if (error) throw error
    return count
  }
  return readLocalConnections().filter((c) => c.cardId === cardId).length
}
