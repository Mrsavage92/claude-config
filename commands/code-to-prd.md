---
name: code-to-prd
description: "Reverse-engineer a frontend or full-stack codebase into a structured PRD. Use when you need to document existing functionality, hand off a project, or derive product requirements from source code."
---

# /code-to-prd

Reverse-engineer a frontend codebase into a complete Product Requirements Document.

## Quick Start

```bash
/code-to-prd                    # Analyze current project
/code-to-prd ./src              # Analyze specific directory
/code-to-prd /path/to/project   # Analyze external project
```

## What It Does

1. **Scan** — Detect framework, routes, APIs, enums, and project structure
2. **Scaffold** — Create `prd/` directory with README.md, per-page stubs, and appendix files
3. **Analyze** — Walk through each page: fields, interactions, API dependencies, page relationships
4. **Generate** — Produce the final PRD with all pages, enum dictionary, API inventory, and page relationship map

## Steps

### Step 1: Analyze

Determine the project path (default: current directory). Run the frontend analyzer if available:

```bash
# Optional: if script is available
python3 {skill_path}/scripts/codebase_analyzer.py {project_path} -o .code-to-prd-analysis.json
```

**Fallback (no script):** Manually inspect the project — read `package.json`, scan route files, identify page components, list API calls from `fetch`/`axios` usage, and catalogue enums/constants. Display a summary: framework, page count, API count, enum count.

### Step 2: Scaffold

Generate the PRD directory skeleton:

```bash
# Optional: if script is available
python3 {skill_path}/scripts/prd_scaffolder.py .code-to-prd-analysis.json -o prd/
```

**Fallback (no script):** Manually create `prd/README.md`, `prd/pages/`, and `prd/appendix/` with stub files based on the Step 1 inventory.

### Step 3: Fill

For each page in the inventory, follow the SKILL.md Phase 2 workflow:
- Read the page's component files
- Document fields, interactions, API dependencies, page relationships
- Fill in the corresponding `prd/pages/` stub

Work in batches of 3-5 pages for large projects (>15 pages). Ask the user to confirm after each batch.

### Step 4: Finalize

Complete the appendix files:
- `prd/appendix/enum-dictionary.md` — all enums and status codes found
- `prd/appendix/api-inventory.md` — consolidated API reference
- `prd/appendix/page-relationships.md` — navigation and data coupling map

Clean up the temporary analysis file if created:
```bash
rm .code-to-prd-analysis.json
```

## Output

A `prd/` directory containing:
- `README.md` — system overview, module map, page inventory
- `pages/*.md` — one file per page with fields, interactions, APIs
- `appendix/*.md` — enum dictionary, API inventory, page relationships

## Skill Reference

- `product-team/code-to-prd/SKILL.md`
- `product-team/code-to-prd/scripts/codebase_analyzer.py` (optional)
- `product-team/code-to-prd/scripts/prd_scaffolder.py` (optional)
- `product-team/code-to-prd/references/prd-quality-checklist.md`

## Related Skills

- `/prd` — Write a PRD from scratch for a new feature or initiative
- `/user-story` — Break PRD pages into sprint-ready user stories
- `/rice` — Prioritize features discovered during the reverse-engineering pass
