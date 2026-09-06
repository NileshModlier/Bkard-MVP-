import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import Input from '../../components/common/Input.jsx'
import Button from '../../components/common/Button.jsx'
import Card from '../../components/common/Card.jsx'
import { FullScreenLoader } from '../../components/common/LoadingScreens.jsx'
import { readJSON, writeJSON } from '../../lib/storage.js'
import { useCards } from '../../hooks/useCards.js'
import { useToast } from '../../hooks/useToast.js'
import { isSupabaseConfigured } from '../../lib/supabaseClient.js'

const DRAFT_KEY = 'bkard_card_draft'

const EMPTY_FORM = {
  fullName: '', jobTitle: '', company: '', email: '', phone: '', website: '', address: '', bio: ''
}

function formFromCard(card) {
  return {
    fullName: card.fullName || '',
    jobTitle: card.jobTitle || '',
    company: card.company || '',
    email: card.email || '',
    phone: card.phone || '',
    website: card.website || '',
    address: card.address || '',
    bio: card.bio || ''
  }
}

export default function Details() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { getCardById, updateCard } = useCards()
  const toast = useToast()
  const navigate = useNavigate()
  const card = isEdit ? getCardById(id) : null
  const prefilled = useRef(false)

  const [form, setForm] = useState(() => (
    isEdit ? EMPTY_FORM : readJSON(DRAFT_KEY, EMPTY_FORM)
  ))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [lookupTimedOut, setLookupTimedOut] = useState(!isEdit)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    prefilled.current = false
    setLookupTimedOut(!isEdit)
  }, [id, isEdit])

  useEffect(() => {
    if (!isEdit || !card || prefilled.current) return
    prefilled.current = true
    setForm(formFromCard(card))
  }, [isEdit, card])

  useEffect(() => {
    if (!isEdit || card) return undefined
    const delay = isSupabaseConfigured() ? 2000 : 0
    const t = setTimeout(() => setLookupTimedOut(true), delay)
    return () => clearTimeout(t)
  }, [isEdit, id, card])

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

  const save = () => {
    if (!validate()) return
    setSaving(true)
    updateCard(id, {
      fullName: form.fullName,
      jobTitle: form.jobTitle,
      company: form.company,
      email: form.email,
      phone: form.phone,
      website: form.website,
      address: form.address,
      bio: form.bio
    })
    setSaving(false)
    toast.success('Card updated')
    navigate('/cards')
  }

  if (isEdit && !card && !lookupTimedOut) {
    return <FullScreenLoader label="Loading card…" />
  }

  if (isEdit && !card) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-lg font-bold text-dark">Card not found</p>
          <p className="text-sm text-dark/50">This card may have been removed or the link is incorrect.</p>
          <Button onClick={() => navigate('/cards')}>Back to my cards</Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-2xl animate-fade-in">
        <div className="mb-6">
          {!isEdit && (
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step 1 of 2</p>
          )}
          <h1 className="mt-1 text-2xl font-extrabold text-dark">{isEdit ? 'Edit card' : 'Your details'}</h1>
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
            {isEdit ? (
              <Button size="lg" loading={saving} onClick={save}>Save</Button>
            ) : (
              <Button size="lg" onClick={next}>Choose template →</Button>
            )}
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
