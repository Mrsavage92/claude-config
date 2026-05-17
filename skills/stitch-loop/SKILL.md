---
name: stitch-loop
description: >
  Autonomous frontend builder using Stitch's iterative baton-passing loop pattern.
  Reads the current task from .stitch/next-prompt.md, generates a page via Stitch MCP,
  integrates it into the site, then writes the next task to keep the loop alive.
  Use for multi-page site generation from a single starting prompt.
allowed-tools:
  - "stitch*:*"
  - "chrome*:*"
  - "Read"
  - "Write"
  - "Bash"
---

# Skill: /stitch-loop

You are an **autonomous frontend builder** using Stitch's iterative baton-passing loop.

---

## Overview

Each iteration:
1. Reads the current task from `.stitch/next-prompt.md`
2. Generates a page using Stitch MCP tools
3. Integrates the page into the site structure
4. Writes the next task to `.stitch/next-prompt.md` to keep the loop alive

---

## Prerequisites

- Access to the Stitch MCP Server
- A Stitch project (existing or will be created)
- `.stitch/DESIGN.md` — generate using `/stitch-design` if needed
- `.stitch/SITE.md` — documents site vision, sitemap, and roadmap

---

## The Baton System

`.stitch/next-prompt.md` relays instructions between iterations:

```markdown
---
page: about
---
A page describing how the product works.

**DESIGN SYSTEM (REQUIRED):**
[Copy Section 6 from .stitch/DESIGN.md]

**Page Structure:**
1. Header with navigation
2. Explanation of core methodology
3. Footer with links
```

**Critical rules:**
- `page` frontmatter field determines the output filename
- Prompt MUST include the design system block from `.stitch/DESIGN.md`
- You MUST update this file before completing — this keeps the loop alive

---

## Execution Protocol

### Step 1: Read the Baton

Parse `.stitch/next-prompt.md`:
- **Page name** from `page` frontmatter
- **Prompt content** from markdown body

### Step 2: Consult Context Files

| File | Purpose |
|------|---------|
| `.stitch/SITE.md` | Site vision, Stitch Project ID, existing pages (sitemap), roadmap |
| `.stitch/DESIGN.md` | Required visual style block for Stitch prompts |

Check Section 4 (Sitemap) — do NOT recreate pages that already exist.

### Step 3: Generate with Stitch

1. Run `list_tools` to find the Stitch MCP prefix
2. Get or create project:
   - If `.stitch/metadata.json` exists → use `projectId` from it
   - Otherwise → call `[prefix]:create_project`, then `[prefix]:get_project`, save to `.stitch/metadata.json`
3. Call `[prefix]:generate_screen_from_text` with `projectId`, full prompt, and `deviceType: DESKTOP`
4. After generation, call `[prefix]:get_project` and update `screens` map in `.stitch/metadata.json`
5. Download assets:
   - Check if `.stitch/designs/{page}.html` and `.stitch/designs/{page}.png` already exist
   - If they exist: ask user whether to refresh or reuse
   - If not: download `htmlCode.downloadUrl` → `.stitch/designs/{page}.html` and `screenshot.downloadUrl` (append `=w{width}`) → `.stitch/designs/{page}.png`

### Step 4: Integrate into Site

1. Move `.stitch/designs/{page}.html` → `site/public/{page}.html`
2. Fix asset paths to be relative to public folder
3. Wire navigation: replace placeholder `href="#"` links with actual page paths
4. Add new page to global navigation if appropriate

### Step 4.5: Visual Verification (Optional)

If Chrome DevTools MCP is available:
1. Start dev server: `npx serve site/public`
2. Navigate to page via `[chrome_prefix]:navigate`
3. Capture screenshot via `[chrome_prefix]:screenshot`
4. Compare against `.stitch/designs/{page}.png`
5. Stop server

### Step 5: Update Site Documentation

Modify `.stitch/SITE.md`:
- Mark new page complete in Section 4 (Sitemap) with `[x]`
- Remove consumed idea from Section 6 (Creative Freedom)
- Update Section 5 (Roadmap) if backlog item completed

### Step 6: Prepare the Next Baton (Critical)

Decide next page from Section 5 (Roadmap), Section 6 (Creative Freedom), or invent one that fits the site vision. Write `.stitch/next-prompt.md` with proper YAML frontmatter.

---

## File Structure

```
project/
├── .stitch/
│   ├── metadata.json      # Stitch project & screen IDs (persist this!)
│   ├── DESIGN.md          # Visual design system
│   ├── SITE.md            # Site vision, sitemap, roadmap
│   ├── next-prompt.md     # The baton — current task
│   └── designs/           # Staging area for Stitch output
│       ├── {page}.html
│       └── {page}.png
└── site/public/           # Production pages
    ├── index.html
    └── {page}.html
```

### `.stitch/metadata.json` Schema

```json
{
  "name": "projects/{id}",
  "projectId": "{id}",
  "title": "My App",
  "visibility": "PRIVATE",
  "projectType": "PROJECT_DESIGN",
  "deviceType": "DESKTOP",
  "designTheme": {
    "colorMode": "DARK",
    "font": "INTER",
    "roundness": "ROUND_EIGHT",
    "customColor": "#40baf7",
    "saturation": 3
  },
  "screens": {
    "index": {
      "id": "screen-id",
      "sourceScreen": "projects/{id}/screens/{screen-id}",
      "x": 0, "y": 0,
      "width": 1440, "height": 900
    }
  }
}
```

---

## Common Pitfalls

- Forgetting to update `.stitch/next-prompt.md` — breaks the loop
- Recreating a page already in the sitemap
- Not including the design system block in the prompt
- Leaving placeholder `href="#"` links unwired
- Forgetting to persist `.stitch/metadata.json`

---

## Related Skills

- `/stitch-design` — aesthetic exploration and design system setup
- `/enhance-prompt` — polishes prompts before generation
- `/remotion` — generate walkthrough videos from produced screens
