import type { Material, MaterialId } from '../types'

export const materials: Record<MaterialId, Material> = {
  steel: {
    id: 'steel',
    name: 'Steel',
    density: 7.86,
    defaultVelocityFps: 1450,
    patternModifier: 5,
    vintageGunSafe: false,
    waterfowlLegal: true,
  },
  bismuth: {
    id: 'bismuth',
    name: 'Bismuth',
    density: 9.6,
    defaultVelocityFps: 1350,
    patternModifier: 0,
    vintageGunSafe: true,
    waterfowlLegal: true,
  },
  tungstenPolymer: {
    id: 'tungstenPolymer',
    name: 'Tungsten Polymer',
    density: 10.8,
    defaultVelocityFps: 1300,
    patternModifier: 0,
    vintageGunSafe: true,
    waterfowlLegal: true,
  },
  hevi: {
    id: 'hevi',
    name: 'Hevi-Shot',
    density: 12,
    defaultVelocityFps: 1350,
    patternModifier: 5,
    vintageGunSafe: false, // TODO: verify against manufacturer guidance before launch
    waterfowlLegal: true,
  },
  tss: {
    id: 'tss',
    name: 'TSS',
    density: 18,
    defaultVelocityFps: 1200,
    patternModifier: 5,
    vintageGunSafe: false, // TODO: verify against manufacturer guidance before launch
    waterfowlLegal: true,
  },
  lead: {
    id: 'lead',
    name: 'Lead',
    density: 11.34,
    defaultVelocityFps: 1300,
    patternModifier: 0,
    vintageGunSafe: true,
    waterfowlLegal: false,
  },
}

export const materialList = Object.values(materials)
