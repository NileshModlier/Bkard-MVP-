import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import PremiumBanner from '../components/common/PremiumBanner.jsx'
import BusinessCard from '../components/cards/BusinessCard.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useCards } from '../hooks/useCards.js'

export default function Dashboard() {
  const { user, gstVerified } = useAuth()
  const { cards } = useCards()

  const totalViews = cards.reduce((sum, c) => sum + (c.views || 0), 0)
  const totalConnections = cards.reduce((sum, c) => sum + (c.connections || 0), 0)

  return (
    <DashboardLayout>
      <div className="animate-fade-in space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-dark">
              Welcome back, {user?.fullName?.split(' ')[0] || 'there'} 👋
            </h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-dark/50">
              {gstVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-600">✓ Verified Executive</span>
              ) : (
                <Link to="/auth/gst-verification" className="text-xs font-semibold text-primary hover:underline">Verify your business →</Link>
              )}
            </div>
          </div>
          <Link to="/create"><Button size="lg" icon="+">New card</Button></Link>
        </div>

        <PremiumBanner />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            ['Total cards', cards.length],
            ['Total views', totalViews],
            ['Connections', totalConnections],
            ['Templates', 6]
          ].map(([label, value]) => (
            <Card key={label} padding="p-5">
              <p className="text-2xl font-extrabold text-dark">{value}</p>
              <p className="mt-1 text-xs font-medium text-dark/45">{label}</p>
            </Card>
          ))}
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-dark">Your cards</h2>
            <Link to="/cards" className="text-sm font-semibold text-primary hover:underline">View all</Link>
          </div>

          {cards.length === 0 ? (
            <Card className="flex flex-col items-center justify-center gap-3 py-14 text-center">
              <p className="text-sm text-dark/50">You haven't created a card yet.</p>
              <Link to="/create"><Button>Create your first card</Button></Link>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {cards.slice(0, 3).map((c) => (
                <Link key={c.id} to={`/cards/share/${c.id}`}>
                  <BusinessCard card={c} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
