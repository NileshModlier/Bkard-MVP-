import { forwardRef } from 'react'
import { CARD_TEMPLATES } from '../../lib/constants.js'

// The visual "physical card" — forwardRef so export utilities (PNG/PDF)
// can target this exact DOM node.
const BusinessCard = forwardRef(function BusinessCard({ card, className = '' }, ref) {
  const template = CARD_TEMPLATES.find((t) => t.id === card?.templateId) || CARD_TEMPLATES[0]

  return (
    <div
      ref={ref}
      className={`relative aspect-[1.6/1] w-full max-w-md overflow-hidden rounded-2xl p-6 shadow-card-hover ${className}`}
      style={{ background: template.bg, color: template.text }}
    >
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-10" style={{ background: template.accent }} />
      <div className="relative flex h-full flex-col justify-between">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-lg font-bold leading-tight">{card?.fullName || 'Your Name'}</p>
            <p className="text-sm opacity-80">{card?.jobTitle || 'Job Title'}</p>
          </div>
          <span
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-black"
            style={{ background: template.accent, color: template.accent === '#1A1A1A' ? '#fff' : '#1A1A1A' }}
          >
            {(card?.company || 'B').slice(0, 1).toUpperCase()}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-semibold opacity-90">{card?.company || 'Company Name'}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-[11px] opacity-70">
            {card?.email && <span>{card.email}</span>}
            {card?.phone && <span>{card.phone}</span>}
          </div>
          {card?.website && <p className="text-[11px] opacity-70">{card.website}</p>}
        </div>
      </div>
    </div>
  )
})

export default BusinessCard
