import type { RangeOption } from '@/types/quiz'

export const RANGE_PRESETS: RangeOption[] = [
  { label: '1–10', lo: 1, hi: 10 },
  { label: '11–20', lo: 11, hi: 20 },
  { label: '21–30', lo: 21, hi: 30 },
  { label: '31–40', lo: 31, hi: 40 },
  { label: '41–50', lo: 41, hi: 50 },
  { label: '51–60', lo: 51, hi: 60 },
  { label: '61–70', lo: 61, hi: 70 },
  { label: '71–80', lo: 71, hi: 80 },
  { label: '81–90', lo: 81, hi: 90 },
  { label: '91–100', lo: 91, hi: 100 },
]

export const QUESTION_COUNTS = [10, 20, 30, 40, 50] as const

export const CLOAK_OPTIONS = [3, 5, 7] as const

export const DIFFICULTIES = [
  { value: 'easy' as const, label: 'Easy', desc: 'Multipliers 1–5' },
  { value: 'medium' as const, label: 'Medium', desc: 'Multipliers 1–10' },
  { value: 'hard' as const, label: 'Hard', desc: 'Multipliers 11–20' },
] as const

export const PERFORMANCE_THRESHOLDS = [
  { min: 100, label: 'Perfect Score!', emoji: '🏆' },
  { min: 80, label: 'Excellent!', emoji: '🌟' },
  { min: 60, label: 'Good Job!', emoji: '👏' },
  { min: 40, label: 'Not Bad!', emoji: '💪' },
  { min: 0, label: 'Keep Practicing!', emoji: '📚' },
] as const

export const STORAGE_KEYS = {
  SCORE_HISTORY: 'tablemaster-scores',
  THEME: 'tablemaster-theme',
} as const
