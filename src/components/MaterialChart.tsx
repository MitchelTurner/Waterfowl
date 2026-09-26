import { materialList, materials } from '../config/materials'

export function MaterialChart() {
  const maxDensity = Math.max(...materialList.map((material) => material.density))
  const leadDensity = materials.lead.density

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-2 text-lg font-semibold text-slate-900">Material density (g/cc)</h2>
      <ul className="space-y-2" aria-label="Material density comparison">
        {materialList.map((material) => (
          <li key={material.id} className="text-sm">
            <div className="mb-1 flex justify-between text-slate-700">
              <span>{material.name}</span>
              <span>{material.density.toFixed(2)}</span>
            </div>
            <div
              className="h-3 rounded bg-slate-100"
              role="progressbar"
              aria-label={`${material.name} density`}
              aria-valuemin={0}
              aria-valuemax={maxDensity}
              aria-valuenow={material.density}
            >
              <div
                className="h-3 rounded bg-sky-500"
                style={{ width: `${(material.density / maxDensity) * 100}%` }}
              ></div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-600">Lead reference line: {leadDensity.toFixed(2)} g/cc</p>
    </section>
  )
}
