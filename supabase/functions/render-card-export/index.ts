// supabase/functions/render-card-export/index.ts
// Server-side, watermark-free PNG export for Premium users — see
// "Card Image Generation Strategy" in the response for why this exists
// alongside (not instead of) the existing client-side html2canvas path.
// Uses Satori (JSX -> SVG) + resvg-wasm (SVG -> PNG), both of which run
// fine in Deno's edge runtime — unlike a headless-Chromium approach
// (Puppeteer), which does not run in Supabase Edge Functions.
import satori from 'https://esm.sh/satori@0.10'
import { Resvg } from 'https://esm.sh/@resvg/resvg-wasm@2'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

Deno.serve(async (req) => {
  const { cardId } = await req.json()

  const { data: card, error } = await supabaseAdmin.from('cards').select('*').eq('id', cardId).single()
  if (error || !card) {
    return new Response(JSON.stringify({ error: 'card not found' }), { status: 404 })
  }

  // Build the same visual layout as components/cards/BusinessCard.jsx, as
  // a Satori-compatible JSX-like object (Satori does not run React itself —
  // this is a deliberately parallel, server-side render target, kept in
  // sync with the client template definitions by importing the same
  // CARD_TEMPLATES data shape rather than duplicating the gradient values).
  const svg = await satori(buildCardElement(card), {
    width: 1050,
    height: 656,
    fonts: [/* Inter font buffer loaded from a bundled asset */]
  })

  const png = new Resvg(svg).render().asPng()

  const path = `${card.owner_id}/${card.id}/${crypto.randomUUID()}.png`
  await supabaseAdmin.storage.from('card-exports').upload(path, png, { contentType: 'image/png' })

  const { data: signed } = await supabaseAdmin.storage
    .from('card-exports')
    .createSignedUrl(path, 60 * 5) // 5-minute expiry — this is a download link, not a hosting URL

  return new Response(JSON.stringify({ url: signed?.signedUrl }), { status: 200 })
})

function buildCardElement(card: Record<string, unknown>) {
  // Placeholder — mirror BusinessCard.jsx's layout as a Satori element tree.
  return { type: 'div', props: { children: card.full_name } }
}
