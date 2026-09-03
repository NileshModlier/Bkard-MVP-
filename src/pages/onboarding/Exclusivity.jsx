import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'

export default function Exclusivity() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-6 py-16">
      <div className="w-full max-w-lg text-center animate-fade-in">
        <span className="mx-auto mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-accent text-2xl font-black text-dark">B</span>
        <h1 className="text-3xl font-extrabold leading-tight text-white sm:text-4xl">
          Welcome to <span className="text-accent">Bkard</span>
        </h1>
        <p className="mx-auto mt-4 max-w-md text-white/60">
          An invite-grade digital identity platform for executives, founders and
          verified professionals. Every card is a statement of who you are.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-3 text-left sm:grid-cols-3">
          {[
            ['◆', 'Verified identity', 'GST-backed executive verification'],
            ['◇', 'Premium templates', 'Boardroom-grade card design'],
            ['○', 'Global reach', 'Share anywhere with one tap']
          ].map(([icon, title, desc]) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <span className="text-accent">{icon}</span>
              <p className="mt-2 text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs text-white/50">{desc}</p>
            </div>
          ))}
        </div>

        <Button size="lg" variant="accent" fullWidth className="mt-10" onClick={() => navigate('/onboarding/cards')}>
          Continue
        </Button>
        <p className="mt-4 text-xs text-white/40">Step 1 of 3 — Exclusivity</p>
      </div>
    </div>
  )
}
