import { renderHook, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useChat } from '../../frontend/src/hooks/useChat'
import * as api from '../../frontend/src/services/api'

describe('useChat', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('starts with empty state', () => {
    const { result } = renderHook(() => useChat())
    expect(result.current.messages).toEqual([])
    expect(result.current.isStreaming).toBe(false)
    expect(result.current.error).toBeNull()
    expect(result.current.recommendation).toBeNull()
  })

  it('appends user message and placeholder on send', () => {
    vi.spyOn(api, 'streamChat').mockReturnValue(() => {})
    const { result } = renderHook(() => useChat())

    act(() => { result.current.sendMessage('Build a chatbot') })

    expect(result.current.messages[0]).toEqual({ role: 'user', content: 'Build a chatbot' })
    expect(result.current.messages[1]).toEqual({ role: 'assistant', content: '' })
    expect(result.current.isStreaming).toBe(true)
  })

  it('ignores empty or whitespace-only messages', () => {
    vi.spyOn(api, 'streamChat').mockReturnValue(() => {})
    const { result } = renderHook(() => useChat())

    act(() => { result.current.sendMessage('   ') })

    expect(result.current.messages).toEqual([])
  })

  it('accumulates tokens into assistant message', () => {
    vi.spyOn(api, 'streamChat').mockImplementation((_, onToken) => {
      onToken('Hello ')
      onToken('world')
      return () => {}
    })
    const { result } = renderHook(() => useChat())

    act(() => { result.current.sendMessage('test') })

    const assistant = result.current.messages.find(m => m.role === 'assistant')
    expect(assistant?.content).toBe('Hello world')
  })

  it('sets isStreaming false and parses recommendation on done', () => {
    const plan = {
      plan: [{ subtask: 'chatbot', model: 'claude-haiku-4-5 ', provider: 'Anthropic', reason: 'good' }],
      summary: 'Use Claude',
    }
    const jsonBlock = `\`\`\`json\n${JSON.stringify(plan)}\n\`\`\``

    vi.spyOn(api, 'streamChat').mockImplementation((_, onToken, onDone) => {
      onToken(jsonBlock)
      onDone()
      return () => {}
    })
    const { result } = renderHook(() => useChat())

    act(() => { result.current.sendMessage('test') })

    expect(result.current.isStreaming).toBe(false)
    expect(result.current.recommendation?.plan[0].model).toBe('claude-haiku-4-5 ')
  })

  it('sets error and re-enables input on failure', () => {
    vi.spyOn(api, 'streamChat').mockImplementation((_, _t, _d, onError) => {
      onError('Network error')
      return () => {}
    })
    const { result } = renderHook(() => useChat())

    act(() => { result.current.sendMessage('test') })

    expect(result.current.error).toBe('Network error')
    expect(result.current.isStreaming).toBe(false)
  })

  it('clearError resets error to null', () => {
    vi.spyOn(api, 'streamChat').mockImplementation((_, _t, _d, onError) => {
      onError('err')
      return () => {}
    })
    const { result } = renderHook(() => useChat())

    act(() => { result.current.sendMessage('test') })
    act(() => { result.current.clearError() })

    expect(result.current.error).toBeNull()
  })
})
