import { useState, useCallback, useRef, useEffect } from 'react'
import { streamChat, type Message } from '../services/api'

export interface PlanItem {
  subtask: string
  model: string
  provider: string
  reason: string
}

export interface RecommendationPlan {
  plan: PlanItem[]
  summary: string
}

function parseRecommendation(content: string): RecommendationPlan | null {
  const match = content.match(/```json\n([\s\S]*?)\n```/)
  if (!match) return null
  try {
    return JSON.parse(match[1]) as RecommendationPlan
  } catch {
    return null
  }
}

interface UseChatOptions {
  initialMessages?: Message[]
  selectedCompanies?: string[]
  onSave?: (messages: Message[], recommendation: RecommendationPlan | null) => void
}

export function useChat(options: UseChatOptions = {}) {
  const { initialMessages, selectedCompanies, onSave } = options

  const [messages, setMessages] = useState<Message[]>(initialMessages ?? [])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<RecommendationPlan | null>(null)
  const abortRef = useRef<(() => void) | null>(null)

  // Keep a ref to the latest onSave so callbacks don't capture a stale version
  const onSaveRef = useRef(onSave)
  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => () => {
    abortRef.current?.()
  }, [])

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isStreaming) return

      const userMessage: Message = { role: 'user', content: content.trim() }
      const nextMessages = [...messages, userMessage]

      const withPlaceholder = [...nextMessages, { role: 'assistant' as const, content: '' }]
      setMessages(withPlaceholder)
      setIsStreaming(true)
      setError(null)
      setRecommendation(null)

      onSaveRef.current?.(withPlaceholder, null)

      abortRef.current = streamChat(
        nextMessages,
        (token) => {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + token,
            }
            onSaveRef.current?.(updated, null)
            return updated
          })
        },
        () => {
          setIsStreaming(false)
          setMessages((prev) => {
            const lastContent = prev[prev.length - 1]?.content ?? ''
            const plan = parseRecommendation(lastContent)
            if (plan) setRecommendation(plan)
            onSaveRef.current?.(prev, plan)
            return prev
          })
        },
        (err) => {
          setError(err)
          setIsStreaming(false)
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            const next = last?.role === 'assistant' && !last.content ? prev.slice(0, -1) : prev
            onSaveRef.current?.(next, null)
            return next
          })
        },
        selectedCompanies,
      )
    },
    [messages, isStreaming, selectedCompanies],
  )

  const clearError = useCallback(() => setError(null), [])

  return { messages, isStreaming, error, recommendation, sendMessage, clearError }
}
