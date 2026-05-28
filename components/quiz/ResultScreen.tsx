'use client'

import { useMemo, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { useQuiz } from '@/context/QuizContext'
import { getPerformanceLabel } from '@/lib/quiz-engine'
import { playVictory } from '@/lib/audio'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import {
  Trophy,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
  TrendingUp,
  Sparkles,
  BarChart3,
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
  const { history, score, totalQuestions, startTime, reset } = useQuiz()
  const confettiFired = useRef(false)

  const correctCount = history.filter(h => h.isCorrect).length
  const wrongCount = history.filter(h => !h.isCorrect).length
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
  const performance = getPerformanceLabel(percentage)

  const timeTaken = useMemo(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000)
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return { mins, secs, total: seconds }
  }, [startTime])

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

  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0

  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 right-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-success/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="glass-card border-0 shadow-xl text-center overflow-hidden">
            <CardContent className="pt-8 pb-6 space-y-5">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, delay: 0.2 }}
                className="text-6xl"
              >
                {performance.emoji}
              </motion.div>

              <div className="space-y-1">
                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold tracking-tight"
                >
                  {performance.label}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-sm text-muted-foreground"
                >
                  Completed in {timeTaken.mins}m {timeTaken.secs}s
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-3 gap-4"
              >
                <div className="rounded-xl bg-success/10 p-4 space-y-1">
                  <CheckCircle2 className="size-5 mx-auto text-success" />
                  <div className="text-2xl font-bold text-success">
                    <AnimatedCounter value={correctCount} />
                  </div>
                  <div className="text-xs text-muted-foreground">Correct</div>
                </div>
                <div className="rounded-xl bg-destructive/10 p-4 space-y-1">
                  <XCircle className="size-5 mx-auto text-destructive" />
                  <div className="text-2xl font-bold text-destructive">
                    <AnimatedCounter value={wrongCount} />
                  </div>
                  <div className="text-xs text-muted-foreground">Wrong</div>
                </div>
                <div className="rounded-xl bg-primary/10 p-4 space-y-1">
                  <Target className="size-5 mx-auto text-primary" />
                  <div className="text-2xl font-bold text-primary">
                    <AnimatedCounter value={accuracy} suffix="%" />
                  </div>
                  <div className="text-xs text-muted-foreground">Accuracy</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="flex items-center justify-center gap-4 text-sm text-muted-foreground"
              >
                <span className="flex items-center gap-1">
                  <Trophy className="size-4" />
                  {score} pts
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-4" />
                  {timeTaken.total}s
                </span>
                <span className="flex items-center gap-1">
                  <TrendingUp className="size-4" />
                  {totalQuestions} Q
                </span>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm">Question Review</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs defaultValue="all" className="w-full">
                <div className="px-4 pb-3">
                  <TabsList className="w-full">
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
                </div>

                {(['all', 'correct', 'wrong'] as const).map((filter) => {
                  const filtered = filter === 'all'
                    ? history
                    : history.filter(h => filter === 'correct' ? h.isCorrect : !h.isCorrect)

                  return (
                    <TabsContent key={filter} value={filter} className="mt-0">
                      <ScrollArea className="max-h-[320px]">
                        {filtered.length === 0 ? (
                          <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
                            {filter === 'wrong' ? (
                              <>
                                <CheckCircle2 className="size-8 text-success" />
                                <p className="text-sm">No wrong answers — perfect!</p>
                              </>
                            ) : (
                              <>
                                <XCircle className="size-8" />
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
                                  <TableCell className="text-success font-mono">
                                    {item.question.ans}
                                  </TableCell>
                                  <TableCell className="font-mono">
                                    {item.selected !== null ? item.selected : '—'}
                                  </TableCell>
                                  <TableCell className="text-right">
                                    {item.isCorrect ? (
                                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20 gap-1">
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
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="pb-6"
        >
          <Button onClick={reset} className="w-full h-11 gap-2 shadow-lg shadow-primary/20" size="lg">
            <RotateCcw className="size-4" />
            Play Again
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
