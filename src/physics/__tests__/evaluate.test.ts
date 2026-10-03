import { describe, expect, it } from 'vitest';
import { FACTORY_LOADS } from '../../config/loads';
import { MATERIALS } from '../../config/materials';
import { speciesById } from '../../config/species';
import { defaultInputs } from '../../hooks/urlState';
import type { FactoryLoad, LoadResult, Species } from '../../types';
import {
  eligibleLoads,
  evaluateMatching,
  meetsSpeciesThreshold,
  recommend,
} from '../evaluate';

function sampleLoad(overrides: Partial<FactoryLoad> = {}): FactoryLoad {
  return {
    id: overrides.id ?? 'sample',
    label: overrides.label ?? 'Sample',
    gauge: overrides.gauge ?? 12,
    material: overrides.material ?? 'steel',
    shotSize: overrides.shotSize ?? '4',
    payloadOz: overrides.payloadOz ?? 1,
    velocityFps: overrides.velocityFps ?? 1450,
    pricePerShell: overrides.pricePerShell ?? 1,
  };
}

function sampleResult(
  overrides: Omit<Partial<LoadResult>, 'load'> & { load?: Partial<FactoryLoad> },
): LoadResult {
  const load = sampleLoad(overrides.load);
  return {
    load,
    pelletMassGr: 1,
    pelletCount: 100,
    velocityAtRangeFps: 1000,
    energyAtRangeFtLb: overrides.energyAtRangeFtLb ?? 3,
    expectedHits: overrides.expectedHits ?? 100,
    meetsEnergy: overrides.meetsEnergy ?? true,
    meetsPattern: overrides.meetsPattern ?? true,
    passes: overrides.passes ?? true,
    costPerShell: overrides.costPerShell ?? load.pricePerShell,
    energyMarginFtLb: overrides.energyMarginFtLb ?? 1,
    hitMargin: overrides.hitMargin ?? 10,
    marginScore: overrides.marginScore ?? 1.2,
    aim: overrides.aim ?? 'both',
  };
}

describe('eligibility', () => {
  it('drops lead for waterfowl and keeps it for upland birds', () => {
    for (const speciesId of ['duck', 'goose']) {
      const loads = eligibleLoads({ ...defaultInputs(), speciesId });
      expect(loads.some((load) => load.material === 'lead')).toBe(false);
      expect(FACTORY_LOADS.some((load) => load.material === 'lead' && load.gauge === 12)).toBe(
        true,
      );
    }
    const pheasant = eligibleLoads({ ...defaultInputs(), speciesId: 'pheasant' });
    expect(pheasant.some((load) => load.material === 'lead')).toBe(true);
  });

  it('drops steel, Hevi-Shot, and TSS for an older gun', () => {
    const loads = eligibleLoads({ ...defaultInputs(), olderGun: true, speciesId: 'pheasant' });
    const hidden = new Set(['steel', 'hevi', 'tss']);
    expect(loads.some((load) => hidden.has(load.material))).toBe(false);
    expect(loads.some((load) => load.material === 'bismuth')).toBe(true);
    expect(loads.some((load) => load.material === 'lead')).toBe(true);
    for (const id of ['steel', 'hevi', 'tss'] as const) {
      expect(MATERIALS.find((material) => material.id === id)?.vintageGunSafe).toBe(false);
    }
  });
});

