import AnimatedCounter from './AnimatedCounter.jsx'

const ACCENTS = {
  blue: 'from-primary/20 to-transparent dark:from-primary/25',
  gold: 'from-[#C4A35A]/25 to-transparent dark:from-[#C4A35A]/20',
  slate: 'from-slate-400/20 to-transparent dark:from-slate-300/10',
  emerald: 'from-emerald-400/25 to-transparent dark:from-emerald-400/20',
  amber: 'from-amber-400/25 to-transparent dark:from-amber-400/15',
  red: 'from-red-400/25 to-transparent dark:from-red-400/20'
}

export default function MetricTile({
  label,
  value,
  icon: Icon,
  accent = 'blue',
  numeric = true,
  hint
}) {
  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5 shadow-card">
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${ACCENTS[accent] || ACCENTS.blue}`}
        aria-hidden
      />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          {numeric ? (
            <p className="text-2xl font-extrabold tracking-tight text-dark">
              <AnimatedCounter value={value} />
            </p>
          ) : (
            <p className="text-lg font-extrabold leading-snug tracking-tight text-dark">{value}</p>
          )}
          <p className="mt-1 text-xs font-medium text-dark/45">{label}</p>
          {hint ? <p className="mt-1 text-[11px] text-dark/40">{hint}</p> : null}
        </div>
        {Icon ? (
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/50 text-primary dark:bg-white/10">
            <Icon className="h-4 w-4" strokeWidth={2} />
          </span>
        ) : null}
      </div>
    </div>
  )
}
