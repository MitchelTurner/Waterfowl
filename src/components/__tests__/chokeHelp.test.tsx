import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CHOKE_OPTIONS, CHOKE_PATTERN_PCT } from '../../config/chokes';
import { defaultInputs } from '../../hooks/urlState';
import { ChokeHelpPanel } from '../ChokeHelp';
import { InputPanel } from '../InputPanel';

describe('choke guide', () => {
  it('explains every listed choke and how to identify one that is not listed', () => {
    const html = renderToStaticMarkup(<ChokeHelpPanel current="mod" />);
    for (const choke of CHOKE_OPTIONS) {
      expect(html).toContain(choke.label);
      expect(html).toContain(`${CHOKE_PATTERN_PCT[choke.id]}%`);
      expect(html).toContain(choke.summary);
    }
    expect(html).toContain('Selected');
    expect(html).toContain('Skeet');
    expect(html).toContain('Light modified');
    expect(html).toContain('turkey');
    expect(html).toContain('How to find out');
    expect(html).toContain('Notches');
    expect(html).toContain('30-inch circle at 40 yards');
  });

  it('offers the guide from the choke label', () => {
    const html = renderToStaticMarkup(<InputPanel inputs={defaultInputs()} onChange={() => undefined} />);
    expect(html).toContain('Explain');
    expect(html).toContain('cursor-help');
    expect(html).not.toContain('How to find out');
    expect(html).toContain('Where to hold on a duck');
    expect(html).toContain('BBB');
    expect(html).toContain('Front half');
  });
});
