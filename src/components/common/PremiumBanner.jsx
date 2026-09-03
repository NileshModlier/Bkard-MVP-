import { useNavigate } from 'react-router-dom'
import { usePremium } from '../../hooks/usePremium.js'
import Button from './Button.jsx'

export default function PremiumBanner({ compact = false }) {
  const { isPremium, remaining, limit, downloadCount } = usePremium()
  const navigate = useNavigate()

  if (isPremium) {
    return (
      <div className={`flex items-center gap-3 rounded-2xl bg-dark px-5 ${compact ? 'py-3' : 'py-4'} text-white`}>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent text-dark text-sm font-bold">★</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Bkard Premium</p>
          <p className="text-xs text-white/60">Unlimited downloads &amp; exports unlocked</p>
        </div>
      </div>
    )
  }

  const pct = Math.min(100, Math.round((downloadCount / limit) * 100))

  return (
    <div className={`rounded-2xl bg-gradient-to-r from-primary to-primary-700 px-5 ${compact ? 'py-3' : 'py-4'} text-white`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{remaining} of {limit} free downloads left</p>
          <p className="text-xs text-white/70">Upgrade for unlimited PNG, PDF &amp; vCard exports</p>
        </div>
        <Button size="sm" variant="accent" onClick={() => navigate('/payment')}>
          Upgrade
        </Button>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/20">
        <div className="h-full rounded-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
