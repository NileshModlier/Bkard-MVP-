import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout.jsx'
import Card from '../components/common/Card.jsx'
import Input from '../components/common/Input.jsx'
import Button from '../components/common/Button.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'

const TABS = ['Profile', 'Company', 'Security', 'Billing']

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

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const save = () => {
    updateProfile(form)
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
              <Button onClick={save}>Save changes</Button>
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
