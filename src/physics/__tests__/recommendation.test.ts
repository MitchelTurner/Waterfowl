import { describe, expect, it } from 'vitest'
import { evaluateLoads, recommendLoads } from '../evaluate'

describe('recommendation filters and sorting', () => {
  it('lead does not appear for waterfowl species', () => {
    const results = evaluateLoads({
      speciesId: 'duck',
      rangeYd: 35,
      gauge: 12,
      choke: 'mod',
      olderGun: false,
      priceOverrides: {},
    })

    expect(results.some((result) => result.load.material === 'lead')).toBe(false)
  })

  it('steel, hevi, and tss do not appear for older guns', () => {
    const results = evaluateLoads({
      speciesId: 'duck',
      rangeYd: 35,
      gauge: 12,
      choke: 'mod',
      olderGun: true,
      priceOverrides: {},
    })

    expect(results.some((result) => ['steel', 'hevi', 'tss'].includes(result.load.material))).toBe(false)
  })

  it('passing recommendations are sorted by ascending cost', () => {
    const results = evaluateLoads({
      speciesId: 'grouse',
      rangeYd: 20,
      gauge: 12,
      choke: 'full',
      olderGun: false,
      priceOverrides: {},
    })
    const { passingByMaterial } = recommendLoads(results, 'grouse')

    for (let index = 1; index < passingByMaterial.length; index += 1) {
      expect(passingByMaterial[index].costPerShell).toBeGreaterThanOrEqual(passingByMaterial[index - 1].costPerShell)
    }
  })
})
