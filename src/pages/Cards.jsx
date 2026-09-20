import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import BusinessCard from '../components/cards/BusinessCard.jsx'
import CardHoverFrame from '../components/cards/CardHoverFrame.jsx'
import Button from '../components/common/Button.jsx'
import EmptyState from '../components/feedback/EmptyState.jsx'
import { useCards } from '../hooks/useCards.js'
import { useToast } from '../hooks/useToast.js'

export default function Cards() {
  const { cards, deleteCard } = useCards()
  const toast = useToast()

  const handleDelete = (id) => {
    deleteCard(id)
    toast.success('Card deleted')
  }

  return (
    <DashboardLayout>
      <div className="animate-fade-in">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold text-dark">My cards</h1>
          <Link to="/create">
            <Button icon={<Plus className="h-4 w-4" strokeWidth={2.5} />}>Create card</Button>
          </Link>
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <div key={c.id} className="space-y-3">
                <Link to={`/cards/share/${c.id}`} className="block">
                  <CardHoverFrame>
                    <BusinessCard card={c} />
                  </CardHoverFrame>
                </Link>
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-dark/45">
                    {c.views || 0} views · {c.qrScans || 0} QR · {(c.copyLinkClicks || 0) + (c.whatsappShares || 0)} shares
                  </p>
                  <div className="flex items-center gap-3">
                    <Link to={`/cards/${c.id}/edit`} className="text-xs font-semibold text-primary hover:underline">Edit</Link>
                    <button onClick={() => handleDelete(c.id)} className="text-xs font-semibold text-red-500 hover:underline">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
