'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateOptions } from '@/lib/quiz-engine'
import { playCorrect, playWrong } from '@/lib/audio'
import { useQuiz } from '@/context/QuizContext'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardHeader, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Sparkles, Zap, Flame } from 'lucide-react'

export default function QuizCard() {
  const { questions, currentIndex, totalQuestions, score, streak, config, answerQuestion } = useQuiz()
  const question = questions[currentIndex]

  const [phase, setPhase] = useState<'cloak' | 'revealed' | 'answered'>('cloak')
  const [cloakTimeLeft, setCloakTimeLeft] = useState(config.cloakDuration)
  const [answerTimeLeft, setAnswerTimeLeft] = useState(config.speedMode ? 3 : 6)
  const [options, setOptions] = useState<number[]>([])
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [feedbackAnim, setFeedbackAnim] = useState<'none' | 'correct' | 'wrong'>('none')

  const cloakTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const answerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const totalCloakTime = config.cloakDuration
  const totalAnswerTime = config.speedMode ? 3 : 6
  const progressPercent = ((currentIndex + 1) / totalQuestions) * 100

  useEffect(() => {
    setOptions(generateOptions(question))
    setCloakTimeLeft(config.cloakDuration)
    setAnswerTimeLeft(config.speedMode ? 3 : 6)
    setSelectedOption(null)
    setFeedbackAnim('none')
    setPhase('cloak')

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
  }, [currentIndex]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase !== 'revealed') return

    setAnswerTimeLeft(config.speedMode ? 3 : 6)
    answerTimerRef.current = setInterval(() => {
      setAnswerTimeLeft(prev => {
        if (prev <= 1) {
          if (answerTimerRef.current) clearInterval(answerTimerRef.current)
          setPhase('answered')
          setFeedbackAnim('wrong')
          playWrong()
          answerQuestion({ question, selected: null, isCorrect: false })
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (answerTimerRef.current) clearInterval(answerTimerRef.current)
    }
  }, [phase, config.speedMode, question, answerQuestion])

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
      answerQuestion({ question, selected: option, isCorrect: correct })
    }, 1100)
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'revealed') return
      const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3, a: 0, b: 1, c: 2, d: 3 }
      const idx = keyMap[e.key.toLowerCase()]
      if (idx !== undefined && options[idx] !== undefined) {
        handleOptionClick(options[idx])
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [phase, options]) // eslint-disable-line react-hooks/exhaustive-deps

  const getTimerRingColor = (timeLeft: number, total: number) => {
    const ratio = timeLeft / total
    if (ratio > 0.5) return 'var(--primary)'
    if (ratio > 0.25) return 'var(--warning)'
    return 'var(--destructive)'
  }

  const ringRadius = 44
  const ringCircumference = 2 * Math.PI * ringRadius
  const labels = ['A', 'B', 'C', 'D']

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-40 left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 right-20 w-80 h-80 bg-primary/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Badge variant="secondary" className="text-xs gap-1">
            <Sparkles className="size-3" />
            Q {currentIndex + 1}/{totalQuestions}
          </Badge>
          <div className="flex-1">
            <Progress value={progressPercent} className="h-2 rounded-full bg-muted [&>[data-slot=progress-track]]:h-full [&>[data-slot=progress-indicator]]:rounded-full" />
          </div>
          <Badge variant="secondary" className="text-xs gap-1">
            <Zap className="size-3" />
            {score} pts
          </Badge>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-6">
          {streak > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              <Badge variant="secondary" className="text-xs gap-1 px-3 py-1">
                <Flame className="size-3.5 text-warning" />
                {streak} streak
              </Badge>
            </motion.div>
          )}

          <Card className="w-full glass-card border-0 shadow-xl">
            <CardHeader className="pb-2">
              <CardDescription className="text-center">
                What is the product?
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 pt-2">
              <motion.h2
                key={currentIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="text-4xl sm:text-5xl font-bold tracking-tight"
              >
                {question.a}
                <span className="text-primary mx-1"> × </span>
                {question.b}
                <span className="text-muted-foreground"> = ?</span>
              </motion.h2>

              <div className="relative">
                <svg width="96" height="96" viewBox="0 0 100 100">
                  <defs>
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <circle cx="50" cy="50" r={ringRadius} fill="none" stroke="var(--border)" strokeWidth="6" />
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
                      filter="url(#glow)"
                    />
                  )}
                  <text
                    x="50" y="54"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="var(--foreground)"
                    fontSize="20"
                    fontWeight="700"
                  >
                    {phase === 'cloak' ? cloakTimeLeft : answerTimeLeft}
                  </text>
                </svg>
              </div>

              {phase === 'cloak' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Options in {cloakTimeLeft}s — calculate mentally!
                </motion.p>
              )}

              {phase === 'revealed' && !selectedOption && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-muted-foreground"
                >
                  Press 1-4 or A-D to answer quickly
                </motion.p>
              )}
            </CardContent>
          </Card>

          <div className="w-full grid grid-cols-2 gap-3">
            {phase === 'cloak' ? (
              <>
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-14 rounded-xl" />
                ))}
              </>
            ) : (
              <AnimatePresence mode="popLayout">
                {options.map((option, idx) => {
                  let btnClass = ''
                  let icon = null

                  if (phase === 'answered') {
                    if (option === question.ans) {
                      btnClass = 'bg-success text-white border-success hover:bg-success/90 shadow-lg shadow-success/20'
                      icon = <span className="text-lg mr-1">✓</span>
                    } else if (option === selectedOption && feedbackAnim === 'wrong') {
                      btnClass = 'bg-destructive text-destructive-foreground border-destructive animate-shake'
                      icon = <span className="text-lg mr-1">✗</span>
                    }
                  }

                  return (
                    <motion.div
                      key={idx}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, delay: idx * 0.08 }}
                    >
                      <Button
                        variant="outline"
                        className={`h-14 w-full justify-start text-base gap-1 rounded-xl ${btnClass}`}
                        onClick={() => handleOptionClick(option)}
                        disabled={phase === 'answered'}
                        aria-label={`Option ${labels[idx]}: ${option}`}
                      >
                        {icon}
                        <span className="text-xs font-medium text-muted-foreground mr-1.5">{labels[idx]}.</span>
                        {option}
                      </Button>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
