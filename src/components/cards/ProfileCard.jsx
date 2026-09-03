export default function ProfileCard({ card, onConnect, connected = false }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-dark/5 bg-white p-4 shadow-card transition hover:shadow-card-hover">
      <div className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
        {(card.fullName || '?').slice(0, 1).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-dark">{card.fullName}</p>
        <p className="truncate text-xs text-dark/50">{card.jobTitle} {card.company ? `· ${card.company}` : ''}</p>
      </div>
      {onConnect && (
        <button
          onClick={() => onConnect(card)}
          disabled={connected}
          className={`shrink-0 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
            connected ? 'bg-emerald-50 text-emerald-600' : 'bg-primary text-white hover:bg-primary-600'
          }`}
        >
          {connected ? 'Connected' : 'Connect'}
        </button>
      )}
    </div>
  )
}
