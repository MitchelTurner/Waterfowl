import { useCallback, useMemo, useState } from 'react';
import { speciesById } from './config/species';
import { DevThresholdBanner } from './components/DevThresholdBanner';
import { InputPanel } from './components/InputPanel';
import { MaterialChart } from './components/MaterialChart';
import { PriceDrawer } from './components/PriceDrawer';
import { RecommendationCard } from './components/RecommendationCard';
import { ResultsTable } from './components/ResultsTable';
import { useUrlState } from './hooks/useUrlState';
import { serializeInputs } from './hooks/urlState';
import { evaluateMatching, recommend } from './physics/evaluate';

export function App() {
  const { inputs, update, setPrice, clearPrices } = useUrlState();
  const [pricesOpen, setPricesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareFallback, setShareFallback] = useState<string | null>(null);
  const closePrices = useCallback(() => setPricesOpen(false), []);

  const species = speciesById(inputs.speciesId);
  const results = useMemo(() => evaluateMatching(inputs), [inputs]);
  const recommendation = useMemo(
    () => recommend(results, species, inputs.rankBy),
    [results, species, inputs.rankBy],
  );
  const focusLoadIds = recommendation.options.map((option) => option.load.id);
  if (recommendation.closestMiss) focusLoadIds.push(recommendation.closestMiss.load.id);

  function toggleShelf(loadId: string) {
    const shelf = inputs.shelf.includes(loadId)
      ? inputs.shelf.filter((id) => id !== loadId)
      : [...inputs.shelf, loadId];
    update({ shelf });
  }

  async function copyLink() {
    const query = serializeInputs(inputs);
    const url = `${window.location.origin}${window.location.pathname}${query ? `?${query}` : ''}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareFallback(null);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setShareFallback(url);
    }
  }

  return (
    <div className="min-h-dvh">
      <a
        href="#recommendation"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-40 focus:bg-card focus:px-3 focus:py-2"
      >
        Skip to recommendation
      </a>
      <header className="bg-paper text-ink">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 pb-2 pt-5">
          <div>
            <p className="text-center font-kicker text-[0.7rem] uppercase tracking-[0.42em] text-clay">
              Shotgun loads compared
            </p>
            <h1 className="mt-1 text-center font-display text-5xl font-bold leading-[0.85] tracking-tight sm:text-6xl">
              ShotMath
            </h1>
            <p className="mx-auto mt-2 max-w-md text-center font-display text-base italic leading-snug">
              Factory loads, weighed by energy, pattern, and price.
            </p>
            <p className="mt-3 bg-clay px-3 py-1.5 text-center font-kicker text-[0.68rem] uppercase tracking-[0.22em] text-paper">
              A field calculator
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="min-h-12 border border-ink bg-ink px-3 font-kicker text-sm uppercase tracking-[0.14em] text-paper"
              onClick={() => setPricesOpen(true)}
            >
              Edit prices
            </button>
            <button
              type="button"
              className="min-h-12 border border-ink bg-paper px-3 font-kicker text-sm uppercase tracking-[0.14em]"
              onClick={() => void copyLink()}
            >
              {copied ? 'Link copied' : 'Copy link'}
            </button>
          </div>
          {shareFallback ? (
            <label className="block text-sm">
              Copy this link
              <input
                className="mt-1 min-h-12 w-full rounded-md px-3 text-base text-ink"
                readOnly
                value={shareFallback}
                onFocus={(event) => event.currentTarget.select()}
              />
            </label>
          ) : null}
        </div>
      </header>
      <DevThresholdBanner />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">
        <InputPanel inputs={inputs} onChange={update} />
        <RecommendationCard
          species={species}
          rangeYd={inputs.rangeYd}
          recommendation={recommendation}
          rankBy={inputs.rankBy}
          onPrice={setPrice}
        />
        <ResultsTable
          results={results}
          highlightId={recommendation.options[0]?.load.id ?? null}
          highlightLabel={inputs.rankBy === 'margin' ? 'Best margin' : 'Cheapest'}
          shelf={inputs.shelf}
          onToggleShelf={toggleShelf}
        />
        <MaterialChart />
        <details className="border border-ink bg-card p-4 text-sm">
          <summary className="dept min-h-12 cursor-pointer">How this estimate works</summary>
          <div className="mt-2 space-y-2 text-ink/85">
            <p>Pellet mass comes from shot diameter and material density. Count is payload divided by that mass.</p>
            <p>
              Velocity uses a sphere drag coefficient that changes with speed, and air density from elevation and
              temperature. Energy is computed from the downrange velocity.
            </p>
            <p>
              Pattern percent is a count inside the species circle. The pattern widens with range and depends on
              gauge. Hits are rounded and labeled as an estimate.
            </p>
            <p>
              A load passes when pellet energy and estimated hits both meet the species threshold. Price rank
              keeps the cheapest passing load of each material. Margin rank keeps the load with the most room
              above both thresholds.
            </p>
          </div>
        </details>
      </main>
      <footer className="mx-auto max-w-3xl px-4 pb-10 pt-2 text-center text-sm">
        <div className="border-t-[3px] border-clay pt-1">
          <p className="border-t border-ink pt-2 font-kicker text-xs uppercase tracking-[0.18em] text-ink/80">
            Estimates only. Pattern your own gun. Not reloading data.
          </p>
        </div>
      </footer>
      <PriceDrawer
        open={pricesOpen}
        inputs={inputs}
        focusLoadIds={focusLoadIds}
        onClose={closePrices}
        onPrice={setPrice}
        onClear={clearPrices}
      />
    </div>
  );
}
