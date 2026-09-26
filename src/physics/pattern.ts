import { CHOKE_PATTERN_PCT } from '../config/chokes';
import { GAUGE_SPREAD, PHYSICS } from '../config/physics';
import type { Choke, Gauge } from '../types';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Gaussian pattern whose width grows linearly with range.
 * The choke table is the percent inside a 30-inch circle at 40 yards when gauge spread is 1.
 * A smaller counting circle, a longer range, or a wider gauge factor lowers the percent.
 */
export function patternPercent(args: {
  choke: Choke;
  patternModifier: number;
  rangeYd: number;
  circleInches?: number;
  gauge?: Gauge;
}): number {
  const referencePct = clamp(CHOKE_PATTERN_PCT[args.choke] + args.patternModifier, 0.1, 99);
  const circle = args.circleInches ?? PHYSICS.patternReferenceCircleIn;
  const spread = GAUGE_SPREAD[args.gauge ?? 12];
  const rangeYd = Math.max(args.rangeYd, 0.5);
  const ratio =
    (circle / PHYSICS.patternReferenceCircleIn) ** 2 *
    (PHYSICS.patternReferenceYard / (rangeYd * spread)) ** 2;
  const inside = 1 - Math.exp(Math.log(1 - referencePct / 100) * ratio);
  return clamp(inside * 100, PHYSICS.patternPercentMin, PHYSICS.patternPercentMax);
}

/** Rounded pellet count inside the pattern percent. Labeled as an estimate in the UI. */
export function expectedHits(pelletCount: number, patternPct: number): number {
  return Math.round((pelletCount * patternPct) / 100);
}
