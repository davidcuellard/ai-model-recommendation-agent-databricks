interface Props {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-700/50 bg-red-900/30 px-4 py-3">
      <span className="flex-1 text-sm font-medium text-red-300">Error: {message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-sm font-medium text-red-500 hover:text-red-300"
      >
        Dismiss
      </button>
    </div>
  )
}
