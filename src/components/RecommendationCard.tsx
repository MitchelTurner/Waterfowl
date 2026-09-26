import type { LoadResult } from '../types'

interface RecommendationCardProps {
  passingByMaterial: LoadResult[]
  closestMiss?: LoadResult
}

export function RecommendationCard({ passingByMaterial, closestMiss }: RecommendationCardProps) {
  if (passingByMaterial.length === 0) {
    if (!closestMiss) {
      return null
    }

    return (
      <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        No loads clear both thresholds. Closest miss: <strong>{closestMiss.load.label}</strong>.
      </section>
    )
  }

  const best = passingByMaterial[0]
  const runnerUp = passingByMaterial[1]

  return (
    <section className="space-y-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-sm text-emerald-950">
        {passingByMaterial.map((result) => `#${result.load.shotSize} ${result.load.material}`).join(' or ')} both clear the
        threshold at this range.
      </p>
      <p className="text-sm text-emerald-900">
        Cheapest passing load: <strong>{best.load.label}</strong> (${best.costPerShell.toFixed(2)}/shell)
        {runnerUp
          ? `. Saves $${(runnerUp.costPerShell - best.costPerShell).toFixed(2)} vs next passing option.`
          : '.'}
      </p>
    </section>
  )
}
