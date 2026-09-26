import { useEffect, useMemo, useState } from 'react'
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
    params.set('prices', encodeURIComponent(JSON.stringify(state.priceOverrides)))
  }
  return params.toString()
}

export function parseUrlState(search: string): UrlState {
  const params = new URLSearchParams(search)
  const parsedGauge = Number(params.get('gauge')) as FactoryLoad['gauge']

  let parsedPrices: Record<string, number> = {}
  const rawPrices = params.get('prices')
  if (rawPrices) {
    try {
      parsedPrices = JSON.parse(decodeURIComponent(rawPrices)) as Record<string, number>
    } catch {
      parsedPrices = {}
    }
  }

  return {
    speciesId: params.get('species') ?? defaultState.speciesId,
    rangeYd: Number(params.get('range') ?? defaultState.rangeYd),
    gauge: [12, 16, 20, 28, 410].includes(parsedGauge) ? parsedGauge : defaultState.gauge,
    choke: (params.get('choke') as Choke) ?? defaultState.choke,
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
