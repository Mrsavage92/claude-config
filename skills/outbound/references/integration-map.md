# Outbound Pipeline — Integration Map

How the outbound skill connects to Adam's existing marketing, sales, and advisory skill ecosystem.

## Inbound Connections (Skills that FEED Outbound)

### `/persona` → ICP Scorer
When a project has persona definitions from `/persona`, the ICP Scorer uses them to:
- Match lead demographics against persona attributes
- Weight scoring dimensions based on persona pain points
- Identify which persona bucket a lead falls into for message selection

**Usage:** During `/outbound init`, check if persona definitions exist for the project. If yes, import them into the `outbound_projects.icp` config automatically.

### `/market-competitors` → Lead Research Agent
Competitive intelligence from `/market-competitors` feeds the research agent:
- Known competitor products and their weaknesses
- Differentiators to reference in outreach
- Competitor customer signals (G2 reviews, case studies)

**Usage:** If a competitor report exists, the Lead Research agent uses it to enrich `competitors_used` field and identify competitor switch signals.

### `/market-copy` → Message Writer Agent
Copy patterns and brand voice from `/market-copy` inform message writing:
- Proven headline and hook patterns
- Brand voice guidelines (tone, vocabulary)
- Value proposition hierarchy

**Usage:** Message Writer reads brand voice config to maintain consistency between marketing copy and outreach messaging.

### `/market-emails` → Message Writer Agent
Email sequence best practices:
- Subject line patterns that perform well
- Optimal sequence timing
- CTA patterns with highest click rates

**Usage:** Message Writer inherits sequence structure and proven email patterns.

### `/cs-sales-coach` Agent → Reply Handler
Objection handling frameworks:
- BANT-based objection responses
- Industry-specific objection patterns
- Escalation criteria for complex objections

**Usage:** Reply Handler uses the sales-coach agent's objection frameworks for automated responses. Complex objections beyond template capability get escalated.

## Outbound Connections (Outbound FEEDS Other Skills)

### Outbound → `/cs-revenue-ops` Agent
Pipeline data feeds revenue operations:
- Lead volume and qualification rates
- Outbound-sourced pipeline value
- Conversion metrics by signal type

**Usage:** Analytics agent exports weekly metrics that the revenue-ops agent can incorporate into GTM dashboards.

### Outbound → `/market-audit`
Outbound performance informs marketing audit:
- Which value props get the highest reply rates
- Which pain points resonate most
- Which industries respond best

**Usage:** When running `/market audit` on the project's website, reference outbound analytics to validate messaging effectiveness.

### Outbound → `/cs-customer-success` Agent
When leads convert to customers:
- Original signal and outreach context
- Pain points identified during research
- Meeting notes and expectations set

**Usage:** Customer success agent receives handoff data for onboarding so the customer experience is seamless from outreach to delivery.

## Data Flow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  /persona    │     │ /market-copy │     │/market-emails│
│  (ICP data)  │     │ (brand voice)│     │(seq patterns)│
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────┐
│                   OUTBOUND PIPELINE                       │
│                                                          │
│  Signal → Research → Score → Write → Reply → Book        │
│                                                          │
│  State: Supabase (outbound_* tables)                     │
│  Orchestration: Outreach Director                        │
│  Cadence: Daily + Weekly optimization                    │
└──────┬───────────────────┬───────────────────┬───────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐  ┌──────────────────┐  ┌──────────────┐
│/cs-revenue-  │  │  /market-audit   │  │/cs-customer- │
│  ops         │  │(validates msgs)  │  │  success     │
│(GTM metrics) │  │                  │  │(onboarding)  │
└──────────────┘  └──────────────────┘  └──────────────┘
```

## MCP Tool Dependencies

The outbound pipeline relies on these MCP tools:

| Tool | Agent(s) | Purpose |
|------|----------|---------|
| `mcp__claude_ai_Supabase__execute_sql` | All agents | Read/write pipeline state |
| `mcp__claude_ai_Supabase__apply_migration` | Init | Create tables |
| `mcp__claude_ai_Indeed__search_jobs` | Signal Capture | Hiring signal detection |
| `mcp__claude_ai_Indeed__get_company_data` | Lead Research | Company firmographic data |
| `WebSearch` | Signal Capture, Lead Research | Signal scanning and enrichment |
| `WebFetch` | Lead Research | Fetch company websites |

## Supabase Project

The outbound tables live in the SAME Supabase project as the rest of the product (if applicable). The `outbound_` prefix namespaces them to avoid collisions.

If no Supabase project exists yet, `/outbound init` will prompt to select or create one.
