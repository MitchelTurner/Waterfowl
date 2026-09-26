export type MaterialId = 'steel' | 'bismuth' | 'tungstenPolymer' | 'hevi' | 'tss' | 'lead'

export interface Material {
  id: MaterialId
  name: string
  density: number
  defaultVelocityFps: number
  patternModifier: number
  vintageGunSafe: boolean
  waterfowlLegal: boolean
}

export type ShotSize =
  | '9'
  | '8'
  | '7.5'
  | '7'
  | '6'
  | '5'
  | '4'
  | '3'
  | '2'
  | '1'
  | 'B'
  | 'BB'
  | 'BBB'
  | 'T'

export type Choke = 'cyl' | 'ic' | 'mod' | 'im' | 'full'

export interface Species {
  id: string
  name: string
  minPelletEnergyFtLb: number
  minPatternHits: number
  typicalRangeYd: number
  source: string
  isWaterfowl: boolean
}

export interface FactoryLoad {
  id: string
  label: string
  gauge: 12 | 16 | 20 | 28 | 410
  material: MaterialId
  shotSize: ShotSize
  payloadOz: number
  velocityFps: number
  pricePerShell: number
  affiliateUrl?: string
}

export interface LoadResult {
  load: FactoryLoad
  pelletMassGr: number
  pelletCount: number
  velocityAtRangeFps: number
  energyAtRangeFtLb: number
  expectedHits: number
  meetsEnergy: boolean
  meetsPattern: boolean
  passes: boolean
  costPerShell: number
}

export interface EvaluationInputs {
  speciesId: string
  rangeYd: number
  gauge: FactoryLoad['gauge']
  choke: Choke
  olderGun: boolean
  priceOverrides: Record<string, number>
}
