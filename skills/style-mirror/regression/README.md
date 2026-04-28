# Style-mirror regression fixtures

Verifies that downstream build skills (`/web-scaffold`, `/web-page`, `/polish`, etc.) honor the `tokens.lock.json` produced by `/style-mirror`.

This catches the failure mode where a build skill silently stops reading the lock and reverts to Design DNA defaults — the exact regression the 2026-04-28 audit found.

## Run

```bash
node run-fixture.mjs fixtures/<name>
```

Exit codes:
- `0` — all conformance checks pass; the build is mirroring the lock
- `1` — at least one check failed; a build skill has regressed
- `2` — fixture missing required files (operator error)

## Create a new fixture

1. `mkdir fixtures/<name>` — name it after the reference site (e.g. `github-com`, `linear-app`).
2. Run `/style-mirror <reference-url>` against a clean scaffold project. This writes `tokens.lock.json`.
3. Copy the generated artifacts into the fixture:
   ```bash
   cp <project>/tokens.lock.json           fixtures/<name>/tokens.lock.json
   cp <project>/src/styles/index.css       fixtures/<name>/expected/index.css
   cp <project>/tailwind.config.ts         fixtures/<name>/expected/tailwind.config.ts
   ```
   `expected/` is the snapshot of what a known-good build produced. It's kept for human review and future diffing.
4. Whenever you change a build skill (web-scaffold, web-page, polish, impeccable, etc.):
   ```bash
   # Re-run the build with the same lock
   /web-scaffold ... # which will read tokens.lock.json from fixtures/<name>/
   # Copy the new outputs into actual/
   cp <project>/src/styles/index.css       fixtures/<name>/actual/index.css
   cp <project>/tailwind.config.ts         fixtures/<name>/actual/tailwind.config.ts
   # Verify
   node run-fixture.mjs fixtures/<name>
   ```

If `actual/` differs from `expected/` in ways the lock didn't authorize, the fixture fails.

## What it checks

Per fixture:
- Locked `body_bg`, `cta_bg` colors appear in the generated tokens
- Locked `heading_family` (first font in the stack) appears in the generated tokens
- Locked `cta_border_radius` appears
- For every `signature_elements.*` set to `false` in the lock: that element does NOT appear in the generated CSS or Tailwind config
  - `gradient_mesh` — radial-gradient(at ...) absent
  - `glassmorphism` — backdrop-filter: blur / backdrop-blur-* absent
  - `grid_lines` — linear-gradient(... 1px transparent 1px) absent
  - `gradient_text` — -webkit-background-clip: text / bg-clip-text absent
  - `grain` — feTurbulence / .grain::after absent

Add fixtures to `fixtures/` for sites with strong, distinctive design languages (github.com, linear.app, stripe.com, framer.com, etc.) so each represents a different replication target.

## When to run

- After any edit to: style-mirror, web-scaffold, web-page, web-component, polish, impeccable, tokens-lock-enforce.ps1, web-system-prompt.md
- Before merging the claude-config repo
- As a CI check if/when the harness gets one
