import { isPlaceholderSource } from '../config/species';
import { materialById } from '../config/materials';
import type { Recommendation } from '../physics/evaluate';
import { buildHeadline, formatEnergy, formatShotSize, formatUsd, formatVelocity } from '../format';
import type { Species } from '../types';

export function RecommendationCard({
  species,
  rangeYd,
  recommendation,
}: {
  species: Species;
  rangeYd: number;
  recommendation: Recommendation;
}) {
  const copy = buildHeadline({
    speciesName: species.name,
    rangeYd,
    options: recommendation.options,
    closestMiss: recommendation.closestMiss,
  });
  const passed = recommendation.options.length > 0;
  const placeholder = import.meta.env.DEV && isPlaceholderSource(species.source);

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
            Placeholder threshold
          </span>
        ) : null}
      </div>
      <p className="mt-2 font-display text-2xl leading-snug sm:text-[1.7rem]">{copy.headline}</p>
      <p className={`mt-2 text-sm ${passed ? 'text-paper/85' : 'text-ink/80'}`}>{copy.support}</p>
      <p className={`mt-3 text-sm ${passed ? 'text-paper/85' : 'text-ink/80'}`}>
        {species.name} needs {formatEnergy(species.minPelletEnergyFtLb)} and {species.minPatternHits}{' '}
        hits at {rangeYd} yd.
      </p>

      {recommendation.options.length > 0 ? (
        <ol className="mt-4 space-y-2">
          {recommendation.options.map((option, index) => {
            const material = materialById(option.load.material);
            return (
              <li
                key={option.load.id}
                className="rounded-md bg-paper/10 px-3 py-2 text-sm ring-1 ring-paper/15"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-semibold">
                    {formatShotSize(option.load.shotSize)} {material.headlineName}
                    {index === 0 ? <span className="ml-2 text-paper/80">Cheapest</span> : null}
                  </p>
                  <p className="font-display text-xl tabular-nums">{formatUsd(option.costPerShell)}</p>
                </div>
                <p className="text-paper/80">{option.load.label}</p>
                <p className="text-paper/80">
                  {formatEnergy(option.energyAtRangeFtLb)} · {formatVelocity(option.velocityAtRangeFps)} · ~
                  {option.expectedHits} hits
                </p>
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
          <p className="mt-1 text-ink/80">{formatUsd(recommendation.closestMiss.costPerShell)} per shell</p>
        </div>
      ) : null}
    </section>
  );
}
