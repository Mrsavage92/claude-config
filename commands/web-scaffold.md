# /web-scaffold

Bootstrap a production-ready React web application with enterprise-quality design from the ground up.

## When to Use
- Starting a new web project, SaaS, landing page, or dashboard
- User provides a project description, name, or brief

---

## Process

### Step 1 — Read the Design DNA
Read `~/.claude/web-system-prompt.md` in full before writing a single file.

### Step 2 — Design Brief
Ask these questions all at once. If the user says "just build it" — make all decisions yourself using the Design DNA and skip to Step 3.

1. **Product:** What does it do and who is it for?
2. **Tone:** Bold/Confident | Calm/Trustworthy | Playful/Modern | Premium/Exclusive | Technical/Developer
3. **Pages for V1:** e.g. Landing, Dashboard, Auth, Pricing, Settings
4. **Color direction:** Brand colors to use, or should you choose? Dark-first or light-first?
5. **Backend needed?** Connect existing Supabase project / create new / skip for now

### Step 3 — Design System (before any component code)

Decide and document:
- **Signature color:** one distinctive HSL hue that defines this product
- **Tone-appropriate font:** pick from the Typography section in web-system-prompt.md
- **Mode:** dark-first or light-first
- **Border radius:** sharp (0.25rem) | standard (0.5rem) | rounded (0.75rem)

### Step 4 — Generate All Files

Generate every file below. Do not skip any.

#### `package.json`
```json
{
  "name": "project-name",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "serve": "serve -s dist -l 3000"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.0",
    "framer-motion": "^11.3.0",
    "lucide-react": "^0.453.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7",
    "@radix-ui/react-slot": "^1.1.0"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "vite": "^5.4.1",
    "@vitejs/plugin-react": "^4.3.1",
    "tailwindcss": "^3.4.11",
    "postcss": "^8.4.47",
    "autoprefixer": "^10.4.20",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "serve": "^14.2.3"
  }
}
```

Add these only if backend is needed:
```json
"@supabase/supabase-js": "^2.45.0",
"@tanstack/react-query": "^5.56.0",
"@tanstack/react-query-devtools": "^5.56.0"
```

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

#### `tsconfig.node.json`
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

#### `vite.config.ts`
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

#### `postcss.config.js`
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

#### `tailwind.config.ts`
```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['YOUR_FONT', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['clamp(2.5rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'hero': ['clamp(1.875rem, 3.5vw, 3rem)', { lineHeight: '1.15', letterSpacing: '-0.015em' }],
        'title': ['clamp(1.5rem, 2.5vw, 2rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        brand: {
          DEFAULT: 'hsl(var(--brand))',
          foreground: 'hsl(var(--brand-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'gradient-shift': 'gradient-shift 4s ease infinite',
        'fade-up': 'fade-up 0.5s ease forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}

export default config
```

#### `src/styles/index.css`
Use the complete token set from web-system-prompt.md. Customise `--brand`, `--primary`, and `--radius` for this project's signature color and chosen border radius. Import the project font via Google Fonts @import at the top. Apply grain texture utility class if dark-first.

#### `src/lib/utils.ts`
```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

#### `src/lib/query-client.ts` (only if backend needed)
```ts
import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: 1,
    },
  },
})
```

#### `src/hooks/use-theme.ts`
```ts
import { useEffect, useState } from 'react'

