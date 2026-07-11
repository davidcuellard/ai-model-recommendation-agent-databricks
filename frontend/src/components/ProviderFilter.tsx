interface Props {
  providers: string[]
  selected: string[]
  onChange: (selected: string[]) => void
}

export function ProviderFilter({ providers, selected, onChange }: Props) {
  if (providers.length === 0) return null

  const allSelected = selected.length === 0

  function toggleProvider(provider: string) {
    if (selected.includes(provider)) {
      onChange(selected.filter((p) => p !== provider))
    } else {
      onChange([...selected, provider])
    }
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto py-1">
      <button
        onClick={() => onChange([])}
        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
          allSelected
            ? 'bg-blue-600 text-white'
            : 'border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
        }`}
      >
        All
      </button>
      {providers.map((provider) => {
        const isSelected = selected.includes(provider)
        return (
          <button
            key={provider}
            onClick={() => toggleProvider(provider)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              isSelected
                ? 'bg-blue-600 text-white'
                : 'border border-gray-600 text-gray-400 hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            {provider}
          </button>
        )
      })}
    </div>
  )
}
