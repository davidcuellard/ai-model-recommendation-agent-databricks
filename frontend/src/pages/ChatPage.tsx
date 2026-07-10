import { useChat } from '../hooks/useChat'
import { ChatMessage } from '../components/ChatMessage'
import { ChatInput } from '../components/ChatInput'
import { ErrorBanner } from '../components/ErrorBanner'

export function ChatPage() {
  const { messages, isStreaming, error, recommendation, sendMessage, clearError } = useChat()

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-900">Model Recommendation Agent</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Describe what you want to build — get grounded model recommendations
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-4">
          {messages.length === 0 && (
            <div className="py-16 text-center text-gray-400">
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

      <footer className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl space-y-3">
          {error && <ErrorBanner message={error} onDismiss={clearError} />}
          <ChatInput onSend={sendMessage} disabled={isStreaming} />
        </div>
      </footer>
    </div>
  )
}
