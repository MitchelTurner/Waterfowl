# ShotMath

Browser-only calculator that compares factory shotgun loads across steel, bismuth, tungsten-polymer, Hevi-Shot, TSS, and lead. It recommends the cheapest load that meets a species energy and pattern threshold for a gauge, choke, and range.

Changing an input updates the result immediately. The same inputs, including price edits, are stored in the query string so a link reproduces the result.

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

Physics lives in `src/physics` and is covered by Vitest. Tunable densities, velocities, choke pattern percents, species thresholds, seed prices, drag coefficient, and pattern spread live in `src/config`.

Species energy and pattern thresholds are placeholders. In dev mode the page shows a TODO banner until every species `source` cites published data. Hevi-Shot and TSS are marked not safe for older guns; confirm that with manufacturer guidance before relying on it.

Lead is a density reference and is omitted for duck and goose. It is marked not legal for waterfowl.

Pattern hit counts are an estimate for a 30-inch circle, not a target photo.

## Disclaimer

Estimates only. Pattern your own gun. Not reloading data.
