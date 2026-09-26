import { useMemo } from 'react'
import { InputPanel } from './components/InputPanel'
import { MaterialChart } from './components/MaterialChart'
import { RecommendationCard } from './components/RecommendationCard'
import { ResultsTable } from './components/ResultsTable'
import { factoryLoads } from './config/loads'
import { hasPlaceholderSpeciesThresholds } from './config/species'
import { evaluateLoads, recommendLoads } from './physics/evaluate'
import { useUrlState } from './hooks/useUrlState'
import type { LoadResult } from './types'

function sortResults(results: LoadResult[], sortBy: 'cost' | 'energy', sortDir: 'asc' | 'desc') {
  const direction = sortDir === 'asc' ? 1 : -1
  return [...results].sort((a, b) => {
    const left = sortBy === 'cost' ? a.costPerShell : a.energyAtRangeFtLb
    const right = sortBy === 'cost' ? b.costPerShell : b.energyAtRangeFtLb
    return (left - right) * direction
  })
}

function App() {
  const [state, setState] = useUrlState()

  const results = useMemo(
    () =>
      evaluateLoads({
        speciesId: state.speciesId,
        rangeYd: state.rangeYd,
        gauge: state.gauge,
        choke: state.choke,
        olderGun: state.olderGun,
        priceOverrides: state.priceOverrides,
      }),
    [state],
  )

  const sortedResults = useMemo(
    () => sortResults(results, state.sortBy, state.sortDir),
    [results, state.sortBy, state.sortDir],
  )

  const recommendations = useMemo(() => recommendLoads(results, state.speciesId), [results, state.speciesId])

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 p-3 text-slate-900 sm:p-4">
      <header>
        <h1 className="text-2xl font-bold">ShotMath</h1>
        <p className="text-sm text-slate-600">Compare performance and cost across shotgun load materials.</p>
      </header>

      {import.meta.env.DEV && hasPlaceholderSpeciesThresholds ? (
        <section className="rounded border border-amber-300 bg-amber-100 p-3 text-sm text-amber-900">
          TODO: Species thresholds still use placeholder values. Add published sources before launch.
        </section>
      ) : null}

      <InputPanel
        speciesId={state.speciesId}
        rangeYd={state.rangeYd}
        gauge={state.gauge}
        choke={state.choke}
        olderGun={state.olderGun}
        onChange={(updates) => setState((prev) => ({ ...prev, ...updates }))}
      />

      <details className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <summary className="cursor-pointer font-semibold">Edit prices</summary>
        <div className="mt-3 grid gap-3">
          {factoryLoads
            .filter((load) => load.gauge === state.gauge)
            .map((load) => (
              <label key={load.id} className="text-sm">
                {load.label}
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  className="mt-1 block w-full rounded border border-slate-300 p-2"
                  value={state.priceOverrides[load.id] ?? load.pricePerShell}
                  onChange={(event) => {
                    const rawValue = event.target.value
                    setState((prev) => {
                      const nextOverrides = { ...prev.priceOverrides }
                      if (rawValue.trim() === '') {
                        delete nextOverrides[load.id]
                      } else {
                        const value = Number(rawValue)
                        nextOverrides[load.id] = Number.isFinite(value) ? Math.max(0, value) : load.pricePerShell
                      }

                      return {
                        ...prev,
                        priceOverrides: nextOverrides,
                      }
                    })
                  }}
                />
              </label>
            ))}
        </div>
      </details>

      <RecommendationCard
        passingByMaterial={recommendations.passingByMaterial}
        closestMiss={recommendations.closestMiss}
      />

      <ResultsTable
        results={sortedResults}
        sortBy={state.sortBy}
        sortDir={state.sortDir}
        onSortChange={(sortBy) =>
          setState((prev) => {
            if (prev.sortBy === sortBy) {
              return {
                ...prev,
                sortBy,
                sortDir: prev.sortDir === 'asc' ? 'desc' : 'asc',
              }
            }

            return {
              ...prev,
              sortBy,
              sortDir: 'asc',
            }
          })
        }
      />

      <MaterialChart />

      <footer className="pb-3 text-center text-xs text-slate-600">
        Estimates only. Pattern your own gun. Not reloading data.
      </footer>
    </main>
  )
}

export default App
