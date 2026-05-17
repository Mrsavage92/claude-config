# Next.js 15+ App Router scaffold templates

Authoritative reference for the **Next.js path** in `/web-scaffold` Step 4. This file contains the project-skeleton templates that differ from the Vite path. For anything not specified here, defer to the canonical Next.js docs.

**Versions** (May 2026):
- Next.js 15 minimum (16 once stable — graduates PPR to default rendering model)
- React 19
- Tailwind v4 (NO `tailwind.config.ts` — config lives in `app/globals.css` `@theme {}`)
- shadcn CLI v4 (registry:base + --diff + shadcn/skills)
- motion v12, lenis, gsap (post-Webflow free)

---

## File tree (canonical)

```
{project-slug}/
├── app/
│   ├── (marketing)/                # Marketing route group — public, indexed
│   │   ├── layout.tsx              # Marketing chrome (top nav, footer)
│   │   ├── page.tsx                # Landing (home)
│   │   ├── pricing/page.tsx
│   │   └── about/page.tsx
│   ├── (app)/                      # Auth-gated route group
│   │   ├── layout.tsx              # AppLayout + TrialBanner
│   │   ├── dashboard/page.tsx
│   │   └── settings/page.tsx
│   ├── auth/                       # Sign-in / sign-up
│   │   └── page.tsx
│   ├── setup/                      # Onboarding wizard (mandatory for SaaS w/ auth)
│   │   └── page.tsx
│   ├── api/                        # Route handlers (server-only)
│   │   └── og/route.tsx            # OG image generation fallback (per-route overrides via opengraph-image.tsx)
│   ├── globals.css                 # @import "tailwindcss" + @theme inline { OKLCH tokens }
│   ├── layout.tsx                  # Root layout — fonts, Speculation Rules, View Transitions meta
│   ├── opengraph-image.tsx         # Root OG (@vercel/og + Satori)
│   ├── icon.tsx                    # Dynamic favicon
│   ├── apple-icon.tsx
│   ├── manifest.ts                 # Typed PWA manifest
│   ├── robots.ts                   # Typed robots.txt
│   ├── sitemap.ts                  # Typed sitemap.xml
│   └── not-found.tsx               # 404
├── components/
│   ├── landing/                    # Hero, FeatureGrid, PricingCards, etc.
│   ├── layout/                     # AppLayout, TrialBanner, MarketingNav, Footer
│   └── ui/                         # shadcn components (registry-managed)
├── lib/
│   ├── utils.ts                    # cn() helper
│   └── supabase/
│       ├── server.ts               # createServerClient (RSC + Server Actions)
│       └── client.ts               # createBrowserClient
├── hooks/
├── instrumentation.ts              # Sentry + RSC error capture
├── middleware.ts                   # Auth gate + redirects
├── next.config.ts                  # PPR experimental + image domains + foundry font opts
├── tsconfig.json
├── postcss.config.mjs              # Tailwind v4 plugin only
├── package.json
├── registry.json                   # shadcn registry:base payload
├── .env.example
└── CLAUDE.md                       # Design system snapshot + framework: nextjs marker
```

Do NOT scaffold `src/`. Do NOT scaffold `pages/` (that's the legacy Pages Router). App Router uses `app/` at the project root.

---

## `next.config.ts`

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    ppr: "incremental",                    // Partial Prerendering, opt-in per route
    reactCompiler: true,                    // React 19 compiler — automatic memoization
    typedRoutes: true,                      // Type-safe <Link href>
    viewTransition: true,                   // Same-doc View Transitions API
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },  // remove if not used
    ],
  },
};

export default nextConfig;
```

---

## `app/layout.tsx` — root layout (Speculation Rules + View Transitions + foundry font)

```tsx
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";

// Foundry variable font — Geist is the free OFL default. Swap for Söhne/GT America for paid projects.
const geist = localFont({
  src: "../public/fonts/Geist[wght].woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "100 900",
});

