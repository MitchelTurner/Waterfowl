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
  const recommendation = useMemo(() => recommend(results, species), [results, species]);

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
      <header className="border-b border-black/10 bg-marsh text-paper">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-4">
          <div>
            <p className="font-display text-4xl leading-none">ShotMath</p>
            <p className="mt-1 max-w-md text-sm text-paper/80">
              Compare factory shotgun loads by energy, pattern, and price.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              className="min-h-12 rounded-md bg-paper px-3 text-sm font-semibold text-marsh"
              onClick={() => setPricesOpen(true)}
            >
              Edit prices
            </button>
            <button
              type="button"
              className="min-h-12 rounded-md border border-paper/40 px-3 text-sm font-semibold"
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
        />
        <ResultsTable results={results} cheapestId={recommendation.options[0]?.load.id ?? null} />
        <MaterialChart />
        <details className="rounded-md border border-line bg-card p-4 text-sm shadow-card">
          <summary className="min-h-12 cursor-pointer font-semibold">How this estimate works</summary>
          <div className="mt-2 space-y-2 text-ink/85">
            <p>Pellet mass comes from shot diameter and material density. Count is payload divided by that mass.</p>
            <p>
              Velocity uses quadratic drag with one drag coefficient. Energy is computed from the downrange
              velocity. A later velocity-based drag model can replace that constant without changing the screen.
            </p>
            <p>
              Pattern percent starts from the choke at 40 yards, shifts with range, and is clamped. Hits are that
              percent of the pellet count, labeled as an estimate.
            </p>
            <p>
              A load passes when pellet energy and estimated hits both meet the species threshold. The card keeps
              the cheapest passing load of each material.
            </p>
          </div>
        </details>
      </main>
      <footer className="mx-auto max-w-3xl px-4 pb-8 text-sm text-ink/80">
        Estimates only. Pattern your own gun. Not reloading data.
      </footer>
      <PriceDrawer
        open={pricesOpen}
        inputs={inputs}
        onClose={closePrices}
        onPrice={setPrice}
        onClear={clearPrices}
      />
    </div>
  );
}
