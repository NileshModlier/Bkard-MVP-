export function FullScreenLoader({ label = 'Loading Bkard…' }) {
  return (
    <div className="fixed inset-0 z-[300] grid place-items-center bg-bg">
      <div className="flex flex-col items-center gap-4">
        <div className="relative h-14 w-14">
          <div className="absolute inset-0 rounded-full border-4 border-primary-100" />
          <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />
        </div>
        <p className="text-sm font-medium text-dark/50">{label}</p>
      </div>
    </div>
  )
}

export function Spinner({ className = 'h-5 w-5' }) {
  return <div className={`animate-spin rounded-full border-2 border-dark/10 border-t-primary ${className}`} />
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-dark/5 bg-white p-6 shadow-card">
      <div className="mb-4 h-32 w-full rounded-xl shimmer-bg animate-shimmer" />
      <div className="mb-2 h-4 w-2/3 rounded shimmer-bg animate-shimmer" />
      <div className="h-3 w-1/2 rounded shimmer-bg animate-shimmer" />
    </div>
  )
}

export function SkeletonGrid({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  )
}
