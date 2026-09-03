import { CARD_TEMPLATES } from '../../lib/constants.js'

export default function TemplateSelector({ selectedId, onSelect }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {CARD_TEMPLATES.map((t) => {
        const active = selectedId === t.id
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onSelect(t.id)}
            className={`
              group relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all duration-200
              ${active ? 'border-primary shadow-glow' : 'border-transparent hover:border-dark/10'}
            `}
          >
            <div
              className="mb-3 aspect-[1.6/1] w-full rounded-xl shadow-sm"
              style={{ background: t.bg }}
            />
            <p className="text-sm font-bold text-dark">{t.name}</p>
            <p className="text-xs text-dark/50">{t.description}</p>
            {active && (
              <span className="absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-white">✓</span>
            )}
          </button>
        )
      })}
    </div>
  )
}
