export default function EmptyIllustration({ className = '' }) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`h-28 w-40 text-primary ${className}`}
      aria-hidden
    >
      <rect x="28" y="28" width="144" height="90" rx="14" className="fill-white dark:fill-white/5" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.5" strokeDasharray="5 4" />
      <rect x="38" y="22" width="124" height="86" rx="12" className="fill-white dark:fill-surface" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      <rect x="50" y="40" width="54" height="8" rx="4" fill="currentColor" fillOpacity="0.35" />
      <rect x="50" y="54" width="36" height="6" rx="3" fill="currentColor" fillOpacity="0.2" />
      <rect x="50" y="82" width="48" height="5" rx="2.5" fill="currentColor" fillOpacity="0.18" />
      <rect x="50" y="92" width="32" height="5" rx="2.5" fill="currentColor" fillOpacity="0.12" />
      <rect x="132" y="38" width="18" height="18" rx="4" fill="currentColor" fillOpacity="0.2" />
      <path d="M136 47h10M141 42v10" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
