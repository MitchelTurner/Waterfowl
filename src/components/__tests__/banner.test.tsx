import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { SPECIES } from '../../config/species';
import { DevThresholdBanner } from '../DevThresholdBanner';

describe('placeholder threshold banner', () => {
  it('flags every unsourced species in dev mode', () => {
    const html = renderToStaticMarkup(<DevThresholdBanner />);
    expect(import.meta.env.DEV).toBe(true);
    expect(html).toContain('TODO');
    expect(html).toContain('PLACEHOLDER');
    for (const species of SPECIES) {
      expect(html).toContain(species.name);
    }
  });
});
