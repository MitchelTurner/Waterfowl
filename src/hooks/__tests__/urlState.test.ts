import { describe, expect, it } from 'vitest';
import { FACTORY_LOADS } from '../../config/loads';
import { speciesById } from '../../config/species';
import { applyInputPatch, defaultInputs, parseInputs, serializeInputs } from '../urlState';

describe('url state', () => {
  it('round-trips inputs, including price overrides', () => {
    const loadId = FACTORY_LOADS[0]!.id;
    const inputs = {
      ...defaultInputs(),
      speciesId: 'goose',
      rangeYd: 50,
      gauge: 20 as const,
      choke: 'full' as const,
      olderGun: true,
      priceOverrides: { [loadId]: 1.5 },
    };
    expect(parseInputs(serializeInputs(inputs))).toEqual(inputs);
    expect(parseInputs(`?${serializeInputs(inputs)}`)).toEqual(inputs);
  });

  it('round-trips elevation, temperature, filters, shelf, and margin rank', () => {
    const loadId = FACTORY_LOADS[1]!.id;
    const inputs = {
      ...defaultInputs(),
      elevationFt: 5000,
      temperatureF: 32,
      materials: ['bismuth', 'lead'] as const,
      maxPrice: 4.5,
      shelf: [loadId],
      onlyShelf: true,
      rankBy: 'margin' as const,
    };
    expect(parseInputs(serializeInputs(inputs))).toEqual({
      ...inputs,
      materials: ['bismuth', 'lead'],
    });
  });

  it('round-trips the defaults', () => {
    const defaults = defaultInputs();
    expect(parseInputs(serializeInputs(defaults))).toEqual(defaults);
    expect(parseInputs('')).toEqual(defaults);
  });

  it('snaps range to the species typical distance when the species changes', () => {
    const goose = speciesById('goose');
    const next = applyInputPatch(defaultInputs(), { speciesId: 'goose' });
    expect(next.speciesId).toBe('goose');
    expect(next.rangeYd).toBe(goose.typicalRangeYd);
    const kept = applyInputPatch(defaultInputs(), { speciesId: 'goose', rangeYd: 52 });
    expect(kept.rangeYd).toBe(52);
  });

  it('ignores unknown species, choke, gauge, and load ids', () => {
    const parsed = parseInputs('?species=moose&range=99&gauge=10&choke=extra&prices=nope:4,12-steel-3-1125-2:2.25');
    const defaults = defaultInputs();
    expect(parsed.speciesId).toBe(defaults.speciesId);
    expect(parsed.rangeYd).toBe(60);
    expect(parsed.gauge).toBe(12);
    expect(parsed.choke).toBe('mod');
    expect(parsed.priceOverrides).toEqual({ '12-steel-3-1125-2': 2.25 });
  });
});
