import { diameterInches } from './shotSizes';
import type { AimPoint, ShotSize, Species } from '../types';

const BODY_MAX_IN = diameterInches('7');
const HEAD_MIN_IN = diameterInches('B');

/**
 * Where to hold, from shot size.
 *
 * Tom Roster's lethality work places a penetrating pattern on the front half
 * of the bird (head, neck, heart, lungs, and spine). This guide splits that
 * into the three holds hunters ask about:
 *
 * - Head: B, BB, BBB, and T. Also any load short on energy or pattern.
 *   Coarse shot has fewer pellets, so the hold is the head and neck. That
 *   includes the case where you only wanted to know the energy is there.
 * - Both: #6 through #1 when energy and pattern both clear. Front half.
 * - Body: #7 and smaller when energy and pattern both clear. Center the bird.
 *   TSS #7 and #9 land here when they clear both thresholds.
 *
 * Turkey stays a head-and-neck hold. Its pattern count is a 10-inch circle.
 */
export function aimPoint(args: {
  speciesId: string;
  shotSize: ShotSize;
  meetsEnergy: boolean;
  meetsPattern: boolean;
}): AimPoint {
  if (args.speciesId === 'turkey') return 'head';
  if (!args.meetsEnergy || !args.meetsPattern) return 'head';
  const diameter = diameterInches(args.shotSize);
  if (diameter + 1e-9 >= HEAD_MIN_IN) return 'head';
  if (diameter <= BODY_MAX_IN + 1e-9) return 'body';
  return 'both';
}

export interface HoldGuideRow {
  label: string;
  detail: string;
}

export function holdGuide(species: Pick<Species, 'id' | 'name'>): {
  intro: string;
  rows: HoldGuideRow[];
} {
  const bird = species.name.toLowerCase();
  if (species.id === 'turkey') {
    return {
      intro: `Where to hold on a ${bird}: the head and neck. The pattern count uses a 10-inch circle.`,
      rows: [],
    };
  }
  return {
    intro: `Where to hold on a ${bird}.`,
    rows: [
      {
        label: 'Head',
        detail: 'Head and neck. B, BB, BBB, and T, plus any load short on energy or pattern.',
      },
      {
        label: 'Both',
        detail: 'Front half: head, neck, and forward body. #6 through #1 when energy and pattern both clear.',
      },
      {
        label: 'Body',
        detail: 'Center of the bird. #7 and smaller when energy and pattern both clear.',
      },
    ],
  };
}
