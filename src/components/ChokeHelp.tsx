import { CHOKE_IDENTIFY, CHOKE_OPTIONS, CHOKE_PATTERN_PCT, UNLISTED_CHOKES } from '../config/chokes';
import type { Choke } from '../types';

export function ChokeHelpPanel({ current }: { current: Choke }) {
  return (
    <div className="text-sm text-ink">
      <p>
        A choke is the constriction at the muzzle. Tighter keeps more pellets in the pattern farther
        out. These percents are what this calculator uses inside a 30-inch circle at 40 yards for a
        12 gauge.
      </p>
      <ul className="mt-2 space-y-1.5">
        {CHOKE_OPTIONS.map((choke) => {
          const selected = choke.id === current;
          return (
            <li key={choke.id} className={`rounded-sm px-2 py-1 ${selected ? 'bg-mist' : ''}`}>
              <span className="font-semibold">
                {choke.label}
                <span className="ml-1 tabular-nums text-brass">{CHOKE_PATTERN_PCT[choke.id]}%</span>
                {selected ? (
                  <span className="ml-1 text-xs uppercase tracking-wide text-brass">Selected</span>
                ) : null}
              </span>
              <span className="mt-0.5 block text-ink/80">{choke.summary}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-3 font-semibold">If your choke is not in this list</p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-ink/85">
        {UNLISTED_CHOKES.map((item) => (
          <li key={item.name}>
            {item.name} is {item.nearest}. Choose the nearest name. A real choke tighter than the one
            you pick will pattern tighter than this estimate.
          </li>
        ))}
      </ul>
      <p className="mt-3 font-semibold">How to find out</p>
      <ul className="mt-1 list-disc space-y-1 pl-4 text-ink/85">
        {CHOKE_IDENTIFY.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </div>
  );
}
