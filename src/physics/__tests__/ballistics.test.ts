import { describe, expect, it } from 'vitest';
import { PHYSICS } from '../../config/physics';
import { diameterInches } from '../../config/shotSizes';
import {
  airDensityKgPerM3,
  constantCd,
  downrangePerformance,
  dragK,
  kineticEnergyFtLb,
  sphereDragCoefficient,
  velocityAtRangeMps,
} from '../ballistics';
import { pelletMassGrams } from '../pellet';

describe('downrange velocity and energy', () => {
  const diameterIn = diameterInches('4');
  const massGrams = pelletMassGrams(diameterIn, 11.34);
  const muzzleFps = 1300;

  it('locks the tunable drag and energy constants', () => {
    expect(PHYSICS.airDensityKgPerM3).toBe(1.225);
    expect(PHYSICS.cd).toBe(0.5);
    expect(PHYSICS.joulesToFootPounds).toBe(0.737562);
  });

  it('decreases velocity strictly as range increases', () => {
    const ranges = [0, 10, 20, 40, 60];
    const velocities = ranges.map(
      (rangeYd) =>
        downrangePerformance({
          diameterIn,
          massGrams,
          muzzleVelocityFps: muzzleFps,
          rangeYd,
        }).velocityFps,
    );
    for (let i = 1; i < velocities.length; i += 1) {
      expect(velocities[i]).toBeLessThan(velocities[i - 1]!);
    }
  });

  it('keeps more velocity at 40 yards when the pellet is denser', () => {
    const light = downrangePerformance({
      diameterIn,
      massGrams: pelletMassGrams(diameterIn, 7.86),
      muzzleVelocityFps: 1400,
      rangeYd: 40,
    });
    const heavy = downrangePerformance({
      diameterIn,
      massGrams: pelletMassGrams(diameterIn, 18),
      muzzleVelocityFps: 1400,
      rangeYd: 40,
    });
    expect(heavy.velocityFps).toBeGreaterThan(light.velocityFps);
  });

  it('matches muzzle energy at range 0', () => {
    const massKg = massGrams / PHYSICS.gramsPerKilogram;
    const muzzleMps = muzzleFps * PHYSICS.metersPerFoot;
    const expected = kineticEnergyFtLb(massKg, muzzleMps);
    const independent = 0.5 * massKg * muzzleMps * muzzleMps * 0.737562;
    const actual = downrangePerformance({
      diameterIn,
      massGrams,
      muzzleVelocityFps: muzzleFps,
      rangeYd: 0,
    }).energyFtLb;
    expect(actual).toBeCloseTo(expected, 8);
    expect(actual).toBeCloseTo(independent, 8);
    expect(
      velocityAtRangeMps(muzzleMps, 0, diameterIn * PHYSICS.metersPerInch, massKg),
    ).toBeCloseTo(muzzleMps, 8);
  });

  it('raises drag through the transonic band', () => {
    expect(sphereDragCoefficient(1.2)).toBeGreaterThan(sphereDragCoefficient(0.4));
  });

  it('thins the air with elevation and heat', () => {
    const sea = airDensityKgPerM3(0, 59);
    expect(sea).toBeCloseTo(1.225, 2);
    expect(airDensityKgPerM3(5000, 59)).toBeLessThan(sea);
    expect(airDensityKgPerM3(0, 90)).toBeLessThan(sea);
  });

  it('matches the closed form when the drag coefficient is constant', () => {
    const diameterM = diameterIn * PHYSICS.metersPerInch;
    const massKg = massGrams / PHYSICS.gramsPerKilogram;
    const muzzle = muzzleFps * PHYSICS.metersPerFoot;
    const rangeM = 40 * PHYSICS.metersPerYard;
    const closed = muzzle * Math.exp(-dragK(diameterM, massKg, 0.5) * rangeM);
    const stepped = velocityAtRangeMps(muzzle, rangeM, diameterM, massKg, constantCd(0.5));
    expect(stepped).toBeCloseTo(closed, 6);
  });
});
