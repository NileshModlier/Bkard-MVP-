import BusinessCard from '../cards/BusinessCard.jsx'

export const SAMPLE_HERO_CARD = {
  templateId: 'obsidian',
  fullName: 'Jordan Blake',
  jobTitle: 'Managing Director',
  company: 'Meridian Capital',
  email: 'jordan@meridian.example',
  website: 'meridian.example'
}

export default function HeroCardPreview({ card = SAMPLE_HERO_CARD, className = '' }) {
  return (
    <div
      className={`w-full max-w-md animate-float motion-reduce:animate-none ${className}`}
      aria-hidden
    >
      <BusinessCard card={card} />
    </div>
  )
}
