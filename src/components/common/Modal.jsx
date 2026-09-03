import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open, onClose, title, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-2xl' }

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} rounded-2xl bg-white p-6 shadow-2xl animate-scale-in`}>
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-bold text-dark">{title}</h3>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full text-dark/50 transition hover:bg-dark/5 hover:text-dark"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
        )}
        <div>{children}</div>
        {footer && <div className="mt-6 flex justify-end gap-3">{footer}</div>}
      </div>
    </div>,
    document.body
  )
}
