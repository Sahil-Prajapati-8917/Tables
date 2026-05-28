'use client'

import { useState, useMemo } from 'react'
import type { Difficulty, RangeOption, QuizConfig } from '@/types/quiz'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

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
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>TableMaster Pro</CardTitle>
              <CardDescription>Master multiplication tables</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Table Range
              </label>
              <div className="flex gap-1">
                <Button variant="ghost" size="xs" onClick={selectAllRanges}>
                  Select All
                </Button>
                <Button variant="ghost" size="xs" onClick={clearRanges}>
                  Clear
                </Button>
              </div>
            </div>
            <ToggleGroup
              multiple
              value={selectedRangeLabels}
              onValueChange={(value) => setSelectedRangeLabels(value)}
              className="grid grid-cols-5 gap-2 w-full"
              spacing={0}
            >
              {RANGE_PRESETS.map((range) => (
                <ToggleGroupItem
                  key={range.label}
                  value={range.label}
                  className="rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                >
                  {range.label}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            <p className="text-xs text-muted-foreground mt-2">
              {selectedNumbersCount > 0
                ? `${selectedNumbersCount} numbers selected`
                : 'Select at least one range'}
            </p>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-3">
              Difficulty
            </label>
            <ToggleGroup
              value={[config.difficulty]}
              onValueChange={(value) => { if (value.length > 0) updateConfig({ difficulty: value[0] as Difficulty }) }}
              className="grid grid-cols-3 gap-2 w-full"
              spacing={0}
            >
              {DIFFICULTIES.map((d) => (
                <ToggleGroupItem
                  key={d.value}
                  value={d.value}
                  className="p-3 h-auto rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                >
                  <div className="text-center">
                    <div className="text-sm font-medium">{d.label}</div>
                    <div className="text-xs opacity-80 mt-0.5">{d.desc}</div>
                  </div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-3">
              Number of Questions
            </label>
            <ToggleGroup
              value={[String(config.questionCount)]}
              onValueChange={(value) => { if (value.length > 0) updateConfig({ questionCount: parseInt(value[0]) }) }}
              className="grid grid-cols-5 gap-2 w-full"
              spacing={0}
            >
              {QUESTION_COUNTS.map((count) => (
                <ToggleGroupItem
                  key={count}
                  value={String(count)}
                  className="rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                >
                  {count}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 block mb-3">
              Cloak Duration
            </label>
            <ToggleGroup
              value={[String(config.cloakDuration)]}
              onValueChange={(value) => { if (value.length > 0) updateConfig({ cloakDuration: parseInt(value[0]) }) }}
              className="grid grid-cols-3 gap-2 w-full"
              spacing={0}
            >
              {CLOAK_OPTIONS.map((sec) => (
                <ToggleGroupItem
                  key={sec}
                  value={String(sec)}
                  className="px-4 py-2.5 h-auto rounded-md data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                >
                  {sec}s
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="space-y-0.5">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Speed Mode
              </label>
              <p className="text-xs text-muted-foreground">Answer within 3s of options reveal</p>
            </div>
            <Switch
              checked={config.speedMode}
              onCheckedChange={(checked: boolean) => updateConfig({ speedMode: checked })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleStart} disabled={!isStartEnabled} className="w-full shadow-sm">
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
