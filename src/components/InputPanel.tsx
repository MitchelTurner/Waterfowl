import { CHOKE_OPTIONS } from '../config/chokes';
import { PHYSICS } from '../config/physics';
import { isPlaceholderSource, SPECIES, speciesById } from '../config/species';
import { formatEnergy, formatGauge } from '../format';
import { GAUGES, type AppInputs, type Choke, type Gauge } from '../types';

export function InputPanel({
  inputs,
  onChange,
}: {
  inputs: AppInputs;
  onChange: (patch: Partial<AppInputs>) => void;
}) {
  const species = speciesById(inputs.speciesId);
  const placeholder = import.meta.env.DEV && isPlaceholderSource(species.source);
  const typical =
    inputs.rangeYd === species.typicalRangeYd
      ? `Typical range for ${species.name.toLowerCase()}.`
      : `Typical for ${species.name.toLowerCase()} is ${species.typicalRangeYd} yd.`;

  return (
    <form
      className="rounded-md border border-line bg-card p-4 shadow-card"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="flex items-end justify-between gap-3">
        <h2 className="font-display text-2xl leading-none">Setup</h2>
        {placeholder ? (
          <span className="rounded-sm bg-brass px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-white">
            Placeholder
          </span>
        ) : null}
      </div>

      <label className="mt-4 block text-sm font-semibold" htmlFor="species">
        Species
      </label>
      <select
        id="species"
        className="mt-1 min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base"
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
        Needs {formatEnergy(species.minPelletEnergyFtLb)} and {species.minPatternHits} hits in a
        30-inch circle.
      </p>

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

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-semibold" htmlFor="gauge">
            Gauge
          </label>
          <select
            id="gauge"
            className="mt-1 min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base"
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
        <div>
          <label className="block text-sm font-semibold" htmlFor="choke">
            Choke
          </label>
          <select
            id="choke"
            className="mt-1 min-h-12 w-full rounded-md border border-line bg-paper px-3 text-base"
            value={inputs.choke}
            onChange={(event) => onChange({ choke: event.target.value as Choke })}
          >
            {CHOKE_OPTIONS.map((choke) => (
              <option key={choke.id} value={choke.id}>
                {choke.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="mt-4 flex min-h-12 items-center gap-3 text-base" htmlFor="older-gun">
        <input
          id="older-gun"
          className="h-6 w-6 accent-marsh"
          type="checkbox"
          checked={inputs.olderGun}
          onChange={(event) => onChange({ olderGun: event.target.checked })}
        />
        <span>Older gun — can&apos;t shoot steel</span>
      </label>
      <p className="mt-1 text-sm text-ink/80">Hides steel, Hevi-Shot, and TSS.</p>
      {import.meta.env.DEV ? (
        <p className="mt-1 text-sm text-brass">
          TODO: confirm Hevi-Shot and TSS vintage-gun flags with manufacturer guidance.
        </p>
      ) : null}
    </form>
  );
}
