import { useToastContext } from '../context/ToastContext.jsx'

export function useToast() {
  return useToastContext()
}
