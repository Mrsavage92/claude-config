# /saas-validator

Dedicated validator for SaaS products. SUPERSETS `/product-validator` with 7 SaaS-specific dimensions covering unit economics, retention, GTM, tech feasibility, compliance, defensibility, and exit optionality. Forces NUMBERS not vibes. Outputs trinary verdict (BUILD / VALIDATE-FIRST / KILL) + confidence score 0-100.

## When to Use
- Candidate from `/saas-discover` is a SaaS product (99% of cases)
- Manual invocation: `/saas-validator {slug}` when the user already has a SaaS idea
- MUST run before `/saas-build` for SaaS products

## When NOT to Use
- Non-SaaS products (physical goods, services, one-time-purchase tools) → use `/product-validator`
- Features inside an already-validated SaaS → not a new product, no validator needed

## Input Required

The user (or discovery skill) must provide:
- **Product name** + one-line description
- **Target buyer segment** (specific, e.g. "AU dental practices 2-10 staff", not "businesses")
- **Pricing hypothesis** ($/mo + tier structure)
- **Stack intent** (default: React/Supabase/Stripe/FastAPI unless specified)

If any missing → HALT, ask once, proceed.

---

## Execution — Two-Layer Validation

### Layer 1: Run `/product-validator` first (inherit the 8 core gates)

Before SaaS-specific gates, run the existing 8 generic gates:
1. Who pays
2. Competitor landscape (free + paid)
3. Market gap
4. Revenue model
5. TAM
6. Moat
7. Buyer pre-commitment
8. Portfolio fit

Inherit the verdict. If generic verdict = KILL → stop. If = VALIDATE-FIRST or BUILD → proceed to Layer 2.

### Layer 2: 7 SaaS-specific dimensions (hard numbers required)

---

## Dimension A: Unit Economics

Required inputs (force the user to estimate, use industry benchmarks if silent):
- **Target price/mo (avg across tiers):** $___
- **Expected CAC:** $___ (acquisition cost per paying customer)
- **CAC payback period:** ___ months (price × gross margin ÷ CAC)
- **LTV:CAC ratio:** ___ : 1 (expected lifetime value vs acquisition cost)
- **Gross margin:** ___% (price minus direct infra/API costs)
- **Infra cost per active user:** $___/mo (Supabase + AI API + email + monitoring)

**Hard thresholds:**
| Check | PASS | WARN | FAIL |
|---|---|---|---|
| CAC payback (SMB) | <12 mo | 12-18 mo | >18 mo |
| LTV:CAC | ≥3:1 | 2-3:1 | <2:1 |
| Gross margin | >70% | 60-70% | <60% |
| Infra % of price | <15% | 15-30% | >30% |

**Any FAIL here = KILL.** SaaS with broken unit economics dies at scale no matter how good the product is.

---

## Dimension B: Retention & Stickiness

Required inputs:
- **Why they won't churn:** (one concrete reason, not "the product is good")
- **Switching cost:** (data lock-in / workflow integration / team-wide adoption / none)
- **Time-to-value:** ___ minutes from signup to first "aha"
- **Expected monthly churn:** ___%

**Hard thresholds:**
| Check | PASS | WARN | FAIL |
|---|---|---|---|
| Concrete retention hook | named | vague | "product is good" |
| Switching cost | high | medium | zero |
| Time-to-value | <10 min | 10-30 min | >30 min or requires setup call |
| Monthly churn (SMB) | <3% | 3-6% | >6% |

**2+ FAILs here = KILL.** You can't outrun churn with new sales forever.

---

## Dimension C: GTM / Distribution Feasibility

Required inputs:
- **Primary acquisition channel:** (SEO / paid / outbound / PLG / partnerships / community)
- **CAC for that channel:** $___
- **First 3 customers path:** how do you close 3 paying customers in 30 days WITHOUT paid ads?
- **Top-of-funnel cost:** can you reach 1,000 qualified prospects for <$500?
- **Sales cycle length:** ___ days (PLG = hours, SMB = days-weeks, enterprise = months)
- **Distribution advantage:** does the user have warm audience here? (MuleSoft clients, AuditHQ users, LinkedIn following, industry Slack/Discord)

**Hard thresholds:**
| Check | PASS | WARN | FAIL |
|---|---|---|---|
| First 3 customers path | named | hand-wavy | "we'll do ads" |
| CAC < 1/3 of ARPU | yes | close | no |
| Warm distribution | owns audience | partial | cold-start |
| Sales cycle vs pricing | matches | stretched | mismatch (e.g. $49/mo with 3mo cycle) |

**Any FAIL on "First 3 customers" OR "Warm distribution" with no fix = VALIDATE-FIRST (go do interviews + build audience).**

---

## Dimension D: Technical Feasibility & Cost

