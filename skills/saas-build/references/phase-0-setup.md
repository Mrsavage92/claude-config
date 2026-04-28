### Phase 0 — Product Validation Gate + GitHub Repo + Notion Doc (fresh builds only)

**For fresh builds (no BUILD-LOG.md), do this before Phase 0.25. For resuming builds, verify these exist and skip if already done.**

**Step 0 — Product Validation Gate (MANDATORY for fresh builds):**

Before creating a repo or writing any code, check if `/product-validator` has already run:

```bash
ls ~/Documents/Claude/outputs/product-validation-*.md 2>/dev/null
```

Look for a file matching this product's slug. Read it and check the verdict:
- If **BUILD** verdict exists → proceed to Step A
- If **KILL** verdict exists → STOP. Tell the user the idea was already killed and why. Do not proceed.
- If **no file exists** → STOP. Run `/product-validator` first. Do not proceed until a BUILD verdict is saved.

This gate exists because FlipTracker wasted multiple sessions building something Google Sheets already does. Every product must prove it's worth building before a single line of code is written.

**Step A — Create GitHub repo:**

Check if a repo exists for this product:
```
mcp__github__search_repositories({ query: "[product-slug] user:Mrsavage92" })
```

If no repo found: create it using the MCP tool (preferred) with fallback to GitHub API:

**Method 1 — GitHub MCP (preferred):**
```
mcp__github__create_repository({ name: "[product-slug]", description: "[product name]", private: true, autoInit: false })
```

**Method 2 — GitHub API via curl (fallback if MCP unavailable):**
```bash
TOKEN=$(git credential fill <<< 'protocol=https
host=github.com' 2>/dev/null | grep password | cut -d= -f2)
# Windows/PowerShell: use the GitHub MCP (mcp__github__create_repository) instead — this curl method is Unix-only
curl -s -X POST -H "Authorization: token $TOKEN" -H "Content-Type: application/json" \
  https://api.github.com/user/repos \
  -d '{"name":"[product-slug]","private":true,"description":"[product name]"}'
```

**Method 3 — gh CLI (final fallback):**
```bash
gh repo create Mrsavage92/[product-slug] --private --source=. --push
```

After creation: set the remote and push immediately:
```bash
git remote add origin https://github.com/Mrsavage92/[product-slug].git 2>/dev/null || git remote set-url origin https://github.com/Mrsavage92/[product-slug].git
git push -u origin main || git push -u origin master
```

**Verify the push succeeded** — if `git push` returns "Repository not found", the repo creation failed. Try the next fallback method. Do NOT continue the build without a working GitHub repo.

In monorepo mode: skip repo creation — the monorepo (`saas-platform` or `au-compliance-platform`) is already the repo. Just verify the `apps/[product-slug]/` directory will be committed there.

Write the repo URL to BUILD-LOG.md and the project memory file as `github_repo`.

**Step B — Create Notion project doc:**

Run `/project-doc` with the product name and brief. This creates the Notion master doc under the Projects hub.

Write the Notion URL to BUILD-LOG.md and the project memory file as `notion_url`.

**Step C — Create project memory file:**

Check if `~/.claude/projects/.../memory/project_[slug].md` exists. If not, create it now:
```markdown
---
name: [Product Name]
description: [one-line product description]
type: project
---

[Product Name] — [brief description]

**Why:** [product rationale]
**How to apply:** Next session = continue from last BUILD-LOG.md phase.

GitHub: [repo URL]
Notion: [notion URL]
Build state: Phase 0 started [date]
```

Add the memory file to MEMORY.md index.

After Steps A-C complete: commit the initial files (BUILD-LOG.md, memory file) and push to GitHub:
```bash
git add BUILD-LOG.md && git commit -m "init: [product-name] saas-build started" && git push origin main
```

Log: "Phase 0 complete — context loaded, repo created, Notion doc created" to BUILD-LOG.md.

---

### Phase Completion Protocol (applies to every phase in this file)

Every time a "Log: Phase X complete" line is reached:
1. Write the log entry to BUILD-LOG.md
2. `git add -A && git commit -m "phase X: [one-line description]" && git push origin main`
3. Run `/project-refresh` PUSH with phase name + what was built + any new NEEDS_HUMAN items

This is not optional. A phase not committed and not in Notion does not exist from the next session's perspective.

In monorepo mode: commit from the monorepo root (`C:/Users/Adam/Documents/au-compliance-platform`), not the app subdirectory.

---
