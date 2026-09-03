// NEW hook — subscribes a card owner to new connection requests in
// real time. Nothing in the original build subscribed to Postgres changes
// at all, despite "professional networking" being a headline feature
// (review §19). Degrades to a no-op when Supabase isn't configured.
import { useEffect, useState } from 'react'
import { subscribeToConnectionRequests } from '../supabase/realtime/connectionsChannel.js'

export function useRealtimeConnections(cardIds) {
  const [latestRequest, setLatestRequest] = useState(null)

  useEffect(() => {
    if (!cardIds?.length) return undefined

    const unsubscribe = subscribeToConnectionRequests(cardIds, (newConnection) => {
      setLatestRequest(newConnection)
    })

    return () => unsubscribe?.()
  }, [cardIds])

  return { latestRequest }
}
