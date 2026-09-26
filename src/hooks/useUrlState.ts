import { useEffect, useMemo, useState } from 'react'
import { factoryLoads } from '../config/loads'
import { speciesList } from '../config/species'
import type { Choke, FactoryLoad } from '../types'

export interface UrlState {
  speciesId: string
  rangeYd: number
  gauge: FactoryLoad['gauge']
  choke: Choke
  olderGun: boolean
  priceOverrides: Record<string, number>
  sortBy: 'cost' | 'energy'
  sortDir: 'asc' | 'desc'
}

const validGauges: FactoryLoad['gauge'][] = [12, 16, 20, 28, 410]
const validChokes: Choke[] = ['cyl', 'ic', 'mod', 'im', 'full']
const validSpeciesIds = new Set(speciesList.map((species) => species.id))
const validLoadIds = new Set(factoryLoads.map((load) => load.id))

const defaultState: UrlState = {
  speciesId: speciesList[0].id,
  rangeYd: speciesList[0].typicalRangeYd,
  gauge: 12,
  choke: 'mod',
  olderGun: false,
  priceOverrides: {},
  sortBy: 'cost',
  sortDir: 'asc',
}

function sanitizePriceOverrides(parsedPrices: unknown): Record<string, number> {
  if (!parsedPrices || typeof parsedPrices !== 'object') {
    return {}
  }

  const output: Record<string, number> = {}
  for (const [key, value] of Object.entries(parsedPrices)) {
    if (validLoadIds.has(key) && typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      output[key] = value
    }
  }

  return output
}

export function serializeUrlState(state: UrlState): string {
  const params = new URLSearchParams()
  params.set('species', state.speciesId)
  params.set('range', String(state.rangeYd))
  params.set('gauge', String(state.gauge))
  params.set('choke', state.choke)
  params.set('olderGun', state.olderGun ? '1' : '0')
  params.set('sortBy', state.sortBy)
  params.set('sortDir', state.sortDir)
  if (Object.keys(state.priceOverrides).length > 0) {
    params.set('prices', JSON.stringify(state.priceOverrides))
  }
  return params.toString()
}

export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)
  const parsedGauge = Number(params.get('gauge')) as FactoryLoad['gauge']
  const parsedChoke = params.get('choke') as Choke | null
  const parsedSpeciesId = params.get('species')
  const parsedRange = Number(params.get('range'))

  let parsedPrices: Record<string, number> = {}
  const rawPrices = params.get('prices')
  if (rawPrices) {
    try {
      parsedPrices = sanitizePriceOverrides(JSON.parse(rawPrices))
    } catch {
      parsedPrices = {}
    }
  }

  return {
    speciesId: parsedSpeciesId && validSpeciesIds.has(parsedSpeciesId) ? parsedSpeciesId : defaultState.speciesId,
    rangeYd: Number.isFinite(parsedRange) ? parsedRange : defaultState.rangeYd,
    gauge: validGauges.includes(parsedGauge) ? parsedGauge : defaultState.gauge,
    choke: parsedChoke && validChokes.includes(parsedChoke) ? parsedChoke : defaultState.choke,
    olderGun: params.get('olderGun') === '1',
    priceOverrides: parsedPrices,
    sortBy: params.get('sortBy') === 'energy' ? 'energy' : 'cost',
    sortDir: params.get('sortDir') === 'desc' ? 'desc' : 'asc',
  }
}

export function useUrlState() {
  const initial = useMemo(() => parseUrlState(window.location.search), [])
  const [state, setState] = useState<UrlState>(initial)

  useEffect(() => {
    const query = serializeUrlState(state)
    const nextUrl = `${window.location.pathname}?${query}`
    window.history.replaceState({}, '', nextUrl)
  }, [state])

  return [state, setState] as const
}
