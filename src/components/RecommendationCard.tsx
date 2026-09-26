import { useState } from 'react';
import { isPlaceholderSource } from '../config/species';
import { materialById } from '../config/materials';
import type { Recommendation } from '../physics/evaluate';
import {
  buildHeadline,
  formatEnergy,
  formatMargin,
  formatShotSize,
  formatUsd,
  formatVelocity,
} from '../format';
import type { RankBy, Species } from '../types';

export function RecommendationCard({
  species,
  rangeYd,
  recommendation,
  rankBy,
  onPrice,
}: {
  species: Species;
  rangeYd: number;
  recommendation: Recommendation;
  rankBy: RankBy;
  onPrice: (loadId: string, price: number | null) => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const copy = buildHeadline({
    speciesName: species.name,
    rangeYd,
    options: recommendation.options,
    closestMiss: recommendation.closestMiss,
    rankBy,
  });
  const passed = recommendation.options.length > 0;
  const placeholder = import.meta.env.DEV && isPlaceholderSource(species.energySource);
  const leadLabel = rankBy === 'margin' ? 'Best margin' : 'Cheapest';

  return (
    <section
      id="recommendation"
      aria-live="polite"
      className={
        passed
          ? 'rounded-md border border-marsh bg-marsh p-4 text-paper shadow-card'
          : 'rounded-md border border-clay bg-card p-4 text-ink shadow-card'
      }
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Recommendation</h2>
        {placeholder ? (
          <span className="rounded-sm bg-brass px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
            Energy placeholder
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-2xl leading-snug sm:text-[1.7rem]">{copy.headline}</p>
      <p className={`mt-2 text-sm ${passed ? 'text-paper/85' : 'text-ink/80'}`}>{copy.support}</p>
      <p className={`mt-3 text-sm ${passed ? 'text-paper/85' : 'text-ink/80'}`}>
        {species.name} needs {formatEnergy(species.minPelletEnergyFtLb)} and {species.minPatternHits}{' '}
        hits in a {species.patternCircleIn}-inch circle at {rangeYd} yd.
      </p>

      {recommendation.options.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {recommendation.options.map((option, index) => {
            const material = materialById(option.load.material);
            const draft = drafts[option.load.id];
            const priceValue = draft !== undefined ? draft : option.costPerShell.toFixed(2);
            return (
              <li
                key={option.load.id}
                className="rounded-md bg-paper/10 px-3 py-2 text-sm ring-1 ring-paper/15"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold">
                    {formatShotSize(option.load.shotSize)} {material.headlineName}
                    {index === 0 ? <span className="ml-2 text-paper/80">{leadLabel}</span> : null}
                  </p>
                  <p className="font-display text-xl tabular-nums">{formatUsd(option.costPerShell)}</p>
                </div>
                <p className="text-paper/80">{option.load.label}</p>
                <p className="text-paper/80">
                  {formatEnergy(option.energyAtRangeFtLb)} · {formatVelocity(option.velocityAtRangeFps)} · ~
                  {option.expectedHits} hits
                </p>
                <p className="text-paper/80">
                  {formatMargin(option.energyMarginFtLb, option.hitMargin)}
                </p>
                <label className="mt-2 block text-xs font-semibold uppercase tracking-wide text-paper/80" htmlFor={`rec-price-${option.load.id}`}>
                  Price per shell
                  <input
                    id={`rec-price-${option.load.id}`}
                    className="mt-1 min-h-11 w-full rounded-md border border-line bg-paper px-2 text-base font-normal normal-case tracking-normal text-ink tabular-nums"
                    inputMode="decimal"
                    min={0}
                    step={0.01}
                    type="number"
                    autoComplete="off"
                    value={priceValue}
                    onChange={(event) => {
                      const raw = event.target.value;
                      setDrafts((current) => ({ ...current, [option.load.id]: raw }));
                    }}
                    onBlur={(event) => {
                      const raw = event.currentTarget.value;
                      const parsed = Number(raw);
                      if (raw.trim() !== '' && Number.isFinite(parsed) && parsed >= 0) {
                        const cents = Math.round(parsed * 100) / 100;
                        const seed = Math.round(option.load.pricePerShell * 100) / 100;
                        onPrice(option.load.id, cents === seed ? null : cents);
                      }
                      setDrafts((current) => {
                        if (current[option.load.id] === undefined) return current;
                        const next = { ...current };
                        delete next[option.load.id];
                        return next;
                      });
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur();
                    }}
                  />
                </label>
              </li>
            );
          })}
        </ol>
      ) : null}

      {recommendation.closestMiss ? (
        <div className="mt-4 rounded-md border border-clay/30 bg-paper px-3 py-3 text-sm text-ink">
          <p className="font-semibold">{recommendation.closestMiss.load.label}</p>
          <p className="mt-1">
            {formatEnergy(recommendation.closestMiss.energyAtRangeFtLb)} (
            {recommendation.closestMiss.meetsEnergy ? 'meets' : 'below'}{' '}
            {formatEnergy(species.minPelletEnergyFtLb)}) · ~{recommendation.closestMiss.expectedHits}{' '}
            hits ({recommendation.closestMiss.meetsPattern ? 'meets' : 'below'} {species.minPatternHits})
          </p>
          <p className="mt-1">{formatMargin(recommendation.closestMiss.energyMarginFtLb, recommendation.closestMiss.hitMargin)}</p>
          <p className="mt-1 text-ink/80">{formatUsd(recommendation.closestMiss.costPerShell)} per shell</p>
        </div>
      ) : null}
    </section>
  );
}
