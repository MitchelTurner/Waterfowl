import { materials } from '../config/materials'
import type { LoadResult } from '../types'

interface ResultsTableProps {
  results: LoadResult[]
  sortBy: 'cost' | 'energy'
  sortDir: 'asc' | 'desc'
  onSortChange: (sortBy: 'cost' | 'energy') => void
}

function ariaSortValue(sortBy: 'cost' | 'energy', activeSortBy: 'cost' | 'energy', sortDir: 'asc' | 'desc') {
  if (sortBy !== activeSortBy) {
    return 'none'
  }

  return sortDir === 'asc' ? 'ascending' : 'descending'
}

export function ResultsTable({ results, sortBy, sortDir, onSortChange }: ResultsTableProps) {
  return (
    <section className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-3 py-2" scope="col">
              Load
            </th>
            <th className="px-3 py-2" scope="col">
              Material
            </th>
            <th className="px-3 py-2" scope="col">
              Pellets
            </th>
            <th className="px-3 py-2" scope="col" aria-sort={ariaSortValue('energy', sortBy, sortDir)}>
              <button type="button" onClick={() => onSortChange('energy')}>
                Energy @ range
                <span className="sr-only"> sorted {ariaSortValue('energy', sortBy, sortDir)}</span>
                {sortBy === 'energy' ? ` (${sortDir})` : ''}
              </button>
            </th>
            <th className="px-3 py-2" scope="col">
              Expected hits (est.)
            </th>
            <th className="px-3 py-2" scope="col">
              Pass
            </th>
            <th className="px-3 py-2" scope="col" aria-sort={ariaSortValue('cost', sortBy, sortDir)}>
              <button type="button" onClick={() => onSortChange('cost')}>
                $/shell
                <span className="sr-only"> sorted {ariaSortValue('cost', sortBy, sortDir)}</span>
                {sortBy === 'cost' ? ` (${sortDir})` : ''}
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {results.map((result) => (
            <tr
              key={result.load.id}
              className={`border-t border-slate-200 ${result.passes ? 'opacity-100' : 'opacity-50'}`}
            >
              <td className="px-3 py-2">
                <div>{result.load.label}</div>
                {result.load.affiliateUrl ? (
                  <a className="text-xs text-blue-600" href={result.load.affiliateUrl} target="_blank" rel="noreferrer">
                    Affiliate link
                  </a>
                ) : null}
              </td>
              <td className="px-3 py-2">
                {materials[result.load.material].name}
                {result.load.material === 'lead' ? (
                  <span className="ml-2 rounded bg-rose-100 px-1 text-xs text-rose-700">Not legal for waterfowl</span>
                ) : null}
              </td>
              <td className="px-3 py-2">{result.pelletCount}</td>
              <td className="px-3 py-2">{result.energyAtRangeFtLb.toFixed(2)} ft-lb</td>
              <td className="px-3 py-2">{result.expectedHits}</td>
              <td className="px-3 py-2">
                <span className={`rounded px-2 py-1 text-xs ${result.passes ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {result.passes ? 'Pass' : 'Fail'}
                </span>
              </td>
              <td className="px-3 py-2">${result.costPerShell.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}
