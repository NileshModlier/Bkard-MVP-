// NEW component — generic empty-state pattern. Currently duplicated inline
// (slightly differently each time) in pages/Cards.jsx and Dashboard.jsx's
// "no cards yet" blocks; centralizing it here is what the architecture's
// components/feedback/ folder is for — app-aware UX states distinct from
// the pure ui/ primitives in components/common/.
import Card from '../common/Card.jsx'

export default function EmptyState({ title, description, action }) {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 py-14 text-center">
      <p className="text-sm font-medium text-dark/70">{title}</p>
      {description && <p className="max-w-xs text-sm text-dark/50">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </Card>
  )
}
