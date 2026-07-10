# Landing Page + App Restyle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an interactive dark-themed stakeholder landing page at `/`, move the chat app to `/app`, and restyle all chat UI components to match the new dark palette.

**Architecture:** Add `react-router-dom` for client-side routing and `framer-motion` for scroll-triggered animations. `LandingPage` is composed of six focused section components under `src/components/landing/`. `ChatPage` and its child components get Tailwind class updates only — no logic changes.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v4, Framer Motion, React Router DOM v6, Vitest + Testing Library

## Global Constraints

- All styling via Tailwind utility classes only — no inline `style` props except for SVG `viewBox`/geometry attributes and the grid background `backgroundImage` (cannot be expressed as Tailwind)
- Dark palette: page base `bg-[#0a0f1e]`, surface `bg-gray-900`, raised surface `bg-gray-800`, accent `blue-500` / `violet-500`
- `framer-motion` animations must not break in jsdom tests — mock the library in every test file that renders Framer components
- Never set `DATABRICKS_TOKEN` — unrelated, but keep this note in scope
- Run `npm run test` and verify all tests pass before each commit
- `ruff` checks do not apply — Python files are not touched in this plan

---

## File Map

```
frontend/
├── package.json                           MODIFY — add react-router-dom, framer-motion
├── src/
│   ├── index.css                          MODIFY — add @keyframes grid-pan
│   ├── main.tsx                           MODIFY — wrap App in BrowserRouter
│   ├── App.tsx                            MODIFY — add Routes for / and /app
│   ├── hooks/
│   │   └── useCountUp.ts                  CREATE — count-up animation hook
│   ├── pages/
│   │   ├── LandingPage.tsx                CREATE — assembles all landing sections
│   │   └── ChatPage.tsx                   MODIFY — restyle to dark theme (no logic)
│   └── components/
│       ├── landing/
│       │   ├── HeroSection.tsx            CREATE
│       │   ├── ProblemSection.tsx         CREATE
│       │   ├── WhySection.tsx             CREATE
│       │   ├── HowItWorksSection.tsx      CREATE
│       │   ├── SystemDiagram.tsx          CREATE
│       │   └── FooterCTA.tsx              CREATE
│       ├── Sidebar.tsx                    MODIFY — add Back to Home link + dark classes
│       ├── ChatMessage.tsx                MODIFY — dark theme
│       ├── RecommendationCard.tsx         MODIFY — dark theme
│       ├── ErrorBanner.tsx                MODIFY — dark theme
│       └── ChatInput.tsx                  MODIFY — dark theme
tests/frontend/
└── landing.test.tsx                       CREATE — routing + key render tests
```

---

### Task 1: Install deps, routing scaffold, and smoke test

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/src/main.tsx`
- Modify: `frontend/src/App.tsx`
- Create: `tests/frontend/landing.test.tsx`

**Interfaces:**
- Produces: `<App />` renders `<LandingPage />` at `/` and `<ChatPage />` at `/app`

- [ ] **Step 1: Install packages**

```bash
cd frontend && npm install react-router-dom framer-motion
```

Expected: `package.json` updated, `node_modules/react-router-dom` and `node_modules/framer-motion` present.

- [ ] **Step 2: Wrap app in BrowserRouter**

Replace the full content of `frontend/src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { App } from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 3: Write failing routing test**

Create `tests/frontend/landing.test.tsx`:

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Stub heavy components so this test focuses on routing only
vi.mock('../../frontend/src/pages/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing</div>,
}))
vi.mock('../../frontend/src/pages/ChatPage', () => ({
  ChatPage: () => <div data-testid="chat-page">Chat</div>,
}))

import { App } from '../../frontend/src/App'

