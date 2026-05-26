'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
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
    setIsCorrect(correct)
    setFeedbackAnim(correct ? 'correct' : 'wrong')
    setPhase('answered')

    if (correct) {
      playCorrect()
    } else {
      playWrong()
    }

    setTimeout(() => {
      onAnswer({
        question,
        selected: option,
        isCorrect: correct,
      })
    }, 1100)
  }

  const getTimerRingColor = (timeLeft: number, total: number) => {
    const ratio = timeLeft / total
    if (ratio > 0.5) return 'var(--primary)'
    if (ratio > 0.25) return 'var(--warning)'
    return 'var(--error)'
  }

  const ringRadius = 44
  const ringCircumference = 2 * Math.PI * ringRadius

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ background: 'var(--muted)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: 'var(--primary)',
              }}
            />
          </div>
          <span
            className="text-sm font-medium whitespace-nowrap"
            style={{ color: 'var(--muted-fg)' }}
          >
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          <div className="flex items-center gap-6">
            <div
              className="text-sm font-medium px-3 py-1.5 rounded-full"
              style={{
                background: 'var(--muted)',
                color: 'var(--muted-fg)',
              }}
            >
              Score: {score}
            </div>
            {streak > 1 && (
              <div
                className="text-sm font-medium px-3 py-1.5 rounded-full animate-progress-pulse"
                style={{
                  background: 'var(--warning-bg)',
                  color: 'var(--warning)',
                }}
              >
                🔥 {streak} streak
              </div>
            )}
          </div>

          <div
            className="w-full max-w-md p-8 sm:p-10 rounded-2xl text-center"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--card-border)',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2" style={{ color: 'var(--fg)' }}>
              {question.a}
              <span style={{ color: 'var(--primary)' }}> × </span>
              {question.b}
              <span style={{ color: 'var(--muted-fg)' }}> = ?</span>
            </h2>

            <div className="flex justify-center mt-6">
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={ringRadius}
                  fill="none"
                  stroke="var(--ring)"
                  strokeWidth="6"
                />
                {phase === 'cloak' && (
                  <circle
                    cx="50"
                    cy="50"
                    r={ringRadius}
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringCircumference * (1 - cloakTimeLeft / totalCloakTime)}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                )}
                {phase === 'revealed' && (
                  <circle
                    cx="50"
                    cy="50"
                    r={ringRadius}
                    fill="none"
                    stroke={getTimerRingColor(answerTimeLeft, totalAnswerTime)}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringCircumference * (1 - answerTimeLeft / totalAnswerTime)}
                    transform="rotate(-90 50 50)"
                    style={{ transition: 'stroke-dashoffset 1s linear' }}
                  />
                )}
                <text
                  x="50"
                  y="54"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--fg)"
                  fontSize="20"
                  fontWeight="700"
                >
                  {phase === 'cloak' ? cloakTimeLeft : answerTimeLeft}
                </text>
              </svg>
            </div>

            {phase === 'cloak' && (
              <p className="text-sm mt-4" style={{ color: 'var(--muted-fg)' }}>
                Options will appear in {cloakTimeLeft}s — calculate mentally!
              </p>
            )}
          </div>

          <div className="w-full max-w-md grid grid-cols-2 gap-3">
            {phase === 'cloak' ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-16 rounded-xl animate-pulse"
                    style={{ background: 'var(--muted)' }}
                  />
                ))}
              </>
            ) : (
              options.map((option, idx) => {
                let optionStyle: React.CSSProperties = {
                  background: 'var(--muted)',
                  color: 'var(--fg)',
                  borderColor: 'var(--card-border)',
                }

                if (phase === 'answered') {
                  if (option === question.ans) {
                    optionStyle = {
                      background: 'var(--success)',
                      color: '#FFFFFF',
                      borderColor: 'var(--success)',
                    }
                  } else if (option === selectedOption && !isCorrect) {
                    optionStyle = {
                      background: 'var(--error)',
                      color: '#FFFFFF',
                      borderColor: 'var(--error)',
                    }
                  }
                } else if (selectedOption === option) {
                  optionStyle = {
                    background: 'var(--primary)',
                    color: 'var(--primary-fg)',
                    borderColor: 'var(--primary)',
                  }
                }

                const labels = ['A', 'B', 'C', 'D']

                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionClick(option)}
                    disabled={phase === 'answered'}
                    className={cn(
                      'h-16 rounded-xl text-lg font-semibold transition-all duration-200 border-2',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]',
                      phase === 'revealed' && !selectedOption && 'hover:scale-[1.02] active:scale-[0.98]',
                      feedbackAnim === 'wrong' && option === selectedOption && 'animate-shake',
                      feedbackAnim === 'correct' && option === question.ans && 'animate-glow-green',
                    )}
                    style={{
                      ...optionStyle,
                      cursor: phase === 'answered' ? 'default' : 'pointer',
                    }}
                    aria-label={`Option ${labels[idx]}: ${option}`}
                  >
                    <span className="text-sm mr-2 opacity-60">{labels[idx]}.</span>
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
