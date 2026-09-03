// supabase/functions/register-download/index.ts
// Thin HTTP wrapper around the register_card_download() SQL function, so
// the frontend's services/downloadService.js has a stable endpoint to call
// via supabase.functions.invoke(). Most of the enforcement logic lives in
// SQL (0005_downloads.sql) precisely so it can't be bypassed by calling
// this function with a crafted request — the atomic check happens in the
// database regardless of what this thin layer does.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  const { cardId, format } = await req.json()

  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } }
  })

  const { data, error } = await userClient.rpc('register_card_download', {
    p_card_id: cardId,
    p_format: format
  })

  if (error) {
    return new Response(JSON.stringify({ allowed: false, error: error.message }), { status: 400 })
  }

  const row = data?.[0]
  return new Response(JSON.stringify({ allowed: row?.allowed ?? false, count: row?.remaining ?? null }), {
    status: 200
  })
})
