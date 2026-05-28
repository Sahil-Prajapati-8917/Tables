'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CountdownOverlayProps {
  onComplete: () => void
}

export default function CountdownOverlay({ onComplete }: CountdownOverlayProps) {
  const [count, setCount] = useState(3)
  const doneRef = useRef(false)

  useEffect(() => {
    if (count <= 0) {
      if (!doneRef.current) {
        doneRef.current = true
        onComplete()
      }
      return
    }
    const timer = setTimeout(() => setCount(prev => prev - 1), 1000)
    return () => clearTimeout(timer)
  }, [count, onComplete])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={count}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-8xl font-bold text-primary">
            {count === 0 ? 'Go!' : count}
          </span>
          <span className="text-sm text-muted-foreground">Get ready...</span>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
