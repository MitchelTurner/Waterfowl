export const GAUGES = [12, 16, 20, 28, 410] as const;

export type Gauge = (typeof GAUGES)[number];

export type MaterialId = 'steel' | 'bismuth' | 'tungstenPolymer' | 'hevi' | 'tss' | 'lead';

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
  | 'T';

export type Choke = 'cyl' | 'ic' | 'mod' | 'im' | 'full';

export interface Material {
  id: MaterialId;
  name: string;
  /** Mid-sentence label, e.g. "bismuth" or "TSS". */
  headlineName: string;
  density: number;
  defaultVelocityFps: number;
  /** Percentage points added to the choke pattern percent. */
  patternModifier: number;
  vintageGunSafe: boolean;
  waterfowlLegal: boolean;
}

export interface Species {
  id: string;
  name: string;
  minPelletEnergyFtLb: number;
  /** Pellets in a 30-inch circle. */
  minPatternHits: number;
  typicalRangeYd: number;
  /** Citation, or a PLACEHOLDER string until published data is wired in. */
  source: string;
  /** Ducks and geese. Lead is dropped for these species. */
  waterfowl: boolean;
}

export interface FactoryLoad {
  id: string;
  label: string;
  gauge: Gauge;
  material: MaterialId;
  shotSize: ShotSize;
  payloadOz: number;
  velocityFps: number;
  /** USD. User edits override this and live in the URL. */
  pricePerShell: number;
  affiliateUrl?: string;
}

export interface LoadResult {
  load: FactoryLoad;
  pelletMassGr: number;
  pelletCount: number;
  velocityAtRangeFps: number;
  energyAtRangeFtLb: number;
  expectedHits: number;
  meetsEnergy: boolean;
  meetsPattern: boolean;
  passes: boolean;
  costPerShell: number;
}

export interface EvaluationInputs {
  speciesId: string;
  rangeYd: number;
  gauge: Gauge;
  choke: Choke;
  olderGun: boolean;
  priceOverrides?: Readonly<Record<string, number>>;
}

export interface AppInputs {
  speciesId: string;
  rangeYd: number;
  gauge: Gauge;
  choke: Choke;
  olderGun: boolean;
  priceOverrides: Record<string, number>;
}
