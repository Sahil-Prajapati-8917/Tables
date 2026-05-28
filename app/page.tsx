'use client'

import { QuizProvider, useQuiz } from '@/context/QuizContext'
import SetupScreen from '@/components/quiz/SetupScreen'
import CountdownOverlay from '@/components/quiz/CountdownOverlay'
import QuizCard from '@/components/quiz/QuizCard'
import ResultScreen from '@/components/quiz/ResultScreen'

function QuizRouter() {
  const { phase, handleCountdownComplete } = useQuiz()

  return (
    <>
      {phase === 'setup' && <SetupScreen />}
      {(phase === 'countdown') && (
        <>
          <SetupScreen />
          <CountdownOverlay onComplete={handleCountdownComplete} />
        </>
      )}
      {phase === 'quiz' && <QuizCard />}
      {phase === 'result' && <ResultScreen />}
    </>
  )
}

export default function Home() {
  return (
    <QuizProvider>
      <QuizRouter />
    </QuizProvider>
  )
}
