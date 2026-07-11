import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 2000, active = false): number {
  const [count, setCount] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) {
      startTimeRef.current = null
      return
    }

    startTimeRef.current = Date.now()

    function tick() {
      if (startTimeRef.current === null) return
      const now = Date.now()
      const elapsed = now - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, active])

  return count
}
