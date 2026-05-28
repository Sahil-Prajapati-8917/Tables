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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-4 animate-fade-in">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6 text-center space-y-4">
          <div className="text-5xl">{performance.emoji}</div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">{performance.label}</h1>
            <p className="text-sm text-muted-foreground">Quiz completed in {timeTaken}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-2xl font-bold" style={{ color: 'var(--success)' }}>{correctCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Correct</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-2xl font-bold" style={{ color: 'var(--destructive)' }}>{wrongCount}</div>
              <div className="text-xs text-muted-foreground mt-1">Wrong</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>{percentage}%</div>
              <div className="text-xs text-muted-foreground mt-1">Score</div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">Points: {score}</p>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-4 pb-2">
            <h2 className="text-sm font-semibold tracking-tight">Question Review</h2>
          </div>
          <div className="h-px bg-border" />
          <div className="overflow-y-auto custom-scrollbar" style={{ maxHeight: '420px' }}>
            {history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 border-l-2 transition-colors hover:bg-accent/50"
                style={{
                  borderLeftColor: item.isCorrect ? 'var(--success)' : 'var(--destructive)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">
                      {item.question.a} × {item.question.b} = {item.question.ans}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Your answer:{' '}
                      <span
                        className="font-medium"
                        style={{ color: item.isCorrect ? 'var(--success)' : 'var(--destructive)' }}
                      >
                        {item.selected !== null ? item.selected : '— (timed out)'}
                      </span>
                    </p>
                  </div>
                  <span className="text-lg flex-shrink-0">
                    {item.isCorrect ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-sm"
        >
          Play Again
        </button>
      </div>
    </div>
  )
}
