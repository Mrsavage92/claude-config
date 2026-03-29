# /vercel-react-best-practices

React + Vite + Vercel performance optimization guidelines. Read this during /web-review Section D and /saas-build Phase 5 quality gate.

---

## Bundle Splitting (critical — fixes the 500KB single-chunk problem)

`vite.config.ts` MUST have manual chunks. No exceptions:

```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
        'vendor-motion':   ['framer-motion'],
        'vendor-query':    ['@tanstack/react-query'],
        'vendor-supabase': ['@supabase/supabase-js'],
      },
    },
  },
  chunkSizeWarningLimit: 250,
},
```

Only include chunks for packages that are actually in package.json.

**Target chunk sizes (gzipped):**
- vendor-react: ~45KB
- vendor-motion: ~35KB
- vendor-query: ~15KB
- vendor-supabase: ~25KB
- Each page chunk: < 30KB

If any chunk exceeds 250KB gzipped: find the heavy import and split it.

---

## Route-Level Code Splitting (required)

Every route in App.tsx MUST use React.lazy + Suspense:

```tsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const Landing   = lazy(() => import('./pages/Landing'))
const SignIn    = lazy(() => import('./pages/SignIn'))
const Dashboard = lazy(() => import('./pages/Dashboard'))

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/"         element={<Landing />} />
          <Route path="/auth"   element={<AuthPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
```

`PageSkeleton` should match the general layout (sidebar + content area) — not a blank screen or spinner.

---

## Data Fetching (TanStack Query — not useEffect)

Never fetch data in `useEffect`. Use TanStack Query:

```tsx
// WRONG
useEffect(() => {
  fetch('/api/data').then(r => r.json()).then(setData)
}, [])

// CORRECT
const { data, isLoading, error } = useQuery({
  queryKey: ['entity', id],
  queryFn: () => supabase.from('entity').select('*').eq('id', id),
  staleTime: 60_000,
})
```

Benefits: automatic deduplication, background refetch, loading/error states, cache.

---

## Image Optimization

```tsx
// Every <img> must have:
<img
  src={url}
  alt="descriptive text"       // never empty unless decorative (then aria-hidden)
  loading="lazy"               // all images below fold
  width={400}                  // explicit dimensions prevent CLS
  height={300}
  decoding="async"
/>

// Hero images (above fold): loading="eager" not lazy
<img src={heroImage} alt="..." loading="eager" width={800} height={600} />
```

---

## Core Web Vitals

**LCP (Largest Contentful Paint) — target < 2.5s:**
- Hero image: `loading="eager"`, explicit dimensions
- Preload hero font: `<link rel="preload" as="font">`
- No large unoptimized images above fold
- Animated background: `opacity: 0.15-0.25` only — never blocks content paint

**CLS (Cumulative Layout Shift) — target < 0.1:**
- All images have explicit `width` + `height`
- Font: use `font-display: swap` in CSS or load via Google Fonts with `display=swap`
- Skeleton loaders match exact dimensions of real content (prevents layout jump on load)

**INP (Interaction to Next Paint) — target < 200ms:**
- Heavy computations: move to `useMemo` or `useCallback`
- Event handlers: never do synchronous heavy work on click
- Framer Motion: use `will-change: transform` only on actively animating elements, remove after animation

---

## Vercel Deployment Specifics

**vercel.json — required for React Router SPA:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```
Must be at project root. Without this, direct URL access and page refresh return 404.

**Environment variables:**
- Set in Vercel dashboard OR via CLI: `npx vercel env add VITE_API_URL production`
- VITE_* prefix required for Vite to expose to browser
- Never commit real secrets — only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are safe to commit (anon key is public by design)

**Build command:** `tsc && vite build` (TypeScript check first — catches errors before Vercel does)

**Output directory:** `dist` (Vercel auto-detects for Vite — no manual config needed)

---

## Framer Motion Performance

```tsx
// Always use viewport={{ once: true }} — never re-animate on scroll up
whileInView="visible"
viewport={{ once: true, margin: '-80px' }}

// Reduce motion support
import { useReducedMotion } from 'framer-motion'
const shouldReduce = useReducedMotion()

// will-change: only add during animation, remove after
// Framer Motion handles this automatically with layout animations
// Do NOT manually add will-change: transform to static elements
```

Heavy animation components (canvas backgrounds, particle systems) should be lazy loaded:
```tsx
const AnimatedBackground = lazy(() => import('./components/AnimatedBackground'))
```

---

## Font Loading

```html
<!-- index.html — preconnect before font load -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```

In `tailwind.config.ts`:
```ts
theme: {
  extend: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
},
```

---

## Audit Checklist (used by /web-review Section D)

```
Performance checklist:
[ ] vite.config.ts has manualChunks with vendor splitting
[ ] All route components use React.lazy + Suspense
[ ] No useEffect data fetching — TanStack Query used instead
[ ] All images have alt, loading="lazy", explicit width+height
[ ] Hero image uses loading="eager"
[ ] vercel.json exists at project root with SPA rewrites
[ ] npm run build succeeds with no TypeScript errors
[ ] No chunk exceeds 250KB gzipped
[ ] Framer Motion animations use viewport={{ once: true }}
[ ] AnimatedBackground component is lazy loaded if it uses canvas/WebGL
[ ] VITE_* env vars set in Vercel — not just .env.local
```
