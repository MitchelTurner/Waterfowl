import { CHOKE_PATTERN_PCT } from '../config/chokes';
import { PHYSICS } from '../config/physics';
import type { Choke } from '../types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function patternPercent(args: {
  choke: Choke;
  patternModifier: number;
  rangeYd: number;
}): number {
  const basePct = CHOKE_PATTERN_PCT[args.choke] + args.patternModifier;
  const rangeAdj = PHYSICS.patternPercentPerYard * (args.rangeYd - PHYSICS.patternReferenceYard);
  return clamp(basePct + rangeAdj, PHYSICS.patternPercentMin, PHYSICS.patternPercentMax);
}

/** Rounded pellet count inside the pattern percent. Never used as a measured target. */
export function expectedHits(pelletCount: number, patternPct: number): number {
  return Math.round((pelletCount * patternPct) / 100);
}