Required inputs:
- **Can current stack deliver?** (React/Supabase/Stripe/FastAPI — yes/no/partial)
- **AI dependency:** if Claude/OpenAI prices rise 50%, are unit economics still viable?
- **Data dependency:** do you need proprietary data/datasets you don't have?
- **Integration burden:** what MUST be built day 1 (SSO? webhooks? public API? OAuth providers?)
- **Support burden:** is this a product where users will flood you with "how do I..." tickets?
- **Scaling cost curve:** Supabase cost at 100 / 1,000 / 10,000 customers

**Hard thresholds:**
| Check | PASS | WARN | FAIL |
|---|---|---|---|
| Stack match | full | partial | needs new stack |
| AI-price-rise survivable | yes | <20% margin impact | economics collapse |
| Data dependency | have/free | licenseable | need to collect for months |
| Integration burden day 1 | <3 items | 3-5 items | 5+ items |
| Support burden | self-serve | light-touch | high-touch (solo founder killer) |

**Any FAIL on stack match OR data dependency = KILL (you can't ship this).**
**FAIL on support burden for a solo founder = KILL (you'll drown).**

---

## Dimension E: Regulatory & Compliance

Required inputs:
- **Does SOC 2 gate enterprise deals?** ($20-40K/year + 3-6mo prep)
- **GDPR / AU Privacy Act exposure?** (storing EU/AU PII)
- **Industry-specific compliance?** (HIPAA, FINRA, MDR, ISO 27001, APRA CPS 234)
- **Data sovereignty:** customers require AU-only hosting?
- **Terms of service liability:** what happens when AI outputs bad advice?

**Hard thresholds:**
| Check | PASS | WARN | FAIL |
|---|---|---|---|
| SOC 2 timing | not needed 12mo | needed yr 2 | needed day 1 |
| Industry regs | general SaaS | light (GDPR only) | heavy (HIPAA/FINRA) |
| Liability surface | low | medium (disclaimer covers) | high (AI advice = risk) |

**FAIL on heavy industry regs for a solo founder = KILL or VALIDATE-FIRST with compliance advisor.**

---

## Dimension F: Defensibility Over Time

Required inputs:
- **12-month moat:** what stops a well-funded competitor launching a clone in 12 weeks?
- **Compounding advantage:** does each customer make the product better for the next? (network effects, data flywheel, brand accumulation)
- **Brand / distribution defensibility:** if competitors match features, does your distribution still win?

**Hard thresholds:**
| Check | PASS | WARN | FAIL |
|---|---|---|---|
| 12-month moat | clear | thin | nothing stops clone |
| Compounding advantage | yes | marginal | no |
| Distribution defense | strong | moderate | commodity channel |

**All 3 FAIL = KILL.** Copycat risk too high. Every WARN/FAIL combo = WARN flag.

---

## Dimension G: Exit / Cashflow Optionality

Required inputs:
- **Plausible acquirers at $X MRR:** name 3 categories (category SaaS consolidators, adjacent tools, PE rollups)
- **If no exit, does it throw cash?** at $10K MRR with 80% margins, is it a good lifestyle business?
- **Lifecycle:** is this a 3-year product or a 10-year product? (AI commoditization risk)

**Hard thresholds:**
| Check | PASS | WARN | FAIL |
|---|---|---|---|
| Acquirer categories | 3+ named | 1-2 | none |
| Cashflow if no exit | strong | ok | weak |
| Lifecycle risk | 10yr | 5-7yr | <3yr (AI kills it) |

**AI-kills-it-in-3-years = WARN, not FAIL.** Might still be worth building if the 3-year cashflow is strong.

---

## Verdict Logic

### Confidence Score (0-100)

```
score = 100
  - 10 per Dimension A FAIL (max -40)
  - 8 per Dimension B FAIL (max -16)
  - 6 per Dimension C FAIL (max -24)
  - 6 per Dimension D FAIL (max -30)
  - 4 per Dimension E FAIL (max -12)
  - 4 per Dimension F FAIL (max -12)
  - 2 per Dimension G FAIL (max -6)
  - 1 per any WARN
```

### Trinary verdict

| Score | Verdict |
|---|---|
| ≥80 | BUILD |
| 60-79 | VALIDATE-FIRST (fix the weak dimensions, re-run) |
| <60 | KILL |

**Override rules:**
- Any FAIL on Dimension A (unit economics) = automatic KILL regardless of score
- Any FAIL on Dimension D stack/data = automatic KILL regardless of score
- FAIL on Dimension C "First 3 customers" + cold distribution = VALIDATE-FIRST floor (can't escape without proving you can sell it)

---

## Output Format

```markdown
# SaaS Validation: {Product Name}

**Verdict:** BUILD | VALIDATE-FIRST | KILL
**Confidence Score:** {N}/100
**Date:** {YYYY-MM-DD}

## Layer 1: Generic Product Gates (/product-validator)
{verdict + brief}

## Layer 2: SaaS-Specific Dimensions

### A. Unit Economics — {PASS/WARN/FAIL}
- CAC payback: {N} mo ({status})
- LTV:CAC: {N}:1 ({status})
- Gross margin: {N}% ({status})
- Infra % of price: {N}% ({status})

### B. Retention — {PASS/WARN/FAIL}
- Retention hook: {named thing}
- Switching cost: {high/med/low/none}
- Time-to-value: {N} min
- Expected monthly churn: {N}%

### C. GTM — {PASS/WARN/FAIL}
- Primary channel: {channel} with CAC ${N}
- First 3 customers: {named path}
- Warm distribution: {describe}
- Sales cycle: {N} days

### D. Technical — {PASS/WARN/FAIL}
- Stack match: {yes/partial/no}
- AI price sensitivity: {survivable/marginal/dead}
- Data dependency: {resolved/gap}
- Day-1 integrations: {count}
- Support burden: {self-serve/light/high}

### E. Compliance — {PASS/WARN/FAIL}
- SOC 2 needed: {timing}
- Industry regs: {list}
- Liability surface: {level}

### F. Defensibility — {PASS/WARN/FAIL}
- 12-month moat: {describe}
- Compounding advantage: {describe}
- Distribution defense: {describe}

### G. Exit / Cashflow — {PASS/WARN/FAIL}
- Acquirer categories: {list}
- Lifestyle cashflow at $10K MRR: {yes/no}
- Lifecycle: {3yr/5yr/10yr}

## Red Flags (things that kill this if unresolved)
- {item 1}
- {item 2}

## Yellow Flags (things to watch)
- {item 1}
- {item 2}

## If KILL — Focus On Instead
{read active-revenue-projects.md, name primary focus}

## If VALIDATE-FIRST — Fix Plan
1. {specific action on weakest dimension}
2. {specific action on second-weakest}
3. Re-run /saas-validator when these are resolved

## If BUILD — Next Step
Run `/saas-build {slug}` with the strategic spine:
- Buyers pre-committed: {names}
- Moat: {named advantage}
- Primary channel: {channel}
- Pricing: {tier structure}
```

---

## Storage & Integration

Save to: `~/Documents/Claude/outputs/saas-validation-{slug}.md`

**Mirror to repo:**
```bash
cp ~/Documents/Claude/outputs/saas-validation-{slug}.md \
   ~/Documents/Git/claude-config/reference/saas-validations/{slug}.md
cd ~/Documents/Git/claude-config
git add reference/saas-validations/{slug}.md
git commit -m "saas-validator: {VERDICT} — {Product Name} ({score}/100)"
git push origin main
```

**Integration with `/saas-build`:**
Phase 0.0 gate accepts either:
- `~/Documents/Claude/outputs/product-validation-{slug}.md` with BUILD verdict, OR
- `~/Documents/Claude/outputs/saas-validation-{slug}.md` with BUILD verdict

If product is a SaaS, the saas-validation file is preferred (deeper confidence). If only product-validation exists, warn user: "Generic product validator passed but SaaS-specific gates weren't run. Run /saas-validator first for unit economics + retention + GTM confidence."

**Integration with `/saas-discover`:**
Phase 5 (auto-validate) switches per candidate:
- Candidate tagged `type: saas` → run `/saas-validator`
- Candidate tagged `type: product` (physical, service, one-time) → run `/product-validator`
- If not tagged → default to `/saas-validator` (our primary interest)

---

## Rules

1. **Force numbers.** If the user can't estimate CAC, churn, or gross margin, that's a red flag — they don't know the business. Use industry benchmarks (SMB SaaS: $100-300 CAC, 4% monthly churn, 75% gross margin) but flag assumed inputs as WARN.
2. **No hand-waving.** "The product will be sticky because it's useful" = FAIL. Needs a named switching cost.
3. **Unit economics are king.** Dimension A failures bypass the scoring — they're always KILL.
4. **Respect the solo founder reality.** A product requiring enterprise sales cycles + SOC 2 + high-touch support is not shippable by one person with limited time. FAIL those combinations explicitly.
5. **Short output.** Scorecard + red flags + action. Not an essay.
6. **Always run /product-validator first.** Don't duplicate gates — layer on top.

---

## Anti-Patterns

- Accepting "we'll figure out CAC later" — SaaS without CAC math dies at scale
- Letting "churn will be low" slide without a named retention hook
- Green-lighting a product with zero warm distribution and "we'll run ads"
- Approving a SaaS that needs SOC 2 day 1 from a solo founder with no compliance advisor
- Running only the 8 generic gates on a SaaS (the Tender Writer failure mode — generic moat check didn't catch the SaaS-specific unit economics)

---

## Model Routing

- Layer 1 (generic gates): delegated to `/product-validator` — inherits its routing
- Layer 2 industry benchmark lookups: WebSearch agents with `model: "haiku"` in parallel (CAC/churn/margin data for the vertical)
- Verdict synthesis: main context
- Never Opus for this skill — it's structured scoring, not open-ended reasoning.
