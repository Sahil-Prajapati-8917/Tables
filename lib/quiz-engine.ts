import type { Question, QuizConfig } from '@/types/quiz'

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function generateQuestions(config: QuizConfig): Question[] {
  const { ranges, questionCount, difficulty } = config

  const pool: Question[] = []
  const seen = new Set<string>()

  let maxB: number
  switch (difficulty) {
    case 'easy':
      maxB = 5
      break
    case 'medium':
      maxB = 10
      break
    case 'hard':
      maxB = 20
      break
  }

  for (const range of ranges) {
    for (let a = range.lo; a <= range.hi; a++) {
      for (let b = 1; b <= maxB; b++) {
        const key = `${a}x${b}`
        if (seen.has(key)) continue
        seen.add(key)
        pool.push({ a, b, ans: a * b })
      }
    }
  }

  const shuffled = shuffleArray(pool)
  const count = Math.min(questionCount, shuffled.length)
  return shuffled.slice(0, count)
}

export function generateOptions(question: Question): number[] {
  const { a, b, ans } = question
  const candidates = new Set<number>()

  const addCandidate = (n: number) => {
    if (n > 0 && n !== ans) candidates.add(n)
  }

  addCandidate(ans - a)
  addCandidate(ans + a)
  addCandidate(ans - b)
  addCandidate(ans + b)
  addCandidate(ans - (a + b))
  addCandidate(ans + (a + b))

  if (a !== b) {
    const diff = Math.abs(a - b)
    addCandidate(ans - diff)
    addCandidate(ans + diff)
  }

  addCandidate(ans - 10)
  addCandidate(ans + 10)
  addCandidate(ans - 20)
  addCandidate(ans + 20)
  addCandidate(ans - 15)
  addCandidate(ans + 15)

  const valid = Array.from(candidates)
  const shuffled = shuffleArray(valid)
  const distractors: number[] = []

  for (const d of shuffled) {
    if (distractors.length >= 3) break
    if (!distractors.includes(d) && d !== ans) {
      distractors.push(d)
    }
  }

  while (distractors.length < 3) {
    const offset = Math.floor(Math.random() * 15) + 5
    const d = ans + (Math.random() > 0.5 ? offset : -offset)
    if (d > 0 && d !== ans && !distractors.includes(d)) {
      distractors.push(d)
    }
  }

  return shuffleArray([ans, ...distractors])
}

export function getPerformanceLabel(percentage: number): { label: string; emoji: string } {
  if (percentage === 100) return { label: 'Perfect Score!', emoji: '🏆' }
  if (percentage >= 80) return { label: 'Excellent!', emoji: '🌟' }
  if (percentage >= 60) return { label: 'Good Job!', emoji: '👏' }
  if (percentage >= 40) return { label: 'Not Bad!', emoji: '💪' }
  return { label: 'Keep Practicing!', emoji: '📚' }
}
