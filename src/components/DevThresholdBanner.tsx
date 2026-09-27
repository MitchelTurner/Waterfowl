import { unsourcedSpecies } from '../config/species';

export function DevThresholdBanner() {
  const unsourced = unsourcedSpecies();
  if (!import.meta.env.DEV || unsourced.length === 0) return null;

  const names = unsourced.map((species) => species.name).join(', ');
  return (
    <div
      role="status"
      data-testid="threshold-todo"
      className="border-y border-clay bg-card px-4 py-3 text-sm text-ink"
    >
      <p className="mx-auto max-w-3xl">
        <strong className="font-semibold">TODO:</strong> {names} pellet-energy thresholds are still{' '}
        <strong className="font-semibold">PLACEHOLDER</strong> values. Duck, goose, and pheasant
        pattern counts follow Roster’s 2016 table. Turkey counts a 10-inch circle. Grouse is not in
        that table.
      </p>
    </div>
  );
}
