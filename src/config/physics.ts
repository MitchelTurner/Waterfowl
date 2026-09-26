export interface PhysicsConfig {
  airDensityKgM3: number
  dragCoefficient: (velocityMps: number) => number
  rangePatternDropPctPerYard: number
}

// TODO: calibrate Cd against manufacturer downrange velocity data.
export const physicsConfig: PhysicsConfig = {
  airDensityKgM3: 1.225,
  dragCoefficient: () => 0.5,
  rangePatternDropPctPerYard: -1,
}

export const unitConstants = {
  grainsPerGram: 15.4324,
  gramsPerOunce: 28.3495,
  inchesToCm: 2.54,
  yardsToMeters: 0.9144,
  fpsToMps: 0.3048,
  joulesToFtLb: 0.737562,
}
