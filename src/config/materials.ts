import type { Material, MaterialId } from '../types';

/**
 * Tunable shot materials.
 * Density is g/cc. patternModifier is percentage points added to the choke.
 * TODO: verify hevi and tss vintageGunSafe against manufacturer guidance before launch.
 */
export const MATERIALS: readonly Material[] = [
  {
    id: 'steel',
    name: 'Steel',
    headlineName: 'steel',
    density: 7.86,
    defaultVelocityFps: 1450,
    patternModifier: 5,
    vintageGunSafe: false,
    waterfowlLegal: true,
  },
  {
    id: 'bismuth',
    name: 'Bismuth',
    headlineName: 'bismuth',
    density: 9.6,
    defaultVelocityFps: 1350,
    patternModifier: 0,
    vintageGunSafe: true,
    waterfowlLegal: true,
  },
  {
    id: 'tungstenPolymer',
    name: 'Tungsten-polymer',
    headlineName: 'tungsten-polymer',
    density: 10.8,
    defaultVelocityFps: 1300,
    patternModifier: 0,
    vintageGunSafe: true,
    waterfowlLegal: true,
  },
  {
    id: 'hevi',
    name: 'Hevi-Shot',
    headlineName: 'Hevi-Shot',
    density: 12,
    defaultVelocityFps: 1350,
    patternModifier: 5,
    // TODO: verify against manufacturer guidance before launch.
    vintageGunSafe: false,
    waterfowlLegal: true,
  },
  {
    id: 'tss',
    name: 'TSS',
    headlineName: 'TSS',
    density: 18,
    defaultVelocityFps: 1200,
    patternModifier: 5,
    // TODO: verify against manufacturer guidance before launch.
    vintageGunSafe: false,
    waterfowlLegal: true,
  },
  {
    id: 'lead',
    name: 'Lead',
    headlineName: 'lead',
    density: 11.34,
    defaultVelocityFps: 1300,
    patternModifier: 0,
    vintageGunSafe: true,
    waterfowlLegal: false,
  },
];

const BY_ID = new Map(MATERIALS.map((material) => [material.id, material]));

export function materialById(id: MaterialId): Material {
  const material = BY_ID.get(id);
  if (!material) {
    throw new Error(`Unknown shot material: ${id}`);
  }
  return material;
}
