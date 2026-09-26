import type { Species } from '../types';

const PLACEHOLDER_SOURCE =
  'PLACEHOLDER — threshold not taken from a published ballistic or species reference';

/**
 * Tunable species thresholds.
 * Every seed value is a PLACEHOLDER until `source` cites published data.
 */
export const SPECIES: readonly Species[] = [
  {
    id: 'duck',
    name: 'Duck',
    minPelletEnergyFtLb: 2,
    minPatternHits: 80,
    typicalRangeYd: 35,
    source: PLACEHOLDER_SOURCE,
    waterfowl: true,
  },
  {
    id: 'goose',
    name: 'Goose',
    minPelletEnergyFtLb: 3.25,
    minPatternHits: 50,
    typicalRangeYd: 45,
    source: PLACEHOLDER_SOURCE,
    waterfowl: true,
  },
  {
    id: 'pheasant',
    name: 'Pheasant',
    minPelletEnergyFtLb: 1.25,
    minPatternHits: 55,
    typicalRangeYd: 30,
    source: PLACEHOLDER_SOURCE,
    waterfowl: false,
  },
  {
    id: 'grouse',
    name: 'Grouse',
    minPelletEnergyFtLb: 0.9,
    minPatternHits: 35,
    typicalRangeYd: 25,
    source: PLACEHOLDER_SOURCE,
    waterfowl: false,
  },
  {
    id: 'turkey',
    name: 'Turkey',
    minPelletEnergyFtLb: 1.4,
    minPatternHits: 100,
    typicalRangeYd: 40,
    source: PLACEHOLDER_SOURCE,
    waterfowl: false,
  },
];

const BY_ID = new Map(SPECIES.map((species) => [species.id, species]));

export function speciesById(id: string): Species {
  const species = BY_ID.get(id);
  if (!species) {
    throw new Error(`Unknown species: ${id}`);
  }
  return species;
}

export function isPlaceholderSource(source: string): boolean {
  return source.toUpperCase().includes('PLACEHOLDER');
}

export function unsourcedSpecies(species: readonly Species[] = SPECIES): Species[] {
  return species.filter((item) => isPlaceholderSource(item.source));
}
