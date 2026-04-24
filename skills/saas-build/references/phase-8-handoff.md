### Phase 8 — Handoff

**8a. Domain availability check (GoDaddy MCP)**

Infer the desired domain from the product name in SCOPE.md. Check both .com.au and .com variants:
```
mcp__claude_ai_GoDaddy__domains_check_availability({ domain: "[product-slug].com.au" })
mcp__claude_ai_GoDaddy__domains_check_availability({ domain: "[product-slug].com" })
```

If available: log to BUILD-LOG.md: "Domain [name] is available — purchase at godaddy.com/domainsearch/find?domainToCheck=[name] then point DNS A record to Vercel IP: 76.76.21.21"

If not available: call `mcp__claude_ai_GoDaddy__domains_suggest({ query: "[product-slug]", country: "AU", limit: 5 })` and log the top 3 available alternatives to BUILD-LOG.md.

If GoDaddy MCP is unavailable: log to BUILD-LOG.md: "Domain check skipped - GoDaddy MCP unavailable. Check [product-slug].com.au and [product-slug].com manually at godaddy.com" and proceed to Phase 8b.

**8b. Write final BUILD-LOG.md entry:**

```markdown
## Build Complete — [timestamp]

**Product:** [name]
**URL:** [production Vercel URL]
**Score:** [web-review score]/40

### Domain
- [product-slug].com.au — [AVAILABLE / NOT AVAILABLE]
- [product-slug].com — [AVAILABLE / NOT AVAILABLE]
- Purchase link: godaddy.com/domainsearch/find?domainToCheck=[product-slug].com.au
- After purchase: point DNS A record → 76.76.21.21, add domain in Vercel dashboard

### What was built
[list of all pages]

### Remaining human actions required
- [ ] Purchase domain (link above) and point DNS to Vercel
- [ ] Switch Stripe to live mode: stripe.com/dashboard → Products → copy live price IDs → update Vercel env vars
- [ ] [any other NEEDS_HUMAN items from this build]

### Architecture notes
[anything non-obvious about the build that future sessions should know]
```

**8c. Generate launch plan via `/launch-strategy`.**

Run `/launch-strategy` to produce `LAUNCH-PLAN.md` in the project root. This covers sequenced go-live across Product Hunt, press, social, email, and community channels with timing recommendations. The launch plan is part of the build deliverable — shipping without it leaves the user with no structured path to first customers.

Input to provide: product name, production URL, target audience (from SCOPE.md), primary acquisition channel (from validator file strategic spine), and any pre-committed buyers.

If `/launch-strategy` is unavailable: log NEEDS_HUMAN "Run /launch-strategy to generate LAUNCH-PLAN.md before going live" and proceed.

**8d. Push build summary to Notion via `/project-refresh` PUSH mode.**
Updates the project's Notion master doc with deploy URL, review score, launch plan link, and remaining human actions — required for cross-session context.

---
