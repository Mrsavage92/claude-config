# ARIA-State Replacement Checklist

When `/animate` removes or replaces a motion-based visual state indicator (a sweeping `layoutId`, a `motion.span` background fill, a position-driven highlight), the new static-or-reduced presentation MUST include an ARIA equivalent so screen-reader users still receive the state change.

Source: WCAG 2.2 SC 1.3.1 (Info & Relationships) + 4.1.2 (Name, Role, Value); Sara Soueidan inclusive-animations guidance.

This file exists because Phase 2 of the /animate forge surfaced a real gap: removing the motion.span fill from a billing toggle left zero state-change signal for AT users.

---

## The rule

For every proposal that REMOVES or REPLACES a motion element AND that element was the visual indicator of a state, the proposed code MUST add the ARIA attribute that announces the same state change.

Audit every removal proposal against this table.

| Removed motion pattern | What it was indicating | Required ARIA replacement |
|---|---|---|
| `<motion.div layoutId="active-tab">` sweeping under the active tab | Which tab is active | `aria-current="page"` (or `aria-selected="true"`) on the active `<button>`/`<a>` |
| `<motion.span layoutId="pricing-switch">` filling under monthly/annual button | Which billing mode is selected | `aria-pressed={billing === 'monthly'}` on each toggle button (or `role="switch"` + `aria-checked`) |
| `<motion.div animate={{ height: 'auto' }}>` expanding panel | Whether section is expanded | `aria-expanded={open}` on the trigger + `id` + `aria-controls` linking |
| `<motion.div initial={{ opacity: 0 }}>` → render-time conditional | Whether modal is open | `role="dialog"` + `aria-modal="true"` + focus management (focus moved to dialog on open) |
| `<motion.div>` count-up via NumberTicker | Final value | `aria-label={finalValue}` on parent; `aria-hidden` on the animated span |
| `<motion.button whileHover={{ scale: 1.05 }}>` hover lift | Hover affordance | None needed if visual hover state remains (border-color, shadow) and focus-visible ring is present |
| `<motion.div animate={{ rotate: 180 }}>` chevron flip | Whether dropdown is open | `aria-expanded={open}` on the trigger button |
| `<motion.li animate={{ x: 0 }}>` slide-in checkmark | Item marked done | Either keep visible icon with `aria-label="Completed"` OR use `<li aria-current="false" data-state="done">` pattern; the textual cue must persist |
| `<motion.div className="sweep-progress">` progress bar fill | Progress amount | `role="progressbar"` + `aria-valuenow={pct}` + `aria-valuemin={0}` + `aria-valuemax={100}` |
| `<motion.span animate={{ opacity }}>` showing/hiding | State on/off | `aria-hidden={!isVisible}` (and remove from tab order) |

---

## Two-step proposal pattern

Whenever you write a removal proposal:

1. **Step A — removal**: state which motion element comes out
2. **Step B — replacement**: state the ARIA attribute that goes in

Format inside the artifact:

```markdown
#### Proposal N — Replace pricing-switch layoutId with CSS bg-primary

**File**: src/components/PricingCards.tsx
**Type**: Tier 2 → Tier 1 (motion removal)

**Before**:
```tsx
<button onClick={() => setBilling('monthly')}>
  Monthly
  {billing === 'monthly' && <motion.span layoutId="pricing-switch" .../>}
</button>
```

**After**:
```tsx
<button
  onClick={() => setBilling('monthly')}
  aria-pressed={billing === 'monthly'}
  className={billing === 'monthly' ? 'bg-primary text-primary-foreground' : 'bg-transparent text-foreground/60'}
>
  Monthly
</button>
```

**A11y**: Removed motion.span (visual fill) replaced with `aria-pressed` on each button + CSS class switch. Screen reader announces "Monthly button, pressed" when active. Reduced-motion behaviour: CSS class change is instantaneous (or `transition: background-color 150ms` — both meet WCAG 2.3.3).

**Floor compliance**: Floor 1 (WCAG 2.3.3 — no animation, so no disable path needed); Floor 2 (substitute, don't strip — replaced spring fill with discrete-state CSS).
```

---

## What this prevents

- Removing layoutId without aria-pressed → toggle becomes invisible to AT users
- Replacing motion expand with CSS height transition without aria-expanded → screen reader doesn't announce open/closed
- Stripping NumberTicker animation without setting aria-label on parent → screen reader reads "1, 2, 47, 123, 1234..." as the number counts up

---

## When NO ARIA replacement is needed

- Motion was purely decorative (background blob, particle field, hero-only flourish) — no state communicated
- Motion was redundant with existing text content ("Step 1 of 4" already shown — animated progress bar is decoration)
- Hover-only motion that survives reduced-motion via a static fallback (border colour, focus ring)

In these cases, the artifact must explicitly note: "No ARIA replacement needed — this motion communicated no state."
