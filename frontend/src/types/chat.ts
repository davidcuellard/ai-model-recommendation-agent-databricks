import type { UIMessage, RecommendationPlan } from '../hooks/useChat'

export interface ChatSession {
  id: string
  title: string
  messages: UIMessage[]
  recommendation: RecommendationPlan | null
  createdAt: number
}
