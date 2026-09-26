import { chokes } from '../config/chokes'
import { materials } from '../config/materials'
import { physicsConfig } from '../config/physics'
import type { Choke, MaterialId } from '../types'

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

export function patternPercentAtRange(choke: Choke, materialId: MaterialId, rangeYd: number): number {
  const basePct = chokes[choke] + materials[materialId].patternModifier
  const rangeAdjustment = physicsConfig.rangePatternDropPctPerYard * (rangeYd - 40)
  return clamp(basePct + rangeAdjustment, 15, 90)
}

export function expectedHits(
  pelletCountValue: number,
  choke: Choke,
  materialId: MaterialId,
  rangeYd: number,
): number {
  const patternPct = patternPercentAtRange(choke, materialId, rangeYd)
  return Math.min(pelletCountValue, Math.round((pelletCountValue * patternPct) / 100))
}
