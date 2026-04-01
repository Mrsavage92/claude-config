---
Name: scroll-stop-prompter
Description: Generates three coordinated AI image/video prompts — hero product shot, exploded view, and cinematic transition — delivered via a styled HTML page with copy buttons and confetti.
Category: marketing-skill
Tier: 2
Author: Claude Skills
Version: 1.0.0
Dependencies: []
Trigger: "scroll-stop prompt", "deconstruction prompt", "exploded view prompt", "product animation prompt", "antigravity prompt"
---

# Scroll-Stop Prompter

## Description

Generates three coordinated AI prompts for creating viral scroll-stopping product content:
1. **Hero shot** — premium cinematic product image prompt
2. **Exploded/deconstructed view** — components suspended in antigravity
3. **Video transition** — cinematic motion between hero and exploded states

Works with any image generator (Midjourney, DALL-E, Flux, Ideogram) and any video model (Runway, Kling, Pika, Higgsfield, Google Flow). Delivers all three prompts in a styled HTML page with one-click copy buttons and confetti celebration.

## Features

- Three coordinated prompts that work together as a visual suite
- Cinematic/emotional language for premium brand feel
- Energy effect concept for video transition prompts
- 9:16 default for social (vertical), 16:9 option for web
- HTML delivery page with copy buttons and confetti
- Works with any AI image/video tool

## Usage

Trigger with: "scroll-stop prompt", "deconstruction prompt", "exploded view prompt", "product animation prompt", or "antigravity prompt"

I will ask 3 quick questions:
1. What is the product? (name + brief description)
2. What is the brand aesthetic? (e.g. premium dark, clean minimal, warm organic)
3. What aspect ratio? (9:16 social / 16:9 web, default: 9:16)

Then I generate all three prompts and deliver them in an HTML page.

## Examples

```
User: scroll-stop prompt for my new skincare serum
Claude: [asks 3 questions, generates prompts, outputs HTML page]

User: exploded view prompt for our wireless earbuds
Claude: [asks 3 questions, generates prompts, outputs HTML page]
```

## Workflow

### Step 1 — Gather Product Info

Ask these 3 questions (and only these 3):
1. **Product**: What is the product? Give me the name and a one-line description.
2. **Aesthetic**: What's the brand aesthetic? (e.g. premium dark luxury, clean Scandinavian minimal, warm earthy organic, bold neon streetwear)
3. **Aspect ratio**: 9:16 (social/vertical) or 16:9 (web/horizontal)? Default: 9:16

### Step 2 — Generate Three Prompts

**PROMPT 1 — Hero Product Shot**
Create a premium still image prompt with:
- Cinematic studio lighting (specify type: softbox, rim light, backlit glow, etc.)
- Background that matches the aesthetic (dark gradient, marble, natural texture, etc.)
- Product placement and angle (hero angle, slight 3/4 turn, flat lay, etc.)
- Mood and atmosphere words (ethereal, confident, aspirational, powerful)
- Technical specs: high resolution, sharp focus, commercial photography style
- Aspect ratio as specified

**PROMPT 2 — Exploded/Deconstructed View**
Create an antigravity components prompt with:
- All key product components floating/suspended in space
- Distance between components (tight orbit, wide spread, layered depth)
- Lighting that reveals material quality (specular highlights, translucency, texture)
- Background that contrasts with components (deep space, clean white, gradient fog)
- Energy effect: subtle particle trails, light streaks, or magnetic field lines connecting parts
- Same aesthetic and aspect ratio as Prompt 1

**PROMPT 3 — Cinematic Video Transition**
Create a video model prompt describing motion from hero → exploded state:
- Opening frame: hero product shot (match Prompt 1 exactly)
- Motion sequence: camera pulls back as components begin separating
- Energy moment: the "burst point" where product disassembles (specify: implosion, magnetic repulsion, time-rewind)
- Climax: full exploded view floating (match Prompt 2)
- Duration guidance: 3-5 seconds
- Motion style: smooth deceleration (ease-out), no hard cuts
- Audio note: suggest sound design concept (whoosh + impact, electronic hum, silence for drama)

### Step 3 — Deliver HTML Page

Output a complete, self-contained HTML file to the appropriate path:
- Claude.ai / cloud environment: `/mnt/user-data/outputs/scroll-stop-prompts-[product-name].html`
- Local: `./scroll-stop-prompts-[product-name].html`

The HTML page must include:

**Design**:
- Dark background (#0a0a0f)
- Glass-morphism cards (rgba white overlay + backdrop blur)
- Space Grotesk font for headings, Inter for body (Google Fonts CDN)
- Accent color: electric purple (#7c3aed) with gradient to cyan (#06b6d4)
- Animated starscape background (canvas, 150 stars, slow drift)

**Layout**:
- Header: "Scroll-Stop Prompt Suite" with product name subtitle
- Three cards, one per prompt, each labeled with icon + title
- Each card has the full prompt text in a monospace code block
- Large COPY button per card (clipboard API, button text changes to ✓ Copied!)
- Footer with pipeline note: "Step 1 of 3 → Create images → Step 2: scroll-stop build"

**Confetti**:
- On page load after 500ms: 80 confetti particles
- Colors: purple, cyan, white, gold
- Physics: gravity + gentle horizontal drift, 2s duration
- Vanilla JS only (no external libraries)

**Copy functionality**:
```javascript
async function copyPrompt(id) {
  const text = document.getElementById(id).innerText;
  await navigator.clipboard.writeText(text);
  const btn = document.querySelector(`[data-target="${id}"]`);
  btn.textContent = '✓ Copied!';
  setTimeout(() => btn.textContent = 'Copy Prompt', 2000);
}
```

Output the complete HTML as a code block first, then save to file.
