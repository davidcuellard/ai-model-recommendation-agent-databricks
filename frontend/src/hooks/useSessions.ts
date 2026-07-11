import { useState, useCallback, useEffect } from 'react'
import type { UIMessage, RecommendationPlan } from './useChat'
import type { ChatSession } from '../types/chat'

const STORAGE_KEY = 'rag_sessions'
const ACTIVE_KEY = 'rag_active_session'
const MAX_SESSIONS = 10

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function makeEmptySession(): ChatSession {
  return {
    id: generateId(),
    title: 'New Chat',
    messages: [],
    recommendation: null,
    createdAt: Date.now(),
  }
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    return JSON.parse(raw) as ChatSession[]
  } catch {
    return []
  }
}

function loadActiveId(sessions: ChatSession[]): string {
  const stored = localStorage.getItem(ACTIVE_KEY)
  if (stored && sessions.some((s) => s.id === stored)) return stored
  return sessions[0]?.id ?? ''
}

function persist(sessions: ChatSession[], activeId: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
  localStorage.setItem(ACTIVE_KEY, activeId)
}

export function useSessions() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const loaded = loadSessions()
    if (loaded.length === 0) {
      const initial = makeEmptySession()
      return [initial]
    }
    return loaded
  })

  const [activeId, setActiveIdState] = useState<string>(() => {
    const loaded = loadSessions()
    if (loaded.length === 0) return ''
    return loadActiveId(loaded)
  })

  // Sync activeId when sessions are first created (empty initial session)
  useEffect(() => {
    if (!activeId && sessions.length > 0) {
      setActiveIdState(sessions[0].id)
    }
  }, [activeId, sessions])

  // Persist whenever state changes
  useEffect(() => {
    if (sessions.length > 0 && activeId) {
      persist(sessions, activeId)
    }
  }, [sessions, activeId])

  const setActiveId = useCallback((id: string) => {
    setActiveIdState(id)
  }, [])

  const createSession = useCallback(() => {
    setSessions((prev) => {
      if (prev.length >= MAX_SESSIONS) return prev
      const session = makeEmptySession()
      const next = [session, ...prev]
      setActiveIdState(session.id)
      return next
    })
  }, [])

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id)
      if (remaining.length === 0) {
        const fresh = makeEmptySession()
        setActiveIdState(fresh.id)
        return [fresh]
      }
      setActiveIdState((currentActive) => {
        if (currentActive === id) {
          // Switch to most recently created remaining session
          const sorted = [...remaining].sort((a, b) => b.createdAt - a.createdAt)
          return sorted[0].id
        }
        return currentActive
      })
      return remaining
    })
  }, [])

  const updateSession = useCallback(
    (id: string, messages: UIMessage[], recommendation: RecommendationPlan | null) => {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== id) return s
          const firstUserMsg = messages.find((m) => m.role === 'user')
          const title =
            s.title === 'New Chat' && firstUserMsg
              ? firstUserMsg.content.slice(0, 45)
              : s.title
          return { ...s, messages, recommendation, title }
        }),
      )
    },
    [],
  )

  const activeSession = sessions.find((s) => s.id === activeId)

  return {
    sessions,
    activeId,
    activeSession,
    createSession,
    deleteSession,
    setActiveId,
    updateSession,
  }
}
