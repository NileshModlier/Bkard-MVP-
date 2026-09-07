import { useEffect, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient.js'
import { isValidGstNumberFormat, normalizeGstin } from '../utils/gstValidator.js'

const TABS = ['Profile', 'Company', 'Security', 'Billing']

const GST_FINAL = new Set(['Verified', 'Rejected'])

export default function Settings() {
  const { user, updateProfile, gstVerified } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('Profile')
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    jobTitle: user?.jobTitle || '',
    company: user?.company || ''
  })
  const [gstNumber, setGstNumber] = useState('')
  const [gstStatus, setGstStatus] = useState('Not submitted')
  const [gstError, setGstError] = useState('')
  const [saving, setSaving] = useState(false)

  const gstLocked = GST_FINAL.has(gstStatus)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    if (!isSupabaseConfigured() || !user?.id) return undefined

    let cancelled = false

    async function loadGst() {
      const { data, error } = await supabase
        .from('profiles')
        .select('gst_number, gst_status')
        .eq('id', user.id)
        .maybeSingle()

      if (cancelled || error || !data) return
      setGstNumber(data.gst_number || '')
      setGstStatus(data.gst_status || 'Not submitted')
    }

    loadGst()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const save = async () => {
    const gstTrimmed = gstNumber.trim()
    setGstError('')

    if (tab === 'Profile' && gstTrimmed && !gstLocked) {
      if (!isValidGstNumberFormat(gstTrimmed)) {
        setGstError('Enter a valid 15-character GSTIN')
        return
      }
    }

    updateProfile(form)

    if (tab === 'Profile' && gstTrimmed && !gstLocked) {
      if (!isSupabaseConfigured() || !user?.id) {
        toast.error('GST can only be saved when Supabase is configured')
        toast.success('Settings saved')
        return
      }

      setSaving(true)
      const normalized = normalizeGstin(gstTrimmed)
      const { error } = await supabase
        .from('profiles')
        .update({
          gst_number: normalized,
          gst_status: 'Pending Verification'
        })
        .eq('id', user.id)
      setSaving(false)

      if (error) {
        toast.error(error.message || 'Failed to save GST number')
        return
      }

      setGstNumber(normalized)
      setGstStatus('Pending Verification')
    }

    toast.success('Settings saved')
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl animate-fade-in">
        <h1 className="text-2xl font-extrabold text-dark">Settings</h1>
        <p className="mt-1 text-sm text-dark/50">Manage your profile, company and account preferences.</p>

        <div className="mt-6 flex gap-2 overflow-x-auto border-b border-dark/5 pb-px">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-dark/45 hover:text-dark'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {(tab === 'Profile' || tab === 'Company') && (
          <Card className="mt-6 space-y-4" padding="p-6">
            {tab === 'Profile' ? (
              <>
                <Input label="Full name" value={form.fullName} onChange={update('fullName')} />
                <Input label="Email" type="email" value={form.email} onChange={update('email')} />
                <Input label="Job title" value={form.jobTitle} onChange={update('jobTitle')} />
                <Input
                  label="GST number"
                  placeholder="22AAAAA0000A1Z5"
                  value={gstNumber}
                  onChange={(e) => {
                    setGstNumber(e.target.value.toUpperCase())
                    setGstError('')
                  }}
                  error={gstError}
                  hint={gstLocked ? undefined : '15-character GSTIN. Status will be Pending Verification until reviewed.'}
                  disabled={gstLocked}
                />
                <div className="flex items-center gap-2 rounded-xl bg-dark/5 px-4 py-3">
                  <span className={`h-2 w-2 rounded-full ${
                    gstStatus === 'Verified' ? 'bg-emerald-500' : gstStatus === 'Rejected' ? 'bg-red-500' : 'bg-accent'
                  }`} />
                  <p className="text-xs font-medium text-dark/60">GST status: {gstStatus}</p>
                </div>
              </>
            ) : (
              <>
                <Input label="Company name" value={form.company} onChange={update('company')} />
                <div className="flex items-center gap-2 rounded-xl bg-dark/5 px-4 py-3">
                  <span className={`h-2 w-2 rounded-full ${gstVerified ? 'bg-emerald-500' : 'bg-accent'}`} />
                  <p className="text-xs font-medium text-dark/60">
                    {gstVerified ? 'GST verified — executive badge active' : 'GST not yet verified'}
                  </p>
                </div>
              </>
            )}
            <div className="flex justify-end pt-2">
              <Button onClick={save} loading={saving}>Save changes</Button>
            </div>
          </Card>
        )}

        {tab === 'Security' && (
          <Card className="mt-6 space-y-4" padding="p-6">
            <Input label="New password" type="password" placeholder="••••••••" />
            <Input label="Confirm new password" type="password" placeholder="••••••••" />
            <div className="flex justify-end pt-2">
              <Button onClick={() => toast.success('Password updated')}>Update password</Button>
            </div>
          </Card>
        )}

        {tab === 'Billing' && (
          <Card className="mt-6" padding="p-6">
            <p className="text-sm text-dark/60">Manage your subscription and payment method from the Billing page.</p>
            <Button className="mt-4" onClick={() => (window.location.href = '/payment')}>Go to billing</Button>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
