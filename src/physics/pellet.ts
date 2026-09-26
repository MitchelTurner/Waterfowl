import { unitConstants } from '../config/physics'

export function pelletMassGrams(diameterIn: number, densityGcc: number): number {
  const diameterCm = diameterIn * unitConstants.inchesToCm
  const volumeCc = (Math.PI / 6) * diameterCm ** 3
  return densityGcc * volumeCc
}

export function pelletMassGrains(diameterIn: number, densityGcc: number): number {
  return pelletMassGrams(diameterIn, densityGcc) * unitConstants.grainsPerGram
}

export function pelletsPerOunce(diameterIn: number, densityGcc: number): number {
  return unitConstants.gramsPerOunce / pelletMassGrams(diameterIn, densityGcc)
}

export function pelletCount(payloadOz: number, diameterIn: number, densityGcc: number): number {
  return Math.round(payloadOz * pelletsPerOunce(diameterIn, densityGcc))
}
