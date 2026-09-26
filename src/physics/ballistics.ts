import { physicsConfig, unitConstants } from '../config/physics'

function crossSectionAreaM2(diameterIn: number): number {
  const diameterM = diameterIn * 0.0254
  return Math.PI * (diameterM / 2) ** 2
}

export function velocityAtRangeFps(
  muzzleVelocityFps: number,
  diameterIn: number,
  pelletMassGr: number,
  rangeYd: number,
): number {
  const v0Mps = muzzleVelocityFps * unitConstants.fpsToMps
  const massKg = (pelletMassGr / unitConstants.grainsPerGram) / 1000
  const areaM2 = crossSectionAreaM2(diameterIn)
  const cd = physicsConfig.dragCoefficient(v0Mps)
  const k = (physicsConfig.airDensityKgM3 * cd * areaM2) / (2 * massKg)
  const rangeM = rangeYd * unitConstants.yardsToMeters
  const velocityMps = v0Mps * Math.exp(-k * rangeM)
  return velocityMps / unitConstants.fpsToMps
}

export function energyAtVelocityFtLb(pelletMassGr: number, velocityFps: number): number {
  const massKg = (pelletMassGr / unitConstants.grainsPerGram) / 1000
  const velocityMps = velocityFps * unitConstants.fpsToMps
  const joules = 0.5 * massKg * velocityMps ** 2
  return joules * unitConstants.joulesToFtLb
}
