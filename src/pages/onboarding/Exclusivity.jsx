import { Link, useNavigate } from 'react-router-dom'
import { Globe, LayoutTemplate, ShieldCheck } from 'lucide-react'
import Button from '../../components/common/Button.jsx'
import GradientMesh from '../../components/branding/GradientMesh.jsx'
import HeroCardPreview from '../../components/branding/HeroCardPreview.jsx'
import FloatingIcons from '../../components/branding/FloatingIcons.jsx'
import ThemeCycleButton from '../../components/branding/ThemeCycleButton.jsx'

const FEATURES = [
  { Icon: ShieldCheck, title: 'Verified identity', desc: 'GST-backed executive verification' },
  { Icon: LayoutTemplate, title: 'Premium templates', desc: 'Boardroom-grade card design' },
  { Icon: Globe, title: 'Global reach', desc: 'Share anywhere with one tap' }
]

export default function Exclusivity() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen bg-bg">
      <GradientMesh />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-black text-white">B</span>
            <span className="text-lg font-extrabold tracking-tight text-dark">Bkard</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeCycleButton />
            <Link
              to="/auth/login"
              className="rounded-xl px-3 py-2 text-sm font-semibold text-dark/70 transition hover:bg-dark/5 hover:text-dark"
            >
              Sign in
            </Link>
          </div>
        </header>

        <div className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-in">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Bkard</p>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-dark sm:text-4xl lg:text-5xl">
              Your executive identity, in one card
            </h1>
            <p className="mt-4 max-w-md text-dark/55">
              An invite-grade digital identity platform for executives, founders and
              verified professionals. Every card is a statement of who you are.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
              {FEATURES.map(({ Icon, title, desc }) => (
                <div key={title} className="glass rounded-xl p-4">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
                  <p className="mt-2 text-sm font-semibold text-dark">{title}</p>
                  <p className="mt-1 text-xs text-dark/50">{desc}</p>
                </div>
              ))}
            </div>

            <Button size="lg" variant="accent" className="mt-10 min-h-11 w-full sm:w-auto sm:px-10" onClick={() => navigate('/onboarding/cards')}>
              Continue
            </Button>
            <p className="mt-4 text-xs text-dark/40">Step 1 of 3 — Exclusivity</p>
          </div>

          <div className="relative mx-auto w-full max-w-lg px-6 py-10 sm:px-10">
            <FloatingIcons />
            <HeroCardPreview />
          </div>
        </div>
      </div>
    </div>
  )
}
