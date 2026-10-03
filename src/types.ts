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

export type RankBy = 'price' | 'margin';

/** Where to hold on the bird for this shot size at the current range. */
export type AimPoint = 'head' | 'body' | 'both';

export interface Species {
  id: string;
  name: string;
  minPelletEnergyFtLb: number;
  /** Pellets inside `patternCircleIn`. */
  minPatternHits: number;
  /** Counting circle for the pattern threshold. Turkey uses 10 inches. */
  patternCircleIn: number;
  typicalRangeYd: number;
  /** Citation for the pattern count, or a PLACEHOLDER string. */
  source: string;
  /** Citation for pellet energy, or a PLACEHOLDER string. */
  energySource: string;
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
  /** Energy minus the species minimum. Negative when short. */
  energyMarginFtLb: number;
  /** Hits minus the species minimum. Negative when short. */
  hitMargin: number;
  /** Lower of the energy and pattern ratios. 1 means right on the threshold. */
  marginScore: number;
  /** Head, body, or both, from shot size plus the energy and pattern result. */
  aim: AimPoint;
}

export interface EvaluationInputs {
  speciesId: string;
  rangeYd: number;
  gauge: Gauge;
  choke: Choke;
  olderGun: boolean;
  priceOverrides?: Readonly<Record<string, number>>;
  elevationFt: number;
  temperatureF: number;
  /** null means every material. An empty list means none. */
  materials: readonly MaterialId[] | null;
  maxPrice: number | null;
  shelf: readonly string[];
  onlyShelf: boolean;
  rankBy: RankBy;
}

export interface AppInputs extends EvaluationInputs {
  priceOverrides: Record<string, number>;
  shelf: string[];
}