describe('App routing', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders LandingPage at /', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('landing-page')).toBeDefined()
    expect(screen.queryByTestId('chat-page')).toBeNull()
  })

  it('renders ChatPage at /app', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('chat-page')).toBeDefined()
    expect(screen.queryByTestId('landing-page')).toBeNull()
  })
})
```

- [ ] **Step 4: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `LandingPage` module not found.

- [ ] **Step 5: Add routes to App.tsx**

Replace full content of `frontend/src/App.tsx`:

```typescript
import { Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { ChatPage } from './pages/ChatPage'

export function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<ChatPage />} />
    </Routes>
  )
}
```

- [ ] **Step 6: Create stub LandingPage so tests pass**

Create `frontend/src/pages/LandingPage.tsx` (stub — will be filled in Task 9):

```typescript
export function LandingPage() {
  return <div>Landing Page — coming soon</div>
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass including the 2 new routing tests.

- [ ] **Step 8: Commit**

```
feat: add react-router-dom + framer-motion, scaffold routing (/ → LandingPage, /app → ChatPage)
```

---

### Task 2: CSS foundation + useCountUp hook

**Files:**
- Modify: `frontend/src/index.css`
- Create: `frontend/src/hooks/useCountUp.ts`

**Interfaces:**
- Produces: `useCountUp(target: number, duration?: number, active?: boolean): number`
- Produces: CSS class `animate-grid-pan` available globally

- [ ] **Step 1: Write failing hook test**

Add to `tests/frontend/landing.test.tsx` (append after existing describe block):

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCountUp } from '../../frontend/src/hooks/useCountUp'

describe('useCountUp', () => {
  it('returns 0 when not active', () => {
    const { result } = renderHook(() => useCountUp(300, 1000, false))
    expect(result.current).toBe(0)
  })

  it('reaches target when active and time elapses', async () => {
    vi.useFakeTimers()
    const { result } = renderHook(() => useCountUp(100, 500, true))
    act(() => { vi.advanceTimersByTime(600) })
    expect(result.current).toBe(100)
    vi.useRealTimers()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `useCountUp` not found.

- [ ] **Step 3: Implement useCountUp**

Create `frontend/src/hooks/useCountUp.ts`:

```typescript
import { useState, useEffect, useRef } from 'react'

export function useCountUp(target: number, duration = 2000, active = false): number {
  const [count, setCount] = useState(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (!active) return
    const startTime = performance.now()

    function tick(now: number) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * target))
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick)
      }
    }

    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration, active])

  return count
}
```

- [ ] **Step 4: Add grid-pan keyframes to index.css**

Replace full content of `frontend/src/index.css`:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";

@keyframes grid-pan {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 40px 40px;
  }
}

.animate-grid-pan {
  animation: grid-pan 8s linear infinite;
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 6: Commit**

```
feat: add useCountUp hook and grid-pan CSS animation
```

---

### Task 3: HeroSection

**Files:**
- Create: `frontend/src/components/landing/HeroSection.tsx`

**Interfaces:**
- Consumes: `react-router-dom` `Link`, `framer-motion` `motion`
- Produces: `<HeroSection />` — no props

- [ ] **Step 1: Write failing render test**

Add to `tests/frontend/landing.test.tsx`:

```typescript
import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'

vi.mock('framer-motion', () => ({
  motion: new Proxy({} as Record<string, unknown>, {
    get: (_: Record<string, unknown>, tag: string) =>
      function MotionEl({ children, ...props }: Record<string, unknown>) {
        return React.createElement(tag, props, children as React.ReactNode)
      },
  }),
  useInView: () => true,
  AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
}))

import { HeroSection } from '../../frontend/src/components/landing/HeroSection'

describe('HeroSection', () => {
  it('renders headline words and CTA link to /app', () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    )
    expect(screen.getByText('Find')).toBeDefined()
    expect(screen.getByText('Instantly.')).toBeDefined()
    const cta = screen.getByRole('link', { name: /launch app/i })
    expect(cta.getAttribute('href')).toBe('/app')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `HeroSection` not found.

- [ ] **Step 3: Implement HeroSection**

Create `frontend/src/components/landing/HeroSection.tsx`:

```typescript
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

const words = ['Find', 'the', 'Right', 'AI', 'Model.', 'Instantly.']

export function HeroSection() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#0a0f1e] px-6 text-center">
      {/* Animated grid background */}
      <div
        className="animate-grid-pan pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59,130,246,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59,130,246,0.07) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-4xl">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-gray-800/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-blue-400"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
          School Project · Real World Architecture
        </motion.div>

        {/* Headline */}
        <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl lg:text-7xl">
          {words.map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
              className="mr-3 inline-block"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* Subline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
          className="mx-auto mb-10 max-w-2xl text-lg text-gray-400 md:text-xl"
        >
          Describe what you want to build. The agent decomposes it into subtasks and
          recommends the best AI model for each — grounded in live OpenRouter data.
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.1 }}
        >
          <Link to="/app">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow hover:shadow-[0_0_40px_rgba(59,130,246,0.7)]"
            >
              Launch App →
            </motion.button>
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6 animate-bounce"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
feat: add HeroSection with animated headline, badge, and CTA
```

---

### Task 4: ProblemSection

**Files:**
- Create: `frontend/src/components/landing/ProblemSection.tsx`

**Interfaces:**
- Consumes: `useCountUp(target, duration, active)` from `../../hooks/useCountUp`, `framer-motion` `motion`, `useInView`
- Produces: `<ProblemSection />` — no props

- [ ] **Step 1: Write failing render test**

Add to `tests/frontend/landing.test.tsx`:

```typescript
import { ProblemSection } from '../../frontend/src/components/landing/ProblemSection'

describe('ProblemSection', () => {
  it('renders all three pain point items', () => {
    render(
      <MemoryRouter>
        <ProblemSection />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Too many models to evaluate manually/i)).toBeDefined()
    expect(screen.getByText(/Pricing, context length/i)).toBeDefined()
    expect(screen.getByText(/No single model is best/i)).toBeDefined()
  })
})
```

Note: `framer-motion` mock and `MemoryRouter` are already set up from Task 3's describe block — this test lives in the same file and inherits those mocks.

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `ProblemSection` not found.

- [ ] **Step 3: Implement ProblemSection**

Create `frontend/src/components/landing/ProblemSection.tsx`:

```typescript
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useCountUp } from '../../hooks/useCountUp'

interface StatProps {
  target: number
  suffix: string
  label: string
}

function Stat({ target, suffix, label }: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })
  const count = useCountUp(target, 2000, inView)

  return (
    <div ref={ref}>
      <p className="text-6xl font-bold text-white">
        {count}
        {suffix}
      </p>
      <p className="mt-2 text-gray-400">{label}</p>
    </div>
  )
}