describe('recommendation', () => {
  const species: Species = {
    id: 'duck',
    name: 'Duck',
    minPelletEnergyFtLb: 2,
    minPatternHits: 50,
    patternCircleIn: 30,
    typicalRangeYd: 35,
    source: 'PLACEHOLDER',
    energySource: 'PLACEHOLDER',
    waterfowl: true,
  };

  it('keeps one cheapest passing load per material, sorted by cost', () => {
    const results = [
      sampleResult({
        passes: true,
        costPerShell: 4,
        load: { id: 'b-expensive', material: 'bismuth', label: 'B expensive', pricePerShell: 4 },
      }),
      sampleResult({
        passes: true,
        costPerShell: 1.1,
        load: { id: 'steel-b', material: 'steel', label: 'Steel B', pricePerShell: 1.1 },
      }),
      sampleResult({
        passes: true,
        costPerShell: 0.9,
        load: { id: 'steel-a', material: 'steel', label: 'Steel A', pricePerShell: 0.9 },
      }),
      sampleResult({
        passes: false,
        costPerShell: 0.1,
        load: { id: 'fail', material: 'lead', label: 'Fail', pricePerShell: 0.1 },
      }),
      sampleResult({
        passes: true,
        costPerShell: 6,
        load: { id: 'tss', material: 'tss', label: 'TSS', shotSize: '7', pricePerShell: 6 },
      }),
    ];
    const { options } = recommend(results, species);
    expect(options.map((option) => option.load.id)).toEqual(['steel-a', 'b-expensive', 'tss']);
    for (let i = 1; i < options.length; i += 1) {
      expect(options[i]!.costPerShell).toBeGreaterThanOrEqual(options[i - 1]!.costPerShell);
    }
  });

  it('names the closest miss when nothing passes', () => {
    const results = [
      sampleResult({
        passes: false,
        energyAtRangeFtLb: 0.2,
        expectedHits: 10,
        costPerShell: 1,
        load: { id: 'far', label: 'Far' },
      }),
      sampleResult({
        passes: false,
        energyAtRangeFtLb: 1.9,
        expectedHits: 49,
        costPerShell: 3,
        load: { id: 'close', label: 'Close' },
      }),
    ];
    const recommendation = recommend(results, species);
    expect(recommendation.options).toHaveLength(0);
    expect(recommendation.closestMiss?.load.id).toBe('close');
  });

  it('keeps the widest margin per material when ranking by margin', () => {
    const results = [
      sampleResult({
        passes: true,
        costPerShell: 1,
        marginScore: 1.1,
        load: { id: 'cheap-thin', material: 'steel', label: 'Cheap', pricePerShell: 1 },
      }),
      sampleResult({
        passes: true,
        costPerShell: 2,
        marginScore: 1.8,
        load: { id: 'dear-wide', material: 'steel', label: 'Wide', pricePerShell: 2 },
      }),
      sampleResult({
        passes: true,
        costPerShell: 5,
        marginScore: 1.4,
        load: { id: 'tss', material: 'tss', label: 'TSS', pricePerShell: 5 },
      }),
    ];
    const { options } = recommend(results, species, 'margin');
    expect(options.map((option) => option.load.id)).toEqual(['dear-wide', 'tss']);
  });

  it('keeps the largest shot that has the energy when the pattern is thin', () => {
    const results = [
      sampleResult({
        passes: false,
        meetsEnergy: true,
        meetsPattern: false,
        energyAtRangeFtLb: 6,
        expectedHits: 30,
        aim: 'head',
        load: { id: 't-steel', material: 'steel', shotSize: 'T', label: 'T Steel', pricePerShell: 1.55 },
      }),
      sampleResult({
        passes: false,
        meetsEnergy: true,
        meetsPattern: false,
        energyAtRangeFtLb: 4,
        expectedHits: 40,
        aim: 'head',
        load: { id: 'bb-steel', material: 'steel', shotSize: 'BB', label: 'BB Steel', pricePerShell: 1.4 },
      }),
      sampleResult({
        passes: true,
        meetsEnergy: true,
        meetsPattern: true,
        energyAtRangeFtLb: 3,
        load: { id: 'two-steel', material: 'steel', shotSize: '2', label: 'Steel 2', pricePerShell: 1.25 },
      }),
      sampleResult({
        passes: false,
        meetsEnergy: true,
        meetsPattern: false,
        energyAtRangeFtLb: 8,
        expectedHits: 20,
        aim: 'head',
        costPerShell: 4.15,
        load: { id: 't-bi', material: 'bismuth', shotSize: 'T', label: 'T Bismuth', pricePerShell: 4.15 },
      }),
    ];
    const recommendation = recommend(results, species);
    expect(recommendation.options.map((option) => option.load.id)).toEqual(['two-steel']);
    expect(recommendation.energyOnly.map((option) => option.load.id)).toEqual(['t-bi', 't-steel']);
  });

  it('treats a load on the threshold as a pass', () => {
    expect(meetsSpeciesThreshold(2, 50, species).passes).toBe(true);
    expect(meetsSpeciesThreshold(1.99, 50, species).meetsEnergy).toBe(false);
    expect(meetsSpeciesThreshold(2, 49, species).meetsPattern).toBe(false);
  });
});

