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

// Stub ChatPage for app routing tests
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
    // LandingPage renders mocked HeroSection which renders a div with data-testid="hero"
    expect(screen.getByTestId('hero')).toBeDefined()
    expect(screen.queryByTestId('chat-page')).toBeNull()
  })

  it('renders ChatPage at /app', () => {
    render(
      <MemoryRouter initialEntries={['/app']}>
        <App />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('chat-page')).toBeDefined()
    expect(screen.queryByTestId('hero')).toBeNull()
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

describe('HeroSection (mocked)', () => {
  it('renders mocked hero section', () => {
    render(
      <MemoryRouter>
        <HeroSection />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('hero')).toBeDefined()
  })
})

describe('ProblemSection (mocked)', () => {
  it('renders mocked problem section', () => {
    render(
      <MemoryRouter>
        <ProblemSection />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('problem')).toBeDefined()
  })
})

describe('WhySection (mocked)', () => {
  it('renders mocked why section', () => {
    render(<WhySection />)
    expect(screen.getByTestId('why')).toBeDefined()
  })
})

describe('HowItWorksSection (mocked)', () => {
  it('renders mocked how section', () => {
    render(<HowItWorksSection />)
    expect(screen.getByTestId('how')).toBeDefined()
  })
})

import { SystemDiagram } from '../../frontend/src/components/landing/SystemDiagram'

describe('SystemDiagram (mocked)', () => {
  it('renders mocked diagram section', () => {
    render(<SystemDiagram />)
    expect(screen.getByTestId('diagram')).toBeDefined()
  })
})

import { FooterCTA } from '../../frontend/src/components/landing/FooterCTA'

describe('FooterCTA (mocked)', () => {
  it('renders mocked footer section', () => {
    render(
      <MemoryRouter>
        <FooterCTA />
      </MemoryRouter>,
    )
    expect(screen.getByTestId('footer')).toBeDefined()
  })
})

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
