import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { GAUGES } from '../../types';
import { FACTORY_LOADS } from '../../config/loads';
import { MATERIALS } from '../../config/materials';
import { SPECIES, isPlaceholderSource, unsourcedSpecies } from '../../config/species';
import { SHOT_DIAMETER_IN } from '../../config/shotSizes';
import { CHOKE_PATTERN_PCT } from '../../config/chokes';

const SRC_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

function sourceFiles(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === '__tests__' || entry.endsWith('.test.ts') || entry.endsWith('.test.tsx')) {
      continue;
    }
    if (statSync(full).isDirectory()) {
      found.push(...sourceFiles(full));
    } else if (/\.(ts|tsx|css)$/.test(entry)) {
      found.push(full);
    }
  }
  return found;
}

describe('catalog', () => {
  it('cites pattern counts and keeps energy marked as placeholder', () => {
    expect(SPECIES.map((species) => species.id).sort()).toEqual([
      'duck',
      'goose',
      'grouse',
      'pheasant',
      'turkey',
    ]);
    for (const species of SPECIES) {
      expect(species.source.trim().length).toBeGreaterThan(0);
      expect(isPlaceholderSource(species.energySource)).toBe(true);
    }
    for (const id of ['duck', 'goose', 'pheasant', 'turkey']) {
      const species = SPECIES.find((item) => item.id === id);
      expect(species?.source).toContain('Roster');
      expect(isPlaceholderSource(species?.source ?? '')).toBe(false);
    }
    expect(isPlaceholderSource(SPECIES.find((item) => item.id === 'grouse')?.source ?? '')).toBe(
      true,
    );
    expect(isPlaceholderSource('Smith 2019, table 2')).toBe(false);
    expect(unsourcedSpecies().length).toBe(SPECIES.length);
  });

  it('stores unique factory loads with positive prices', () => {
    const ids = new Set<string>();
    const materialIds = new Set(MATERIALS.map((material) => material.id));
    for (const load of FACTORY_LOADS) {
      expect(ids.has(load.id)).toBe(false);
      ids.add(load.id);
      expect(materialIds.has(load.material)).toBe(true);
      expect(SHOT_DIAMETER_IN[load.shotSize]).toBeGreaterThan(0);
      expect(GAUGES).toContain(load.gauge);
      expect(load.payloadOz).toBeGreaterThan(0);
      expect(load.pricePerShell).toBeGreaterThan(0);
      expect(load.velocityFps).toBeGreaterThan(0);
      expect(load.id.includes(':') || load.id.includes(',')).toBe(false);
    }
    expect(CHOKE_PATTERN_PCT.full).toBe(70);
  });

  it('does not ship handload output in the app source', () => {
    const banned = /\b(powder|primer|primers|wad|wads|recipe|recipes)\b/i;
    for (const file of sourceFiles(SRC_ROOT)) {
      const text = readFileSync(file, 'utf8');
      expect(text, file).not.toMatch(banned);
    }
  });
});
