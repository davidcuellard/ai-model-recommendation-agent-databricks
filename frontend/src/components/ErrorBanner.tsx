interface Props {
  message: string
  onDismiss: () => void
}

export function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
      <span className="flex-1 text-sm font-medium text-red-700">Error: {message}</span>
      <button
        onClick={onDismiss}
        className="shrink-0 text-sm font-medium text-red-400 hover:text-red-600"
      >
        Dismiss
      </button>
    </div>
  )
}
