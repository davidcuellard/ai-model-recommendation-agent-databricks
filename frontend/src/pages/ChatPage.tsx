import { useState, useEffect, useCallback } from 'react'
import { useChat } from '../hooks/useChat'
import { useSessions } from '../hooks/useSessions'
import { getProviders } from '../services/api'
import type { Message } from '../services/api'
import type { RecommendationPlan } from '../hooks/useChat'
import { ChatMessage } from '../components/ChatMessage'
import { ChatInput } from '../components/ChatInput'
import { ErrorBanner } from '../components/ErrorBanner'
import { Sidebar } from '../components/Sidebar'
import { ProviderFilter } from '../components/ProviderFilter'

interface ChatAreaProps {
  initialMessages: Message[]
  selectedCompanies: string[]
  onSave: (messages: Message[], recommendation: RecommendationPlan | null) => void
}

function ChatArea({ initialMessages, selectedCompanies, onSave }: ChatAreaProps) {
  const { messages, isStreaming, error, recommendation, sendMessage, clearError } = useChat({
    initialMessages,
    selectedCompanies,
    onSave,
  })

  return (
    <>
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="py-16 text-center text-gray-500">
              <p className="text-lg">Ask me what you want to build.</p>
              <p className="mt-2 text-sm">
                I'll recommend the best AI models for each part of your project.
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={i}
              message={msg}
              isCurrentlyStreaming={isStreaming && i === messages.length - 1 && msg.role === 'assistant'}
              recommendation={
                i === messages.length - 1 && msg.role === 'assistant' && !isStreaming
                  ? recommendation
                  : null
              }
            />
          ))}
        </div>
      </main>

      <footer className="border-t border-gray-800 bg-gray-900 px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {error && <ErrorBanner message={error} onDismiss={clearError} />}
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </footer>
    </>
  )
}

export function ChatPage() {
  const { sessions, activeId, activeSession, createSession, deleteSession, setActiveId, updateSession } =
    useSessions()

  const [providers, setProviders] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>([])

  useEffect(() => {
    getProviders().then(setProviders).catch(() => {})
  }, [])

  const handleSave = useCallback(
    (messages: Message[], recommendation: RecommendationPlan | null) => {
      updateSession(activeId, messages, recommendation)
    },
    [activeId, updateSession],
  )

  return (
    <div className="flex h-screen bg-[#0a0f1e]">
      <Sidebar
        sessions={sessions}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={createSession}
        onDelete={deleteSession}
      />

      <div className="flex min-w-0 flex-1 flex-col bg-[#0f172a]">
        <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-50">Model Recommendation Agent</h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Describe what you want to build — get grounded model recommendations
          </p>
          <ProviderFilter
            providers={providers}
            selected={selectedProviders}
            onChange={setSelectedProviders}
          />
        </header>

        <ChatArea
          key={activeId}
          initialMessages={activeSession?.messages ?? []}
          selectedCompanies={selectedProviders}
          onSave={handleSave}
        />
      </div>
    </div>
  )
}
