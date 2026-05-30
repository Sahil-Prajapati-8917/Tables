'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useQuiz } from '@/context/QuizContext'
import { getPerformanceLabel } from '@/lib/quiz-engine'
import { playVictory } from '@/lib/audio'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  CircleDollarSign,
  ArrowUpRight,
  BarChart3,
  Ellipsis,
  Target,
  Timer,
} from 'lucide-react'

function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  const started = useRef(false)

  useEffect(() => {
    if (started.current) return
    started.current = true
    const duration = 1000
    const steps = 30
    const increment = value / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= value) {
        setDisplay(value)
        clearInterval(timer)
      } else {
        setDisplay(Math.round(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [value])

  return (
    <span className="tabular-nums">
      {display}{suffix}
    </span>
  )
}

export default function ResultScreen() {
  const { history, score, totalQuestions, timeTaken, reset } = useQuiz()
  const confettiFired = useRef(false)

  const correctCount = history.filter(h => h.isCorrect).length
  const wrongCount = history.filter(h => !h.isCorrect).length
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const performance = getPerformanceLabel(percentage)
  const mins = Math.floor(timeTaken / 60)
  const secs = timeTaken % 60

  useEffect(() => {
    if (percentage >= 80 && !confettiFired.current) {
      confettiFired.current = true
      playVictory()

      const duration = 2000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors: ['#6C5CE7', '#A78BFA', '#7C6AF7'],
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors: ['#6C5CE7', '#A78BFA', '#7C6AF7'],
        })
        if (Date.now() < end) requestAnimationFrame(frame)
      }
      frame()
    }
  }, [percentage])

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-card rounded-xl border">
            <div className="flex h-14 items-center justify-center border-b px-4 sm:px-5">
              <div className="flex items-center gap-2">
                <div className="flex size-7 sm:size-8 items-center justify-center rounded-md border bg-muted/40">
                  <Trophy className="size-4 text-muted-foreground" />
                </div>
                <h2 className="text-sm font-medium sm:text-base">{performance.label}</h2>
              </div>
            </div>
            <CardContent className="pt-6 pb-6 space-y-6">
              <div className="flex flex-col items-center gap-2">
                <span className="text-5xl">{performance.emoji}</span>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="size-3.5" />
                  Completed in {timeTaken.mins}m {timeTaken.secs}s
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-3">
                <div className="bg-card flex flex-col rounded-xl border p-4 sm:p-5">
                  <div className="flex min-h-[64px] items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted/40 flex size-8 items-center justify-center rounded-md border">
                        <CheckCircle2 className="size-4 text-emerald-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">Correct</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-foreground text-lg font-semibold">
                            <AnimatedCounter value={correctCount} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Correct answers">
                      <Ellipsis className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-card flex flex-col rounded-xl border p-4 sm:p-5">
                  <div className="flex min-h-[64px] items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted/40 flex size-8 items-center justify-center rounded-md border">
                        <XCircle className="size-4 text-destructive" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">Wrong</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-foreground text-lg font-semibold">
                            <AnimatedCounter value={wrongCount} />
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Wrong answers">
                      <Ellipsis className="size-4" />
                    </Button>
                  </div>
                </div>

                <div className="bg-card flex flex-col rounded-xl border p-4 sm:p-5">
                  <div className="flex min-h-[64px] items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-muted/40 flex size-8 items-center justify-center rounded-md border">
                        <Target className="size-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium">Accuracy</p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-foreground text-lg font-semibold">
                            <AnimatedCounter value={percentage} suffix="%" />
                          </span>
                          <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                            <ArrowUpRight className="size-3" />
                            {score} pts
                          </span>
                          <span className="text-muted-foreground text-[10px] sm:text-xs">total</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="size-8" aria-label="Accuracy details">
                      <Ellipsis className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-card flex flex-col gap-3 rounded-xl border p-4 sm:p-5">
                <div className="flex min-h-[64px] items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-muted/40 flex size-8 items-center justify-center rounded-md border">
                      <CircleDollarSign className="size-4 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-muted-foreground text-xs font-medium">Score</p>
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-foreground text-lg font-semibold">{score}</span>
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <ArrowUpRight className="size-3" />
                          {totalQuestions}
                        </span>
                        <span className="text-muted-foreground text-[10px] sm:text-xs">questions</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="size-8" aria-label="Score details">
                    <Ellipsis className="size-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-card rounded-xl border">
            <div className="flex h-14 items-center justify-between border-b px-4 sm:px-5">
              <div className="flex items-center gap-2.5">
                <Button variant="outline" size="icon" className="size-7 sm:size-8" aria-label="Question review">
                  <BarChart3 className="size-4 text-muted-foreground" />
                </Button>
                <h2 className="text-sm font-medium sm:text-base">Question Review</h2>
              </div>
            </div>

            <div className="p-4 sm:p-5">
              <Tabs defaultValue="all" className="w-full">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="all" className="flex-1">
                    All ({totalQuestions})
                  </TabsTrigger>
                  <TabsTrigger value="correct" className="flex-1">
                    Correct ({correctCount})
                  </TabsTrigger>
                  <TabsTrigger value="wrong" className="flex-1">
                    Wrong ({wrongCount})
                  </TabsTrigger>
                </TabsList>

                {(['all', 'correct', 'wrong'] as const).map((filter) => {
                  const filtered = filter === 'all'
                    ? history
                    : history.filter(h => filter === 'correct' ? h.isCorrect : !h.isCorrect)

                  return (
                    <TabsContent key={filter} value={filter} className="mt-0">
                      <ScrollArea className="max-h-[320px]">
                        {filtered.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-12 text-muted-foreground">
                            {filter === 'wrong' ? (
                              <>
                                <CheckCircle2 className="size-10 text-emerald-600" />
                                <p className="text-sm">No wrong answers — perfect!</p>
                              </>
                            ) : (
                              <>
                                <XCircle className="size-10" />
                                <p className="text-sm">No questions in this category</p>
                              </>
                            )}
                          </div>
                        ) : (
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Question</TableHead>
                                <TableHead>Correct</TableHead>
                                <TableHead>Your Answer</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filtered.map((item, idx) => (
                                <TableRow key={idx}>
                                  <TableCell className="text-xs text-muted-foreground font-mono">
                                    {idx + 1}
                                  </TableCell>
                                  <TableCell className="font-medium">
                                    {item.question.a} × {item.question.b}
                                  </TableCell>
                                  <TableCell className="text-emerald-600 font-mono">
                                    {item.question.ans}
                                  </TableCell>
                                  <TableCell className="font-mono">
                                    {item.selected !== null ? item.selected : '—'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.isCorrect ? (
                                      <Badge variant="secondary" className="bg-emerald-600/10 text-emerald-600 border-emerald-600/20 gap-1">
                                        <CheckCircle2 className="size-3" />
                                        Correct
                                      </Badge>
                                    ) : (
                                      <Badge variant="secondary" className="bg-destructive/10 text-destructive border-destructive/20 gap-1">
                                        <XCircle className="size-3" />
                                        {item.selected === null ? 'Timed out' : 'Wrong'}
                                      </Badge>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        )}
                      </ScrollArea>
                    </TabsContent>
                  )
                })}
              </Tabs>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pb-6"
        >
          <Button onClick={reset} className="w-full h-10 gap-2">
            <RotateCcw className="size-4" />
            Play Again
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
