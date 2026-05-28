'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from 'next-themes'
import { useQuiz } from '@/context/QuizContext'
import { RANGE_PRESETS, QUESTION_COUNTS, CLOAK_OPTIONS, DIFFICULTIES } from '@/lib/constants'
import type { Difficulty } from '@/types/quiz'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'
import {
  Sun,
  Moon,
  Play,
  ArrowRight,
  Check,
  Layers,
  Clock,
  Gauge,
  Table,
  Sigma,
  Sparkles,
} from 'lucide-react'

export default function SetupScreen() {
  const { config, setConfig, startQuiz } = useQuiz()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [selectedRangeLabels, setSelectedRangeLabels] = useState<string[]>(
    config.ranges.map(r => r.label)
  )

  const isStartEnabled = selectedRangeLabels.length > 0

  const selectedNumbersCount = useMemo(() =>
    selectedRangeLabels.reduce((sum, label) => {
      const range = RANGE_PRESETS.find(r => r.label === label)
      return range ? sum + (range.hi - range.lo + 1) : sum
    }, 0), [selectedRangeLabels]
  )

  const updateConfig = (updates: Partial<typeof config>) => {
    setConfig({
      ...config,
      ranges: selectedRangeLabels.map(label => RANGE_PRESETS.find(r => r.label === label)!).filter(Boolean),
      ...updates,
    })
  }

  const handleRangeToggle = (label: string) => {
    setSelectedRangeLabels(prev =>
      prev.includes(label) ? prev.filter(l => l !== label) : [...prev, label]
    )
  }

  const handleStart = () => {
    updateConfig({})
    startQuiz()
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme
  const isDark = currentTheme === 'dark'

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col">
        <header className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-lg bg-primary flex items-center justify-center">
              <Sigma className="size-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">TableMaster Pro</h1>
              <p className="text-xs text-muted-foreground">Multiplication Quiz</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="size-5" /> : <Moon className="size-5" />}
          </Button>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-xl"
          >
            <Card className="glass-card border-0 shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">Quiz Setup</CardTitle>
                    <CardDescription>Configure your multiplication challenge</CardDescription>
                  </div>
                  <Sparkles className="size-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="size-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Difficulty</label>
                  </div>
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
                        className="p-3 h-auto rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                      >
                        <div className="text-center">
                          <div className="text-sm font-medium">{d.label}</div>
                          <div className="text-[11px] opacity-80 mt-0.5">{d.desc}</div>
                        </div>
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="size-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Cloak Duration</label>
                  </div>
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
                        className="px-6 py-2.5 h-auto rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                      >
                        {sec}s
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                <Separator />

                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div className="flex items-center gap-2">
                    <Gauge className="size-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium">Speed Mode</label>
                      <p className="text-xs text-muted-foreground">3s limit after options appear</p>
                    </div>
                  </div>
                  <Switch
                    checked={config.speedMode}
                    onCheckedChange={(checked: boolean) => updateConfig({ speedMode: checked })}
                  />
                </div>

                <Separator />

                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sigma className="size-4 text-muted-foreground" />
                    <label className="text-sm font-medium">Questions</label>
                  </div>
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
                        className="rounded-lg data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90"
                      >
                        {count}
                      </ToggleGroupItem>
                    ))}
                  </ToggleGroup>
                </div>

                <Separator />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Table className="size-4 text-muted-foreground" />
                      <label className="text-sm font-medium">Table Range</label>
                    </div>
                    <Sheet>
                      <SheetTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Layers className="size-3.5" />
                          {selectedRangeLabels.length > 0
                            ? `${selectedRangeLabels.length} selected`
                            : 'Select ranges'}
                          <ArrowRight className="size-3.5" />
                        </Button>
                      </SheetTrigger>
                      <SheetContent side="right" className="w-80 sm:w-96">
                        <SheetHeader>
                          <SheetTitle>Table Ranges</SheetTitle>
                          <SheetDescription>
                            Choose multiplication tables to practice
                          </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 space-y-3">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedRangeLabels(RANGE_PRESETS.map(r => r.label))}
                            >
                              Select All
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => setSelectedRangeLabels([])}
                            >
                              Clear
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            {RANGE_PRESETS.map((range) => {
                              const selected = selectedRangeLabels.includes(range.label)
                              return (
                                <Button
                                  key={range.label}
                                  variant={selected ? 'default' : 'outline'}
                                  className="justify-between"
                                  onClick={() => handleRangeToggle(range.label)}
                                >
                                  {range.label}
                                  {selected && <Check className="size-3.5" />}
                                </Button>
                              )
                            })}
                          </div>
                        </div>
                        <div className="mt-6">
                          <SheetClose asChild>
                            <Button className="w-full">Done</Button>
                          </SheetClose>
                        </div>
                      </SheetContent>
                    </Sheet>
                  </div>
                  {selectedRangeLabels.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedRangeLabels.map(label => (
                        <Badge key={label} variant="secondary" className="text-xs">
                          {label}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No ranges selected — choose at least one
                    </p>
                  )}
                  {selectedNumbersCount > 0 && (
                    <p className="text-xs text-muted-foreground mt-1.5">
                      {selectedNumbersCount} unique numbers available
                    </p>
                  )}
                </div>
              </CardContent>

              <div className="px-4 pb-4">
                <Button
                  onClick={handleStart}
                  disabled={!isStartEnabled}
                  className="w-full h-11 gap-2 shadow-lg shadow-primary/20"
                  size="lg"
                >
                  <Play className="size-4" />
                  Start Quiz
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
