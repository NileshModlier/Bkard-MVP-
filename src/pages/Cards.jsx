import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import BusinessCard from '../components/cards/BusinessCard.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
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
          <Link to="/create"><Button icon="+">New card</Button></Link>
        </div>

        {cards.length === 0 ? (
          <Card className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <p className="text-sm text-dark/50">No cards yet — create your first digital business card.</p>
            <Link to="/create"><Button>Create a card</Button></Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {cards.map((c) => (
              <div key={c.id} className="space-y-3">
                <Link to={`/cards/share/${c.id}`}>
                  <BusinessCard card={c} />
                </Link>
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-dark/45">{c.views || 0} views · {c.connections || 0} connections</p>
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
