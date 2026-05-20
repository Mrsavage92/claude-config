# [Route] — Page Override

This file overrides the matching sections of `../MASTER.md` for THIS route only. Sections not present here inherit from MASTER unchanged.

Keep this file SHORT — only include sections that genuinely deviate from the project-wide rules. If everything matches MASTER, delete this file.

---

## Hero signature variant (override)

<e.g. "On /pricing the hero is a single-column quote layout, not the scroll-kinetic-typography signature defined in MASTER. Why: pricing page needs immediate scannable value, not editorial pacing.">

## Section composition

<numbered list of sections IN ORDER on this route, e.g.>
1. Compact hero (pricing-page variant — no signature element)
2. Plan comparison table
3. Feature matrix
4. FAQ
5. Final CTA
6. Footer

## Per-route component locks

- `PricingTable` — locked, primary component for this route
- Banned on this route: `<e.g. "BackgroundGradientAnimation, FeatureBento — both used on /">`

## Motion intensity dial

`<0.0–1.0>` — `<one-sentence why this differs from MASTER>`
- 0.0 = motion-free (legal pages, dense data)
- 0.3 = subtle hover only
- 0.5 = MASTER default
- 0.7 = strong choreography
- 1.0 = full signature motion (hero routes)

## Per-route copy voice

`<override the MASTER voice for this route only, if needed>`
- e.g. "/pricing voice is concrete-numbers-only; no narrative copy. Voice MASTER (warm, plain English) does not apply here."

## Per-route SEO

- `<title>` — `<copy>`
- `<description>` — `<copy>`
- `<og.image>` — `<asset path or generator hint>`
