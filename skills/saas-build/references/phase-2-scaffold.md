### Phase 2 — Scaffold

**Action: invoke `Skill('web-scaffold')` now.** Do NOT read `~/.claude/skills/web-scaffold/SKILL.md` and execute its steps inline — that bypasses the skill's own bundle-splitting, Sentry, and design-token contracts. The Skill tool exists; use it.

The numbered steps below are a **summary of what `Skill('web-scaffold')` does** (with decisions sourced from SCOPE.md and DESIGN-BRIEF.md), not a substitute for invoking it:
0. **Read DESIGN-BRIEF.md Component Lock table** — every landing page section has a specific 21st.dev component assigned. Use these during the landing page build. Do NOT re-run MCP queries.
1. Generate all foundation files (package.json, tsconfig, vite.config, tailwind.config, index.css, main.tsx, App.tsx, CLAUDE.md)
2. Apply bundle splitting from premium-website performance rules (vendor-react, vendor-motion, vendor-query, vendor-supabase chunks)
3. tsconfig.json MUST include `"types": ["vite/client"]`
4. CLAUDE.md MUST include: color job definition, design reference site, page inventory summary
5. AppLayout MUST include skip-nav link as first element. LandingNav (the public landing page header) MUST ALSO include a skip-nav link as its first child, targeting `#main-content`. LandingHero `<section>` MUST have `id="main-content"` on its root element — the skip-nav target must exist.
5a. SVG gradient stops MUST use the React `style` prop for CSS variables — NOT presentation attributes. Correct: `<stop style={{ stopColor: 'hsl(var(--brand))', stopOpacity: 0.55 }} />`. Wrong: `<stop stopColor="hsl(148, 60%, 45%)" />`. CSS variables are NOT resolved in SVG presentation attributes — only in inline `style`.
6. Generate vercel.json with SPA rewrites at project root
7. Run install commands. If any command exits non-zero: read the full error output, fix the root cause (wrong Node version, missing lockfile, network issue), retry once. If retry fails, log STUCK with exact error and stop.
```bash
npm install
npx shadcn@latest init
npx shadcn@latest add button input label card dialog dropdown-menu sheet sonner separator badge skeleton avatar tabs table select textarea switch radio-group checkbox
npm install @sentry/react
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```
After install, create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
  test: { environment: 'jsdom', setupFiles: ['./src/tests/setup.ts'] },
})
```
Create `src/tests/setup.ts`:
```ts
import '@testing-library/jest-dom'
```
8. Create `src/components/ErrorBoundary.tsx` — class component wrapping children, renders inline error + retry button on caught errors. Wrap every `React.lazy` route with it in App.tsx.
9. Create `src/pages/NotFoundPage.tsx` — 404 page with headline, sub, and back-to-home button. Register as `path="*"` catch-all in App.tsx.
10. Create `src/hooks/useSeo.ts` — sets `document.title` and `<meta name="description">` via useEffect. MUST accept both object form `({ title, description?, noIndex? })` AND positional form `(title: string, description?: string)` via a union type overload — scaffold copies will use one form, page authors the other, and a mismatch causes silent TypeScript errors:
    ```ts
    type SeoOptions = { title: string; description?: string; noIndex?: boolean }
    export function useSeo(options: SeoOptions | string, description?: string) {
      const title = typeof options === 'string' ? options : options.title
      const desc = typeof options === 'string' ? description : options.description
      useEffect(() => {
        document.title = `${title} | [Product Name]`
        const meta = document.querySelector('meta[name="description"]')
        if (meta) meta.setAttribute('content', desc ?? '')
      }, [title, desc])
    }
    ```
    Call on every page.
11. Add OG + Twitter meta tags to `index.html`: `og:title`, `og:description`, `og:image` (set to `/og-image.jpg` — auto-generated in step 14 below), `twitter:card`.
12. Generate `public/robots.txt`:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://[product-domain]/sitemap.xml
   ```
   Leave domain as placeholder — user replaces after domain is live.
