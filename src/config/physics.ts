/**
 * Tunable ballistics and pattern constants.
 * Components read these; they do not hardcode drag, pattern, or unit factors.
 */
export const PHYSICS = {
  /** kg/m³ at sea level, 15°C. Tunable. */
  airDensityKgPerM3: 1.225,
  /**
   * Single drag coefficient for the MVP closed-form model.
   * Tunable.
   * TODO: calibrate Cd against manufacturer downrange velocity data.
   */
  cd: 0.5,
  /** Pattern percent change per yard away from the 40-yard reference. Tunable. */
  patternPercentPerYard: -1,
  patternPercentMin: 15,
  patternPercentMax: 90,
  patternReferenceYard: 40,
  gramsPerOunce: 28.3495,
  grainsPerGram: 15.4324,
  joulesToFootPounds: 0.737562,
  cmPerInch: 2.54,
  metersPerInch: 0.0254,
  metersPerYard: 0.9144,
  /** Also feet per second → meters per second. */
  metersPerFoot: 0.3048,
  gramsPerKilogram: 1000,
  /** Slider bounds. Tunable. */
  rangeYdMin: 15,
  rangeYdMax: 60,
} as const;
