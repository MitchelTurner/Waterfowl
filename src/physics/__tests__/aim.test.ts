import { describe, expect, it } from 'vitest';
import { aimPoint, holdGuide } from '../../config/aim';
import { speciesById } from '../../config/species';

describe('aim point', () => {
  it('sends big shot and thin patterns to the head', () => {
    for (const shotSize of ['B', 'BB', 'BBB', 'T'] as const) {
      expect(
        aimPoint({ speciesId: 'duck', shotSize, meetsEnergy: true, meetsPattern: true }),
      ).toBe('head');
    }
    expect(
      aimPoint({ speciesId: 'goose', shotSize: '2', meetsEnergy: true, meetsPattern: false }),
    ).toBe('head');
    expect(
      aimPoint({ speciesId: 'duck', shotSize: '4', meetsEnergy: false, meetsPattern: true }),
    ).toBe('head');
  });

  it('uses the front half for mid-size shot that clears both thresholds', () => {
    for (const shotSize of ['6', '5', '4', '3', '2', '1'] as const) {
      expect(
        aimPoint({ speciesId: 'duck', shotSize, meetsEnergy: true, meetsPattern: true }),
      ).toBe('both');
    }
  });

  it('centers the body for fine shot that clears both thresholds', () => {
    for (const shotSize of ['9', '8', '7.5', '7'] as const) {
      expect(
        aimPoint({ speciesId: 'duck', shotSize, meetsEnergy: true, meetsPattern: true }),
      ).toBe('body');
    }
  });

  it('keeps turkey on the head and neck', () => {
    expect(
      aimPoint({ speciesId: 'turkey', shotSize: '9', meetsEnergy: true, meetsPattern: true }),
    ).toBe('head');
    expect(holdGuide(speciesById('turkey')).intro).toContain('head and neck');
    expect(holdGuide(speciesById('turkey')).rows).toHaveLength(0);
  });

  it('names the three holds for a duck', () => {
    const guide = holdGuide(speciesById('duck'));
    expect(guide.intro).toContain('duck');
    expect(guide.rows.map((row) => row.label)).toEqual(['Head', 'Both', 'Body']);
    expect(guide.rows[0]?.detail).toContain('T');
    expect(guide.rows[1]?.detail).toContain('#6');
    expect(guide.rows[2]?.detail).toContain('#7');
  });
});
