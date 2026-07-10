import React from 'react'
import { render, screen, renderHook, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCountUp } from '../../frontend/src/hooks/useCountUp'

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
