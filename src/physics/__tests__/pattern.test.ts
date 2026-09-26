import { describe, expect, it } from 'vitest';
import { CHOKE_OPTIONS, CHOKE_PATTERN_PCT } from '../../config/chokes';
import { MATERIALS } from '../../config/materials';
import { PHYSICS } from '../../config/physics';
import { expectedHits, patternPercent } from '../pattern';

describe('pattern estimate', () => {
  it('matches the choke table at 40 yards in a 30-inch circle and clamps far out', () => {
    expect(patternPercent({ choke: 'mod', patternModifier: 0, rangeYd: 40 })).toBeCloseTo(
      CHOKE_PATTERN_PCT.mod,
      5,
    );
    expect(patternPercent({ choke: 'full', patternModifier: 5, rangeYd: 15 })).toBe(
      PHYSICS.patternPercentMax,
    );
    expect(patternPercent({ choke: 'cyl', patternModifier: 0, rangeYd: 200 })).toBe(
      PHYSICS.patternPercentMin,
    );
  });

  it('drops for a smaller counting circle and rises for a tighter gauge factor', () => {
    const wide = patternPercent({ choke: 'full', patternModifier: 0, rangeYd: 40, circleInches: 30 });
    const tight = patternPercent({ choke: 'full', patternModifier: 0, rangeYd: 40, circleInches: 10 });
    expect(tight).toBeLessThan(wide);
    const twelve = patternPercent({ choke: 'mod', patternModifier: 0, rangeYd: 50, gauge: 12 });
    const fourTen = patternPercent({ choke: 'mod', patternModifier: 0, rangeYd: 50, gauge: 410 });
    expect(fourTen).toBeGreaterThan(twelve);
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
