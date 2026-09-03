import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timers = useRef({})

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const show = useCallback((message, options = {}) => {
    const id = ++idCounter
    const toast = {
      id,
      message,
      type: options.type || 'info', // info | success | error | warning
      duration: options.duration ?? 3500
    }
    setToasts((prev) => [...prev, toast])
    timers.current[id] = setTimeout(() => dismiss(id), toast.duration)
    return id
  }, [dismiss])

  const success = useCallback((msg, opts) => show(msg, { ...opts, type: 'success' }), [show])
  const error = useCallback((msg, opts) => show(msg, { ...opts, type: 'error' }), [show])
  const warning = useCallback((msg, opts) => show(msg, { ...opts, type: 'warning' }), [show])

  return (
    <ToastContext.Provider value={{ toasts, show, success, error, warning, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider')
  return ctx
}
