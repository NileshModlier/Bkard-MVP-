// NEW component — component-level premium gate. Wraps any UI element that
// should only be fully usable by Premium users, rendering a fallback
// (typically an upgrade CTA) otherwise. This is the concrete implementation
// the architecture's components/guards/ folder was designed around.
import { usePremium } from '../../hooks/usePremium.js'

export default function PremiumGate({ children, fallback = null }) {
  const { isPremium } = usePremium()

  if (!isPremium) return fallback

  return children
}
