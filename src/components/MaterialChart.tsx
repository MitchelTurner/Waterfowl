import { MATERIALS, materialById } from '../config/materials';
import type { MaterialId } from '../types';

const SWATCH: Record<MaterialId, string> = {
  steel: '#5e6b73',
  bismuth: '#b87333',
  tungstenPolymer: '#5f7044',
  hevi: '#1f6f78',
  tss: '#3a3128',
  lead: '#8a8175',
};

export function MaterialChart() {
  const max = Math.max(...MATERIALS.map((material) => material.density));
  const leadRatio = materialById('lead').density / max;

  return (
    <figure className="rounded-md border border-line bg-card p-4 shadow-card">
      <figcaption className="font-display text-2xl leading-none">Density</figcaption>
      <p className="mt-2 text-sm text-ink/80">
        Grams per cubic centimeter. The dashed line marks lead density. Lead is a reference only and
        is not legal for waterfowl.
      </p>
      <div className="mt-4 grid grid-cols-[9rem_minmax(0,1fr)] items-center gap-x-3 gap-y-3">
        {MATERIALS.map((material) => (
          <div key={material.id} className="contents">
            <div className="min-w-0 break-words text-sm font-semibold leading-tight">
              {material.name}
              {material.id === 'lead' ? (
                <span className="mt-0.5 block text-xs font-semibold text-brass">
                  Not legal for waterfowl
                </span>
              ) : null}
            </div>
            <div className="relative h-8 min-w-0">
              <div className="absolute inset-y-2.5 left-0 right-12 overflow-hidden rounded-sm bg-mist">
                <div
                  className="h-full"
                  style={{
                    width: `${(material.density / max) * 100}%`,
                    background:
                      material.id === 'lead'
                        ? 'repeating-linear-gradient(135deg, #8a8175 0 4px, #cfc6b8 4px 8px)'
                        : SWATCH[material.id],
                  }}
                />
              </div>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 z-10 border-l-2 border-dashed border-clay"
                style={{ left: `calc((100% - 3rem) * ${leadRatio})` }}
              />
              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm tabular-nums">
                {material.density.toFixed(2)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </figure>
  );
}
