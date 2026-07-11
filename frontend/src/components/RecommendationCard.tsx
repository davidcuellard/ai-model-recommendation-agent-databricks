import type { RecommendationPlan } from '../hooks/useChat'

interface Props {
  plan: RecommendationPlan
}

export function RecommendationCard({ plan }: Props) {
  return (
    <div className="mt-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-blue-400">Model Recommendations</h3>
      <div className="space-y-2">
        {plan.plan.map((item, i) => (
          <div key={i} className="rounded-lg border border-gray-700 bg-gray-800 p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-100">{item.subtask}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{item.reason}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded bg-blue-500/20 px-2 py-0.5 font-mono text-xs font-semibold text-blue-300">
                  {item.model}
                </span>
                <p className="mt-1 text-xs text-gray-500">{item.provider}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {plan.summary && (
        <p className="mt-3 border-t border-blue-500/20 pt-3 text-xs leading-relaxed text-blue-300">
          {plan.summary}
        </p>
      )}
    </div>
  )
}
