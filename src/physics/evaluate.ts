import { FACTORY_LOADS } from '../config/loads';
import { materialById } from '../config/materials';
import { speciesById } from '../config/species';
import { diameterInches } from '../config/shotSizes';
import type { EvaluationInputs, FactoryLoad, LoadResult, RankBy, Species } from '../types';
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
  if (inputs.materials !== null && !inputs.materials.includes(load.material)) return false;
  if (inputs.onlyShelf && !inputs.shelf.includes(load.id)) return false;
  if (
    inputs.maxPrice !== null &&
    shellCost(load, inputs.priceOverrides) > inputs.maxPrice
  ) {
    return false;
  }
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
    elevationFt: inputs.elevationFt,
    temperatureF: inputs.temperatureF,
  });
  const patternPct = patternPercent({
    choke: inputs.choke,
    patternModifier: material.patternModifier,
    rangeYd: inputs.rangeYd,
    circleInches: species.patternCircleIn,
    gauge: inputs.gauge,
  });
  const hits = expectedHits(pelletCount, patternPct);
  const threshold = meetsSpeciesThreshold(flight.energyFtLb, hits, species);
  const energyMarginFtLb = flight.energyFtLb - species.minPelletEnergyFtLb;
  const hitMargin = hits - species.minPatternHits;
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
    energyMarginFtLb,
    hitMargin,
    marginScore: missScore(
      {
        energyAtRangeFtLb: flight.energyFtLb,
        expectedHits: hits,
      },
      species,
    ),
  };
}

export function evaluateMatching(
  inputs: EvaluationInputs,
  loads: readonly FactoryLoad[] = FACTORY_LOADS,
): LoadResult[] {
  return eligibleLoads(inputs, loads).map((load) => evaluate(load, inputs));
}

export interface Recommendation {
  /** One passing load per material. Price rank is cheapest first. Margin rank is widest first. */
  options: LoadResult[];
  /** Set only when nothing passes. */
  closestMiss: LoadResult | null;
}

function missScore(
  result: { energyAtRangeFtLb: number; expectedHits: number },
  species: Species,
): number {
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

function betterPass(candidate: LoadResult, current: LoadResult, rankBy: RankBy): boolean {
  if (rankBy === 'margin') {
    if (candidate.marginScore !== current.marginScore) {
      return candidate.marginScore > current.marginScore;
    }
    if (candidate.costPerShell !== current.costPerShell) {
      return candidate.costPerShell < current.costPerShell;
    }
    return candidate.load.id < current.load.id;
  }
  if (candidate.costPerShell !== current.costPerShell) {
    return candidate.costPerShell < current.costPerShell;
  }
  return candidate.load.id < current.load.id;
}

export function recommend(
  results: readonly LoadResult[],
  species: Species,
  rankBy: RankBy = 'price',
): Recommendation {
  const bestByMaterial = new Map<string, LoadResult>();
  let closest: LoadResult | null = null;
  let closestScore = Number.NEGATIVE_INFINITY;

  for (const result of results) {
    if (result.passes) {
      const current = bestByMaterial.get(result.load.material);
      if (current === undefined || betterPass(result, current, rankBy)) {
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

  const options = [...bestByMaterial.values()].sort((a, b) => {
    if (rankBy === 'margin' && a.marginScore !== b.marginScore) {
      return b.marginScore - a.marginScore;
    }
    return a.costPerShell - b.costPerShell || a.load.label.localeCompare(b.load.label);
  });

  return {
    options,
    closestMiss: options.length === 0 ? closest : null,
  };
}
