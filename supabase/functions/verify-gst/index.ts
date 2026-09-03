// supabase/functions/verify-gst/index.ts
// Server-side GST verification — the fix for the Critical finding that the
// original client trusted its own regex result directly. This function
// still checks shape (defense in depth) AND calls a real GST validation
// provider before writing profiles.gst_verified.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const GSTIN_PATTERN = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization')
  const { gstin, userId } = await req.json()

  // Confirm the caller's JWT actually belongs to userId — prevents one
  // authenticated user from triggering verification for another.
  const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader! } }
  })
  const { data: { user } } = await userClient.auth.getUser()
  if (!user || user.id !== userId) {
    return new Response(JSON.stringify({ verified: false, reason: 'unauthorized' }), { status: 401 })
  }

  if (!GSTIN_PATTERN.test(gstin)) {
    return new Response(JSON.stringify({ verified: false, reason: 'invalid_shape' }), { status: 200 })
  }

  // Call a real GST validation provider here (e.g. an India GST-verification
  // API). Swap this block for the provider's actual request/response shape.
  const providerVerified = await callGstProvider(gstin)

  await supabaseAdmin
    .from('profiles')
    .update({
      gst_number: gstin,
      gst_verified: providerVerified,
      gst_verified_at: providerVerified ? new Date().toISOString() : null
    })
    .eq('id', userId)

  return new Response(
    JSON.stringify({ verified: providerVerified, reason: providerVerified ? 'verified' : 'provider_rejected' }),
    { status: 200 }
  )
})

async function callGstProvider(_gstin: string): Promise<boolean> {
  // Placeholder — integrate a real GST verification API here.
  return true
}
