import { PHYSICS } from '../config/physics';
import { FACTORY_LOADS } from '../config/loads';
import { SPECIES, speciesById } from '../config/species';
import { CHOKE_OPTIONS } from '../config/chokes';
import { MATERIALS } from '../config/materials';
import {
  GAUGES,
  type AppInputs,
  type Choke,
  type Gauge,
  type MaterialId,
  type RankBy,
} from '../types';

const CHOKE_IDS = new Set<string>(CHOKE_OPTIONS.map((option) => option.id));
const GAUGE_IDS = new Set<number>(GAUGES);
const SPECIES_IDS = new Set(SPECIES.map((species) => species.id));
const LOAD_IDS = new Set(FACTORY_LOADS.map((load) => load.id));
const MATERIAL_IDS = new Set<string>(MATERIALS.map((material) => material.id));
const ALL_MATERIALS = MATERIALS.map((material) => material.id);

export function defaultInputs(): AppInputs {
  const duck = speciesById('duck');
  return {
    speciesId: duck.id,
    rangeYd: duck.typicalRangeYd,
    gauge: 12,
    choke: 'mod',
    olderGun: false,
    priceOverrides: {},
    elevationFt: 0,
    temperatureF: 59,
    materials: null,
    maxPrice: null,
    shelf: [],
    onlyShelf: false,
    rankBy: 'price',
  };
}

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function clampRangeYd(rangeYd: number): number {
  return clampNumber(Math.round(rangeYd), PHYSICS.rangeYdMin, PHYSICS.rangeYdMax);
}

function roundCents(price: number): number {
  return Math.round(price * 100) / 100;
}

function canonicalizeMaterials(materials: readonly MaterialId[] | null): MaterialId[] | null {
  if (materials === null) return null;
  const unique = ALL_MATERIALS.filter((id) => materials.includes(id));
  if (unique.length === ALL_MATERIALS.length) return null;
  return unique;
}

export function normalizeInputs(inputs: AppInputs): AppInputs {
  const maxPrice =
    inputs.maxPrice === null || !Number.isFinite(inputs.maxPrice)
      ? null
      : Math.max(0, roundCents(inputs.maxPrice));
  return {
    ...inputs,
    rangeYd: clampRangeYd(inputs.rangeYd),
    elevationFt: clampNumber(
      Math.round(inputs.elevationFt),
      PHYSICS.elevationFtMin,
      PHYSICS.elevationFtMax,
    ),
    temperatureF: clampNumber(
      Math.round(inputs.temperatureF),
      PHYSICS.temperatureFMin,
      PHYSICS.temperatureFMax,
    ),
    materials: canonicalizeMaterials(inputs.materials),
    maxPrice,
    shelf: [...new Set(inputs.shelf.filter((id) => LOAD_IDS.has(id)))].sort(),
    rankBy: inputs.rankBy === 'margin' ? 'margin' : 'price',
    onlyShelf: inputs.onlyShelf,
  };
}

export function applyInputPatch(prev: AppInputs, patch: Partial<AppInputs>): AppInputs {
  const next: AppInputs = {
    ...prev,
    ...patch,
    priceOverrides: patch.priceOverrides ?? prev.priceOverrides,
    shelf: patch.shelf ? [...patch.shelf] : prev.shelf,
    materials: patch.materials === undefined ? prev.materials : patch.materials,
  };
  if (patch.speciesId && patch.speciesId !== prev.speciesId && patch.rangeYd === undefined) {
    next.rangeYd = speciesById(patch.speciesId).typicalRangeYd;
  }
  return normalizeInputs(next);
}

function parsePrices(value: string | null): Record<string, number> {
  if (!value) return {};
  const overrides: Record<string, number> = {};
  for (const part of value.split(',')) {
    if (!part) continue;
    const splitAt = part.indexOf(':');
    if (splitAt <= 0) continue;
    const id = part.slice(0, splitAt);
    const raw = part.slice(splitAt + 1);
    const price = Number(raw);
    if (!LOAD_IDS.has(id) || !Number.isFinite(price) || price < 0) continue;
    overrides[id] = roundCents(price);
  }
  return overrides;
}

