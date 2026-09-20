import { useEffect, useRef, useState } from 'react'
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js'

export default function AnimatedCounter({ value, duration = 700, className = '' }) {
  const reduceMotion = usePrefersReducedMotion()
  const target = Number(value) || 0
  const [display, setDisplay] = useState(reduceMotion ? target : 0)
  const fromRef = useRef(0)

  useEffect(() => {
    if (reduceMotion) {
      setDisplay(target)
      fromRef.current = target
      return undefined
    }

    const from = fromRef.current
    const start = performance.now()
    let frame = 0

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 3
      const next = Math.round(from + (target - from) * eased)
      setDisplay(next)
      if (t < 1) frame = requestAnimationFrame(tick)
      else fromRef.current = target
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, reduceMotion])

  return <span className={className}>{display.toLocaleString()}</span>
}
