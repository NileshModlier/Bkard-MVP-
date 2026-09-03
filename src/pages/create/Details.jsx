import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import Card from '../../components/common/Card.jsx'
import { readJSON, writeJSON } from '../../lib/storage.js'

const DRAFT_KEY = 'bkard_card_draft'

export default function Details() {
  const [form, setForm] = useState(() => readJSON(DRAFT_KEY, {
    fullName: '', jobTitle: '', company: '', email: '', phone: '', website: '', address: '', bio: ''
  }))
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const errs = {}
    if (!form.fullName.trim()) errs.fullName = 'Required'
    if (!form.jobTitle.trim()) errs.jobTitle = 'Required'
    if (!form.email.trim()) errs.email = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validate()) return
    writeJSON(DRAFT_KEY, form)
    navigate('/create/templates')
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1 of 2</p>
          <h1 className="mt-1 text-2xl font-extrabold text-dark">Your details</h1>
          <p className="mt-1 text-sm text-dark/50">This information appears on your public card.</p>
        </div>

        <Card padding="p-6" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Full name" value={form.fullName} onChange={update('fullName')} error={errors.fullName} placeholder="Jordan Blake" />
            <Input label="Job title" value={form.jobTitle} onChange={update('jobTitle')} error={errors.jobTitle} placeholder="Chief Executive Officer" />
          </div>
          <Input label="Company" value={form.company} onChange={update('company')} placeholder="Acme Inc." />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Email" type="email" value={form.email} onChange={update('email')} error={errors.email} placeholder="you@company.com" />
            <Input label="Phone" value={form.phone} onChange={update('phone')} placeholder="+1 555 010 1234" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label="Website" value={form.website} onChange={update('website')} placeholder="acme.com" />
            <Input label="Address" value={form.address} onChange={update('address')} placeholder="City, Country" />
          </div>
          <Input label="Bio" textarea value={form.bio} onChange={update('bio')} placeholder="A short executive summary…" />

          <div className="flex justify-end pt-2">
            <Button size="lg" onClick={next}>Choose template →</Button>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
