import { materialById } from './materials';
import type { FactoryLoad, Gauge, MaterialId, ShotSize } from '../types';

/**
 * Tunable seed prices and factory performance.
 * Velocities fall back to the material default. Prices are USD per shell.
 * Overrides belong in URL state, not in this file.
 */

function factoryLoad(
  load: Omit<FactoryLoad, 'velocityFps'> & { velocityFps?: number },
): FactoryLoad {
  return {
    ...load,
    velocityFps: load.velocityFps ?? materialById(load.material).defaultVelocityFps,
  };
}

function shell(
  id: string,
  label: string,
  gauge: Gauge,
  material: MaterialId,
  shotSize: ShotSize,
  payloadOz: number,
  pricePerShell: number,
): FactoryLoad {
  return factoryLoad({ id, label, gauge, material, shotSize, payloadOz, pricePerShell });
}

export const FACTORY_LOADS: readonly FactoryLoad[] = [
  shell('12-steel-3-1125-2', '12ga 3in 1-1/8oz #2 Steel', 12, 'steel', '2', 1.125, 1.25),
  shell('12-steel-3-1125-3', '12ga 3in 1-1/8oz #3 Steel', 12, 'steel', '3', 1.125, 1.2),
  shell('12-steel-3-1125-4', '12ga 3in 1-1/8oz #4 Steel', 12, 'steel', '4', 1.125, 1.15),
  shell('12-steel-3-125-bb', '12ga 3in 1-1/4oz BB Steel', 12, 'steel', 'BB', 1.25, 1.4),
  shell('12-steel-275-1-6', '12ga 2-3/4in 1oz #6 Steel', 12, 'steel', '6', 1, 0.95),
  shell('12-bismuth-3-125-2', '12ga 3in 1-1/4oz #2 Bismuth', 12, 'bismuth', '2', 1.25, 3.4),
  shell('12-bismuth-3-125-3', '12ga 3in 1-1/4oz #3 Bismuth', 12, 'bismuth', '3', 1.25, 3.25),
  shell('12-bismuth-3-125-4', '12ga 3in 1-1/4oz #4 Bismuth', 12, 'bismuth', '4', 1.25, 3.1),
  shell('12-bismuth-275-1-6', '12ga 2-3/4in 1oz #6 Bismuth', 12, 'bismuth', '6', 1, 2.8),
  shell(
    '12-tungsten-3-125-4',
    '12ga 3in 1-1/4oz #4 Tungsten-polymer',
    12,
    'tungstenPolymer',
    '4',
    1.25,
    2.95,
  ),
  shell(
    '12-tungsten-3-125-5',
    '12ga 3in 1-1/4oz #5 Tungsten-polymer',
    12,
    'tungstenPolymer',
    '5',
    1.25,
    2.9,
  ),
  shell('12-hevi-3-125-2', '12ga 3in 1-1/4oz #2 Hevi-Shot', 12, 'hevi', '2', 1.25, 4.35),
  shell('12-hevi-3-125-4', '12ga 3in 1-1/4oz #4 Hevi-Shot', 12, 'hevi', '4', 1.25, 4.15),
  shell('12-tss-3-1125-7', '12ga 3in 1-1/8oz #7 TSS', 12, 'tss', '7', 1.125, 6.5),
  shell('12-tss-3-1125-9', '12ga 3in 1-1/8oz #9 TSS', 12, 'tss', '9', 1.125, 6.75),
  shell('12-tss-3-125-9', '12ga 3in 1-1/4oz #9 TSS', 12, 'tss', '9', 1.25, 8.4),
  shell('12-lead-275-125-4', '12ga 2-3/4in 1-1/4oz #4 Lead', 12, 'lead', '4', 1.25, 0.9),
  shell('12-lead-275-125-6', '12ga 2-3/4in 1-1/4oz #6 Lead', 12, 'lead', '6', 1.25, 0.85),
  shell('12-lead-275-118-75', '12ga 2-3/4in 1-1/8oz #7.5 Lead', 12, 'lead', '7.5', 1.125, 0.75),
  shell('12-lead-3-15-5', '12ga 3in 1-1/2oz #5 Lead', 12, 'lead', '5', 1.5, 1.05),

  shell('20-steel-3-1-3', '20ga 3in 1oz #3 Steel', 20, 'steel', '3', 1, 1.35),
  shell('20-steel-3-1-4', '20ga 3in 1oz #4 Steel', 20, 'steel', '4', 1, 1.3),
  shell('20-bismuth-3-1-4', '20ga 3in 1oz #4 Bismuth', 20, 'bismuth', '4', 1, 3.55),
  shell('20-bismuth-275-875-6', '20ga 2-3/4in 7/8oz #6 Bismuth', 20, 'bismuth', '6', 0.875, 3.1),
  shell('20-tungsten-3-1-5', '20ga 3in 1oz #5 Tungsten-polymer', 20, 'tungstenPolymer', '5', 1, 3.05),
  shell('20-hevi-3-1-4', '20ga 3in 1oz #4 Hevi-Shot', 20, 'hevi', '4', 1, 4.6),
  shell('20-tss-3-1-7', '20ga 3in 1oz #7 TSS', 20, 'tss', '7', 1, 7.4),
  shell('20-tss-3-1-9', '20ga 3in 1oz #9 TSS', 20, 'tss', '9', 1, 7.6),
  shell('20-lead-275-875-6', '20ga 2-3/4in 7/8oz #6 Lead', 20, 'lead', '6', 0.875, 0.7),
  shell('20-lead-275-875-75', '20ga 2-3/4in 7/8oz #7.5 Lead', 20, 'lead', '7.5', 0.875, 0.68),

  shell('16-steel-275-875-4', '16ga 2-3/4in 7/8oz #4 Steel', 16, 'steel', '4', 0.875, 1.4),
  shell('16-bismuth-275-1-5', '16ga 2-3/4in 1oz #5 Bismuth', 16, 'bismuth', '5', 1, 3.35),
  shell('16-lead-275-1-6', '16ga 2-3/4in 1oz #6 Lead', 16, 'lead', '6', 1, 0.95),
  shell('16-tss-275-1-9', '16ga 2-3/4in 1oz #9 TSS', 16, 'tss', '9', 1, 7.1),

  shell('28-bismuth-275-75-6', '28ga 2-3/4in 3/4oz #6 Bismuth', 28, 'bismuth', '6', 0.75, 3.7),
  shell('28-tss-275-75-9', '28ga 2-3/4in 3/4oz #9 TSS', 28, 'tss', '9', 0.75, 7.9),
  shell('28-lead-275-75-6', '28ga 2-3/4in 3/4oz #6 Lead', 28, 'lead', '6', 0.75, 0.88),
  shell('28-lead-275-75-8', '28ga 2-3/4in 3/4oz #8 Lead', 28, 'lead', '8', 0.75, 0.85),

  shell('410-tss-3-8125-9', '.410 3in 13/16oz #9 TSS', 410, 'tss', '9', 0.8125, 6.95),
  shell('410-bismuth-3-6875-6', '.410 3in 11/16oz #6 Bismuth', 410, 'bismuth', '6', 0.6875, 3.2),
  shell('410-lead-3-6875-6', '.410 3in 11/16oz #6 Lead', 410, 'lead', '6', 0.6875, 0.65),
  shell('410-lead-25-5-75', '.410 2-1/2in 1/2oz #7.5 Lead', 410, 'lead', '7.5', 0.5, 0.55),
];

export function loadById(id: string): FactoryLoad | undefined {
  return FACTORY_LOADS.find((load) => load.id === id);
}
