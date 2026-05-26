'use client'

import { useState, useCallback, useEffect } from 'react'
import { generateQuestions } from '@/lib/quiz-engine'
import type { QuizPhase, QuizConfig, Question, HistoryItem } from '@/types/quiz'
import SetupScreen from '@/components/quiz/SetupScreen'
import CountdownOverlay from '@/components/quiz/CountdownOverlay'
import QuizCard from '@/components/quiz/QuizCard'
import ResultScreen from '@/components/quiz/ResultScreen'

const DEFAULT_CONFIG: QuizConfig = {
  ranges: [],
  questionCount: 10,
  cloakDuration: 5,
  speedMode: false,
  difficulty: 'medium',
}

export default function Home() {
  const [phase, setPhase] = useState<QuizPhase>('setup')
  const [config, setConfig] = useState<QuizConfig>(DEFAULT_CONFIG)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [startTime, setStartTime] = useState(0)
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')

  useEffect(() => {
    try {
      const saved = localStorage.getItem('tablemaster-theme')
      if (saved === 'light' || saved === 'dark') {
        setTheme(saved)
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setTheme(prefersDark ? 'dark' : 'light')
      }
    } catch {}
  }, [])

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    try {
      localStorage.setItem('tablemaster-theme', theme)
    } catch {}
  }, [theme])

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }, [])

  const handleStart = useCallback(() => {
    if (config.ranges.length === 0) return

    if (startTime === 0) {
      setStartTime(Date.now())
    }

    const generated = generateQuestions(config)
    if (generated.length === 0) return

    setQuestions(generated)
    setCurrentIndex(0)
    setHistory([])
    setScore(0)
    setStreak(0)
    setPhase('countdown')
  }, [config, startTime])

  const handleCountdownComplete = useCallback(() => {
    setPhase('quiz')
  }, [])

  const handleAnswer = useCallback((item: HistoryItem) => {
    setHistory(prev => [...prev, item])

    if (item.isCorrect) {
      setScore(prev => prev + 10)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    if (currentIndex + 1 >= questions.length) {
      setPhase('result')
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }, [currentIndex, questions.length])

  const handlePlayAgain = useCallback(() => {
    setPhase('setup')
    setStartTime(0)
    setConfig(DEFAULT_CONFIG)
  }, [])

  if (phase === 'setup') {
    return (
      <SetupScreen
        config={config}
        onConfigChange={setConfig}
        onStart={handleStart}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />
    )
  }

  if (phase === 'countdown') {
    return (
      <>
        <SetupScreen
          config={config}
          onConfigChange={setConfig}
          onStart={handleStart}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        <CountdownOverlay onComplete={handleCountdownComplete} />
      </>
    )
  }

  if (phase === 'quiz' && questions[currentIndex]) {
    return (
      <QuizCard
        key={currentIndex}
        question={questions[currentIndex]}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        score={score}
        streak={streak}
        cloakDuration={config.cloakDuration}
        speedMode={config.speedMode}
        onAnswer={handleAnswer}
      />
    )
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        history={history}
        score={score}
        totalQuestions={questions.length}
        startTime={startTime}
        onPlayAgain={handlePlayAgain}
      />
    )
  }

  return null
}
