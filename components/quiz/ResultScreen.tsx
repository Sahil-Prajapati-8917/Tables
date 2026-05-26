'use client'

import { useMemo } from 'react'
import { getPerformanceLabel } from '@/lib/quiz-engine'
import { playVictory } from '@/lib/audio'
import type { HistoryItem } from '@/types/quiz'

interface ResultScreenProps {
  history: HistoryItem[]
  score: number
  totalQuestions: number
  startTime: number
  onPlayAgain: () => void
}

export default function ResultScreen({
  history,
  score,
  totalQuestions,
  startTime,
  onPlayAgain,
}: ResultScreenProps) {
  const correctCount = history.filter(h => h.isCorrect).length
  const wrongCount = history.filter(h => !h.isCorrect).length
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const performance = getPerformanceLabel(percentage)

  const timeTaken = useMemo(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }, [startTime])

  if (percentage === 100) {
    playVictory()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div className="w-full max-w-lg space-y-4 animate-slide-up">
        <div
          className="p-6 sm:p-8 rounded-2xl text-center"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-lg)',
          }}
        >
          <div className="text-5xl mb-3">{performance.emoji}</div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--fg)' }}>
            {performance.label}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
            Quiz completed in {timeTaken}
          </p>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--muted)' }}
            >
              <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>
                {correctCount}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
                Correct
              </div>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--muted)' }}
            >
              <div className="text-2xl font-bold" style={{ color: 'var(--error)' }}>
                {wrongCount}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
                Wrong
              </div>
            </div>
            <div
              className="p-4 rounded-xl"
              style={{ background: 'var(--muted)' }}
            >
              <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>
                {percentage}%
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
                Score
              </div>
            </div>
          </div>

          <div className="mt-4 text-sm" style={{ color: 'var(--muted-fg)' }}>
            Points: {score}
          </div>
        </div>

        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--card-border)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div className="p-4 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <h2 className="text-base font-semibold" style={{ color: 'var(--fg)' }}>
              Question Review
            </h2>
          </div>
          <div
            className="overflow-y-auto"
            style={{ maxHeight: '420px' }}
          >
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 border-b last:border-b-0"
                style={{
                  borderColor: 'var(--card-border)',
                  borderLeft: `3px solid ${item.isCorrect ? 'var(--success)' : 'var(--error)'}`,
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                      {item.question.a} × {item.question.b} = {item.question.ans}
                    </div>
                    <div className="text-xs mt-1" style={{ color: 'var(--muted-fg)' }}>
                      Your answer:{' '}
                      <span
                        className="font-medium"
                        style={{ color: item.isCorrect ? 'var(--success)' : 'var(--error)' }}
                      >
                        {item.selected !== null ? item.selected : '— (timed out)'}
                      </span>
                    </div>
                  </div>
                  <span className="text-lg flex-shrink-0">
                    {item.isCorrect ? '✅' : '❌'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-3.5 rounded-xl text-base font-semibold transition-all duration-200 border-2"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-fg)',
            borderColor: 'var(--primary)',
            boxShadow: 'var(--shadow-glow)',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
