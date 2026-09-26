import type { ShotSize } from '../types';

/** Tunable. US shot size → diameter in inches. */
export const SHOT_DIAMETER_IN: Record<ShotSize, number> = {
  '9': 0.08,
  '8': 0.09,
  '7.5': 0.095,
  '7': 0.1,
  '6': 0.11,
  '5': 0.12,
  '4': 0.13,
  '3': 0.14,
  '2': 0.15,
  '1': 0.16,
  B: 0.17,
  BB: 0.18,
  BBB: 0.19,
  T: 0.2,
};

export const SHOT_SIZES = Object.keys(SHOT_DIAMETER_IN) as ShotSize[];

export function diameterInches(size: ShotSize): number {
  const diameter = SHOT_DIAMETER_IN[size];
  if (diameter === undefined) {
    throw new Error(`Unknown shot size: ${size}`);
  }
  return diameter;
}
