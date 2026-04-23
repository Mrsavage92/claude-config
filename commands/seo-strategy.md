---
name: seo-strategy
description: Two-mode SEO skill — Mode 1 optimises a single article with competitor research and semantic rewrite, Mode 2 runs a site-wide audit across up to 10 pages with architecture review and prioritised action plan. Both output interactive HTML reports.
---

Run SEO analysis using the seo-strategy skill at ~/.claude/skills/claude-skills/marketing-skill/seo-strategy/SKILL.md.

**Mode 1** (single page): triggered by "optimize this article", "SEO this", "SEO optimise this page"
**Mode 2** (site audit): triggered by "audit my site", "full SEO audit", "website SEO review"

Detect which mode the user wants from their request and proceed accordingly.

## Quick Start

**Mode 1 — Optimise an article:**
```
/seo-strategy optimize this article: [paste URL or content]
```

**Mode 2 — Audit a site:**
```
/seo-strategy audit my site https://example.com
```

## Mode 1 Output

Interactive HTML report with:
- SEO score before and after (score rings)
- Fully optimised article rewrite
- Semantic keyword analysis (topical depth)
- Competitor gap analysis
- Title, meta, H-structure optimisation

## Mode 2 Output

Interactive HTML report with:
- Per-page health scores across up to 10 pages
- Keyword cannibalization detection
- Topic cluster map with internal linking gaps
- Technical SEO checklist (Core Web Vitals, schema, canonical, etc.)
- Prioritised action plan sorted by effort/impact ratio

## Pipeline

SEO Strategy is Step 4 of the content pipeline:
1. /scroll-stop-prompt — generate product content prompts
2. Create images/video with AI tools
3. /scroll-stop-build — build scroll-driven website
4. **seo-strategy** ← you are here — optimise for search

## Related Skills

- /scroll-stop-prompt
- /scroll-stop-build
