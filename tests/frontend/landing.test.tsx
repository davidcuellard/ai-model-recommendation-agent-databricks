import React from 'react'
import { render, screen, renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCountUp } from '../../frontend/src/hooks/useCountUp'

// Polyfill IntersectionObserver for tests
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

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

// Stub heavy components so this test focuses on routing only
vi.mock('../../frontend/src/pages/LandingPage', () => ({
  LandingPage: () => <div data-testid="landing-page">Landing</div>,
}))
vi.mock('../../frontend/src/pages/ChatPage', () => ({
  ChatPage: () => <div data-testid="chat-page">Chat</div>,
}))

import { App } from '../../frontend/src/App'
import { HeroSection } from '../../frontend/src/components/landing/HeroSection'
import { ProblemSection } from '../../frontend/src/components/landing/ProblemSection'
import { WhySection } from '../../frontend/src/components/landing/WhySection'
import { HowItWorksSection } from '../../frontend/src/components/landing/HowItWorksSection'

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

describe('useCountUp', () => {
  it('returns 0 when not active', () => {
    const { result } = renderHook(() => useCountUp(300, 1000, false))
    expect(result.current).toBe(0)
  })

  it('reaches target when active and time elapses', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    const { result } = renderHook(() => useCountUp(100, 500, true))
    await act(async () => {
      vi.advanceTimersByTime(600)
    })
    expect(result.current).toBe(100)
    vi.useRealTimers()
  })
})

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

describe('WhySection', () => {
  it('renders all three benefit cards', () => {
    render(<WhySection />)
    expect(screen.getByText('Grounded in live data')).toBeDefined()
    expect(screen.getByText('Subtask decomposition')).toBeDefined()
    expect(screen.getByText('Instant recommendations')).toBeDefined()
  })
})

describe('HowItWorksSection', () => {
  it('renders all 4 steps', () => {
    render(<HowItWorksSection />)
    expect(screen.getAllByText('Describe your task')).toBeDefined()
    expect(screen.getAllByText('Agent decomposes')).toBeDefined()
    expect(screen.getAllByText('Vector Search retrieves')).toBeDefined()
    expect(screen.getAllByText('Recommendation delivered')).toBeDefined()
  })
})

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
