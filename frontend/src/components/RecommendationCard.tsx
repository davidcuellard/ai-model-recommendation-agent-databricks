import type { RecommendationPlan } from '../hooks/useChat'

interface Props {
  plan: RecommendationPlan
}

export function RecommendationCard({ plan }: Props) {
  return (
    <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
      <h3 className="mb-3 text-sm font-semibold text-blue-900">Model Recommendations</h3>
      <div className="space-y-2">
        {plan.plan.map((item, i) => (
          <div key={i} className="rounded-lg border border-blue-100 bg-white p-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900">{item.subtask}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{item.reason}</p>
              </div>
              <div className="shrink-0 text-right">
                <span className="rounded bg-blue-100 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700">
                  {item.model}
                </span>
                <p className="mt-1 text-xs text-gray-400">{item.provider}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {plan.summary && (
        <p className="mt-3 border-t border-blue-200 pt-3 text-xs leading-relaxed text-blue-800">
          {plan.summary}
        </p>
      )}
    </div>
  )
}
