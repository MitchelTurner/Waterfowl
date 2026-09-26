import { materialById } from './config/materials';
import type { Gauge, LoadResult, RankBy, ShotSize } from './types';

export function formatShotSize(size: ShotSize): string {
  return /^\d/.test(size) ? `#${size}` : size;
}

export function formatGauge(gauge: Gauge): string {
  return gauge === 410 ? '.410' : `${gauge} ga`;
}

export function formatUsd(amount: number): string {
  const sign = amount < 0 ? '-' : '';
  return `${sign}$${Math.abs(amount).toFixed(2)}`;
}

export function formatEnergy(ftLb: number): string {
  return `${ftLb.toFixed(1)} ft-lb`;
}

export function formatMargin(energyMarginFtLb: number, hitMargin: number): string {
  const energy = `${energyMarginFtLb >= 0 ? '+' : ''}${energyMarginFtLb.toFixed(1)} ft-lb`;
  const hits = `${hitMargin >= 0 ? '+' : ''}${hitMargin} hits`;
  return `${energy} · ${hits}`;
}

export function formatVelocity(fps: number): string {
  return `${Math.round(fps)} fps`;
}

export interface HeadlineCopy {
  headline: string;
  support: string;
}

export function buildHeadline(args: {
  speciesName: string;
  rangeYd: number;
  options: readonly LoadResult[];
  closestMiss: LoadResult | null;
  rankBy?: RankBy;
}): HeadlineCopy {
  const { speciesName, rangeYd, options, closestMiss } = args;
  const rankBy = args.rankBy ?? 'price';

  if (options.length === 0) {
    const headline = `Nothing clears the ${speciesName.toLowerCase()} threshold at ${rangeYd} yards.`;
    if (!closestMiss) {
      return {
        headline,
        support: 'No factory loads match this gauge and filter.',
      };
    }
    return {
      headline,
      support: `Closest is ${closestMiss.load.label}: ${formatEnergy(closestMiss.energyAtRangeFtLb)} and about ${closestMiss.expectedHits} hits. Pattern counts are an estimate.`,
    };
  }

  const cheapest = options[0];
  const cheapMaterial = materialById(cheapest.load.material);
  const cheapShot = formatShotSize(cheapest.load.shotSize);

  if (options.length === 1) {
    return {
      headline: `${cheapShot} ${cheapMaterial.headlineName} clears the threshold at ${rangeYd} yards.`,
      support: `${cheapMaterial.name} is the only passing material, at ${formatUsd(cheapest.costPerShell)} per shell. Pattern counts are an estimate.`,
    };
  }

  const next = options[1];
  const nextMaterial = materialById(next.load.material);
  const diff = next.costPerShell - cheapest.costPerShell;
  const costSentence =
    diff > 0.001
      ? `${cheapMaterial.name} costs ${formatUsd(diff)} less per shell.`
      : diff < -0.001
        ? `${cheapMaterial.name} costs ${formatUsd(-diff)} more per shell.`
        : `${cheapMaterial.name} and ${nextMaterial.name} cost the same per shell.`;
  const extra =
    options.length > 2
      ? ` ${options.length} materials clear it.`
      : '';

  const picker =
    rankBy === 'margin'
      ? 'Widest margin of each passing material is below.'
      : 'Cheapest load of each passing material is below.';

  return {
    headline: `${cheapShot} ${cheapMaterial.headlineName} or ${formatShotSize(next.load.shotSize)} ${nextMaterial.headlineName} both clear the threshold at ${rangeYd} yards. ${costSentence}`,
    support: `${picker}${extra} Pattern counts are an estimate.`,
  };
}
