import { useAuthContext } from '../context/AuthContext.jsx'

// Public hook surface for authentication — keeps components decoupled
// from the context implementation detail.
export function useAuth() {
  return useAuthContext()
}
