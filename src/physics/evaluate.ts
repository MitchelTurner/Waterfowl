import { factoryLoads } from '../config/loads'
import { materials } from '../config/materials'
import { shotSizeDiametersIn } from '../config/shotSizes'
import { speciesById } from '../config/species'
import type { EvaluationInputs, FactoryLoad, LoadResult } from '../types'
import { energyAtVelocityFtLb, velocityAtRangeFps } from './ballistics'
import { expectedHits } from './pattern'
import { pelletCount, pelletMassGrains } from './pellet'

export interface RecommendationSummary {
  passingByMaterial: LoadResult[]
  closestMiss?: LoadResult
}

function distanceFromPass(result: LoadResult, minEnergy: number, minHits: number): number {
  const energyGap = Math.max(0, minEnergy - result.energyAtRangeFtLb)
  const hitGap = Math.max(0, minHits - result.expectedHits)
  return energyGap + hitGap / 25
}

export function evaluateLoad(load: FactoryLoad, inputs: EvaluationInputs): LoadResult {
  const material = materials[load.material]
  const species = speciesById[inputs.speciesId]
  const diameterIn = shotSizeDiametersIn[load.shotSize]
  const pelletMassGr = pelletMassGrains(diameterIn, material.density)
  const totalPellets = pelletCount(load.payloadOz, diameterIn, material.density)
  const velocity = velocityAtRangeFps(load.velocityFps, diameterIn, pelletMassGr, inputs.rangeYd)
  const energy = energyAtVelocityFtLb(pelletMassGr, velocity)
  const hits = expectedHits(totalPellets, inputs.choke, load.material, inputs.rangeYd)
  const meetsEnergy = energy >= species.minPelletEnergyFtLb
  const meetsPattern = hits >= species.minPatternHits

  return {
    load,
    pelletMassGr,
    pelletCount: totalPellets,
    velocityAtRangeFps: velocity,
    energyAtRangeFtLb: energy,
    expectedHits: hits,
    meetsEnergy,
    meetsPattern,
    passes: meetsEnergy && meetsPattern,
    costPerShell: inputs.priceOverrides[load.id] ?? load.pricePerShell,
  }
}

export function evaluateLoads(inputs: EvaluationInputs): LoadResult[] {
  const species = speciesById[inputs.speciesId]

  return factoryLoads
    .filter((load) => load.gauge === inputs.gauge)
    .filter((load) => !species.isWaterfowl || materials[load.material].waterfowlLegal)
    .filter((load) => !inputs.olderGun || materials[load.material].vintageGunSafe)
    .map((load) => evaluateLoad(load, inputs))
}

export function recommendLoads(results: LoadResult[], speciesId: string): RecommendationSummary {
  const species = speciesById[speciesId]
  const passing = results.filter((result) => result.passes)
  const cheapestByMaterial = new Map<string, LoadResult>()

  for (const result of [...passing].sort((a, b) => a.costPerShell - b.costPerShell)) {
    if (!cheapestByMaterial.has(result.load.material)) {
      cheapestByMaterial.set(result.load.material, result)
    }
  }

  const passingByMaterial = [...cheapestByMaterial.values()].sort((a, b) => a.costPerShell - b.costPerShell)

  if (passingByMaterial.length > 0) {
    return { passingByMaterial }
  }

  const closestMiss = [...results].sort(
    (a, b) =>
      distanceFromPass(a, species.minPelletEnergyFtLb, species.minPatternHits) -
      distanceFromPass(b, species.minPelletEnergyFtLb, species.minPatternHits),
  )[0]

  return { passingByMaterial, closestMiss }
}
