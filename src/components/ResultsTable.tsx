import { useMemo, useState } from 'react';
import { materialById } from '../config/materials';
import { formatAim, formatEnergy, formatMargin, formatUsd, formatVelocity } from '../format';
import type { LoadResult } from '../types';

type SortKey = 'cost' | 'energy';

function Status({ result }: { result: LoadResult }) {
  if (result.passes) {
    return (
      <span className="rounded-sm bg-moss px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
        Pass
      </span>
    );
  }
  if (result.meetsEnergy) {
    return (
      <span className="inline-flex flex-wrap justify-end gap-1">
        <span className="rounded-sm bg-brass px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-paper">
          Energy
        </span>
        <span className="rounded-sm bg-clay/10 px-2 py-0.5 text-xs font-semibold text-clay">
          Thin pattern
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex flex-wrap justify-end gap-1">
      <span className="rounded-sm bg-clay px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
        Fail
      </span>
      <span className="rounded-sm bg-clay/10 px-2 py-0.5 text-xs font-semibold text-clay">
        Low energy
      </span>
      {!result.meetsPattern ? (
        <span className="rounded-sm bg-clay/10 px-2 py-0.5 text-xs font-semibold text-clay">
          Thin pattern
        </span>
      ) : null}
    </span>
  );
}

function ShopLink({ url }: { url?: string }) {
  if (!url) return null;
  return (
    <a
      className="text-sm font-semibold text-brass underline decoration-brass/40 underline-offset-2"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Shop
    </a>
  );
}

export function ResultsTable({
  results,
  highlightId,
  highlightLabel,
  shelf,
  onToggleShelf,
}: {
  results: LoadResult[];
  highlightId: string | null;
  highlightLabel: string;
  shelf: readonly string[];
  onToggleShelf: (loadId: string) => void;
}) {
  const [sortKey, setSortKey] = useState<SortKey>('cost');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');

  function toggle(next: SortKey) {
    if (next === sortKey) {
      setDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }
    setSortKey(next);
    setDirection(next === 'energy' ? 'desc' : 'asc');
  }

  const sorted = useMemo(() => {
    const copy = [...results];
    const sign = direction === 'asc' ? 1 : -1;
    copy.sort((a, b) => {
      const primary =
        sortKey === 'cost'
          ? a.costPerShell - b.costPerShell
          : a.energyAtRangeFtLb - b.energyAtRangeFtLb;
      if (primary !== 0) return primary * sign;
      return a.load.label.localeCompare(b.load.label);
    });
    return copy;
  }, [results, sortKey, direction]);

  const directionLabel = direction === 'asc' ? 'low to high' : 'high to low';
  const costLabel = sortKey === 'cost' ? `Cost, ${directionLabel}` : 'Sort by cost';
  const energyLabel = sortKey === 'energy' ? `Energy, ${directionLabel}` : 'Sort by energy';

  return (
    <section id="results" className="border border-ink bg-card p-4" aria-labelledby="results-title">
      <div className="dept">
        <h2 id="results-title">Loads</h2>
        <p className="font-kicker text-sm tracking-normal">{sorted.length}</p>
      </div>
      <p className="mt-2 text-sm text-ink/80">
        Every matching load stays in the list. Energy means the pellet has the energy and the pattern is thin. Hit counts are a pattern estimate. Hold is head, body, or both.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          className={`min-h-12 border px-2 font-kicker text-xs uppercase leading-tight tracking-[0.08em] ${
            sortKey === 'cost' ? 'border-ink bg-ink text-paper' : 'border-ink bg-paper text-ink'
          }`}
          aria-pressed={sortKey === 'cost'}
          onClick={() => toggle('cost')}
        >
          {costLabel}
        </button>
        <button
          type="button"
          className={`min-h-12 border px-2 font-kicker text-xs uppercase leading-tight tracking-[0.08em] ${
            sortKey === 'energy' ? 'border-ink bg-ink text-paper' : 'border-ink bg-paper text-ink'
          }`}
          aria-pressed={sortKey === 'energy'}
          onClick={() => toggle('energy')}
        >
          {energyLabel}
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="mt-4 text-sm">No loads match this gauge and filter.</p>
      ) : (
        <>
          <ul className="mt-4 space-y-2 md:hidden">
            {sorted.map((result) => (
              <ResultCard
                key={result.load.id}
                result={result}
                highlighted={result.load.id === highlightId}
                highlightLabel={highlightLabel}
                onShelf={shelf.includes(result.load.id)}
                onToggleShelf={onToggleShelf}
              />
            ))}
          </ul>
          <div className="mt-4 hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">
                Factory loads with pellet count, energy, estimated hits, hold, pass or energy or fail, and price per shell.
              </caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink/70">
                  <th className="py-2 pr-3 font-semibold">Load</th>
                  <th className="py-2 pr-3 font-semibold">Material</th>
                  <th className="py-2 pr-3 font-semibold">Pellets</th>
                  <th className="py-2 pr-3 font-semibold">Energy</th>
                  <th className="py-2 pr-3 font-semibold">Hits (est.)</th>
                  <th className="py-2 pr-3 font-semibold">Hold</th>
                  <th className="py-2 pr-3 font-semibold">Result</th>
                  <th className="py-2 pr-3 font-semibold">$/shell</th>
                  <th className="py-2 font-semibold">
                    <span className="sr-only">Link</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((result) => {
                  const material = materialById(result.load.material);
                  const highlighted = result.load.id === highlightId;
                  const onShelf = shelf.includes(result.load.id);
                  return (
                    <tr
                      key={result.load.id}
                      className={
                        result.passes || result.meetsEnergy
                          ? 'border-b border-line/80'
                          : 'border-b border-line/80 bg-mist text-ink/75'
                      }
                    >
                      <td className="py-3 pr-3 font-semibold text-ink">
                        {result.load.label}
                        {highlighted ? (
                          <span className="ml-2 rounded-sm bg-brass/15 px-1.5 py-0.5 text-xs font-semibold uppercase text-brass">
                            {highlightLabel}
                          </span>
                        ) : null}
                        <button
                          type="button"
                          className="mt-2 block min-h-11 rounded-md border border-line bg-paper px-3 text-sm font-semibold text-ink"
                          aria-pressed={onShelf}
                          onClick={() => onToggleShelf(result.load.id)}
                        >
                          {onShelf ? 'On shelf' : 'Add to shelf'}
                        </button>
                      </td>
                      <td className="py-3 pr-3">
                        {material.name}
                        {!material.waterfowlLegal ? (
                          <span className="mt-1 block text-xs font-semibold text-brass">
                            Not legal for waterfowl
                          </span>
                        ) : null}
                      </td>
                      <td className="py-3 pr-3 tabular-nums">{result.pelletCount}</td>
                      <td className="py-3 pr-3 tabular-nums">
                        {formatEnergy(result.energyAtRangeFtLb)}
                        <span className="mt-0.5 block text-xs">{formatVelocity(result.velocityAtRangeFps)}</span>
                        <span className="mt-0.5 block text-xs">
                          {formatMargin(result.energyMarginFtLb, result.hitMargin)}
                        </span>
                      </td>
                      <td className="py-3 pr-3 tabular-nums">~{result.expectedHits}</td>
                      <td className="py-3 pr-3 font-semibold">{formatAim(result.aim)}</td>
                      <td className="py-3 pr-3">
                        <Status result={result} />
                      </td>
                      <td className="py-3 pr-3 tabular-nums font-semibold text-ink">
                        {formatUsd(result.costPerShell)}
                      </td>
                      <td className="py-3">
                        <ShopLink url={result.load.affiliateUrl} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}

function ResultCard({
  result,
  highlighted,
  highlightLabel,
  onShelf,
  onToggleShelf,
}: {
  result: LoadResult;
  highlighted: boolean;
  highlightLabel: string;
  onShelf: boolean;
  onToggleShelf: (loadId: string) => void;
}) {
  const material = materialById(result.load.material);
  return (
    <li className={`rounded-md border border-line p-3 ${result.passes || result.meetsEnergy ? 'bg-paper' : 'bg-mist'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className={result.passes || result.meetsEnergy ? '' : 'text-ink/75'}>
          <p className="font-semibold text-ink">{result.load.label}</p>
          <p className="mt-0.5 text-sm">
            {material.name}
            {highlighted ? ` · ${highlightLabel}` : ''} · {result.pelletCount} pellets
          </p>
          {!material.waterfowlLegal ? (
            <p className="mt-1 text-xs font-semibold text-brass">Not legal for waterfowl</p>
          ) : null}
        </div>
        <p className="font-display text-2xl tabular-nums leading-none">{formatUsd(result.costPerShell)}</p>
      </div>
      <div className={`mt-2 grid grid-cols-2 gap-2 text-sm ${result.passes || result.meetsEnergy ? '' : 'text-ink/75'}`}>
        <p>
          <span className="block text-xs uppercase tracking-wide">Energy</span>
          {formatEnergy(result.energyAtRangeFtLb)} · {formatVelocity(result.velocityAtRangeFps)}
          <span className="mt-0.5 block text-xs">{formatMargin(result.energyMarginFtLb, result.hitMargin)}</span>
        </p>
        <p>
          <span className="block text-xs uppercase tracking-wide">Hits (est.)</span>~{result.expectedHits}
        </p>
      </div>
      <p className={`mt-2 text-sm ${result.passes || result.meetsEnergy ? '' : 'text-ink/75'}`}>
        <span className="text-xs uppercase tracking-wide">Hold </span>
        <span className="font-semibold">{formatAim(result.aim)}</span>
      </p>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <Status result={result} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="min-h-11 rounded-md border border-line bg-paper px-3 text-sm font-semibold"
            aria-pressed={onShelf}
            onClick={() => onToggleShelf(result.load.id)}
          >
            {onShelf ? 'On shelf' : 'Add to shelf'}
          </button>
          <ShopLink url={result.load.affiliateUrl} />
        </div>
      </div>
    </li>
  );
}