13. Generate `public/sitemap.xml` with all public routes from SCOPE.md (landing, features, pricing, terms, privacy). Set `<lastmod>` to today's date. Leave domain as placeholder.
14. Generate `public/site.webmanifest`:
   ```json
   { "name": "[Product Name]", "short_name": "[Slug]", "start_url": "/", "display": "standalone", "background_color": "#0a0a0a", "theme_color": "#0a0a0a", "icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }] }
   ```
   Add `<link rel="manifest" href="/site.webmanifest">` and `<link rel="apple-touch-icon" href="/icon-192.png">` to `index.html`.

   **Auto-generate icons via ai-image-generation skill (no human required):**

   Before writing the prompt: read DESIGN-BRIEF.md to extract (a) the exact primary color HSL value, (b) the product personality type, and (c) the product's core action/metaphor (what does it fundamentally DO — track, connect, analyse, protect, automate?).

   Construct a craft-level prompt using this template:
   ```
   App icon for [Product Name]. [One sentence: what the product does, who it's for].
   Visual concept: [specific metaphor derived from core action — e.g. "an upward arrow dissolving into data points" for analytics, "a shield with a circuit line" for security, "interlocking gears morphing into a checkmark" for workflow automation].
   Style: flat vector, ultra-clean, [personality adjective from DESIGN-BRIEF — e.g. "precision enterprise" / "bold consumer" / "calm healthcare"].
   Color: [primary HSL from DESIGN-BRIEF] icon on #0a0a0a background, subtle inner glow matching primary color.
   Quality reference: Stripe, Linear, Vercel app icon aesthetic — not generic, not clipart.
   Format: square, centered, 10% padding from edge. No text. No gradients unless glassy/frosted effect.
   ```

   Run with Seedream 4.5 for maximum quality. The command outputs JSON — extract the URL with jq:
   ```bash
   ICON_URL=$(infsh app run bytedance/seedream-4-5 --input '{"prompt": "[constructed prompt above]"}' | jq -r '.output // .images[0].url // .image_url // empty')
   ```

   If ICON_URL is non-empty, download to /public:
   ```bash
   curl -sL "$ICON_URL" -o public/icon-512.png
   cp public/icon-512.png public/icon-192.png
   ```

   Update site.webmanifest to include both: `"icons": [{ "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }, { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }]`

   **Also generate the OG social image** (replaces the 1200x630 placeholder set in step 11):
   Write a second prompt for a wide-format hero: same brand colors and visual metaphor, but landscape layout showing the product in context — dashboard mockup, key UI element, or abstract brand scene. Aspect ratio 1200x630.
   ```bash
   OG_URL=$(infsh app run xai/grok-imagine-image --input '{"prompt": "[og-hero-prompt]", "aspect_ratio": "16:9"}' | jq -r '.output // .images[0].url // .image_url // empty')
   [ -n "$OG_URL" ] && curl -sL "$OG_URL" -o public/og-image.jpg
   ```
   Update index.html og:image to `/og-image.jpg` if downloaded successfully.

   > **Platform note (Windows):** The `jq`, `curl`, and `cp` commands above are Unix/Mac only. On Windows without WSL, skip the download steps and log NEEDS_HUMAN "Download icon from ICON_URL to public/icon-512.png and public/icon-192.png manually" then continue.

   If infsh is unavailable or ICON_URL is empty: run the `/ai-image-generation` skill with the same constructed prompt to generate and download the icon. If that also fails: log NEEDS_HUMAN: "Add icon-192.png, icon-512.png, and og-image.jpg to /public." and continue.
15. Initialise Sentry in `main.tsx` conditionally — only if `VITE_SENTRY_DSN` is set, so local dev and deploys without a Sentry project don't silently fail:
   ```ts
   if (import.meta.env.VITE_SENTRY_DSN) {
     Sentry.init({ dsn: import.meta.env.VITE_SENTRY_DSN })
   }
   ```
   Wrap `<App />` with `<Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>`. Add `VITE_SENTRY_DSN=` (blank, optional) to `.env.example` with comment: `# Get from sentry.io — create project → Client Keys → DSN`.

### Phase 2 completion gate (transcript-verifiable — do not self-grade)

Phase 2 cannot be marked complete unless THIS conversation's tool-call log contains:

- [ ] At least one `Skill('web-scaffold')` invocation
- [ ] `npm install` exit 0 AND `npm run build` exit 0 (verified via Bash tool, not assumed)
- [ ] vitest setup file present at `src/tests/setup.ts`

If `Skill('web-scaffold')` was not invoked → Phase 2 has NOT completed even if foundation files exist. Hand-rolled scaffold from main-context knowledge is a phase failure (see AuditHQ v2 retro 2026-04-24).

Log: "Phase 2 complete — Skill('web-scaffold') invoked, build green" to BUILD-LOG.md.

---