function parseMaterials(value: string | null): MaterialId[] | null {
  if (value === null) return null;
  if (value === 'none') return [];
  const ids = value
    .split(',')
    .filter((id): id is MaterialId => MATERIAL_IDS.has(id));
  return canonicalizeMaterials(ids);
}

function parseShelf(value: string | null): string[] {
  if (!value) return [];
  return value.split(',').filter((id) => LOAD_IDS.has(id));
}

export function parseInputs(search: string): AppInputs {
  const defaults = defaultInputs();
  const raw = search.startsWith('?') ? search.slice(1) : search;
  const params = new URLSearchParams(raw);

  const speciesParam = params.get('species');
  const speciesId =
    speciesParam && SPECIES_IDS.has(speciesParam) ? speciesParam : defaults.speciesId;
  const species = speciesById(speciesId);

  const rangeParam = params.get('range');
  const rangeNumber = rangeParam === null ? Number.NaN : Number(rangeParam);
  const rangeYd = Number.isFinite(rangeNumber) ? rangeNumber : species.typicalRangeYd;

  const gaugeParam = Number(params.get('gauge'));
  const gauge: Gauge = GAUGE_IDS.has(gaugeParam) ? (gaugeParam as Gauge) : defaults.gauge;

  const chokeParam = params.get('choke');
  const choke: Choke =
    chokeParam && CHOKE_IDS.has(chokeParam) ? (chokeParam as Choke) : defaults.choke;

  const olderParam = params.get('olderGun');
  const olderGun = olderParam === '1' || olderParam === 'true';

  const elevationParam = params.get('elev');
  const elevationNumber = elevationParam === null ? Number.NaN : Number(elevationParam);
  const temperatureParam = params.get('temp');
  const temperatureNumber = temperatureParam === null ? Number.NaN : Number(temperatureParam);
  const maxPriceParam = params.get('maxPrice');
  const maxPriceNumber = maxPriceParam === null ? Number.NaN : Number(maxPriceParam);
  const rankParam = params.get('rank');
  const rankBy: RankBy = rankParam === 'margin' ? 'margin' : 'price';

  return normalizeInputs({
    speciesId,
    rangeYd,
    gauge,
    choke,
    olderGun,
    priceOverrides: parsePrices(params.get('prices')),
    elevationFt: Number.isFinite(elevationNumber) ? elevationNumber : defaults.elevationFt,
    temperatureF: Number.isFinite(temperatureNumber) ? temperatureNumber : defaults.temperatureF,
    materials: parseMaterials(params.get('materials')),
    maxPrice: Number.isFinite(maxPriceNumber) ? maxPriceNumber : null,
    shelf: parseShelf(params.get('shelf')),
    onlyShelf: params.get('onlyShelf') === '1',
    rankBy,
  });
}

export function serializeInputs(inputs: AppInputs): string {
  const normalized = normalizeInputs(inputs);
  const params = new URLSearchParams();
  params.set('species', normalized.speciesId);
  params.set('range', String(normalized.rangeYd));
  params.set('gauge', String(normalized.gauge));
  params.set('choke', normalized.choke);
  if (normalized.olderGun) params.set('olderGun', '1');
  if (normalized.elevationFt !== 0) params.set('elev', String(normalized.elevationFt));
  if (normalized.temperatureF !== 59) params.set('temp', String(normalized.temperatureF));
  if (normalized.materials !== null) {
    params.set('materials', normalized.materials.length === 0 ? 'none' : normalized.materials.join(','));
  }
  if (normalized.maxPrice !== null) params.set('maxPrice', normalized.maxPrice.toFixed(2));
  if (normalized.shelf.length > 0) params.set('shelf', normalized.shelf.join(','));
  if (normalized.onlyShelf) params.set('onlyShelf', '1');
  if (normalized.rankBy === 'margin') params.set('rank', 'margin');
  const prices = Object.entries(normalized.priceOverrides)
    .filter(([, price]) => Number.isFinite(price) && price >= 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, price]) => `${id}:${price.toFixed(2)}`)
    .join(',');
  if (prices) params.set('prices', prices);
  return params.toString();
}

export function roundCentsPrice(price: number): number {
  return roundCents(price);
}
