import { PHYSICS } from '../config/physics';
import { FACTORY_LOADS } from '../config/loads';
import { SPECIES, speciesById } from '../config/species';
import { CHOKE_OPTIONS } from '../config/chokes';
import { GAUGES, type AppInputs, type Choke, type Gauge } from '../types';

const CHOKE_IDS = new Set<string>(CHOKE_OPTIONS.map((option) => option.id));
const GAUGE_IDS = new Set<number>(GAUGES);
const SPECIES_IDS = new Set(SPECIES.map((species) => species.id));
const LOAD_IDS = new Set(FACTORY_LOADS.map((load) => load.id));

export function defaultInputs(): AppInputs {
  const duck = speciesById('duck');
  return {
    speciesId: duck.id,
    rangeYd: duck.typicalRangeYd,
    gauge: 12,
    choke: 'mod',
    olderGun: false,
    priceOverrides: {},
  };
}

export function clampRangeYd(rangeYd: number): number {
  const rounded = Math.round(rangeYd);
  return Math.min(PHYSICS.rangeYdMax, Math.max(PHYSICS.rangeYdMin, rounded));
}

function roundCents(price: number): number {
  return Math.round(price * 100) / 100;
}

export function applyInputPatch(prev: AppInputs, patch: Partial<AppInputs>): AppInputs {
  const next: AppInputs = {
    ...prev,
    ...patch,
    priceOverrides: patch.priceOverrides ?? prev.priceOverrides,
  };
  if (patch.speciesId && patch.speciesId !== prev.speciesId && patch.rangeYd === undefined) {
    next.rangeYd = speciesById(patch.speciesId).typicalRangeYd;
  }
  next.rangeYd = clampRangeYd(next.rangeYd);
  return next;
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
  const rangeYd = Number.isFinite(rangeNumber) ? clampRangeYd(rangeNumber) : species.typicalRangeYd;

  const gaugeParam = Number(params.get('gauge'));
  const gauge: Gauge = GAUGE_IDS.has(gaugeParam) ? (gaugeParam as Gauge) : defaults.gauge;

  const chokeParam = params.get('choke');
  const choke: Choke =
    chokeParam && CHOKE_IDS.has(chokeParam) ? (chokeParam as Choke) : defaults.choke;

  const olderParam = params.get('olderGun');
  const olderGun = olderParam === '1' || olderParam === 'true';

  return {
    speciesId,
    rangeYd,
    gauge,
    choke,
    olderGun,
    priceOverrides: parsePrices(params.get('prices')),
  };
}

export function serializeInputs(inputs: AppInputs): string {
  const params = new URLSearchParams();
  params.set('species', inputs.speciesId);
  params.set('range', String(inputs.rangeYd));
  params.set('gauge', String(inputs.gauge));
  params.set('choke', inputs.choke);
  if (inputs.olderGun) params.set('olderGun', '1');
  const prices = Object.entries(inputs.priceOverrides)
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
