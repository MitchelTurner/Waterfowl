import { speciesList } from '../config/species'
import type { Choke, FactoryLoad } from '../types'

interface InputPanelProps {
  speciesId: string
  rangeYd: number
  gauge: FactoryLoad['gauge']
  choke: Choke
  olderGun: boolean
  onChange: (updates: Partial<InputPanelProps>) => void
}

const gauges: FactoryLoad['gauge'][] = [12, 16, 20, 28, 410]
const chokes: Choke[] = ['cyl', 'ic', 'mod', 'im', 'full']

export function InputPanel(props: InputPanelProps) {
  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Inputs</h2>
      <label className="block text-sm font-medium text-slate-700">
        Species
        <select
          className="mt-1 w-full rounded border border-slate-300 p-2"
          value={props.speciesId}
          onChange={(event) => {
            const nextSpecies = speciesList.find((species) => species.id === event.target.value)
            props.onChange({
              speciesId: event.target.value,
              rangeYd: nextSpecies ? nextSpecies.typicalRangeYd : props.rangeYd,
            })
          }}
        >
          {speciesList.map((species) => (
            <option key={species.id} value={species.id}>
              {species.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Range: {props.rangeYd} yd
        <input
          className="mt-2 w-full"
          type="range"
          min={15}
          max={60}
          value={props.rangeYd}
          onChange={(event) => props.onChange({ rangeYd: Number(event.target.value) })}
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm font-medium text-slate-700">
          Gauge
          <select
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={props.gauge}
            onChange={(event) => props.onChange({ gauge: Number(event.target.value) as FactoryLoad['gauge'] })}
          >
            {gauges.map((gauge) => (
              <option key={gauge} value={gauge}>
                {gauge === 410 ? '.410' : `${gauge}ga`}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-slate-700">
          Choke
          <select
            className="mt-1 w-full rounded border border-slate-300 p-2"
            value={props.choke}
            onChange={(event) => props.onChange({ choke: event.target.value as Choke })}
          >
            {chokes.map((option) => (
              <option key={option} value={option}>
                {option.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={props.olderGun}
          onChange={(event) => props.onChange({ olderGun: event.target.checked })}
        />
        Older gun — can't shoot steel
      </label>
    </section>
  )
}
