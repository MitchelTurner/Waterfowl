import { unsourcedSpecies } from '../config/species';

export function DevThresholdBanner() {
  const unsourced = unsourcedSpecies();
  if (!import.meta.env.DEV || unsourced.length === 0) return null;

  const names = unsourced.map((species) => species.name).join(', ');
  return (
    <div
      role="status"
      data-testid="threshold-todo"
      className="border-b border-brass/40 bg-[#f3e2c4] px-4 py-3 text-sm text-ink"
    >
      <p className="mx-auto max-w-3xl">
        <strong className="font-semibold">TODO:</strong> {names} energy and pattern thresholds are{' '}
        <strong className="font-semibold">PLACEHOLDER</strong> values. Replace each species source
        before treating pass/fail as published guidance.
      </p>
    </div>
  );
}
