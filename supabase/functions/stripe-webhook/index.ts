// supabase/functions/stripe-webhook/index.ts
// The ONLY code path that may ever set a subscription's status — Deno Edge
// Function, deployed with `supabase functions deploy stripe-webhook`.
// Runs with the service_role key (RLS-bypassing), which is exactly why it
// must live server-side and never in the frontend bundle.
import Stripe from 'https://esm.sh/stripe@14?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, { apiVersion: '2024-06-20' })
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! // service_role — server-only, never a VITE_ var
)

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  const body = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, signature!, webhookSecret)
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed':
    case 'customer.subscription.updated':
    case 'customer.subscription.created': {
      const sub = event.data.object as Stripe.Subscription
      const ownerId = sub.metadata?.supabase_user_id
      if (!ownerId) break

      await supabaseAdmin.from('subscriptions').upsert(
        {
          owner_id: ownerId,
          plan: sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly',
          status: sub.status === 'active' ? 'active' : sub.status === 'past_due' ? 'past_due' : 'incomplete',
          stripe_subscription_id: sub.id,
          stripe_price_id: sub.items.data[0]?.price?.id,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          cancel_at_period_end: sub.cancel_at_period_end
        },
        { onConflict: 'stripe_subscription_id' }
      )
      // profiles.is_premium is updated automatically by the
      // subscriptions_sync_premium_flag trigger (0006_subscriptions.sql) —
      // this function never touches profiles directly.
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', sub.id)
      break
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
})