describe('shelf and price filters', () => {
  it('limits eligibility by material, max price, and shelf', () => {
    const base = defaultInputs();
    const steelOnly = eligibleLoads({ ...base, materials: ['steel'] });
    expect(steelOnly.length).toBeGreaterThan(0);
    expect(steelOnly.every((load) => load.material === 'steel')).toBe(true);
    expect(eligibleLoads({ ...base, materials: [] })).toHaveLength(0);

    const cap = 2;
    const capped = eligibleLoads({ ...base, maxPrice: cap });
    expect(capped.length).toBeGreaterThan(0);
    expect(capped.every((load) => load.pricePerShell <= cap)).toBe(true);

    const bismuth = FACTORY_LOADS.find((load) => load.gauge === 12 && load.material === 'bismuth');
    expect(bismuth).toBeDefined();
    const shelf = eligibleLoads({
      ...base,
      speciesId: 'pheasant',
      onlyShelf: true,
      shelf: [bismuth!.id],
    });
    expect(shelf.map((load) => load.id)).toEqual([bismuth!.id]);
  });
});

describe('catalog evaluation', () => {
  it('sorts real passing duck loads by cost and prices an override', () => {
    const duck = speciesById('duck');
    const inputs = defaultInputs();
    const results = evaluateMatching(inputs);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((result) => result.load.material === 'lead')).toBe(false);
    const { options } = recommend(results, duck);
    expect(options.length).toBeGreaterThan(1);
    for (let i = 1; i < options.length; i += 1) {
      expect(options[i]!.costPerShell).toBeGreaterThanOrEqual(options[i - 1]!.costPerShell);
    }
    const materials = new Set(options.map((option) => option.load.material));
    expect(materials.size).toBe(options.length);

    const cheapest = options[0]!;
    const overridden = evaluateMatching({
      ...inputs,
      priceOverrides: { [cheapest.load.id]: cheapest.costPerShell + 20 },
    });
    const bumped = overridden.find((result) => result.load.id === cheapest.load.id);
    expect(bumped?.costPerShell).toBeCloseTo(cheapest.costPerShell + 20, 5);
    const next = recommend(overridden, duck);
    expect(next.options[0]?.load.id).not.toBe(cheapest.load.id);
  });

  it('keeps every result finite, with hits inside the pellet count', () => {
    for (const species of ['duck', 'goose', 'pheasant', 'grouse', 'turkey']) {
      const results = evaluateMatching({
        ...defaultInputs(),
        speciesId: species,
        rangeYd: 40,
        choke: 'full',
      });
      for (const result of results) {
        expect(Number.isFinite(result.energyAtRangeFtLb)).toBe(true);
        expect(Number.isFinite(result.velocityAtRangeFps)).toBe(true);
        expect(result.expectedHits).toBeLessThanOrEqual(result.pelletCount);
        expect(result.expectedHits).toBeGreaterThanOrEqual(0);
        expect(result.velocityAtRangeFps).toBeLessThan(result.load.velocityFps);
        expect(['head', 'body', 'both']).toContain(result.aim);
      }
    }
  });

  it('shows T shot energy for duck and goose when the pattern is thin', () => {
    for (const speciesId of ['duck', 'goose'] as const) {
      const species = speciesById(speciesId);
      for (const gauge of [12, 20] as const) {
        const inputs = { ...defaultInputs(), speciesId, rangeYd: species.typicalRangeYd, gauge };
        const tee = evaluateMatching(inputs).find((result) => result.load.shotSize === 'T');
        expect(tee, `${speciesId} ${gauge}`).toBeDefined();
        expect(tee!.meetsEnergy).toBe(true);
        expect(tee!.meetsPattern).toBe(false);
        expect(tee!.aim).toBe('head');
        const { energyOnly } = recommend(evaluateMatching(inputs), species);
        expect(energyOnly.some((result) => result.load.shotSize === 'T')).toBe(true);
      }
    }

    const duck = speciesById('duck');
    const atDecoys = evaluateMatching({ ...defaultInputs(), speciesId: 'duck', rangeYd: duck.typicalRangeYd });
    const steelTwo = atDecoys.find((result) => result.load.id === '12-steel-3-1125-2');
    const tssSeven = atDecoys.find((result) => result.load.id === '12-tss-3-1125-7');
    expect(steelTwo?.passes).toBe(true);
    expect(steelTwo?.aim).toBe('both');
    expect(tssSeven?.passes).toBe(true);
    expect(tssSeven?.aim).toBe('body');
  });
});
