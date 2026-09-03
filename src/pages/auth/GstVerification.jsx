import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { useToast } from '../../hooks/useToast.js'

export default function GstVerification() {
  const [gst, setGst] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { verifyGst } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!gst.trim()) {
      setError('Enter your GSTIN to verify')
      return
    }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900)) // simulate verification latency
    const ok = verifyGst(gst)
    setLoading(false)
    if (ok) {
      toast.success('Executive badge unlocked')
    } else {
      toast.warning('Could not verify — you can retry anytime in Settings')
    }
    navigate('/dashboard')
  }

  const skip = () => navigate('/dashboard')

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6 py-12">
      <div className="w-full max-w-md animate-fade-in">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-accent-50 text-lg text-accent-600">◆</span>
          <h1 className="text-2xl font-extrabold text-dark">Verify your business</h1>
          <p className="mt-1 text-sm text-dark/50">Add your GSTIN to earn the executive verified badge</p>
        </div>

        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-dark/5 bg-white p-6 shadow-card">
          <Input
            label="GSTIN"
            placeholder="22AAAAA0000A1Z5"
            value={gst}
            onChange={(e) => setGst(e.target.value.toUpperCase())}
            error={error}
            hint="15-character Goods & Services Tax Identification Number"
          />
          <Button type="submit" fullWidth size="lg" loading={loading}>
            Verify &amp; continue
          </Button>
          <Button type="button" variant="ghost" fullWidth onClick={skip}>
            Skip for now
          </Button>
        </form>
      </div>
    </div>
  )
}
