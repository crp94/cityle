# Cityle

Cityle is a daily and unlimited urban-climate deduction game. Players identify one of 255 curated global cities in six guesses while progressively unlocking climate, population, urban-form, 2050 scenario, map, and planning clues.

The editorial framing treats housing, care, health, education, mobility, shade and public space as shared urban infrastructure. It asks how access and climate burdens are distributed, emphasizes collective and democratic policy levers, and rejects improvements that displace the communities they are meant to benefit.

## Run locally

```bash
npm install
npm run dev
```

`npm install` alone produces a working checkout: a `postinstall` script runs `npm run data:curate` automatically, so the curated city pool is validated and generated before you ever run `dev`.

Open [http://localhost:3000](http://localhost:3000).

## Quality checks

```bash
npm run check
npm run build
```

`npm run check` regenerates and validates the curated pool, then runs ESLint and TypeScript.

## City pool

Both Daily and Unlimited use `src/data/curated-cities.json`. The curated pool is hand-authored directly in `src/scripts/buildCuratedCities.ts` — the script reads no other file. Running it re-validates that source and re-derives the fields it computes (the 2050 monthly temperature and rainfall projections):

```bash
npm run data:curate
```

The selection and editorial planning facts live in `src/scripts/buildCuratedCities.ts`. The Daily mode uses deterministic shuffled cycles, so all 255 cities appear once before a new order begins.

The curation step is typed against the game's own `City` type, so every enum field (climate tiers, risk levels, morphology, continent, and more) is checked at compile time. On top of that, it runtime-validates required fields and plausible numeric ranges, reconciles each annual rainfall figure and each annual mean temperature against their twelve monthly values, checks that every Köppen code's hand-typed group label actually matches the code (e.g. `Csa` must be labelled "C: Temperate"), guards against incomplete or fallback photo metadata — a city either ships all four `image_*` fields with a verified, credited photo, or none at all — asserts every image URL in the pool is unique (no city can silently reuse another's photo), and flags any two cities whose coordinates fall within ~25km of each other as likely duplicates or same-metro suburbs.

## Data status

Cityle is a game, not a scientific dataset. Coordinates and broad profiles are curated for play. Several climate, air-quality, mobility, economy, heat-risk, and 2050 fields in the working dataset are generated or modelled estimates and have not been independently verified city by city.

References such as IPCC AR6, Köppen–Geiger research, WHO air-quality guidance, UN-Habitat, and GHSL informed the schema and broad ranges. They are not direct per-value provenance. Do not use Cityle data for research, policy, health, investment, or planning decisions.

The Guess 4 clue is a label-free CARTO basemap using OpenStreetMap data. It is intentionally described as a map—not satellite imagery—and includes attribution in the UI.

The Everyday Access clue introduces the 15-minute-neighbourhood concept with an illustrative 1.2 km walking radius and a social-infrastructure checklist. It deliberately does not assign a city score: a defensible measurement would require pedestrian-network isochrones, population-weighted destination coverage, service capacity and quality, affordability, safety, disability access, and neighbourhood-level inequality.

The access framing follows [WHO healthy urban transport guidance](https://www.who.int/teams/environment-climate-change-and-health/healthy-urban-environments/transport), which connects compact neighbourhoods, walking and cycling with access to employment, education, health services, food and recreation.

## Deploying

The app needs zero secrets or API keys to deploy. `@vercel/analytics` auto-detects automatically on Vercel's own hosting, and the only devDependency that does anything special, `sharp`, is used purely at build time for icon generation — it has no runtime API key or external service dependency.

That means deployment is just connecting this GitHub repo at [vercel.com](https://vercel.com), or running `npx vercel` from the project root and following its prompts.

Optionally set `NEXT_PUBLIC_SITE_URL` once a real domain exists — it's used to resolve `metadataBase` for Open Graph and Twitter card images. It defaults to `http://localhost:3000`, which is fine for local dev, but should be set to the real production URL after deploying so social share images resolve correctly.

## Climatle reference

[Climatle](https://github.com/crp94/climatle) informed Cityle’s generated-data validation, compact five-step proximity signal, and native-share fallback. Country-level Climatle/OWID measurements are not copied into Cityle because they are not city-level observations.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- D3 geographic projections

The generated Cityle logo is stored at `public/cityle-logo.png`.
