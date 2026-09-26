import { PHYSICS } from '../config/physics';

/**
 * Drag coefficient at a velocity. The MVP resolver ignores velocity.
 * A later Cd(v) can replace `defaultCd` without changing callers.
 */
export type CdResolver = (velocityMps: number) => number;

export function constantCd(cd: number): CdResolver {
  return () => cd;
}

export const defaultCd: CdResolver = constantCd(PHYSICS.cd);

/** k = (ρ Cd A) / (2 m), with A = π(d/2)². */
export function dragK(diameterM: number, massKg: number, cd: number): number {
  const area = Math.PI * (diameterM / 2) ** 2;
  return (PHYSICS.airDensityKgPerM3 * cd * area) / (2 * massKg);
}

/**
 * Closed form for constant Cd: v(x) = v0 * exp(-k x).
 * `cdAt` is sampled once. When Cd depends on velocity, replace this body
 * with a numerical step; callers already pass a CdResolver.
 */
export function velocityAtRangeMps(
  muzzleVelocityMps: number,
  rangeM: number,
  diameterM: number,
  massKg: number,
  cdAt: CdResolver = defaultCd,
): number {
  const distance = Math.max(0, rangeM);
  const cd = cdAt(muzzleVelocityMps);
  const k = dragK(diameterM, massKg, cd);
  return muzzleVelocityMps * Math.exp(-k * distance);
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
  cdAt?: CdResolver;
}

export interface DownrangePerformance {
  velocityFps: number;
  energyFtLb: number;
}

/** Convert hunter units at the edge, then run SI drag and energy. */
export function downrangePerformance(input: DownrangeInput): DownrangePerformance {
  const diameterM = input.diameterIn * PHYSICS.metersPerInch;
  const massKg = input.massGrams / PHYSICS.gramsPerKilogram;
  const muzzleVelocityMps = input.muzzleVelocityFps * PHYSICS.metersPerFoot;
  const rangeM = input.rangeYd * PHYSICS.metersPerYard;
  const velocityMps = velocityAtRangeMps(
    muzzleVelocityMps,
    rangeM,
    diameterM,
    massKg,
    input.cdAt,
  );
  return {
    velocityFps: velocityMps / PHYSICS.metersPerFoot,
    energyFtLb: kineticEnergyFtLb(massKg, velocityMps),
  };
}
