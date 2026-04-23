# /web-fix

Apply a targeted, minimal fix to a UI bug, layout issue, or broken interaction. Never rewrites full files.

## When to Use
- Something looks wrong visually (spacing, alignment, color, sizing)
- A component is broken or behaving unexpectedly
- A layout is not responsive at a certain breakpoint
- An animation is not triggering or is janky
- A form, button, or interaction is not working

## Critical Rule
**This skill never rewrites full files.** It reads the exact problem area, applies the minimum diff needed, and stops. This is the direct replacement for Lovable's expensive debug loop.

## Process

### Step 1 — Diagnose Before Touching Code

Ask or infer:
1. What exactly is wrong? (visual / functional / performance)
2. Which file and component is affected?
3. Is there a browser console error?

Read the specific component file. Read only what is needed — do not read the entire codebase.

### Step 2 — Root Cause First

Identify the root cause before writing any fix:
- **Visual issue** → check CSS variables, Tailwind classes, responsive breakpoints
- **Layout broken** → check flex/grid parent, missing container, overflow hidden cutting content
- **Dark mode wrong** → check `.dark:` variants, CSS variable values in dark scope
- **Animation not firing** → check `whileInView` viewport settings, `once: true`, z-index stacking
- **Form not working** → check React Hook Form setup, Supabase call, error handling
- **Console error** → read error, trace to exact line, fix that line

### Step 3 — Apply Minimal Fix

Rules:
- Edit only the lines that need changing — use Edit tool, not Write
- If the fix requires a new CSS variable, add it to `index.css` only
- If a new Tailwind class is needed, add to the component only
- If a new shadcn component is needed, install it: `npx shadcn@latest add [name]`
- Never delete existing working code to "clean up" while fixing

### Step 4 — Verify the Fix
After applying, mentally trace through:
- Does it fix the reported issue?
- Does it break anything adjacent?
- Does it work in both light and dark mode?
- Does it work at 375px mobile width?

### Step 5 — Output
State in one sentence what was wrong and what was changed. No summary paragraphs.

Example: `Fixed: Hero gradient not showing in dark mode — added dark: variant for --background gradient in index.css line 47.`

## Common Fix Patterns

### Spacing/alignment off
```tsx
// Wrong: magic number
<div className="mt-[13px]">

// Right: use scale
<div className="mt-3">
```

### Color not following design system
```tsx
// Wrong
<p className="text-gray-500">

// Right
<p className="text-muted-foreground">
```

### Responsive layout broken on mobile
```tsx
// Wrong: desktop-only flex
<div className="flex gap-8">

// Right: stack on mobile
<div className="flex flex-col gap-4 md:flex-row md:gap-8">
```

### Animation not triggering
```tsx
// Wrong: only triggers once on mount
<motion.div animate={...}>

// Right: triggers on scroll into view
<motion.div
  variants={fadeUp}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, margin: "-50px" }}
>
```

### Dark mode text invisible
```tsx
// Wrong: hardcoded
<p className="text-black">

// Right: semantic token
<p className="text-foreground">
```

### Card border not visible in dark mode
```css
/* Add to index.css .dark */
--border: 240 3.7% 25%;
```
