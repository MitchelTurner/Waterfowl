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

  it('falls back safely for malformed query values', () => {
    const parsed = parseUrlState(
      '?species=unknown&range=nope&gauge=10&choke=extra-full&prices={"invalid":-2,"12ga-steel-2-125":2.3,"12ga-bis-3-125":"x"}&sortBy=what',
    )

    expect(parsed.speciesId).toBe('duck')
    expect(parsed.rangeYd).toBe(35)
    expect(parsed.gauge).toBe(12)
    expect(parsed.choke).toBe('mod')
    expect(parsed.priceOverrides).toEqual({ '12ga-steel-2-125': 2.3 })
    expect(parsed.sortBy).toBe('cost')
  })
})
