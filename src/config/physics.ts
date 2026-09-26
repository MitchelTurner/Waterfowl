import type { Gauge } from '../types';

/**
 * Tunable ballistics and pattern constants.
 * Components read these; they do not hardcode drag, pattern, or unit factors.
 *
 * Flight drag uses Allen's 2018 average sphere curve Cd(Mach), not `cd`.
 * `cd` remains the incompressible reference (about 0.47–0.5) for comparison.
 */
export const PHYSICS = {
  /** kg/m³ at sea level, 15°C. Tunable reference. */
  airDensityKgPerM3: 1.225,
  /** Incompressible-sphere reference. Flight uses Cd(Mach) instead. Tunable. */
  cd: 0.5,
  patternPercentMin: 5,
  patternPercentMax: 95,
  /** Choke tables are defined for this range and this counting circle. */
  patternReferenceYard: 40,
  patternReferenceCircleIn: 30,
  gramsPerOunce: 28.3495,
  grainsPerGram: 15.4324,
  joulesToFootPounds: 0.737562,
  cmPerInch: 2.54,
  metersPerInch: 0.0254,
  metersPerYard: 0.9144,
  /** Also feet per second → meters per second, and feet of elevation → meters. */
  metersPerFoot: 0.3048,
  gramsPerKilogram: 1000,
  rangeYdMin: 15,
  rangeYdMax: 60,
  elevationFtMin: 0,
  elevationFtMax: 8000,
  temperatureFMin: -20,
  temperatureFMax: 110,
  /** ISA sea-level temperature, 15°C. */
  isaTemperatureSeaLevelK: 288.15,
  isaLapseRateKPerM: 0.0065,
  isaPressureSeaLevelPa: 101325,
  /** Dry air, J/(kg·K). Chosen so sea level at 59°F is about 1.225 kg/m³. */
  specificGasConstantDryAir: 287.05,
  gravityMPerS2: 9.80665,
  /** Ratio of specific heats for dry air, used for the speed of sound. */
  heatCapacityRatio: 1.4,
  /** Distance step for Cd(v) integration, meters. Tunable. */
  dragStepM: 0.25,
} as const;

/**
 * Tunable pattern-width factors. 1 matches the 40-yard choke table.
 * Below 1 is a tighter pattern. These are estimates, not measured gauge tables.
 */
export const GAUGE_SPREAD: Record<Gauge, number> = {
  12: 1,
  16: 0.97,
  20: 0.93,
  28: 0.88,
  410: 0.82,
};
