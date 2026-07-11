import type { Message } from '../services/api'
import type { RecommendationPlan } from '../hooks/useChat'

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  recommendation: RecommendationPlan | null
  createdAt: number
}
