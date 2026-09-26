import { FACTORY_LOADS } from '../config/loads';
import { materialById } from '../config/materials';
import { speciesById } from '../config/species';
import { diameterInches } from '../config/shotSizes';
import type { EvaluationInputs, FactoryLoad, LoadResult, Species } from '../types';
import { downrangePerformance } from './ballistics';
import { countPellets, pelletMassGrains, pelletMassGrams } from './pellet';
import { expectedHits, patternPercent } from './pattern';

export function shellCost(
  load: FactoryLoad,
  overrides?: Readonly<Record<string, number>>,
): number {
  const override = overrides?.[load.id];
  return override === undefined ? load.pricePerShell : override;
}

export function meetsSpeciesThreshold(
  energyFtLb: number,
  hits: number,
  species: Species,
): { meetsEnergy: boolean; meetsPattern: boolean; passes: boolean } {
  const meetsEnergy = energyFtLb >= species.minPelletEnergyFtLb;
  const meetsPattern = hits >= species.minPatternHits;
  return { meetsEnergy, meetsPattern, passes: meetsEnergy && meetsPattern };
}

export function isEligible(load: FactoryLoad, inputs: EvaluationInputs): boolean {
  if (load.gauge !== inputs.gauge) return false;
  const species = speciesById(inputs.speciesId);
  const material = materialById(load.material);
  if (species.waterfowl && !material.waterfowlLegal) return false;
  if (inputs.olderGun && !material.vintageGunSafe) return false;
  return true;
}

export function eligibleLoads(
  inputs: EvaluationInputs,
  loads: readonly FactoryLoad[] = FACTORY_LOADS,
): FactoryLoad[] {
  return loads.filter((load) => isEligible(load, inputs));
}

export function evaluate(load: FactoryLoad, inputs: EvaluationInputs): LoadResult {
  const species = speciesById(inputs.speciesId);
  const material = materialById(load.material);
  const diameterIn = diameterInches(load.shotSize);
  const massGrams = pelletMassGrams(diameterIn, material.density);
  const pelletCount = countPellets(load.payloadOz, massGrams);
  const flight = downrangePerformance({
    diameterIn,
    massGrams,
    muzzleVelocityFps: load.velocityFps,
    rangeYd: inputs.rangeYd,
  });
  const patternPct = patternPercent({
    choke: inputs.choke,
    patternModifier: material.patternModifier,
    rangeYd: inputs.rangeYd,
  });
  const hits = expectedHits(pelletCount, patternPct);
  const threshold = meetsSpeciesThreshold(flight.energyFtLb, hits, species);
  return {
    load,
    pelletMassGr: pelletMassGrains(massGrams),
    pelletCount,
    velocityAtRangeFps: flight.velocityFps,
    energyAtRangeFtLb: flight.energyFtLb,
    expectedHits: hits,
    meetsEnergy: threshold.meetsEnergy,
    meetsPattern: threshold.meetsPattern,
    passes: threshold.passes,
    costPerShell: shellCost(load, inputs.priceOverrides),
  };
}

export function evaluateMatching(
  inputs: EvaluationInputs,
  loads: readonly FactoryLoad[] = FACTORY_LOADS,
): LoadResult[] {
  return eligibleLoads(inputs, loads).map((load) => evaluate(load, inputs));
}

export interface Recommendation {
  /** Cheapest passing load for each material, lowest price first. */
  options: LoadResult[];
  /** Set only when nothing passes. */
  closestMiss: LoadResult | null;
}

function missScore(result: LoadResult, species: Species): number {
  const energyRatio =
    species.minPelletEnergyFtLb <= 0
      ? Number.POSITIVE_INFINITY
      : result.energyAtRangeFtLb / species.minPelletEnergyFtLb;
  const patternRatio =
    species.minPatternHits <= 0
      ? Number.POSITIVE_INFINITY
      : result.expectedHits / species.minPatternHits;
  return Math.min(energyRatio, patternRatio);
}

export function recommend(results: readonly LoadResult[], species: Species): Recommendation {
  const bestByMaterial = new Map<string, LoadResult>();
  let closest: LoadResult | null = null;
  let closestScore = Number.NEGATIVE_INFINITY;

  for (const result of results) {
    if (result.passes) {
      const current = bestByMaterial.get(result.load.material);
      const cheaper = current === undefined || result.costPerShell < current.costPerShell;
      const tie =
        current !== undefined &&
        result.costPerShell === current.costPerShell &&
        result.load.id < current.load.id;
      if (cheaper || tie) {
        bestByMaterial.set(result.load.material, result);
      }
      continue;
    }

    const score = missScore(result, species);
    const closer = closest === null || score > closestScore;
    const tie =
      closest !== null && score === closestScore && result.costPerShell < closest.costPerShell;
    if (closer || tie) {
      closest = result;
      closestScore = score;
    }
  }

  const options = [...bestByMaterial.values()].sort(
    (a, b) => a.costPerShell - b.costPerShell || a.load.label.localeCompare(b.load.label),
  );

  return {
    options,
    closestMiss: options.length === 0 ? closest : null,
  };
}
