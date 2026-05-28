'use client'

import { useState, useMemo } from 'react'
import type { Difficulty, RangeOption, QuizConfig } from '@/types/quiz'

interface SetupScreenProps {
  config: QuizConfig
  onConfigChange: (config: QuizConfig) => void
  onStart: () => void
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

export default function SetupScreen({ config, onConfigChange, onStart }: SetupScreenProps) {
  const [selectedRangeLabels, setSelectedRangeLabels] = useState<string[]>(
    config.ranges.map(r => r.label)
  )

  const isStartEnabled = selectedRangeLabels.length > 0

  const toggleRange = (label: string) => {
    setSelectedRangeLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const selectAllRanges = () => setSelectedRangeLabels(RANGE_PRESETS.map(r => r.label))
  const clearRanges = () => setSelectedRangeLabels([])

  const selectedNumbersCount = useMemo(() =>
    selectedRangeLabels.reduce((sum, label) => {
      const range = RANGE_PRESETS.find(r => r.label === label)
      return range ? sum + (range.hi - range.lo + 1) : sum
    }, 0), [selectedRangeLabels]
  )

  const updateConfig = (updates: Partial<QuizConfig>) => {
    onConfigChange({
      ...config,
      ranges: selectedRangeLabels.map(label => RANGE_PRESETS.find(r => r.label === label)!).filter(Boolean),
      ...updates,
    })
  }

  const handleStart = () => { updateConfig({}); onStart() }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <div className="flex flex-col space-y-1.5 p-6 pb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">TableMaster Pro</h1>
              <p className="text-sm text-muted-foreground">Master multiplication tables</p>
            </div>
          </div>
        </div>

        <div className="p-6 pt-0 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Table Range
              </label>
              <div className="flex gap-1">
                <button
                  onClick={selectAllRanges}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-7 px-2 text-muted-foreground"
                >
                  Select All
                </button>
                <button
                  onClick={clearRanges}
                  className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 h-7 px-2 text-muted-foreground"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="grid grid-cols-5 gap-2" role="group">
              {RANGE_PRESETS.map((range) => {
                const isSelected = selectedRangeLabels.includes(range.label)
                return (
                  <button
                    key={range.label}
                    onClick={() => toggleRange(range.label)}
                    data-state={isSelected ? 'on' : 'off'}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-3 py-2 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-transparent text-muted-foreground border border-input'
                    }`}
                  >
                    {range.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedNumbersCount > 0
                ? `${selectedNumbersCount} numbers selected`
                : 'Select at least one range'}
            </p>
          </div>

          <div className="h-px bg-border" />

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-3">
              Difficulty
            </label>
            <div className="grid grid-cols-3 gap-2" role="group">
              {DIFFICULTIES.map((d) => {
                const isSelected = config.difficulty === d.value
                return (
                  <button
                    key={d.value}
                    onClick={() => updateConfig({ difficulty: d.value })}
                    data-state={isSelected ? 'on' : 'off'}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 p-3 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-transparent text-muted-foreground border border-input'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-sm font-medium">{d.label}</div>
                      <div className="text-xs opacity-80 mt-0.5">{d.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-3">
              Number of Questions
            </label>
            <div className="grid grid-cols-5 gap-2" role="group">
              {QUESTION_COUNTS.map((count) => {
                const isSelected = config.questionCount === count
                return (
                  <button
                    key={count}
                    onClick={() => updateConfig({ questionCount: count })}
                    data-state={isSelected ? 'on' : 'off'}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-3 py-2 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-transparent text-muted-foreground border border-input'
                    }`}
                  >
                    {count}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-3">
              Cloak Duration
            </label>
            <div className="grid grid-cols-3 gap-2" role="group">
              {CLOAK_OPTIONS.map((sec) => {
                const isSelected = config.cloakDuration === sec
                return (
                  <button
                    key={sec}
                    onClick={() => updateConfig({ cloakDuration: sec })}
                    data-state={isSelected ? 'on' : 'off'}
                    className={`inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 px-4 py-2.5 ${
                      isSelected
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-transparent text-muted-foreground border border-input'
                    }`}
                  >
                    {sec}s
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-input p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none">Speed Mode</label>
              <p className="text-xs text-muted-foreground">Answer within 3s of options reveal</p>
            </div>
            <button
              onClick={() => updateConfig({ speedMode: !config.speedMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                config.speedMode ? 'bg-primary' : 'bg-input'
              }`}
              role="switch"
              aria-checked={config.speedMode}
            >
              <span
                className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-sm ring-0 transition-transform ${
                  config.speedMode ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>

        <div className="p-6 pt-0">
          <button
            onClick={handleStart}
            disabled={!isStartEnabled}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full shadow-sm"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  )
}