type Theme = 'dark' | 'light' | 'system'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem('theme') as Theme) || 'system'
  )

  useEffect(() => {
    const root = window.document.documentElement
    const isDark =
      theme === 'dark' ||
      (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)

    root.classList.toggle('dark', isDark)
    localStorage.setItem('theme', theme)
  }, [theme])

  return { theme, setTheme }
}
```

#### `src/components/layout/Header.tsx`
Responsive navigation with:
- Logo / brand name on left
- Nav links in centre (desktop only)
- CTA button + theme toggle on right
- Mobile hamburger menu using shadcn Sheet
- Scroll-triggered: `bg-background/80 backdrop-blur-md border-b border-border/50` appears after 50px scroll (transparent above)
- Active link state using `useLocation()` from react-router-dom

#### `src/components/sections/Hero.tsx`
The most important file. Apply the First Render Principle from web-system-prompt.md:
- Choose a background from Visual Signature Elements (gradient mesh recommended for most, grid lines for SaaS/developer)
- Display-size headline with `text-balance` and the animated gradient text class for emphasis
- Supporting visual (mock product screenshot using shadcn Card, or gradient placeholder)
- One primary CTA button (brand color) + one secondary (outline)
- Framer Motion entrance: stagger the headline, subheadline, and CTA with 0.1s delays
- If dark-first: apply grain texture

#### `src/pages/Index.tsx`
Compose Hero + 3 section stubs below the fold:
- Features section (placeholder with 3 cards)
- Social proof / logos section
- CTA section
Use `React.lazy` + `Suspense` for all below-fold sections.

#### `src/App.tsx`
```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { QueryClientProvider } from '@tanstack/react-query' // only if backend
import { queryClient } from '@/lib/query-client' // only if backend
import { useTheme } from '@/hooks/use-theme'

const Index = lazy(() => import('@/pages/Index'))

function AppContent() {
  useTheme() // initialises dark/light class on mount
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Suspense><Index /></Suspense>} />
      </Routes>
    </BrowserRouter>
  )
}

export default function App() {
  // Wrap with QueryClientProvider only if backend is needed
  return <AppContent />
}
```

#### `index.html`
```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="[Project description]" />
    <meta property="og:title" content="[Project name]" />
    <meta property="og:description" content="[Project description]" />
    <meta property="og:image" content="/og-image.png" />
    <title>[Project name]</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

#### `src/main.tsx`
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

#### `CLAUDE.md` (project root — critical for future sessions)
```markdown
# [Project Name] — Claude Context

## Stack
React 18 + Vite + TypeScript + Tailwind CSS v3 + shadcn/ui + Framer Motion
Backend: [Supabase / none]

## Design System
- Design DNA: read ~/.claude/web-system-prompt.md before any UI work
- Signature color: [brand HSL value]
- Font: [chosen font]
- Mode: [dark-first / light-first]
- Border radius: [value]

## Key Files
- Design tokens: src/styles/index.css
- Tailwind config: tailwind.config.ts
- Supabase client: src/lib/supabase.ts (if applicable)
- Types: src/types/database.types.ts (if applicable)

## Conventions
- Named exports only — no default exports for components
- Max 150 lines per component file
- All colors via CSS variables — never hardcoded hex/rgb
- Semantic Tailwind tokens only (text-foreground, not text-black)
- Framer Motion scroll animations on all major sections

## shadcn/ui
Components are in src/components/ui/ — never edit these directly.
To add: npx shadcn@latest add [component-name]
```

#### `.env.example`
```
# Add any non-Supabase env vars here
# Supabase URL and anon key are hardcoded in src/lib/supabase.ts (safe — anon key is public)
```

### Step 5 — shadcn Init Instructions
Provide as a single copy-paste block:
```bash
npm install && npx shadcn@latest init && npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs
```

### Step 6 — Supabase (if needed)
Use Supabase MCP to get project URL and anon key. Write `src/lib/supabase.ts` with hardcoded values. Create initial schema if described. See `/web-supabase` for full backend setup.

### Step 7 — Output Summary
```
Project scaffolded: [name]
Stack: React 18 + Vite + TypeScript + Tailwind + shadcn/ui + Framer Motion
Design: [tone] | [signature color] | [font] | [dark/light]-first
Pages planned: [list]
Backend: [Supabase / none]

Next:
  npm install
  npx shadcn@latest init
  npx shadcn@latest add button input label card dialog dropdown-menu sheet toast sonner separator badge skeleton avatar tabs
  npm run dev

Continue with:
  /web-page     — build full pages
  /web-component — add individual components
  /web-supabase  — add backend features
```

---

## Rules
- Design system first — index.css and tailwind.config.ts before any component
- All 15 files generated — do not skip tsconfig.json, postcss.config.js, CLAUDE.md
- Hero section is the most important file — spend the most effort here
- CLAUDE.md must be written to the project root so future sessions have context
- Supabase and TanStack Query only added to package.json if backend is needed
