# ShotMath

Browser-only calculator that compares factory shotgun loads across steel, bismuth, tungsten-polymer, Hevi-Shot, TSS, and lead. It recommends a passing load for a species, gauge, choke, and range, ranked by price or by margin above the energy and pattern thresholds.

Changing an input updates the result immediately. The same inputs, including price edits, shelf marks, material filters, elevation, and temperature, are stored in the query string so a link reproduces the result.

## Run

```bash
npm install
npm test
npm run dev
npm run build
npm start
```

`npm start` serves the static `dist` folder. Railway uses `railway.json` to build and start that site. There is no backend, account, or database.

## Model

Physics lives in `src/physics` and is covered by Vitest. Tunable densities, velocities, choke pattern percents, species thresholds, seed prices, drag, air, and pattern spread live in `src/config`.

Flight drag follows Allen's 2018 average sphere curve, so the drag coefficient changes with speed. Air density uses standard-atmosphere pressure at the chosen elevation and the chosen air temperature. The incompressible drag coefficient stays in config as a reference.

Pattern percent is a Gaussian count. The choke table is the percent inside a 30-inch circle at 40 yards for a 12 gauge. A smaller circle, a longer range, or a wider gauge factor lowers the percent. Hit counts are an estimate.

Duck, goose, and pheasant pattern counts use the low end of Tom Roster's 2016 lethality table. Turkey counts 100 pellets in a 10-inch circle, the usual pattern-board goal. Grouse pattern counts and every pellet-energy minimum are still placeholders. In dev mode the page shows a TODO banner until those values are sourced. Hevi-Shot and TSS are marked not safe for older guns; confirm that with manufacturer guidance before relying on it.

Factory waterfowl loads run through T shot. A load that has the pellet energy and misses the pattern count stays on the card under “Energy is there,” and in the list with an Energy mark. The hold for each load is Head, Body, or Both: B through T, and anything short on energy or pattern, is the head and neck; #6 through #1 that clear both thresholds is the front half; #7 and smaller that clear both is the body. Turkey stays a head-and-neck hold.

Lead is a density reference and is omitted for duck and goose. It is marked not legal for waterfowl.

Seed prices carry a catalog date in `src/config/loads.ts`. They are not a live retail quote. Edits stay in the link.

## Disclaimer

Estimates only. Pattern your own gun. Not reloading data.