const painPoints = [
  'Too many models to evaluate manually',
  'Pricing, context length, and capabilities change constantly',
  'No single model is best for every subtask',
]

export function ProblemSection() {
  return (
    <section className="bg-[#0a0f1e] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center text-3xl font-bold text-white md:text-4xl"
        >
          The Problem
        </motion.h2>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          {/* Stats */}
          <div className="space-y-10">
            <Stat target={300} suffix="+" label="AI models on OpenRouter alone" />
            <Stat target={40} suffix="h" label="Hours spent manually comparing models per project" />
          </div>

          {/* Pain points */}
          <div className="space-y-4">
            {painPoints.map((point, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.15 }}
                className="flex items-start gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4"
              >
                <span className="mt-0.5 shrink-0 text-red-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
                <p className="text-gray-300">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
feat: add ProblemSection with count-up stats and pain point cards
```

---

### Task 5: WhySection

**Files:**
- Create: `frontend/src/components/landing/WhySection.tsx`

**Interfaces:**
- Consumes: `framer-motion` `motion`
- Produces: `<WhySection />` — no props

- [ ] **Step 1: Write failing render test**

Add to `tests/frontend/landing.test.tsx`:

```typescript
import { WhySection } from '../../frontend/src/components/landing/WhySection'

describe('WhySection', () => {
  it('renders all three benefit cards', () => {
    render(<WhySection />)
    expect(screen.getByText('Grounded in live data')).toBeDefined()
    expect(screen.getByText('Subtask decomposition')).toBeDefined()
    expect(screen.getByText('Instant recommendations')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `WhySection` not found.

- [ ] **Step 3: Implement WhySection**

Create `frontend/src/components/landing/WhySection.tsx`:

```typescript
import { motion } from 'framer-motion'

const cards = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7M4 7c0-2 1-3 3-3h10c2 0 3 1 3 3M4 7h16M9 11h6" />
      </svg>
    ),
    title: 'Grounded in live data',
    body: 'Pulls the full OpenRouter catalog fresh via a Databricks ingestion job — no stale hardcoded lists.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
    title: 'Subtask decomposition',
    body: 'Breaks your prompt into sub-problems and matches the right model to each one independently.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: 'Instant recommendations',
    body: 'Vector Search over model embeddings returns relevant candidates in milliseconds.',
  },
]

export function WhySection() {
  return (
    <section className="bg-gray-900/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center text-3xl font-bold text-white md:text-4xl"
        >
          Why This App
        </motion.h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.15 }}
              whileHover={{ y: -4 }}
              className="rounded-2xl border border-gray-800 bg-gray-900 p-6 transition-shadow hover:shadow-[0_0_20px_rgba(59,130,246,0.15)]"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                {card.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">{card.title}</h3>
              <p className="text-sm leading-relaxed text-gray-400">{card.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
feat: add WhySection with three animated benefit cards
```

---

### Task 6: HowItWorksSection

**Files:**
- Create: `frontend/src/components/landing/HowItWorksSection.tsx`

**Interfaces:**
- Consumes: `framer-motion` `motion`
- Produces: `<HowItWorksSection />` — no props

- [ ] **Step 1: Write failing render test**

Add to `tests/frontend/landing.test.tsx`:

```typescript
import { HowItWorksSection } from '../../frontend/src/components/landing/HowItWorksSection'

describe('HowItWorksSection', () => {
  it('renders all 4 steps', () => {
    render(<HowItWorksSection />)
    expect(screen.getByText('Describe your task')).toBeDefined()
    expect(screen.getByText('Agent decomposes')).toBeDefined()
    expect(screen.getByText('Vector Search retrieves')).toBeDefined()
    expect(screen.getByText('Recommendation delivered')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `HowItWorksSection` not found.

- [ ] **Step 3: Implement HowItWorksSection**

Create `frontend/src/components/landing/HowItWorksSection.tsx`:

```typescript
import { motion } from 'framer-motion'

const steps = [
  {
    n: 1,
    label: 'Describe your task',
    detail: 'Type what you want to build in plain language',
  },
  {
    n: 2,
    label: 'Agent decomposes',
    detail: 'Claude breaks it into independent subtasks',
  },
  {
    n: 3,
    label: 'Vector Search retrieves',
    detail: 'Top-5 model chunks from the live catalog',
  },
  {
    n: 4,
    label: 'Recommendation delivered',
    detail: 'Structured plan with model + rationale per subtask',
  },
]

export function HowItWorksSection() {
  return (
    <section className="bg-[#0a0f1e] px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center text-3xl font-bold text-white md:text-4xl"
        >
          How It Works
        </motion.h2>

        {/* Desktop timeline */}
        <div className="hidden md:block">
          <div className="relative">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute top-5 h-0.5 bg-gradient-to-r from-blue-600 to-violet-600"
            />
            <div className="relative grid grid-cols-4 gap-4">
              {steps.map((step, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.2 }}
                  className="text-center"
                >
                  <div className="relative z-10 mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-full border-2 border-blue-500 bg-[#0a0f1e] text-sm font-bold text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.4)]">
                    {step.n}
                  </div>
                  <p className="mb-1 text-sm font-semibold text-white">{step.label}</p>
                  <p className="text-xs text-gray-500">{step.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile stepper */}
        <div className="space-y-6 md:hidden">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-[#0a0f1e] text-sm font-bold text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.4)]">
                {step.n}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{step.label}</p>
                <p className="mt-0.5 text-xs text-gray-500">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
feat: add HowItWorksSection with animated 4-step timeline
```

---

### Task 7: SystemDiagram

**Files:**
- Create: `frontend/src/components/landing/SystemDiagram.tsx`

**Interfaces:**
- Consumes: `framer-motion` `motion`, `useInView`
- Produces: `<SystemDiagram />` — no props

- [ ] **Step 1: Write failing render test**

Add to `tests/frontend/landing.test.tsx`:

```typescript
import { SystemDiagram } from '../../frontend/src/components/landing/SystemDiagram'

describe('SystemDiagram', () => {
  it('renders Architecture heading and all 8 node labels', () => {
    render(<SystemDiagram />)
    expect(screen.getByText('Architecture')).toBeDefined()
    expect(screen.getByText('OpenRouter API')).toBeDefined()
    expect(screen.getByText('Ingestion Job')).toBeDefined()
    expect(screen.getByText('Delta Table')).toBeDefined()
    expect(screen.getByText('Vector Search')).toBeDefined()
    expect(screen.getByText('User')).toBeDefined()
    expect(screen.getByText('FastAPI Backend')).toBeDefined()
    expect(screen.getByText('Claude Haiku')).toBeDefined()
    expect(screen.getByText('Recommendation')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `SystemDiagram` not found.

- [ ] **Step 3: Implement SystemDiagram**

Create `frontend/src/components/landing/SystemDiagram.tsx`:

```typescript
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

const NODE_W = 150
const NODE_H = 44
const NODE_RX = 8

const topNodes = [
  { id: 'openrouter', label: 'OpenRouter API', badge: 'Source', x: 20, y: 55 },
  { id: 'ingest', label: 'Ingestion Job', badge: 'Databricks', x: 210, y: 55 },
  { id: 'delta', label: 'Delta Table', badge: 'Unity Catalog', x: 400, y: 55 },
  { id: 'vs', label: 'Vector Search', badge: 'Databricks', x: 590, y: 55 },
]

const bottomNodes = [
  { id: 'user', label: 'User', badge: 'Browser', x: 20, y: 195 },
  { id: 'fastapi', label: 'FastAPI Backend', badge: 'Python', x: 210, y: 195 },
  { id: 'claude', label: 'Claude Haiku', badge: 'OpenRouter', x: 400, y: 195 },
  { id: 'reco', label: 'Recommendation', badge: 'JSON Plan', x: 590, y: 195 },
]

// Horizontal arrows: [x1, y1, x2, y2]
const topArrows: [number, number, number, number][] = [
  [170, 77, 210, 77],
  [360, 77, 400, 77],
  [550, 77, 590, 77],
]
const bottomArrows: [number, number, number, number][] = [
  [170, 217, 210, 217],
  [360, 217, 400, 217],
  [550, 217, 590, 217],
]

function ArrowMarker({ id, color }: { id: string; color: string }) {
  return (
    <marker id={id} markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
      <path d="M0,0 L0,6 L6,3 z" fill={color} />
    </marker>
  )
}

interface NodeGroupProps {
  node: { id: string; label: string; badge: string; x: number; y: number }
  stroke: string
  delay: number
  inView: boolean
  direction: 'up' | 'down'
}

function NodeGroup({ node, stroke, delay, inView, direction }: NodeGroupProps) {
  return (
    <motion.g
      initial={{ opacity: 0, y: direction === 'up' ? -12 : 12 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.4, delay }}
    >
      <rect
        x={node.x}
        y={node.y}
        width={NODE_W}
        height={NODE_H}
        rx={NODE_RX}
        fill="#1f2937"
        stroke={stroke}
        strokeWidth={1.5}
      />
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 16}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="#f9fafb"
      >
        {node.label}
      </text>
      <text
        x={node.x + NODE_W / 2}
        y={node.y + 32}
        textAnchor="middle"
        fontSize={9}
        fill="#6b7280"
      >
        {node.badge}
      </text>
    </motion.g>
  )
}

export function SystemDiagram() {
  const ref = useRef<SVGSVGElement>(null)
  const inView = useInView(ref, { once: true })

  return (
    <section className="bg-gray-900/50 px-6 py-24">
      <div className="mx-auto max-w-5xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-center text-3xl font-bold md:text-4xl"
        >
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            Architecture
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 text-center text-sm text-gray-500"
        >
          Data pipeline (top) feeds the request flow (bottom) via Vector Search retrieval
        </motion.p>

        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900 p-6">
          <svg
            ref={ref}
            viewBox="0 0 780 300"
            className="w-full min-w-[600px]"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <ArrowMarker id="arrow-blue" color="#3b82f6" />
              <ArrowMarker id="arrow-violet" color="#8b5cf6" />
              <ArrowMarker id="arrow-indigo" color="#6366f1" />
            </defs>

            {/* Row labels */}
            <text x="20" y="20" fontSize={10} fill="#4b5563" fontWeight={600} letterSpacing={1}>
              DATA PIPELINE
            </text>
            <text x="20" y="180" fontSize={10} fill="#4b5563" fontWeight={600} letterSpacing={1}>
              REQUEST FLOW
            </text>

            {/* Top row nodes */}
            {topNodes.map((node, i) => (
              <NodeGroup
                key={node.id}
                node={node}
                stroke="#3b82f6"
                delay={i * 0.12}
                inView={inView}
                direction="up"
              />
            ))}

            {/* Bottom row nodes */}
            {bottomNodes.map((node, i) => (
              <NodeGroup
                key={node.id}
                node={node}
                stroke="#8b5cf6"
                delay={0.6 + i * 0.12}
                inView={inView}
                direction="down"
              />
            ))}

            {/* Top row arrows */}
            {topArrows.map(([x1, y1, x2, y2], i) => (
              <motion.path
                key={`ta-${i}`}
                d={`M${x1},${y1} L${x2},${y2}`}
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="none"
                markerEnd="url(#arrow-blue)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.25 + i * 0.15 }}
              />
            ))}

            {/* Bottom row arrows */}
            {bottomArrows.map(([x1, y1, x2, y2], i) => (
              <motion.path
                key={`ba-${i}`}
                d={`M${x1},${y1} L${x2},${y2}`}
                stroke="#8b5cf6"
                strokeWidth={1.5}
                strokeDasharray="5 3"
                fill="none"
                markerEnd="url(#arrow-violet)"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={inView ? { pathLength: 1, opacity: 1 } : {}}
                transition={{ duration: 0.3, delay: 0.85 + i * 0.15 }}
              />
            ))}

            {/* Vector Search → FastAPI connector (curved) */}
            <motion.path
              d="M 665 99 C 665 148 285 142 285 195"
              stroke="#6366f1"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="none"
              markerEnd="url(#arrow-indigo)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={inView ? { pathLength: 1, opacity: 1 } : {}}
              transition={{ duration: 0.7, delay: 1.3 }}
            />
          </svg>
        </div>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
feat: add SystemDiagram with animated SVG architecture flow
```

---

### Task 8: FooterCTA

**Files:**
- Create: `frontend/src/components/landing/FooterCTA.tsx`

**Interfaces:**
- Consumes: `react-router-dom` `Link`, `framer-motion` `motion`
- Produces: `<FooterCTA />` — no props

- [ ] **Step 1: Write failing render test**

Add to `tests/frontend/landing.test.tsx`:

```typescript
import { FooterCTA } from '../../frontend/src/components/landing/FooterCTA'

describe('FooterCTA', () => {
  it('renders CTA link pointing to /app', () => {
    render(
      <MemoryRouter>
        <FooterCTA />
      </MemoryRouter>,
    )
    const link = screen.getByRole('link', { name: /launch app/i })
    expect(link.getAttribute('href')).toBe('/app')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — `FooterCTA` not found.

- [ ] **Step 3: Implement FooterCTA**

Create `frontend/src/components/landing/FooterCTA.tsx`:

```typescript
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export function FooterCTA() {
  return (
    <section className="bg-gradient-to-b from-[#0a0f1e] to-gray-900 px-6 py-24 text-center">
      <div className="mx-auto max-w-2xl">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-4 text-3xl font-bold text-white md:text-4xl"
        >
          Ready to find your model?
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-10 text-lg text-gray-400"
        >
          Try the live agent — describe any project and get instant recommendations.
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Link to="/app">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-shadow hover:shadow-[0_0_40px_rgba(59,130,246,0.7)]"
            >
              Launch App →
            </motion.button>
          </Link>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 text-xs text-gray-600"
        >
          Built on Databricks · Powered by OpenRouter · Grounded in live data
        </motion.p>
      </div>
    </section>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
feat: add FooterCTA section with glowing Launch App button
```

---

### Task 9: Assemble LandingPage

**Files:**
- Modify: `frontend/src/pages/LandingPage.tsx` (replace stub from Task 1)

**Interfaces:**
- Consumes: all six section components
- Produces: `<LandingPage />` — no props — renders full scrollable page

- [ ] **Step 1: Write failing render test**

Add to `tests/frontend/landing.test.tsx`:

```typescript
// Re-mock the section components to avoid re-rendering animations
vi.mock('../../frontend/src/components/landing/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero" />,
}))
vi.mock('../../frontend/src/components/landing/ProblemSection', () => ({
  ProblemSection: () => <div data-testid="problem" />,
}))
vi.mock('../../frontend/src/components/landing/WhySection', () => ({
  WhySection: () => <div data-testid="why" />,
}))
vi.mock('../../frontend/src/components/landing/HowItWorksSection', () => ({
  HowItWorksSection: () => <div data-testid="how" />,
}))
vi.mock('../../frontend/src/components/landing/SystemDiagram', () => ({
  SystemDiagram: () => <div data-testid="diagram" />,
}))
vi.mock('../../frontend/src/components/landing/FooterCTA', () => ({
  FooterCTA: () => <div data-testid="footer" />,
}))

import { LandingPage } from '../../frontend/src/pages/LandingPage'

describe('LandingPage', () => {
  it('renders all six sections', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('hero')).toBeDefined()
    expect(screen.getByTestId('problem')).toBeDefined()
    expect(screen.getByTestId('why')).toBeDefined()
    expect(screen.getByTestId('how')).toBeDefined()
    expect(screen.getByTestId('diagram')).toBeDefined()
    expect(screen.getByTestId('footer')).toBeDefined()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: FAIL — LandingPage still returns stub div, sections not found.

- [ ] **Step 3: Replace stub with full LandingPage**

Replace the full content of `frontend/src/pages/LandingPage.tsx`:

```typescript
import { HeroSection } from '../components/landing/HeroSection'
import { ProblemSection } from '../components/landing/ProblemSection'
import { WhySection } from '../components/landing/WhySection'
import { HowItWorksSection } from '../components/landing/HowItWorksSection'
import { SystemDiagram } from '../components/landing/SystemDiagram'
import { FooterCTA } from '../components/landing/FooterCTA'

export function LandingPage() {
  return (
    <main className="bg-[#0a0f1e]">
      <HeroSection />
      <ProblemSection />
      <WhySection />
      <HowItWorksSection />
      <SystemDiagram />
      <FooterCTA />
    </main>
  )
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
feat: assemble LandingPage from all six sections
```

---

### Task 10: Restyle ChatPage and all child components

**Files:**
- Modify: `frontend/src/pages/ChatPage.tsx`
- Modify: `frontend/src/components/Sidebar.tsx`
- Modify: `frontend/src/components/ChatMessage.tsx`
- Modify: `frontend/src/components/RecommendationCard.tsx`
- Modify: `frontend/src/components/ErrorBanner.tsx`
- Modify: `frontend/src/components/ChatInput.tsx`

**Interfaces:**
- All props and logic unchanged — class names only

- [ ] **Step 1: Verify existing tests pass before touching anything**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -20
```

Expected: all tests pass (baseline).

- [ ] **Step 2: Restyle ChatPage.tsx**

In `frontend/src/pages/ChatPage.tsx`, apply these class changes (logic untouched):

`ChatArea` component — the `<footer>` element:
```
border-t border-gray-200 bg-white px-4 py-4
→
border-t border-gray-800 bg-gray-900 px-4 py-4
```

`ChatPage` component:

The empty state `<div>` inside `<main>`:
```
text-gray-400
→
text-gray-500
```

The outer wrapper `<div className="flex h-screen">` — add background:
```
className="flex h-screen bg-[#0a0f1e]"
```

The chat area wrapper:
```
className="flex min-w-0 flex-1 flex-col bg-gray-50"
→
className="flex min-w-0 flex-1 flex-col bg-[#0f172a]"
```

The `<header>` element:
```
className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm"
→
className="border-b border-gray-800 bg-gray-900 px-6 py-4"
```

The `<h1>` inside header:
```
className="text-xl font-semibold text-gray-900"
→
className="text-xl font-semibold text-gray-50"
```

The `<p>` subtitle inside header:
```
className="mt-0.5 text-sm text-gray-500"
→
className="mt-0.5 text-sm text-gray-400"
```

- [ ] **Step 3: Restyle Sidebar.tsx**

In `frontend/src/components/Sidebar.tsx`:

Add a "Back to Home" link above the `<p>RAG Agent</p>` label. Import `Link` from `react-router-dom` at the top:

```typescript
import { Link } from 'react-router-dom'
```

Inside the `<div className="border-b border-gray-700 px-4 py-4">` block, prepend:

```typescript
<Link
  to="/"
  className="mb-3 flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300"
>
  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
  </svg>
  Home
</Link>
```

No other changes to Sidebar — the dark classes are already correct (`bg-gray-900`, `text-gray-100`, `border-gray-700`).

- [ ] **Step 4: Restyle ChatMessage.tsx**

In `frontend/src/components/ChatMessage.tsx`, update the assistant message bubble classes:

```
'rounded-bl-sm border border-gray-200 bg-white text-gray-900 shadow-sm'
→
'rounded-bl-sm border border-gray-700 bg-gray-800 text-gray-100'
```

Update the prose wrapper div:
```
className="prose prose-sm max-w-none text-gray-900 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
→
className="prose prose-sm prose-invert max-w-none text-gray-100 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
```

Update the streaming dots:
```
bg-gray-400
→
bg-gray-500
```
(two occurrences — both animation-delay spans and the final span)

- [ ] **Step 5: Restyle RecommendationCard.tsx**

Replace the full content of `frontend/src/components/RecommendationCard.tsx`:

```typescript
import type { RecommendationPlan } from '../hooks/useChat'

interface Props {
  plan: RecommendationPlan
}

export function RecommendationCard({ plan }: Props) {
  return (
    <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-blue-400">Model Recommendations</h3>
      <div className="space-y-2">
        {plan.plan.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-700 bg-gray-800 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-100">{item.subtask}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{item.reason}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-blue-300">
                  {item.model}
                </span>
                <p className="mt-1 text-xs text-gray-500">{item.provider}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {plan.summary && (
        <p className="mt-3 border-t border-blue-500/20 pt-3 text-xs leading-relaxed text-blue-300">
          {plan.summary}
        </p>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Restyle ErrorBanner.tsx**

Replace the full content of `frontend/src/components/ErrorBanner.tsx`:

```typescript
interface Props {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-700/50 bg-red-900/30 px-4 py-3">
      <span className="flex-1 text-sm font-medium text-red-300">Error: {message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-sm font-medium text-red-500 hover:text-red-300"
      >
        Dismiss
      </button>
    </div>
  )
}
```

- [ ] **Step 7: Restyle ChatInput.tsx**

In `frontend/src/components/ChatInput.tsx`, update the textarea classes:

```
className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
→
className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
```

Update the disabled send button:
```
disabled:bg-gray-300
→
disabled:bg-gray-700 disabled:text-gray-500
```

- [ ] **Step 8: Run all tests — expect PASS**

```bash
cd /Users/david.cuellar/code/databricks/rag-project && npm run test --prefix frontend 2>&1 | tail -30
```

Expected: all tests pass (logic unchanged, only classes edited).

- [ ] **Step 9: Commit**

```
feat: restyle chat UI to dark theme matching landing page palette
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| Add react-router-dom + framer-motion | Task 1 |
| `/` → LandingPage, `/app` → ChatPage | Task 1 |
| grid-pan CSS animation | Task 2 |
| useCountUp hook | Task 2 |
| Hero: badge, stagger headline, CTA, scroll indicator | Task 3 |
| Problem: count-up stats, pain point cards | Task 4 |
| Why: 3 cards with lift hover | Task 5 |
| How it works: timeline line + 4 steps | Task 6 |
| System diagram: SVG animated pipeline | Task 7 |
| Footer CTA with /app link | Task 8 |
| Assemble LandingPage | Task 9 |
| ChatPage dark restyle | Task 10 |
| Sidebar "Back to Home" link | Task 10 |
| ChatMessage dark restyle | Task 10 |
| RecommendationCard dark restyle | Task 10 |
| ErrorBanner dark restyle | Task 10 |
| ChatInput dark restyle | Task 10 |

All spec requirements covered. No placeholder steps. Type signatures are consistent across tasks (`useCountUp` signature defined in Task 2, consumed in Task 4 with matching parameters). `Link` from `react-router-dom` used consistently in Tasks 3, 8, 10 — not mixed with `<a>` tags.
