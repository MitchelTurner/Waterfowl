import { describe, expect, it } from 'vitest';
import { CHOKE_OPTIONS, CHOKE_PATTERN_PCT } from '../../config/chokes';
import { MATERIALS } from '../../config/materials';
import { PHYSICS } from '../../config/physics';
import { expectedHits, patternPercent } from '../pattern';

describe('pattern estimate', () => {
  it('adjusts the 40-yard choke percent by range and clamps it', () => {
    expect(patternPercent({ choke: 'mod', patternModifier: 0, rangeYd: 40 })).toBe(
      CHOKE_PATTERN_PCT.mod,
    );
    expect(patternPercent({ choke: 'mod', patternModifier: 0, rangeYd: 50 })).toBe(50);
    expect(patternPercent({ choke: 'full', patternModifier: 5, rangeYd: 15 })).toBe(
      PHYSICS.patternPercentMax,
    );
    expect(patternPercent({ choke: 'cyl', patternModifier: 0, rangeYd: 70 })).toBe(
      PHYSICS.patternPercentMin,
    );
  });

  it('never estimates more hits than pellets thrown', () => {
    const counts = [1, 2, 17, 133, 358, 1000];
    for (const choke of CHOKE_OPTIONS) {
      for (const material of MATERIALS) {
        for (const rangeYd of [15, 25, 40, 60]) {
          const pct = patternPercent({
            choke: choke.id,
            patternModifier: material.patternModifier,
            rangeYd,
          });
          expect(pct).toBeGreaterThanOrEqual(PHYSICS.patternPercentMin);
          expect(pct).toBeLessThanOrEqual(PHYSICS.patternPercentMax);
          for (const count of counts) {
            expect(expectedHits(count, pct)).toBeLessThanOrEqual(count);
          }
        }
      }
    }
  });
});
