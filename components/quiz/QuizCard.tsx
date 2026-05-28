'use client'

import { useState, useEffect, useRef } from 'react'
import { generateOptions } from '@/lib/quiz-engine'
import { playCorrect, playWrong } from '@/lib/audio'
import type { Question, HistoryItem } from '@/types/quiz'

interface QuizCardProps {
  question: Question
  currentIndex: number
  totalQuestions: number
  score: number
  streak: number
  cloakDuration: number
  speedMode: boolean
  onAnswer: (historyItem: HistoryItem) => void
}

export default function QuizCard({
  question,
  currentIndex,
  totalQuestions,
  score,
  streak,
  cloakDuration,
  speedMode,
  onAnswer,
}: QuizCardProps) {
  const [phase, setPhase] = useState<'cloak' | 'revealed' | 'answered'>('cloak')
  const [cloakTimeLeft, setCloakTimeLeft] = useState(cloakDuration)
  const [answerTimeLeft, setAnswerTimeLeft] = useState(speedMode ? 3 : 6)
  const [options, setOptions] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [feedbackAnim, setFeedbackAnim] = useState<'none' | 'correct' | 'wrong'>('none')

  const cloakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalCloakTime = cloakDuration
  const totalAnswerTime = speedMode ? 3 : 6
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100

  useEffect(() => {
    setOptions(generateOptions(question))

    cloakTimerRef.current = setInterval(() => {
      setCloakTimeLeft(prev => {
        if (prev <= 1) {
          if (cloakTimerRef.current) clearInterval(cloakTimerRef.current)
          setPhase('revealed')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (cloakTimerRef.current) clearInterval(cloakTimerRef.current)
      if (answerTimerRef.current) clearInterval(answerTimerRef.current)
    }
  }, [question]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'revealed') return

    setAnswerTimeLeft(speedMode ? 3 : 6)
    answerTimerRef.current = setInterval(() => {
      setAnswerTimeLeft(prev => {
        if (prev <= 1) {
          if (answerTimerRef.current) clearInterval(answerTimerRef.current)
          setPhase('answered')
          setFeedbackAnim('wrong')
          playWrong()
          onAnswer({ question, selected: null, isCorrect: false })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (answerTimerRef.current) clearInterval(answerTimerRef.current)
    }
  }, [phase, speedMode, question, onAnswer])

  const handleOptionClick = (option: number) => {
    if (phase !== 'revealed') return
    if (answerTimerRef.current) clearInterval(answerTimerRef.current)

    const correct = option === question.ans
    setSelectedOption(option)
    setFeedbackAnim(correct ? 'correct' : 'wrong')
    setPhase('answered')

    if (correct) playCorrect()
    else playWrong()

    setTimeout(() => {
      onAnswer({ question, selected: option, isCorrect: correct })
    }, 1100)
  }

  const getTimerRingColor = (timeLeft: number, total: number) => {
    const ratio = timeLeft / total
    if (ratio > 0.5) return 'var(--primary)'
    if (ratio > 0.25) return 'var(--warning)'
    return 'var(--destructive)'
  }

  const ringRadius = 44
  const ringCircumference = 2 * Math.PI * ringRadius

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6 flex flex-col min-h-screen">
        <div className="flex items-center gap-3 mb-6">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-border text-muted-foreground">
            Q {currentIndex + 1} / {totalQuestions}
          </span>
          <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors border-border text-muted-foreground">
            {score} pts
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-8">
          {streak > 1 && (
            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold border-border text-warning bg-muted">
              🔥 {streak} streak
            </span>
          )}

          <div className="w-full rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <div className="flex flex-col space-y-1.5 p-6 pb-2">
              <p className="text-sm text-muted-foreground">Calculate the product</p>
            </div>
            <div className="p-6 pt-0 flex flex-col items-center gap-6">
              <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
                {question.a}
                <span className="text-primary"> × </span>
                {question.b}
                <span className="text-muted-foreground"> = ?</span>
              </h2>

              <div className="relative">
                <svg width="96" height="96" viewBox="0 0 100 100">
                  <circle
                    cx="50" cy="50" r={ringRadius}
                    fill="none" stroke="var(--border)" strokeWidth="6"
                  />
                  {(phase === 'cloak' || phase === 'revealed') && (
                    <circle
                      cx="50" cy="50" r={ringRadius}
                      fill="none"
                      stroke={phase === 'cloak' ? 'var(--primary)' : getTimerRingColor(answerTimeLeft, totalAnswerTime)}
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={
                        ringCircumference * (1 -
                          (phase === 'cloak'
                            ? cloakTimeLeft / totalCloakTime
                            : answerTimeLeft / totalAnswerTime))
                      }
                      transform="rotate(-90 50 50)"
                      style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
                    />
                  )}
                  <text x="50" y="54" textAnchor="middle" dominantBaseline="middle" fill="var(--foreground)" fontSize="20" fontWeight="700">
                    {phase === 'cloak' ? cloakTimeLeft : answerTimeLeft}
                  </text>
                </svg>
              </div>

              {phase === 'cloak' && (
                <p className="text-sm text-muted-foreground">
                  Options will appear in {cloakTimeLeft}s — calculate mentally!
                </p>
              )}
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            {phase === 'cloak' ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-md animate-pulse bg-muted" />
                ))}
              </>
            ) : (
              options.map((option, idx) => {
                const labels = ['A', 'B', 'C', 'D']
                let variant = 'bg-transparent text-card-foreground border border-input hover:bg-accent hover:text-accent-foreground'
                let icon = null

                if (phase === 'answered') {
                  if (option === question.ans) {
                    variant = 'bg-success text-white border-success'
                    icon = <span className="text-lg mr-2">✓</span>
                  } else if (option === selectedOption && feedbackAnim === 'wrong') {
                    variant = 'bg-destructive text-destructive-foreground border-destructive animate-shake'
                    icon = <span className="text-lg mr-2">✗</span>
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={phase === 'answered'}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none h-14 px-4 ${variant} ${
                      phase === 'revealed' && !selectedOption ? 'hover:scale-[1.02] active:scale-[0.98]' : ''
                    }`}
                    aria-label={`Option ${labels[idx]}: ${option}`}
                  >
                    {icon}
                    <span className="text-sm mr-1.5 text-muted-foreground">{labels[idx]}.</span>
                    {option}
                  </button>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
