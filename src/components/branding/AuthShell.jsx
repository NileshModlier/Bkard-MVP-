import { Link } from 'react-router-dom'
import { BarChart3, QrCode, ShieldCheck } from 'lucide-react'
import GradientMesh from './GradientMesh.jsx'
import HeroCardPreview from './HeroCardPreview.jsx'
import ThemeCycleButton from './ThemeCycleButton.jsx'

const SIGNUP_POINTS = [
  { Icon: ShieldCheck, title: 'GST-backed verification', body: 'Executive identity with a clear GST workflow.' },
  { Icon: QrCode, title: 'Shareable QR identity', body: 'One card, one link, ready for meetings.' },
  { Icon: BarChart3, title: 'Private analytics', body: 'Views, scans, and shares stay on your dashboard.' }
]

export default function AuthShell({ mode = 'login', children }) {
  return (
    <div className="relative min-h-screen bg-bg">
      <GradientMesh />
      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex items-center justify-between">
          <Link to="/onboarding/exclusivity" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-sm font-black text-white">B</span>
            <span className="text-lg font-extrabold tracking-tight text-dark">Bkard</span>
          </Link>
          <ThemeCycleButton />
        </header>

        <div className="grid flex-1 items-center gap-10 pb-10 lg:grid-cols-2">
          <div className="hidden lg:block">
            {mode === 'signup' ? (
              <div className="space-y-4">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Create your account</p>
                <h2 className="text-3xl font-extrabold tracking-tight text-dark">Your executive identity, in one card</h2>
                <ul className="mt-6 space-y-3">
                  {SIGNUP_POINTS.map(({ Icon, title, body }) => (
                    <li key={title} className="glass flex gap-3 rounded-2xl p-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" strokeWidth={2} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-dark">{title}</p>
                        <p className="mt-0.5 text-xs text-dark/50">{body}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="relative mx-auto max-w-md">
                <HeroCardPreview />
              </div>
            )}
          </div>

          <div className="mx-auto w-full max-w-md animate-fade-in">{children}</div>
        </div>
      </div>
    </div>
  )
}
