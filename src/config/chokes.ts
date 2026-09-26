import type { Choke } from '../types';

/** Tunable. Pattern percent inside a 30-inch circle at 40 yards. */
export const CHOKE_PATTERN_PCT: Record<Choke, number> = {
  cyl: 40,
  ic: 50,
  mod: 60,
  im: 65,
  full: 70,
};

export const CHOKE_OPTIONS: readonly { id: Choke; label: string; summary: string }[] = [
  {
    id: 'cyl',
    label: 'Cylinder',
    summary: 'No constriction. The widest pattern in this list, for very close shots.',
  },
  {
    id: 'ic',
    label: 'Improved Cylinder',
    summary: 'A light constriction. A common choice for close birds.',
  },
  {
    id: 'mod',
    label: 'Modified',
    summary: 'A middle constriction. A general hunting choke.',
  },
  {
    id: 'im',
    label: 'Improved Modified',
    summary: 'Tighter than modified and more open than full.',
  },
  {
    id: 'full',
    label: 'Full',
    summary: 'A tight constriction for longer shots.',
  },
];

/** Names a hunter may see that are not in the dropdown, and which listed choke is nearest. */
export const UNLISTED_CHOKES: readonly { name: string; nearest: string }[] = [
  { name: 'Skeet', nearest: 'between cylinder and improved cylinder' },
  { name: 'Light modified', nearest: 'between improved cylinder and modified' },
  { name: 'Extra-full and turkey', nearest: 'tighter than full' },
];

export const CHOKE_IDENTIFY = [
  'A screw-in tube is usually stamped on the side: CYL, SK, IC, LM, M, IM, F, XF, or Turkey. Match those letters, the tube box, or the maker’s chart.',
  'Notches on the rim are a maker’s code. They do not mean the same thing on every brand, so read the stamp before counting notches.',
  'A fixed choke is often stamped on the barrel as Cylinder, Imp. Cyl., Modified, or Full.',
  'If nothing is marked, a shop can measure the constriction. You can also count pellets in a 30-inch circle at 40 yards and pick the closest percent in this list.',
] as const;

export function chokeLabel(choke: Choke): string {
  const match = CHOKE_OPTIONS.find((option) => option.id === choke);
  if (!match) {
    throw new Error(`Unknown choke: ${choke}`);
  }
  return match.label;
}
