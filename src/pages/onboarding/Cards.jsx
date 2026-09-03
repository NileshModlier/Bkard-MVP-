import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { CARD_TEMPLATES } from '../../lib/constants.js'

export default function OnboardingCards() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-2xl animate-fade-in text-center">
        <h1 className="text-3xl font-extrabold text-dark sm:text-4xl">Designed for how you lead</h1>
        <p className="mx-auto mt-3 max-w-md text-dark/55">
          Choose from boardroom-grade templates, then customize every detail —
          from typography to QR placement.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {CARD_TEMPLATES.slice(0, 6).map((t) => (
            <div key={t.id} className="aspect-[1.6/1] rounded-xl shadow-card transition hover:-translate-y-1" style={{ background: t.bg }} />
          ))}
        </div>

        <Button size="lg" fullWidth className="mt-10" onClick={() => navigate('/onboarding/verification')}>
          Continue
        </Button>
        <p className="mt-4 text-xs text-dark/40">Step 2 of 3 — Card Templates</p>
      </div>
    </div>
  )
}
