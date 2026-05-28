export type QuizPhase = 'setup' | 'countdown' | 'quiz' | 'result'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface RangeOption {
  label: string
  lo: number
  hi: number
}

export interface Question {
  a: number
  b: number
  ans: number
}

export interface HistoryItem {
  question: Question
  selected: number | null
  isCorrect: boolean
}

export interface QuizConfig {
  ranges: RangeOption[]
  questionCount: number
  cloakDuration: number
  speedMode: boolean
  difficulty: Difficulty
}

export interface ScoreRecord {
  date: number
  score: number
  total: number
  percentage: number
  timeTaken: number
}
