import type { Message } from '../services/api'
import type { RecommendationPlan } from '../hooks/useChat'
import { RecommendationCard } from './RecommendationCard'

function stripJsonBlock(content: string): string {
  return content.replace(/```json\n[\s\S]*?\n```/g, '').trim()
}

interface Props {
  message: Message
  isCurrentlyStreaming: boolean
  recommendation: RecommendationPlan | null
}

export function ChatMessage({ message, isCurrentlyStreaming, recommendation }: Props) {
  const isUser = message.role === 'user'
  const displayContent = isUser ? message.content : stripJsonBlock(message.content)

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[80%]">
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'rounded-br-sm bg-blue-600 text-white'
              : 'rounded-bl-sm border border-gray-200 bg-white text-gray-900 shadow-sm'
          }`}
        >
          {isCurrentlyStreaming && !displayContent ? (
            <div className="flex items-center gap-1.5 py-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
              <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{displayContent}</p>
          )}
        </div>
        {recommendation && <RecommendationCard plan={recommendation} />}
      </div>
    </div>
  )
}
