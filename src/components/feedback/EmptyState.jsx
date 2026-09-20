import Card from '../common/Card.jsx'
import EmptyIllustration from './EmptyIllustration.jsx'

export default function EmptyState({ title, description, action }) {
  return (
    <Card className="glass flex flex-col items-center justify-center gap-3 py-14 text-center dark:bg-white/5">
      <EmptyIllustration />
      {title ? <p className="text-sm font-semibold text-dark">{title}</p> : null}
      {description && <p className="max-w-xs text-sm text-dark/50">{description}</p>}
      {action && <div className="mt-1">{action}</div>}
    </Card>
  )
}
