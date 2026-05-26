'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { Difficulty, RangeOption, QuizConfig } from '@/types/quiz'

interface SetupScreenProps {
  config: QuizConfig
  onConfigChange: (config: QuizConfig) => void
  onStart: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const RANGE_PRESETS: RangeOption[] = [
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

const QUESTION_COUNTS = [10, 20, 30, 40, 50]
const CLOAK_OPTIONS = [3, 5, 7]
const DIFFICULTIES: { value: Difficulty; label: string; desc: string }[] = [
  { value: 'easy', label: 'Easy', desc: 'Multipliers 1–5' },
  { value: 'medium', label: 'Medium', desc: 'Multipliers 1–10' },
  { value: 'hard', label: 'Hard', desc: 'Multipliers 11–20' },
]

export default function SetupScreen({
  config,
  onConfigChange,
  onStart,
  theme,
  onToggleTheme,
}: SetupScreenProps) {
  const [selectedRangeLabels, setSelectedRangeLabels] = useState<string[]>(
    config.ranges.map(r => r.label)
  )

  const isStartEnabled = selectedRangeLabels.length > 0

  const toggleRange = (label: string) => {
    setSelectedRangeLabels(prev => {
      const next = prev.includes(label)
        ? prev.filter(l => l !== label)
        : [...prev, label]
      return next
    })
  }

  const selectAllRanges = () => {
    setSelectedRangeLabels(RANGE_PRESETS.map(r => r.label))
  }

  const clearRanges = () => {
    setSelectedRangeLabels([])
  }

  const selectedNumbersCount = useMemo(() => {
    return selectedRangeLabels.reduce((sum, label) => {
      const range = RANGE_PRESETS.find(r => r.label === label)
      if (range) return sum + (range.hi - range.lo + 1)
      return sum
    }, 0)
  }, [selectedRangeLabels])

  const updateConfig = (updates: Partial<QuizConfig>) => {
    onConfigChange({
      ...config,
      ranges: selectedRangeLabels
        .map(label => RANGE_PRESETS.find(r => r.label === label)!)
        .filter(Boolean),
      ...updates,
    })
  }

  const handleStart = () => {
    updateConfig({})
    onStart()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg)' }}>
      <div
        className="w-full max-w-lg animate-scale-in"
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--fg)' }}>
                TableMaster Pro
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--muted-fg)' }}>
                Master multiplication tables
              </p>
            </div>
            <ThemeToggle
              theme={theme}
              onToggle={onToggleTheme}
            />
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                  Table Range
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={selectAllRanges}
                    className="text-xs px-2 py-1 rounded-md transition-colors"
                    style={{
                      color: 'var(--primary)',
                      background: 'var(--muted)',
                    }}
                  >
                    Select All
                  </button>
                  <button
                    onClick={clearRanges}
                    className="text-xs px-2 py-1 rounded-md transition-colors"
                    style={{
                      color: 'var(--muted-fg)',
                      background: 'var(--muted)',
                    }}
                  >
                    Clear
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {RANGE_PRESETS.map((range) => {
                  const isSelected = selectedRangeLabels.includes(range.label)
                  return (
                    <button
                      key={range.label}
                      onClick={() => toggleRange(range.label)}
                      className={cn(
                        'px-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]'
                      )}
                      style={{
                        background: isSelected ? 'var(--primary)' : 'var(--muted)',
                        color: isSelected ? 'var(--primary-fg)' : 'var(--muted-fg)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--card-border)',
                      }}
                    >
                      {range.label}
                    </button>
                  )
                })}
              </div>
              <p className="text-xs mt-2" style={{ color: 'var(--muted-fg)' }}>
                {selectedNumbersCount > 0
                  ? `${selectedNumbersCount} numbers selected`
                  : 'Select at least one range'}
              </p>
            </div>

            <div style={{ height: '1px', background: 'var(--card-border)' }} />

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--fg)' }}>
                Difficulty
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DIFFICULTIES.map((d) => {
                  const isSelected = config.difficulty === d.value
                  return (
                    <button
                      key={d.value}
                      onClick={() => updateConfig({ difficulty: d.value })}
                      className={cn(
                        'p-3 rounded-xl text-left transition-all duration-150 border',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]'
                      )}
                      style={{
                        background: isSelected ? 'var(--primary)' : 'var(--muted)',
                        color: isSelected ? 'var(--primary-fg)' : 'var(--fg)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--card-border)',
                      }}
                    >
                      <div className="text-sm font-medium">{d.label}</div>
                      <div className="text-xs mt-0.5 opacity-80">{d.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--fg)' }}>
                Number of Questions
              </label>
              <div className="grid grid-cols-5 gap-2">
                {QUESTION_COUNTS.map((count) => {
                  const isSelected = config.questionCount === count
                  return (
                    <button
                      key={count}
                      onClick={() => updateConfig({ questionCount: count })}
                      className={cn(
                        'px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150',
                        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]'
                      )}
                      style={{
                        background: isSelected ? 'var(--primary)' : 'var(--muted)',
                        color: isSelected ? 'var(--primary-fg)' : 'var(--muted-fg)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--card-border)',
                      }}
                    >
                      {count}
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium block mb-2" style={{ color: 'var(--fg)' }}>
                Cloak Duration (options hidden for)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CLOAK_OPTIONS.map((sec) => {
                  const isSelected = config.cloakDuration === sec
                  return (
                    <button
                      key={sec}
                      onClick={() => updateConfig({ cloakDuration: sec })}
                      className={cn(
                        'px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]'
                      )}
                      style={{
                        background: isSelected ? 'var(--primary)' : 'var(--muted)',
                        color: isSelected ? 'var(--primary-fg)' : 'var(--muted-fg)',
                        borderColor: isSelected ? 'var(--primary)' : 'var(--card-border)',
                      }}
                    >
                      {sec}s
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--muted)' }}>
              <div>
                <label className="text-sm font-medium" style={{ color: 'var(--fg)' }}>
                  Speed Mode
                </label>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-fg)' }}>
                  Answer within 3s of options reveal
                </p>
              </div>
              <button
                onClick={() => updateConfig({ speedMode: !config.speedMode })}
                className={cn(
                  'relative w-12 h-7 rounded-full transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]'
                )}
                style={{
                  background: config.speedMode ? 'var(--primary)' : 'var(--ring)',
                }}
                role="switch"
                aria-checked={config.speedMode}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-6 h-6 rounded-full transition-all duration-200',
                  )}
                  style={{
                    background: 'var(--primary-fg)',
                    transform: config.speedMode ? 'translateX(20px)' : 'translateX(0)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }}
                />
              </button>
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={!isStartEnabled}
            className={cn(
              'w-full mt-6 py-3.5 rounded-xl text-base font-semibold transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]'
            )}
            style={{
              background: isStartEnabled ? 'var(--primary)' : 'var(--muted)',
              color: isStartEnabled ? 'var(--primary-fg)' : 'var(--muted-fg)',
              cursor: isStartEnabled ? 'pointer' : 'not-allowed',
              boxShadow: isStartEnabled ? 'var(--shadow-glow)' : 'none',
            }}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  )
}

function ThemeToggle({ theme, onToggle }: { theme: string; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 border"
      style={{
        background: 'var(--muted)',
        color: 'var(--muted-fg)',
        borderColor: 'var(--card-border)',
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {theme === 'light' ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.64" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.64" y2="4.22" />
        </svg>
      )}
    </button>
  )
}
