'use client'

import { useEffect, useState } from 'react'

interface CountdownOverlayProps {
  onComplete: () => void
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)

  useEffect(() => {
    if (count === 0) {
      onComplete()
      return
    }
    const timer = setTimeout(() => setCount(c => c - 1), 900)
    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="text-center">
        {count > 0 ? (
          <div
            key={count}
            className="animate-countdown-pop text-8xl font-bold select-none text-primary-foreground"
          >
            {count}
          </div>
        ) : (
          <div className="animate-countdown-pop text-6xl font-bold select-none text-primary">
            GO!
          </div>
        )}
      </div>
    </div>
  )
}
