import { describe, expect, it } from 'vitest';
import { buildHeadline, formatShotSize, formatUsd } from '../../format';
import type { LoadResult } from '../../types';

function result(partial: {
  id: string;
  material: LoadResult['load']['material'];
  shotSize: LoadResult['load']['shotSize'];
  price: number;
  label: string;
}): LoadResult {
  return {
    load: {
      id: partial.id,
      label: partial.label,
      gauge: 12,
      material: partial.material,
      shotSize: partial.shotSize,
      payloadOz: 1,
      velocityFps: 1200,
      pricePerShell: partial.price,
    },
    pelletMassGr: 1,
    pelletCount: 100,
    velocityAtRangeFps: 900,
    energyAtRangeFtLb: 3,
    expectedHits: 90,
    meetsEnergy: true,
    meetsPattern: true,
    passes: true,
    costPerShell: partial.price,
  };
}

describe('headline', () => {
  it('formats shot sizes and dollars', () => {
    expect(formatShotSize('3')).toBe('#3');
    expect(formatShotSize('7.5')).toBe('#7.5');
    expect(formatShotSize('BB')).toBe('BB');
    expect(formatUsd(2.5)).toBe('$2.50');
  });

  it('states the cheaper of two passing materials', () => {
    const copy = buildHeadline({
      speciesName: 'Duck',
      rangeYd: 35,
      closestMiss: null,
      options: [
        result({
          id: 'bi',
          material: 'bismuth',
          shotSize: '3',
          price: 4,
          label: '12ga 3in 1-1/4oz #3 Bismuth',
        }),
        result({
          id: 'tss',
          material: 'tss',
          shotSize: '7',
          price: 6.5,
          label: '12ga 3in 1-1/8oz #7 TSS',
        }),
      ],
    });
    expect(copy.headline).toBe(
      '#3 bismuth or #7 TSS both clear the threshold at 35 yards. Bismuth costs $2.50 less per shell.',
    );
  });

  it('says when nothing clears and names the closest miss', () => {
    const miss = result({
      id: 'steel',
      material: 'steel',
      shotSize: '2',
      price: 1.25,
      label: '12ga 3in 1-1/8oz #2 Steel',
    });
    const copy = buildHeadline({
      speciesName: 'Goose',
      rangeYd: 55,
      options: [],
      closestMiss: miss,
    });
    expect(copy.headline).toBe('Nothing clears the goose threshold at 55 yards.');
    expect(copy.support).toContain('12ga 3in 1-1/8oz #2 Steel');
  });
});
