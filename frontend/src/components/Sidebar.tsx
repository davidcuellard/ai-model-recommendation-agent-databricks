import { Link } from 'react-router-dom'
import type { ChatSession } from '../types/chat'

interface Props {
  sessions: ChatSession[]
  activeId: string
  onSelect: (id: string) => void
  onNew: () => void
  onDelete: (id: string) => void
}

function relativeTime(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export function Sidebar({ sessions, activeId, onSelect, onNew, onDelete }: Props) {
  const atLimit = sessions.length >= 5

  return (
    <div className="flex w-60 shrink-0 flex-col bg-gray-900 text-gray-100">
      <div className="border-b border-gray-700 px-4 py-4">
        <Link
          to="/"
          className="mb-3 flex items-center gap-1.5 text-xs text-gray-500 transition-colors hover:text-gray-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Home
        </Link>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
          RAG Agent
        </p>
        <button
          onClick={onNew}
          disabled={atLimit}
          className="w-full rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          + New Chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {sessions.map((session) => {
          const isActive = session.id === activeId
          return (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              className={`group flex cursor-pointer items-start gap-2 px-3 py-2.5 transition-colors ${
                isActive ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-100">{session.title}</p>
                <p className="mt-0.5 text-xs text-gray-400">{relativeTime(session.createdAt)}</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(session.id)
                }}
                className="mt-0.5 shrink-0 text-gray-500 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                aria-label="Delete session"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
