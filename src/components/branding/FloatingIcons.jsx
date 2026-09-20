import { Link2, QrCode, ShieldCheck } from 'lucide-react'

const ICONS = [
  { Icon: QrCode, className: 'left-0 top-10' },
  { Icon: Link2, className: 'right-0 top-1/3' },
  { Icon: ShieldCheck, className: 'bottom-4 left-1/2 -translate-x-1/2' }
]

export default function FloatingIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden md:block" aria-hidden>
      {ICONS.map(({ Icon, className }) => (
        <span
          key={className}
          className={`glass absolute grid h-10 w-10 place-items-center rounded-xl text-primary shadow-card ${className}`}
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
      ))}
    </div>
  )
}
