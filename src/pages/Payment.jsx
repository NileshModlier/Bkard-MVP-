import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Card from '../components/common/Card.jsx'
import Button from '../components/common/Button.jsx'
import Input from '../components/common/Input.jsx'
import { usePremium } from '../hooks/usePremium.js'
import { useToast } from '../hooks/useToast.js'

const PLANS = [
  {
    id: 'monthly',
    name: 'Premium Monthly',
    price: '$12',
    cadence: '/month',
    features: ['Unlimited downloads', 'All premium templates', 'Priority directory placement', 'Advanced analytics']
  },
  {
    id: 'yearly',
    name: 'Premium Yearly',
    price: '$96',
    cadence: '/year',
    badge: 'Save 33%',
    features: ['Everything in Monthly', '2 months free', 'Executive onboarding concierge', 'Early access to new templates']
  }
]

export default function Payment() {
  const [selected, setSelected] = useState('yearly')
  const [processing, setProcessing] = useState(false)
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvc: '' })
  const { isPremium, upgradeToPremium } = usePremium()
  const toast = useToast()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setProcessing(true)
    await new Promise((r) => setTimeout(r, 1200)) // simulated payment processing
    upgradeToPremium()
    setProcessing(false)
    toast.success('Welcome to Bkard Premium')
    navigate('/dashboard')
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl animate-fade-in">
        <h1 className="text-2xl font-extrabold text-dark">Billing &amp; Premium</h1>
        <p className="mt-1 text-sm text-dark/50">Unlock unlimited downloads and executive-grade features.</p>

        {isPremium ? (
          <Card className="mt-6 flex items-center gap-4 bg-dark text-white" padding="p-6">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-accent text-xl font-bold text-dark">★</span>
            <div>
              <p className="font-bold">You're on Bkard Premium</p>
              <p className="text-sm text-white/60">Unlimited exports and priority discovery are active.</p>
            </div>
          </Card>
        ) : (
          <>
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelected(plan.id)}
                  className={`relative rounded-2xl border-2 p-5 text-left transition ${
                    selected === plan.id ? 'border-primary shadow-glow' : 'border-dark/10 hover:border-dark/20'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 right-4 rounded-full bg-accent px-2.5 py-0.5 text-[10px] font-bold text-dark">{plan.badge}</span>
                  )}
                  <p className="text-sm font-bold text-dark">{plan.name}</p>
                  <p className="mt-1"><span className="text-2xl font-extrabold text-dark">{plan.price}</span><span className="text-sm text-dark/45">{plan.cadence}</span></p>
                  <ul className="mt-4 space-y-1.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-dark/60">
                        <span className="text-emerald-500">✓</span>{f}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>

            <Card className="mt-6" padding="p-6">
              <p className="mb-4 text-sm font-bold text-dark">Payment details</p>
              <form onSubmit={submit} className="space-y-4">
                <Input label="Cardholder name" placeholder="Jordan Blake" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} required />
                <Input label="Card number" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} required />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="Expiry" placeholder="MM/YY" value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} required />
                  <Input label="CVC" placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} required />
                </div>
                <Button type="submit" size="lg" fullWidth loading={processing}>
                  Upgrade to {PLANS.find((p) => p.id === selected)?.name}
                </Button>
                <p className="text-center text-[11px] text-dark/35">This is a simulated checkout for demo purposes — no real charge occurs.</p>
              </form>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}
