import { describe, expect, it } from 'vitest'
import { pelletCount } from '../pellet'

function expectWithinPercent(actual: number, expected: number, percent: number) {
  const lower = expected * (1 - percent / 100)
  const upper = expected * (1 + percent / 100)
  expect(actual).toBeGreaterThanOrEqual(lower)
  expect(actual).toBeLessThanOrEqual(upper)
}

describe('pellet count sanity checks', () => {
  it('matches known counts within ±5%', () => {
    expectWithinPercent(pelletCount(1, 0.13, 11.34), 133, 5)
    expectWithinPercent(pelletCount(1, 0.13, 7.86), 191, 5)
    expectWithinPercent(pelletCount(1, 0.13, 9.6), 157, 5)
    expectWithinPercent(pelletCount(1, 0.08, 18), 358, 5)
  })
})
