import { useEffect, useRef, useState } from 'react';
import { GAUGES, type AppInputs } from '../types';
import { FACTORY_LOADS } from '../config/loads';
import { formatGauge, formatUsd } from '../format';

export function PriceDrawer({
  open,
  inputs,
  onClose,
  onPrice,
  onClear,
}: {
  open: boolean;
  inputs: AppInputs;
  onClose: () => void;
  onPrice: (loadId: string, price: number | null) => void;
  onClear: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    setDrafts({});
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const overrideCount = Object.keys(inputs.priceOverrides).length;

  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-ink/50" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="price-title"
        className="flex max-h-[85dvh] w-full max-w-3xl flex-col rounded-t-md bg-paper shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3">
          <div>
            <h2 id="price-title" className="font-display text-2xl leading-none">
              Edit prices
            </h2>
            <p className="mt-1 text-sm text-ink/80">
              Seed prices you can override. Nothing here is a live feed. Overrides stay in the link.
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="min-h-12 shrink-0 rounded-md border border-line px-3 text-sm font-semibold"
            onClick={onClose}
          >
            Close
          </button>
        </div>
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2">
          <p className="text-sm">{overrideCount === 0 ? 'Using seed prices.' : `${overrideCount} edited.`}</p>
          <button
            type="button"
            className="min-h-12 rounded-md px-3 text-sm font-semibold text-brass disabled:text-ink/40"
            onClick={onClear}
            disabled={overrideCount === 0}
          >
            Reset all
          </button>
        </div>
        <div className="overflow-y-auto px-4 py-3">
          {GAUGES.map((gauge) => {
            const loads = FACTORY_LOADS.filter((load) => load.gauge === gauge);
            if (loads.length === 0) return null;
            return (
              <section key={gauge} className="mb-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide">{formatGauge(gauge)}</h3>
                <ul className="mt-2 space-y-3">
                  {loads.map((load) => {
                    const edited = inputs.priceOverrides[load.id] !== undefined;
                    const value =
                      drafts[load.id] !== undefined
                        ? drafts[load.id]
                        : (inputs.priceOverrides[load.id] ?? load.pricePerShell).toFixed(2);
                    return (
                      <li key={load.id} className="grid grid-cols-[minmax(0,1fr)_6.5rem] items-center gap-3">
                        <label htmlFor={`price-${load.id}`} className="text-sm leading-snug">
                          {load.label}
                          {edited ? (
                            <span className="mt-0.5 block text-xs font-semibold text-brass">
                              Edited · seed {formatUsd(load.pricePerShell)}
                            </span>
                          ) : null}
                        </label>
                        <input
                          id={`price-${load.id}`}
                          className="min-h-12 w-full rounded-md border border-line bg-card px-2 text-base tabular-nums"
                          inputMode="decimal"
                          min={0}
                          step={0.01}
                          type="number"
                          autoComplete="off"
                          value={value}
                          onChange={(event) => {
                            const raw = event.target.value;
                            setDrafts((current) => ({ ...current, [load.id]: raw }));
                            const parsed = Number(raw);
                            if (raw.trim() === '' || !Number.isFinite(parsed) || parsed < 0) return;
                            const cents = Math.round(parsed * 100) / 100;
                            const seed = Math.round(load.pricePerShell * 100) / 100;
                            onPrice(load.id, cents === seed ? null : cents);
                          }}
                          onBlur={() => {
                            setDrafts((current) => {
                              if (current[load.id] === undefined) return current;
                              const next = { ...current };
                              delete next[load.id];
                              return next;
                            });
                          }}
                        />
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
        <div className="border-t border-line p-3">
          <button
            type="button"
            className="min-h-12 w-full rounded-md bg-marsh text-base font-semibold text-paper"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
