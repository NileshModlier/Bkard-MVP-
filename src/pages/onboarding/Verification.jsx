import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button.jsx'
import { writeJSON } from '../../lib/storage.js'
import { STORAGE_KEYS } from '../../lib/constants.js'

export default function Verification() {
  const navigate = useNavigate()

  const finish = () => {
    writeJSON(STORAGE_KEYS.ONBOARDED, true)
    navigate('/auth/login')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-16">
      <div className="w-full max-w-md animate-fade-in text-center">
        <span className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-primary-50 text-2xl text-primary">✓</span>
        <h1 className="text-3xl font-extrabold text-dark">Executive verification</h1>
        <p className="mt-3 text-dark/55">
          Bkard verifies real businesses through GST validation, awarding a
          visible executive badge on your public card — a signal of trust for
          every connection you make.
        </p>

        <div className="mt-8 space-y-3 rounded-2xl border border-dark/5 bg-white p-5 text-left shadow-card">
          {['Instant GST validation', 'Executive verified badge', 'Priority in discovery directory'].map((f) => (
            <div key={f} className="flex items-center gap-3">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600">✓</span>
              <span className="text-sm text-dark/75">{f}</span>
            </div>
          ))}
        </div>

        <Button size="lg" fullWidth className="mt-8" onClick={finish}>
          Get started
        </Button>
        <p className="mt-4 text-xs text-dark/40">Step 3 of 3 — Verification</p>
      </div>
    </div>
  )
}
