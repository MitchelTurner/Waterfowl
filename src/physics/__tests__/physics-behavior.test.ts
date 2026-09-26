import { describe, expect, it } from 'vitest'
import { energyAtVelocityFtLb, velocityAtRangeFps } from '../ballistics'
import { expectedHits } from '../pattern'
import { pelletCount, pelletMassGrains } from '../pellet'

describe('physics behavior', () => {
  it('velocity decreases with range', () => {
    const mass = pelletMassGrains(0.13, 9.6)
    const v20 = velocityAtRangeFps(1350, 0.13, mass, 20)
    const v40 = velocityAtRangeFps(1350, 0.13, mass, 40)
    expect(v20).toBeGreaterThan(v40)
  })

  it('denser material retains more velocity at equal diameter and muzzle velocity', () => {
    const steelMass = pelletMassGrains(0.13, 7.86)
    const tssMass = pelletMassGrains(0.13, 18)
    const steelV40 = velocityAtRangeFps(1300, 0.13, steelMass, 40)
    const tssV40 = velocityAtRangeFps(1300, 0.13, tssMass, 40)
    expect(tssV40).toBeGreaterThan(steelV40)
  })

  it('energy at range zero equals muzzle energy', () => {
    const mass = pelletMassGrains(0.13, 9.6)
    const v0 = velocityAtRangeFps(1350, 0.13, mass, 0)
    expect(energyAtVelocityFtLb(mass, v0)).toBeCloseTo(energyAtVelocityFtLb(mass, 1350), 8)
  })

  it('expected hits never exceeds pellet count', () => {
    const pellets = pelletCount(1.25, 0.13, 9.6)
    const hits = expectedHits(pellets, 'full', 'tss', 15)
    expect(hits).toBeLessThanOrEqual(pellets)
  })
})
