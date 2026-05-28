'use client'

import { createContext, useContext, useState, useCallback, useRef, type ReactNode } from 'react'
import { generateQuestions } from '@/lib/quiz-engine'
import type { QuizPhase, QuizConfig, Question, HistoryItem, ScoreRecord } from '@/types/quiz'
import { STORAGE_KEYS } from '@/lib/constants'

const DEFAULT_CONFIG: QuizConfig = {
  ranges: [],
  questionCount: 10,
  cloakDuration: 5,
  speedMode: false,
  difficulty: 'medium',
}

interface QuizContextValue {
  phase: QuizPhase
  config: QuizConfig
  questions: Question[]
  currentIndex: number
  history: HistoryItem[]
  score: number
  streak: number
  startTime: number
  scoreHistory: ScoreRecord[]
  setConfig: (config: QuizConfig) => void
  startQuiz: () => void
  answerQuestion: (item: HistoryItem) => void
  handleCountdownComplete: () => void
  reset: () => void
  totalQuestions: number
}

const QuizContext = createContext<QuizContextValue | null>(null)

function loadScoreHistory(): ScoreRecord[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SCORE_HISTORY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveScoreHistory(records: ScoreRecord[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.SCORE_HISTORY, JSON.stringify(records.slice(-50)))
  } catch {}
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<QuizPhase>('setup')
  const [config, setConfig] = useState<QuizConfig>(DEFAULT_CONFIG)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [scoreHistory, setScoreHistory] = useState<ScoreRecord[]>(loadScoreHistory)
  const historyRef = useRef<HistoryItem[]>([])
  const scoreRef = useRef(0)

  const startQuiz = useCallback(() => {
    if (config.ranges.length === 0) return
    const generated = generateQuestions(config)
    if (generated.length === 0) return

    if (startTime === 0) setStartTime(Date.now())

    setQuestions(generated)
    setCurrentIndex(0)
    setHistory([])
    historyRef.current = []
    setScore(0)
    scoreRef.current = 0
    setStreak(0)
    setPhase('countdown')
  }, [config, startTime])

  const handleCountdownComplete = useCallback(() => {
    setPhase('quiz')
  }, [])

  const answerQuestion = useCallback((item: HistoryItem) => {
    historyRef.current = [...historyRef.current, item]
    setHistory(historyRef.current)

    let newScore = scoreRef.current
    let newStreak = 0

    if (item.isCorrect) {
      newScore += 10
      newStreak = streak + 1
      scoreRef.current = newScore
      setScore(newScore)
      setStreak(newStreak)
    } else {
      setStreak(0)
    }

    if (currentIndex + 1 >= questions.length) {
      setPhase('result')
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const total = questions.length
      const correct = historyRef.current.filter(h => h.isCorrect).length + (item.isCorrect ? 1 : 0)
      const percentage = Math.round((correct / total) * 100)
      const record: ScoreRecord = { date: Date.now(), score: newScore, total, percentage, timeTaken: elapsed }

      setScoreHistory(prev => {
        const updated = [record, ...prev].slice(0, 50)
        saveScoreHistory(updated)
        return updated
      })
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, questions.length, streak, startTime])

  const reset = useCallback(() => {
    setPhase('setup')
    setStartTime(0)
    setConfig(DEFAULT_CONFIG)
    setQuestions([])
    setCurrentIndex(0)
    setHistory([])
    historyRef.current = []
    setScore(0)
    scoreRef.current = 0
    setStreak(0)
  }, [])

  return (
    <QuizContext.Provider
      value={{
        phase,
        config,
        questions,
        currentIndex,
        history,
        score,
        streak,
        startTime,
        scoreHistory,
        setConfig,
        startQuiz,
        answerQuestion,
        handleCountdownComplete,
        reset,
        totalQuestions: questions.length,
      }}
    >
      {children}
    </QuizContext.Provider>
  )
}

export function useQuiz() {
  const ctx = useContext(QuizContext)
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider')
  return ctx
}
