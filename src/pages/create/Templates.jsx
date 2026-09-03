import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout.jsx'
import TemplateSelector from '../../components/cards/TemplateSelector.jsx'
import BusinessCard from '../../components/cards/BusinessCard.jsx'
import Button from '../../components/common/Button.jsx'
import { readJSON, removeKey } from '../../lib/storage.js'
import { useCards } from '../../hooks/useCards.js'
import { useToast } from '../../hooks/useToast.js'
import { CARD_TEMPLATES } from '../../lib/constants.js'

const DRAFT_KEY = 'bkard_card_draft'

export default function Templates() {
  const draft = readJSON(DRAFT_KEY, {})
  const [templateId, setTemplateId] = useState(CARD_TEMPLATES[0].id)
  const [saving, setSaving] = useState(false)
  const { createCard } = useCards()
  const toast = useToast()
  const navigate = useNavigate()

  const previewCard = { ...draft, templateId }

  const finish = async () => {
    if (!draft.fullName) {
      navigate('/create/details')
      return
    }
    setSaving(true)
    const card = await createCard({ ...draft, templateId })
    removeKey(DRAFT_KEY)
    setSaving(false)
    toast.success('Card created successfully')
    navigate(`/cards/share/${card.id}`)
  }

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl animate-fade-in">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Step 2 of 2</p>
          <h1 className="mt-1 text-2xl font-extrabold text-dark">Choose a template</h1>
          <p className="mt-1 text-sm text-dark/50">Preview updates live as you pick a style.</p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.2fr_1fr]">
          <TemplateSelector selectedId={templateId} onSelect={setTemplateId} />

          <div className="flex flex-col items-center gap-4 lg:sticky lg:top-24 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-wide text-dark/40">Live preview</p>
            <BusinessCard card={previewCard} />
            <Button size="lg" fullWidth loading={saving} onClick={finish}>Create card</Button>
            <Button variant="ghost" fullWidth onClick={() => navigate('/create/details')}>← Back to details</Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