const geistMono = localFont({
  src: "../public/fonts/GeistMono[wght].woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com"),
  title: { default: "{Product}", template: "%s — {Product}" },
  description: "{One-line value prop}",
  openGraph: {
    type: "website",
    siteName: "{Product}",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

// Speculation Rules — prefetch internal links on hover/tap. p75 nav TTFB ≈ 45ms.
const speculationRules = {
  prerender: [
    {
      where: { href_matches: "/*" },
      eagerness: "moderate", // moderate = hover/pointerdown; conservative = pointerdown only; eager = viewport
    },
  ],
  prefetch: [
    {
      where: { href_matches: "/*" },
      eagerness: "moderate",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <head>
        {/* Cross-document View Transitions opt-in (Chrome 126+, Safari 18.5+, Firefox 146+ partial) */}
        <meta name="view-transition" content="same-origin" />
        <Script
          id="speculation-rules"
          type="speculationrules"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(speculationRules) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

---

## `app/globals.css` — Tailwind v4 + OKLCH design tokens + cross-doc View Transitions

```css
@import "tailwindcss";

/* Cross-document View Transitions opt-in (the @view-transition rule itself).
   Same-doc transitions are handled by next/navigation per-route. */
@view-transition {
  navigation: auto;
}

/* Reduced-motion respect (Cardinal Rule contract) */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
  }
}

@theme inline {
  /* Brand — 1 accent only. Replace OKLCH values from DESIGN-BRIEF.md. */
  --color-brand: oklch(0.68 0.21 250);
  --color-brand-foreground: oklch(0.99 0 0);

  /* Surface — 1 surface only */
  --color-background: oklch(0.99 0 0);
  --color-foreground: oklch(0.18 0 0);

  /* Neutrals — 2 only */
  --color-muted: oklch(0.96 0 0);
  --color-muted-foreground: oklch(0.48 0 0);
  --color-border: oklch(0.92 0 0);

  /* Typography */
  --font-sans: var(--font-sans);
  --font-mono: var(--font-mono);

  /* Motion tokens */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 300ms;
}

/* Named view-transition slots for shared elements across routes */
.hero-image { view-transition-name: hero-image; }
.product-logo { view-transition-name: product-logo; }
.nav-active { view-transition-name: nav-active; }
```

**Do NOT add a `tailwind.config.ts` file.** Tailwind v4 reads config from `@theme {}` in CSS.

---

## `app/opengraph-image.tsx` — dynamic OG via @vercel/og + Satori

```tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "oklch(0.99 0 0)",
          color: "oklch(0.18 0 0)",
          fontFamily: "Geist",
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.6 }}>{`{Product}`}</div>
        <div style={{ fontSize: 92, fontWeight: 700, marginTop: 16 }}>
          {`{Headline}`}
        </div>
        <div style={{ fontSize: 36, opacity: 0.75, marginTop: 16 }}>
          {`{Subheadline}`}
        </div>
      </div>
    ),
    size
  );
}
```

Per-route overrides: drop `opengraph-image.tsx` inside the route folder (e.g. `app/pricing/opengraph-image.tsx`) — Next.js auto-routes.

---

## `app/manifest.ts` / `app/robots.ts` / `app/sitemap.ts`

```ts
// app/manifest.ts
import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "{Product}",
    short_name: "{Product}",
    description: "{Value prop}",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#000000",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}

// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/auth/", "/setup/", "/api/"] }],
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL}/sitemap.xml`,
  };
}

// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";
  return [
    { url: `${base}/`, lastModified: new Date(), priority: 1 },
    { url: `${base}/pricing`, lastModified: new Date(), priority: 0.9 },
    { url: `${base}/about`, lastModified: new Date(), priority: 0.6 },
  ];
}
```

---

## `instrumentation.ts` — Sentry + RSC error capture

```ts
import * as Sentry from "@sentry/nextjs";

export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      enabled: process.env.NODE_ENV === "production",
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
```

---

## `registry.json` — shadcn registry:base payload (design system as portable resource)

```json
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "{project-slug}",
  "homepage": "{site-url}",
  "items": [
    {
      "name": "design-system",
      "type": "registry:base",
      "dependencies": ["motion", "lenis", "gsap"],
      "registryDependencies": [
        "button", "input", "label", "card", "dialog",
        "dropdown-menu", "sheet", "toast", "sonner",
        "separator", "badge", "skeleton", "avatar",
        "tabs", "table", "select", "textarea",
        "spinner", "kbd", "button-group", "input-group",
        "field", "item", "empty"
      ],
      "files": [
        { "path": "app/globals.css", "type": "registry:style" },
        { "path": "lib/utils.ts", "type": "registry:lib" }
      ],
      "cssVars": {
        "theme": {
          "--color-brand": "oklch(0.68 0.21 250)",
          "--color-background": "oklch(0.99 0 0)"
        }
      }
    }
  ]
}
```

After scaffold: `npx shadcn@latest registry build` emits the bundle. AI tools (Magic MCP, v0) can read it for accurate component context.

---

## CLAUDE.md framework marker (mandatory)

```yaml
# Section D — Locked decisions
framework: nextjs
framework_router: app
ppr: incremental
react_compiler: true
view_transitions: cross-doc
speculation_rules: prerender_moderate
tailwind: 4
shadcn_cli: 4
motion_stack: lenis + gsap + motion v12
```

Every downstream skill (`/web-page`, `/web-supabase`, `/web-deploy`, `/web-evolve`) reads `framework: nextjs` and branches.

---

## Anti-patterns specific to the Next.js path

- Using Pages Router (`pages/`) — App Router only.
- Adding `tailwind.config.ts` — config lives in CSS `@theme {}`.
- `"use client"` on the root layout — keep RSC, push client boundaries down.
- Calling `createBrowserClient` from a Server Component — use `createServerClient`.
- Static OG images committed to `public/` — use `app/opengraph-image.tsx` for dynamic per-route OG.
- Manual `<link rel="prefetch">` tags — Speculation Rules supersedes them.
- `next/image` without `priority` on the LCP image.

---

## Where this path differs from Vite for downstream skills

| Skill | Vite path | Next.js path |
|---|---|---|
| `/web-page` builds | `src/pages/{Name}.tsx` | `app/{route}/page.tsx` |
| Route group | React Router 7 lazy | App Router route groups `(marketing)` / `(app)` |
| Data fetching | TanStack Query everywhere | RSC + Server Actions for marketing; TanStack for client-state |
| OG generation | `api/og.tsx` Edge Function | `opengraph-image.tsx` per route |
| Auth gate | `<ProtectedRoute>` wrapper in App.tsx | `middleware.ts` redirect + `(app)` route group |
| Sentry | `src/main.tsx` | `instrumentation.ts` |
| Manifest | `public/site.webmanifest` | `app/manifest.ts` (typed) |
| Speculation | `index.html` `<script>` block | `app/layout.tsx` `<Script>` block |
| View Transitions | Same-doc only | Same-doc + cross-doc via `@view-transition` CSS |
