import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CreditCard, Eye, Plus, QrCode, Share2, ShieldCheck } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Button from '../components/common/Button.jsx'
import PremiumBanner from '../components/common/PremiumBanner.jsx'
import BusinessCard from '../components/cards/BusinessCard.jsx'
import CardHoverFrame from '../components/cards/CardHoverFrame.jsx'
import MetricTile from '../components/dashboard/MetricTile.jsx'
import EmptyState from '../components/feedback/EmptyState.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useCards } from '../hooks/useCards.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'

function gstAccent(status) {
  if (status === 'Verified') return 'emerald'
  if (status === 'Rejected') return 'red'
  if (status === 'Pending Verification') return 'amber'
  return 'slate'
}

export default function Dashboard() {
  const { user, gstVerified } = useAuth()
  const { cards } = useCards()
  const [gstStatus, setGstStatus] = useState(gstVerified ? 'Verified' : 'Not submitted')

  const totalViews = cards.reduce((sum, c) => sum + (c.views || 0), 0)
  const totalQrScans = cards.reduce((sum, c) => sum + (c.qrScans || 0), 0)
  const totalShares = cards.reduce(
    (sum, c) => sum + (c.copyLinkClicks || 0) + (c.whatsappShares || 0),
    0
  )

  useEffect(() => {
    if (gstVerified) {
      setGstStatus('Verified')
      return undefined
    }
    if (!isSupabaseConfigured() || !user?.id) {
      setGstStatus('Not submitted')
      return undefined
    }

    let cancelled = false
    supabase
      .from('profiles')
      .select('gst_status')
      .eq('id', user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled || error) return
        setGstStatus(data?.gst_status || 'Not submitted')
      })

    return () => {
      cancelled = true
    }
  }, [user?.id, gstVerified])

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-dark">
              Welcome back, {user?.fullName?.split(' ')[0] || 'there'}
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-dark/50">
              {gstVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">Verified Executive</span>
              ) : (
                <Link to="/auth/gst-verification" className="text-xs font-semibold text-primary hover:underline">Verify your business →</Link>
              )}
            </div>
          </div>
          <Link to="/create">
            <Button size="lg" icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}>Create card</Button>
          </Link>
        </div>

        <PremiumBanner />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <MetricTile label="Total cards" value={cards.length} icon={CreditCard} accent="blue" />
          <MetricTile label="Total views" value={totalViews} icon={Eye} accent="blue" />
          <MetricTile label="QR scans" value={totalQrScans} icon={QrCode} accent="gold" />
          <MetricTile label="Shares" value={totalShares} icon={Share2} accent="gold" />
          <MetricTile
            label="GST status"
            value={gstStatus}
            icon={ShieldCheck}
            accent={gstAccent(gstStatus)}
            numeric={false}
            hint="Read-only"
          />
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark">Your cards</h2>
            <Link to="/cards" className="text-sm font-semibold text-primary hover:underline">View all</Link>
          </div>

          {cards.length === 0 ? (
            <EmptyState
              title="No cards yet"
              description="Create your first digital business card and share it with a link or QR code."
              action={
                <Link to="/create">
                  <Button icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}>Create card</Button>
                </Link>
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.slice(0, 3).map((c) => (
                <Link key={c.id} to={`/cards/share/${c.id}`} className="block">
                  <CardHoverFrame>
                    <BusinessCard card={c} />
                  </CardHoverFrame>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
