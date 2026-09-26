import { PHYSICS } from '../config/physics';

/** Sphere volume in cubic centimeters from a diameter in inches. */
export function pelletVolumeCc(diameterIn: number): number {
  const dCm = diameterIn * PHYSICS.cmPerInch;
  return (Math.PI / 6) * dCm ** 3;
}

export function pelletMassGrams(diameterIn: number, densityGPerCc: number): number {
  return densityGPerCc * pelletVolumeCc(diameterIn);
}

export function pelletMassGrains(massGrams: number): number {
  return massGrams * PHYSICS.grainsPerGram;
}

export function pelletsPerOunce(massGrams: number): number {
  return PHYSICS.gramsPerOunce / massGrams;
}

export function countPellets(payloadOz: number, massGrams: number): number {
  return Math.round(payloadOz * pelletsPerOunce(massGrams));
}
