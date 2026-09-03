import { createPortal } from 'react-dom'
import { useToast } from '../../hooks/useToast.js'

const STYLES = {
  info: 'bg-dark text-white',
  success: 'bg-emerald-600 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-accent text-dark'
}

const ICONS = { info: 'ℹ', success: '✓', error: '✕', warning: '!' }

export default function ToastViewport() {
  const { toasts, dismiss } = useToast()

  return createPortal(
    <div className="pointer-events-none fixed bottom-5 right-5 z-[200] flex w-[calc(100%-2.5rem)] max-w-sm flex-col gap-2.5 sm:w-auto">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismiss(t.id)}
          className={`pointer-events-auto flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 shadow-2xl animate-slide-up ${STYLES[t.type]}`}
        >
          <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-white/20 text-xs font-bold">
            {ICONS[t.type]}
          </span>
          <p className="text-sm font-medium">{t.message}</p>
        </div>
      ))}
    </div>,
    document.body
  )
}
