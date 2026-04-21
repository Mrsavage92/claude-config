# Typography Library by Personality Type

Font pairing recommendations for `/web-design-research`. Locked in Step 4. All fonts are free Google Fonts — specify the import in DESIGN-BRIEF.md.

---

## Font Pairings by Personality (anti-convergence library)

Each personality lists 3 distinctive options to rotate between — never pick the same pair as the last build. **Inter is acceptable as body for Enterprise + Civic only**; everywhere else, body fonts must have character. Display fonts must NEVER be Inter, Roboto, Arial, Helvetica, or Space Grotesk.

| Personality | Display options (rotate) | Body options (rotate) | Character |
|---|---|---|---|
| Enterprise Authority | DM Sans \| Söhne (or fallback Manrope) \| Geist | Inter \| Geist \| IBM Plex Sans | Clean, official, no-nonsense |
| Data Intelligence | JetBrains Mono \| IBM Plex Mono \| Space Mono | Geist \| IBM Plex Sans \| Manrope | Terminal precision with readable body |
| Trusted Productivity | Plus Jakarta Sans \| Manrope \| Outfit | Plus Jakarta Sans \| Manrope \| Geist | Warm, modern, consistent |
| Premium Professional | Fraunces \| Cormorant Garamond \| Tiempos (fallback Lora) | Inter \| Geist \| Söhne (fallback Manrope) | Editorial serif display + clean body |
| Bold Operator | Bricolage Grotesque \| Archivo Black \| Anton | Manrope \| Plus Jakarta Sans \| IBM Plex Sans | Strong, wide, construction-grade |
| Health & Care | Nunito \| Quicksand \| Mulish | Plus Jakarta Sans \| Nunito \| Mulish | Rounded, warm, approachable |
| Growth Engine | Cal Sans \| Bricolage Grotesque \| Clash Display | Plus Jakarta Sans \| Geist \| Manrope | Bold display energy + modern body |
| Civic/Government | Source Sans 3 \| Public Sans \| Atkinson Hyperlegible | Source Sans 3 \| Public Sans \| Inter | Institutional, readable, accessible |

**Rotation rule:** Read recent DESIGN-BRIEF.md files (Step 8 differentiation audit). If the last 2 builds in the same personality used the same display font, pick a different option from the list. If you've used all three, pick from the personality directly above or below in the table — but document the cross-pollination reason.

**Aesthetic-direction overrides** (from Step 1b — these supersede personality defaults when the aesthetic demands it):
- **Brutalist/raw** → Use a default browser font deliberately (Times New Roman, Courier, Verdana) — subverts expectations
- **Editorial/magazine** → Always serif display (Fraunces, Cormorant, Lora, Newsreader)
- **Retro-futuristic** → Mono dominates (JetBrains Mono, IBM Plex Mono, VT323 for accents)
- **Luxury/refined** → Serif display + lots of whitespace, never sans-serif headlines
- **Maximalist chaos** → Mix 3 typefaces (one display, one serif, one mono) — break the "two-font rule" intentionally

---

## Heading Scale (lock these in DESIGN-BRIEF.md)

- Display (hero headline): `clamp(3rem, 6vw, 5rem)` — never smaller
- Title (section headings): `clamp(1.75rem, 3vw, 2.5rem)`
- Subheading: `1.125rem`
- Body: `1rem`
- Caption: `0.875rem`

---

## Letter Spacing

- Enterprise/Civic: `letter-spacing: -0.01em` (tight but not aggressive)
- Growth/Bold/Premium: `letter-spacing: -0.03em` (aggressive tight — modern feel)
- Health/Productivity: `letter-spacing: 0` (normal — warmth and readability)
