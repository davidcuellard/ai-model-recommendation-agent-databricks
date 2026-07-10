import { useState, useCallback, useRef } from 'react'
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

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [recommendation, setRecommendation] = useState<RecommendationPlan | null>(null)
  const abortRef = useRef<(() => void) | null>(null)

  const sendMessage = useCallback(
    (content: string) => {
      if (!content.trim() || isStreaming) return

      const userMessage: Message = { role: 'user', content: content.trim() }
      const nextMessages = [...messages, userMessage]

      setMessages([...nextMessages, { role: 'assistant', content: '' }])
      setIsStreaming(true)
      setError(null)
      setRecommendation(null)

      abortRef.current = streamChat(
        nextMessages,
        (token) => {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: updated[updated.length - 1].content + token,
            }
            return updated
          })
        },
        () => {
          setIsStreaming(false)
          setMessages((prev) => {
            const lastContent = prev[prev.length - 1]?.content ?? ''
            const plan = parseRecommendation(lastContent)
            if (plan) setRecommendation(plan)
            return prev
          })
        },
        (err) => {
          setError(err)
          setIsStreaming(false)
          setMessages((prev) => {
            const last = prev[prev.length - 1]
            return last?.role === 'assistant' && !last.content ? prev.slice(0, -1) : prev
          })
        },
      )
    },
    [messages, isStreaming],
  )

  const clearError = useCallback(() => setError(null), [])

  return { messages, isStreaming, error, recommendation, sendMessage, clearError }
}
