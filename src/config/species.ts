import type { Species } from '../types'

export const speciesList: Species[] = [
  {
    id: 'duck',
    name: 'Duck',
    minPelletEnergyFtLb: 2.5,
    minPatternHits: 95,
    typicalRangeYd: 35,
    source: 'PLACEHOLDER: Needs published threshold citation',
    isWaterfowl: true,
  },
  {
    id: 'goose',
    name: 'Goose',
    minPelletEnergyFtLb: 4,
    minPatternHits: 85,
    typicalRangeYd: 40,
    source: 'PLACEHOLDER: Needs published threshold citation',
    isWaterfowl: true,
  },
  {
    id: 'pheasant',
    name: 'Pheasant',
    minPelletEnergyFtLb: 1.5,
    minPatternHits: 85,
    typicalRangeYd: 30,
    source: 'PLACEHOLDER: Needs published threshold citation',
    isWaterfowl: false,
  },
  {
    id: 'grouse',
    name: 'Grouse',
    minPelletEnergyFtLb: 1,
    minPatternHits: 75,
    typicalRangeYd: 25,
    source: 'PLACEHOLDER: Needs published threshold citation',
    isWaterfowl: false,
  },
  {
    id: 'turkey',
    name: 'Turkey',
    minPelletEnergyFtLb: 2,
    minPatternHits: 110,
    typicalRangeYd: 40,
    source: 'PLACEHOLDER: Needs published threshold citation',
    isWaterfowl: false,
  },
]

export const speciesById = Object.fromEntries(speciesList.map((species) => [species.id, species])) as Record<
  string,
  Species
>

export const hasPlaceholderSpeciesThresholds = speciesList.some((species) =>
  species.source.toUpperCase().includes('PLACEHOLDER'),
)
