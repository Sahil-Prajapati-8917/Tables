# TableMaster Pro

An interactive, premium multiplication table training app built with **Next.js 16**, **TypeScript**, **Tailwind CSS v4**, and **React 19**. Designed to enhance mental arithmetic through cloaked MCQs, smart distractors, and timed challenges.

## Features

### 🧠 The Core Solving Philosophy
- **Cloaked MCQ Delay** — Options are hidden for a configurable period (3s/5s/7s) forcing mental calculation first
- **Cognitive Distractor Generator** — Wrong answers are mathematically close to the correct answer (off-by-factor, off-by-base-10), not random noise

### 🎮 Quiz Configuration
- **Table Ranges** — 10 range chips (1–10 through 91–100) with Select All / Clear
- **3 Difficulty Levels** — Easy (×1–5), Medium (×1–10), Hard (×11–20)
- **Question Count** — 10, 20, 30, 40, or 50 questions per session
- **Cloak Duration** — 3s, 5s, or 7s before options appear
- **Speed Mode** — Toggle requiring answers within 3s of options revealing

### 🎨 Themes
- **Elegant Dark** — Deep-slate background (`#0F172A`), purple/blue accents, glassmorphic cards
- **Soft Light** — Pure light canvas, warm white cards, gentle shadows
- System preference detection + manual toggle persisted to `localStorage`

### 🔊 Immersive Audio
Web Audio API synthesized sound effects (no external assets):
- Woodblock tick during countdowns
- Dual-note arpeggio for correct answers
- Frequency-sweep for incorrect answers
- Triadic victory chime on quiz completion

### 📊 Results & Tracking
- Per-question review list with correct/incorrect indicators
- Score, percentage, and performance label (🏆 Perfect Score → 📚 Keep Practicing)
- Streak tracking with 🔥 animation
- Time taken for full quiz

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS v4 with CSS custom properties |
| Animations | CSS keyframes + Framer Motion |
| Icons | Lucide React |
| Audio | Web Audio API (browser-native) |
| Persistence | localStorage (theme, config) |

## Project Structure

```
├── app/
│   ├── layout.tsx          # Root layout with font loading + metadata
│   ├── page.tsx            # Client-side state machine (setup → countdown → quiz → result)
│   └── globals.css         # Tailwind v4 + CSS variable theme tokens
├── components/quiz/
│   ├── SetupScreen.tsx     # Configuration: ranges, difficulty, Q count, cloak, speed mode
│   ├── CountdownOverlay.tsx# Full-screen 3→2→1→GO countdown
│   ├── QuizCard.tsx        # Main quiz: question display, SVG timer ring, options grid
│   ├── ResultScreen.tsx    # Summary stats, performance label, scrollable review list
│   └── ThemeToggle.tsx     # Light/dark toggle button
├── lib/
│   ├── quiz-engine.ts      # Question pool generation, smart distractor algorithm, scoring
│   ├── audio.ts            # Web Audio API synthesizer for sound effects
│   └── utils.ts            # cn() classname merger
└── types/
    └── quiz.ts             # TypeScript interfaces and type definitions
```

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Open [http://localhost:3000](http://localhost:3000) to play.

## Smart Distractor Algorithm

The option generator produces three wrong answers that are confusingly close to the correct answer:

1. **Multiplier Drift** — Correct ± multiplicand (off-by-one on the multiplier)
2. **Multiplicand Drift** — Correct ± multiplier (off-by-one on the multiplicand)
3. **Sum Drift** — Correct ± (a + b)
4. **Decimal Drift** — Correct ± 10, Correct ± 20
5. **Fuzzy Fallback** — If < 3 valid candidates, random offset in [5, 20]

All options are shuffled and uniqueness is enforced via `Set`.

## Deployment

Deploy to Vercel with zero configuration:

```bash
npx vercel deploy
```
