import { useEffect, useId, useState } from 'react';
import { CHOKE_OPTIONS } from '../config/chokes';
import { ChokeHelpPanel } from './ChokeHelp';
import { MATERIALS } from '../config/materials';
import { PHYSICS } from '../config/physics';
import { holdGuide } from '../config/aim';
import { isPlaceholderSource, SPECIES, speciesById } from '../config/species';
import { formatEnergy, formatGauge } from '../format';
import {
  GAUGES,
  type AppInputs,
  type Choke,
  type Gauge,
  type MaterialId,
  type RankBy,
} from '../types';

const fieldClass = 'mt-1 min-h-12 w-full border border-ink bg-paper px-3 text-base';

function HoldGuide({ speciesId, speciesName }: { speciesId: string; speciesName: string }) {
  const guide = holdGuide({ id: speciesId, name: speciesName });
  return (
    <div className="mt-3 border border-line bg-paper px-3 py-2 text-sm">
      <p className="font-semibold">{guide.intro}</p>
      {guide.rows.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {guide.rows.map((row) => (
            <li key={row.label}>
              <span className="font-kicker text-xs uppercase tracking-[0.12em] text-clay">{row.label}</span>
              <span className="mt-0.5 block text-ink/80">{row.detail}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function InputPanel({
  inputs,
  onChange,
}: {
  inputs: AppInputs;
  onChange: (patch: Partial<AppInputs>) => void;
}) {
  const [chokeHover, setChokeHover] = useState(false);
  const [chokePinned, setChokePinned] = useState(false);
  const chokeHelpId = useId();
  const chokeOpen = chokeHover || chokePinned;
  const species = speciesById(inputs.speciesId);
  const energyPlaceholder = import.meta.env.DEV && isPlaceholderSource(species.energySource);
  const enabled = new Set(inputs.materials ?? MATERIALS.map((material) => material.id));
  const typical =
    inputs.rangeYd === species.typicalRangeYd
      ? `Typical range for ${species.name.toLowerCase()}.`
      : `Typical for ${species.name.toLowerCase()} is ${species.typicalRangeYd} yd.`;

  useEffect(() => {
    if (!chokePinned) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setChokePinned(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chokePinned]);

  function toggleMaterial(id: MaterialId) {
    const current = inputs.materials ?? MATERIALS.map((material) => material.id);
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    onChange({ materials: next.length === MATERIALS.length ? null : next });
  }

  return (
    <form
      className="border border-ink bg-card p-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="dept">
        <h2>Setup</h2>
        {energyPlaceholder ? (
          <span className="rounded-sm bg-brass px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
            Energy placeholder
          </span>
        ) : null}
      </div>

      <label className="mt-4 block text-sm font-semibold" htmlFor="species">
        Species
      </label>
      <select
        id="species"
        className={fieldClass}
        value={inputs.speciesId}
        onChange={(event) => onChange({ speciesId: event.target.value })}
      >
        {SPECIES.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <p className="mt-1 text-sm text-ink/80">
        Needs {formatEnergy(species.minPelletEnergyFtLb)} and {species.minPatternHits} hits in a{' '}
        {species.patternCircleIn}-inch circle.
      </p>
      <HoldGuide speciesId={species.id} speciesName={species.name} />

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <label className="text-sm font-semibold" htmlFor="range">
          Range
        </label>
        <span className="font-display text-3xl tabular-nums leading-none">{inputs.rangeYd} yd</span>
      </div>
      <input
        id="range"
        className="shot-range"
        type="range"
        min={PHYSICS.rangeYdMin}
        max={PHYSICS.rangeYdMax}
        step={1}
        value={inputs.rangeYd}
        aria-valuemin={PHYSICS.rangeYdMin}
        aria-valuemax={PHYSICS.rangeYdMax}
        aria-valuenow={inputs.rangeYd}
        aria-valuetext={`${inputs.rangeYd} yards`}
        onChange={(event) => onChange({ rangeYd: Number(event.target.value) })}
      />
      <p className="text-sm text-ink/80">{typical}</p>

      <div
        className="mt-4 grid grid-cols-2 gap-3"
        onMouseLeave={() => setChokeHover(false)}
      >
        <div>
          <label className="flex min-h-11 items-center text-sm font-semibold" htmlFor="gauge">
            Gauge
          </label>
          <select
            id="gauge"
            className={fieldClass}
            value={inputs.gauge}
            onChange={(event) => onChange({ gauge: Number(event.target.value) as Gauge })}
          >
            {GAUGES.map((gauge) => (
              <option key={gauge} value={gauge}>
                {formatGauge(gauge)}
              </option>
            ))}
          </select>
        </div>
        <div onMouseEnter={() => setChokeHover(true)}>
          <div className="flex min-h-11 items-center justify-between gap-2">
            <label
              className="cursor-help border-b border-dotted border-brass text-sm font-semibold"
              htmlFor="choke"
            >
              Choke
            </label>
            <button
              type="button"
              className="min-h-11 text-xs font-semibold uppercase tracking-wide text-brass"
              aria-expanded={chokeOpen}
              aria-controls={chokeHelpId}
              onClick={() => setChokePinned((current) => !current)}
            >
              Explain
            </button>
          </div>
          <select
            id="choke"
            className={fieldClass}
            value={inputs.choke}
            aria-describedby={chokeOpen ? chokeHelpId : undefined}
            onChange={(event) => onChange({ choke: event.target.value as Choke })}
          >
            {CHOKE_OPTIONS.map((choke) => (
              <option key={choke.id} value={choke.id}>
                {choke.label}
              </option>
            ))}
          </select>
        </div>
        {chokeOpen ? (
          <div
            id={chokeHelpId}
            role="region"
            aria-label="Choke guide"
            className="col-span-2 rounded-md border border-line bg-paper p-3"
            onMouseEnter={() => setChokeHover(true)}
          >
            <ChokeHelpPanel current={inputs.choke} />
          </div>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-semibold" htmlFor="elevation">
              Elevation
            </label>
            <span className="text-sm tabular-nums">{inputs.elevationFt} ft</span>
          </div>
          <input
            id="elevation"
            className="shot-range"
            type="range"
            min={PHYSICS.elevationFtMin}
            max={PHYSICS.elevationFtMax}
            step={100}
            value={inputs.elevationFt}
            aria-valuetext={`${inputs.elevationFt} feet`}
            onChange={(event) => onChange({ elevationFt: Number(event.target.value) })}
          />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="text-sm font-semibold" htmlFor="temperature">
              Air
            </label>
            <span className="text-sm tabular-nums">{inputs.temperatureF}°F</span>
          </div>
          <input
            id="temperature"
            className="shot-range"
            type="range"
            min={PHYSICS.temperatureFMin}
            max={PHYSICS.temperatureFMax}
            step={1}
            value={inputs.temperatureF}
            aria-valuetext={`${inputs.temperatureF} degrees Fahrenheit`}
            onChange={(event) => onChange({ temperatureF: Number(event.target.value) })}
          />
        </div>
      </div>

      <label className="mt-2 flex min-h-12 items-center gap-3 text-base" htmlFor="older-gun">
        <input
          id="older-gun"
          className="h-6 w-6 accent-marsh"
          type="checkbox"
          checked={inputs.olderGun}
          onChange={(event) => onChange({ olderGun: event.target.checked })}
        />
        <span>Older gun — hide steel, Hevi-Shot, and TSS</span>
      </label>
      {import.meta.env.DEV ? (
        <p className="text-sm text-brass">
          TODO: confirm Hevi-Shot and TSS vintage-gun flags with manufacturer guidance.
        </p>
      ) : null}

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold">Materials</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {MATERIALS.map((material) => {
            const on = enabled.has(material.id);
            return (
              <button
                key={material.id}
                type="button"
                className={`min-h-11 rounded-md border px-3 text-sm font-semibold ${
                  on ? 'border-marsh bg-marsh text-paper' : 'border-line bg-paper text-ink/70'
                }`}
                aria-pressed={on}
                onClick={() => toggleMaterial(material.id)}
              >
                {material.name}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold" htmlFor="max-price">
            Max price
          </label>
          <input
            id="max-price"
            className={fieldClass}
            type="number"
            inputMode="decimal"
            min={0}
            step={0.25}
            placeholder="No cap"
            value={inputs.maxPrice ?? ''}
            onChange={(event) => {
              const raw = event.target.value;
              if (raw.trim() === '') {
                onChange({ maxPrice: null });
                return;
              }
              const parsed = Number(raw);
              if (Number.isFinite(parsed) && parsed >= 0) onChange({ maxPrice: parsed });
            }}
          />
        </div>
        <div>
          <span className="block text-sm font-semibold">Rank passing loads</span>
          <div className="mt-1 grid grid-cols-2 gap-2">
            {([
              ['price', 'Price'],
              ['margin', 'Margin'],
            ] as const).map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={`min-h-12 rounded-md border px-2 text-sm font-semibold ${
                  inputs.rankBy === id
                    ? 'border-marsh bg-marsh text-paper'
                    : 'border-line bg-paper text-ink'
                }`}
                aria-pressed={inputs.rankBy === (id as RankBy)}
                onClick={() => onChange({ rankBy: id })}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <label className="mt-4 flex min-h-12 items-center gap-3 text-base" htmlFor="only-shelf">
        <input
          id="only-shelf"
          className="h-6 w-6 accent-marsh"
          type="checkbox"
          checked={inputs.onlyShelf}
          onChange={(event) => onChange({ onlyShelf: event.target.checked })}
        />
        <span>Only loads on my shelf ({inputs.shelf.length})</span>
      </label>
    </form>
  );
}
