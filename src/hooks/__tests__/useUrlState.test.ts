import { describe, expect, it } from 'vitest'
import { parseUrlState, serializeUrlState } from '../useUrlState'

describe('URL state', () => {
  it('round-trips serialize -> parse for identical values', () => {
    const state = {
      speciesId: 'goose',
      rangeYd: 44,
      gauge: 20 as const,
      choke: 'im' as const,
      olderGun: true,
      priceOverrides: { '20ga-steel-3-1': 1.9 },
      sortBy: 'energy' as const,
      sortDir: 'desc' as const,
    }

    const encoded = serializeUrlState(state)
    expect(parseUrlState(encoded)).toEqual(state)
  })
})
