import { useState, useEffect, useCallback } from 'react'
import { useChat } from '../hooks/useChat'
import { useSessions } from '../hooks/useSessions'
import { getProviders } from '../services/api'
import type { Message } from '../services/api'
import type { RecommendationPlan, UIMessage } from '../hooks/useChat'
import { ChatMessage } from '../components/ChatMessage'
import { ChatInput } from '../components/ChatInput'
import { ErrorBanner } from '../components/ErrorBanner'
import { Sidebar } from '../components/Sidebar'
import { ProviderFilter } from '../components/ProviderFilter'

interface ChatAreaProps {
  initialMessages: Message[]
  selectedCompanies: string[]
  onSave: (messages: UIMessage[], recommendation: RecommendationPlan | null) => void
}

function ChatArea({ initialMessages, selectedCompanies, onSave }: ChatAreaProps) {
  const { messages, isStreaming, error, sendMessage, clearError } = useChat({
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
                msg.role === 'assistant' && !(isStreaming && i === messages.length - 1)
                  ? (msg.recommendation ?? null)
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
    (messages: UIMessage[], recommendation: RecommendationPlan | null) => {
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
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-50">Model Recommendation Agent</h1>
              <p className="mt-0.5 text-sm text-gray-400">
                Describe what you want to build — get grounded model recommendations
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <img
                src="https://cdn.prod.website-files.com/673e584365dc85b813c0e0d7/686ed19a686120b0466805a2_Web_Favicon.png"
                alt="Factored"
                className="h-4 w-4 opacity-40"
              />
              <span className="text-xs text-gray-600">Factored Labs</span>
            </div>
          </div>
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
