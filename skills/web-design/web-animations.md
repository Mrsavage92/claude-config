# Skill: Web Animations

## Purpose
Add premium motion to React/Vite/Tailwind sites. 4 techniques with copy-paste prompts.

## Technique 1 — Lottie (Animated Illustrations)
npm install lottie-react
import Lottie from 'lottie-react'
<Lottie animationData={data} loop={true} style={{ width: 400 }} />
Source: lottiefiles.com (Adam has GitHub-connected account)

## Technique 2 — Autoplay Video Hero
<video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
  <source src="/hero.mp4" type="video/mp4" />
</video>
Layouts: BACKGROUND (full hero + dark overlay) | SIDE | INLINE (card frame)
Format: MP4 H.264, under 5MB

## Technique 3 — Framer Motion
npm install framer-motion
Scroll entrance: whileInView, once: true, viewport margin -50px
Stagger pattern: container/item variants, staggerChildren: 0.1
Hover buttons: whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
Hover cards: whileHover={{ y: -4, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}

## Technique 4 — 21st.dev Animated Backgrounds
Source: 21st.dev → Backgrounds → Copy Prompt

When 21st.dev prompt is pasted (format: shadcn + Tailwind + TS + component.tsx + demo.tsx):
1. Create /components/ui if missing
2. Save to /components/ui/[name].tsx
3. Install deps from imports
4. Ensure lib/utils.ts has cn() helper
5. Wire using demo.tsx
6. Customize: opacity 0.2, z-index -1, fixed full viewport, will-change: transform

## Recommended Stack Order
1. Background (Technique 4)
2. Hero visual (Technique 2 or Lottie)
3. Scroll entrance (Technique 3)
4. Micro-interactions (hover)

## Performance
- Lottie: under 200KB, prefer Optimized dotLottie
- Video: compress first, under 5MB
- Framer: import only what you use
- Backgrounds: test mobile fps, disable on prefers-reduced-motion
