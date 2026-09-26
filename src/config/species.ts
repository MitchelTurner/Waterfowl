import type { Species } from '../types';

const ENERGY_PLACEHOLDER =
  'PLACEHOLDER — pellet-energy minimum is not taken from a published lethality table';

const ROSTER =
  'Tom Roster, 2016 Nontoxic Shot Lethality Table, reprinted by Montana Fish, Wildlife & Parks (pattern count in a 30-inch circle)';

/**
 * Tunable species thresholds.
 * Pattern counts for duck, goose, and pheasant use the low end of Roster's published ranges.
 * Turkey uses a 10-inch counting circle. Energy minimums stay marked until sourced.
 */
export const SPECIES: readonly Species[] = [
  {
    id: 'duck',
    name: 'Duck',
    minPelletEnergyFtLb: 2,
    minPatternHits: 85,
    patternCircleIn: 30,
    typicalRangeYd: 35,
    source: `${ROSTER}. Large ducks (mallard, pintail, gadwall): 85–90 pellets. This app uses 85.`,
    energySource: ENERGY_PLACEHOLDER,
    waterfowl: true,
  },
  {
    id: 'goose',
    name: 'Goose',
    minPelletEnergyFtLb: 3.25,
    minPatternHits: 50,
    patternCircleIn: 30,
    typicalRangeYd: 45,
    source: `${ROSTER}. Large geese: 50–55 pellets. This app uses 50.`,
    energySource: ENERGY_PLACEHOLDER,
    waterfowl: true,
  },
  {
    id: 'pheasant',
    name: 'Pheasant',
    minPelletEnergyFtLb: 1.25,
    minPatternHits: 90,
    patternCircleIn: 30,
    typicalRangeYd: 35,
    source: `${ROSTER}. Ring-necked pheasants: 90–95 pellets. This app uses 90.`,
    energySource: ENERGY_PLACEHOLDER,
    waterfowl: false,
  },
  {
    id: 'grouse',
    name: 'Grouse',
    minPelletEnergyFtLb: 0.9,
    minPatternHits: 35,
    patternCircleIn: 30,
    typicalRangeYd: 25,
    source: 'PLACEHOLDER — grouse is not listed in Roster’s 2016 table',
    energySource: ENERGY_PLACEHOLDER,
    waterfowl: false,
  },
  {
    id: 'turkey',
    name: 'Turkey',
    minPelletEnergyFtLb: 1.4,
    minPatternHits: 100,
    patternCircleIn: 10,
    typicalRangeYd: 40,
    source:
      '10-inch pattern-board goal of 100 pellets, the usual turkey load test. Roster 2016 instead lists 210–230 pellets in a 30-inch circle for head-and-neck shots at 20–40 yards.',
    energySource: ENERGY_PLACEHOLDER,
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

export function speciesNeedsSource(species: Species): boolean {
  return isPlaceholderSource(species.source) || isPlaceholderSource(species.energySource);
}

export function unsourcedSpecies(species: readonly Species[] = SPECIES): Species[] {
  return species.filter(speciesNeedsSource);
}
