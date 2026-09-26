import { PHYSICS } from '../config/physics';

/**
 * Drag coefficient at a velocity in m/s.
 * The default resolver is Allen's Cd(Mach) and therefore depends on speed.
 */
export type CdResolver = (velocityMps: number) => number;

export function constantCd(cd: number): CdResolver {
  return () => cd;
}

/**
 * Allen, E. J. (2018). Approximate ballistics formulas for spherical pellets in free flight.
 * Defence Technology, 14(1). Average of the Re = 10,000 and 9/16-inch sphere curves.
 * The printed middle segment is −0.163 + 0.94M so the knots match Table 2.
 */
export function sphereDragCoefficient(mach: number): number {
  if (mach >= 2) return 0.995;
  if (mach >= 1.2) return 0.92 + 0.0375 * mach;
  if (mach >= 0.7) return -0.163 + 0.94 * mach;
  if (mach >= 0.2) return 0.418 + 0.11 * mach;
  return 0.44;
}

export function temperatureKelvin(temperatureF: number): number {
  return ((temperatureF - 32) * 5) / 9 + 273.15;
}

export function speedOfSoundMps(temperatureF: number): number {
  const tempK = temperatureKelvin(temperatureF);
  return Math.sqrt(PHYSICS.heatCapacityRatio * PHYSICS.specificGasConstantDryAir * tempK);
}

/** ISA pressure at elevation, then density from the hunter's thermometer. */
export function airDensityKgPerM3(elevationFt: number, temperatureF: number): number {
  const elevationM = Math.max(0, elevationFt) * PHYSICS.metersPerFoot;
  const seaK = PHYSICS.isaTemperatureSeaLevelK;
  const isaK = seaK - PHYSICS.isaLapseRateKPerM * elevationM;
  const exponent =
    PHYSICS.gravityMPerS2 / (PHYSICS.specificGasConstantDryAir * PHYSICS.isaLapseRateKPerM);
  const pressure = PHYSICS.isaPressureSeaLevelPa * (isaK / seaK) ** exponent;
  return pressure / (PHYSICS.specificGasConstantDryAir * temperatureKelvin(temperatureF));
}

export function sphereCdAt(temperatureF: number): CdResolver {
  const sound = speedOfSoundMps(temperatureF);
  return (velocityMps) => sphereDragCoefficient(velocityMps / sound);
}

export const defaultCd: CdResolver = sphereCdAt(59);

/** k = (ρ Cd A) / (2 m), with A = π(d/2)². */
export function dragK(
  diameterM: number,
  massKg: number,
  cd: number,
  airDensity: number = PHYSICS.airDensityKgPerM3,
): number {
  const area = Math.PI * (diameterM / 2) ** 2;
  return (airDensity * cd * area) / (2 * massKg);
}

/**
 * Steps Cd along the trajectory. A constant Cd reproduces v(x) = v0 exp(−k x)
 * up to the step size. Callers still pass a CdResolver.
 */
export function velocityAtRangeMps(
  muzzleVelocityMps: number,
  rangeM: number,
  diameterM: number,
  massKg: number,
  cdAt: CdResolver = defaultCd,
  airDensity: number = PHYSICS.airDensityKgPerM3,
): number {
  const distance = Math.max(0, rangeM);
  if (distance === 0 || muzzleVelocityMps <= 0) return Math.max(0, muzzleVelocityMps);

  let traveled = 0;
  let velocity = muzzleVelocityMps;
  while (traveled < distance - 1e-9) {
    const dx = Math.min(PHYSICS.dragStepM, distance - traveled);
    const k = dragK(diameterM, massKg, cdAt(velocity), airDensity);
    velocity *= Math.exp(-k * dx);
    traveled += dx;
  }
  return velocity;
}

export function kineticEnergyFtLb(massKg: number, velocityMps: number): number {
  const joules = 0.5 * massKg * velocityMps * velocityMps;
  return joules * PHYSICS.joulesToFootPounds;
}

export interface DownrangeInput {
  diameterIn: number;
  massGrams: number;
  muzzleVelocityFps: number;
  rangeYd: number;
  elevationFt?: number;
  temperatureF?: number;
  cdAt?: CdResolver;
}

export interface DownrangePerformance {
  velocityFps: number;
  energyFtLb: number;
}

/** Convert hunter units at the edge, then run SI drag and energy. */
export function downrangePerformance(input: DownrangeInput): DownrangePerformance {
  const elevationFt = input.elevationFt ?? 0;
  const temperatureF = input.temperatureF ?? 59;
  const diameterM = input.diameterIn * PHYSICS.metersPerInch;
  const massKg = input.massGrams / PHYSICS.gramsPerKilogram;
  const muzzleVelocityMps = input.muzzleVelocityFps * PHYSICS.metersPerFoot;
  const rangeM = input.rangeYd * PHYSICS.metersPerYard;
  const density = airDensityKgPerM3(elevationFt, temperatureF);
  const velocityMps = velocityAtRangeMps(
    muzzleVelocityMps,
    rangeM,
    diameterM,
    massKg,
    input.cdAt ?? sphereCdAt(temperatureF),
    density,
  );
  return {
    velocityFps: velocityMps / PHYSICS.metersPerFoot,
    energyFtLb: kineticEnergyFtLb(massKg, velocityMps),
  };
}
