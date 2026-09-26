import { describe, expect, it } from 'vitest';
import { materialById } from '../../config/materials';
import { diameterInches } from '../../config/shotSizes';
import { countPellets, pelletMassGrams } from '../pellet';

function pelletsInOneOunce(size: '4' | '9', density: number): number {
  const mass = pelletMassGrams(diameterInches(size), density);
  return countPellets(1, mass);
}

function expectWithinPercent(actual: number, expected: number, percent = 5) {
  const tolerance = Math.abs(expected) * (percent / 100);
  expect(Math.abs(actual - expected)).toBeLessThanOrEqual(tolerance);
}

describe('pellet count', () => {
  it('matches published-style counts within 5%', () => {
    expectWithinPercent(pelletsInOneOunce('4', materialById('lead').density), 133);
    expectWithinPercent(pelletsInOneOunce('4', materialById('steel').density), 191);
    expectWithinPercent(pelletsInOneOunce('4', 9.6), 157);
    expectWithinPercent(pelletsInOneOunce('9', 18), 358);
  });

  it('uses the bismuth and TSS densities from config', () => {
    expect(materialById('bismuth').density).toBe(9.6);
    expect(materialById('tss').density).toBe(18);
  });
});
