import type { Choke } from '../types';

/** Tunable. Pattern percent inside a 30-inch circle at 40 yards. */
export const CHOKE_PATTERN_PCT: Record<Choke, number> = {
  cyl: 40,
  ic: 50,
  mod: 60,
  im: 65,
  full: 70,
};

export const CHOKE_OPTIONS: readonly { id: Choke; label: string }[] = [
  { id: 'cyl', label: 'Cylinder' },
  { id: 'ic', label: 'Improved Cylinder' },
  { id: 'mod', label: 'Modified' },
  { id: 'im', label: 'Improved Modified' },
  { id: 'full', label: 'Full' },
];

export function chokeLabel(choke: Choke): string {
  const match = CHOKE_OPTIONS.find((option) => option.id === choke);
  if (!match) {
    throw new Error(`Unknown choke: ${choke}`);
  }
  return match.label;
}
