## Product Validation: Automation Agency (NDIS / Healthcare / Social Care)

**Verdict:** KILL
**Date:** 2026-04-28

**Idea:** Done-for-you AI automation consultancy for small Australian NDIS, allied health, and social care providers (5–50 staff). Fixed-price setup packages ($1.2k / $2.5k) plus $500/mo support, built on Zapier / Make / n8n / Power Automate.

### Gate Results
1. **Who pays:** Small NDIS providers, allied health clinics, plan managers, support coordinators, 5–50 staff, AU — **PASS**
2. **Competitors (free + paid):** Saturated. NDIS-vertical specialists already exist: Conway Consulting Group (https://www.conwaygroup.com.au — explicit Allied Health + NDIS automation), AI Lab Australia (https://www.ailabaustralia.com/industries/ai-automation-ndis-disability-services-australia — same pitch, same vertical), Adtuna Health, Nifty Marketing, Square Meters Healthcare. Generalist Zapier/Make/n8n shops also serving AU SMBs: Flipside AI (Sydney), Launch Lab (Sydney/Canberra), Flow Digital, flowmondo, ProsperSpark. NDIS-native platforms with built-in AI/automation eating the "just buy software" alternative: ShiftCare ($9/user/mo, marketed as "#1 AI NDIS Software"), Lumary, Brevity, Halaxy, CarePlan, SupportAbility, Splose, Rotawiz, Flowlogic. Published market price for AI automation for NDIS providers already sits at $600–$2,000/mo. — **FAIL**
3. **Market gap:** "Connect the tools you already use, plain English, practical" is the exact same pitch every Zapier/Make consultant in AU runs. Conway Consulting Group already owns this positioning in the NDIS+allied health vertical. No defensible gap. — **FAIL**
4. **Revenue model:** $1.2k / $2.5k setup + $500/mo support. Numbers exist and align with market range — **PASS** (marginal; services revenue is fragile)
5. **TAM:** 21,734 NDIS provider businesses; 269,000 broader providers; $44.7bn category. Capturing 50 retainer clients = $300K ARR. Market is big enough. — **PASS**
6. **Moat:** None named. "Someone who understands service operations" is a generic credential — Conway, Flipside, Launch Lab all claim equivalent. No proprietary data, no distribution channel, no domain lock-in, no cost structure advantage. This is the same Gate 6 failure Tender Writer hit. — **FAIL**
7. **Pre-committed buyers:** Zero named. No "3 NDIS clinic owners said yes at $X". — **FAIL** (would trigger VALIDATE-FIRST in isolation, but compounds here)
8. **Portfolio fit:** AuditHQ is locked PRIMARY at $0 MRR, $10K/mo target, with explicit policy "new builds BLOCKED until $5K/mo or parked" in `active-revenue-projects.md`. GrowLocal is code-complete and still needs first customers. BDR MuleSoft is active client delivery. Adding a 4th attention surface — and one that requires its own sales motion + delivery hours — directly starves the locked primary. Hard trigger. — **FAIL**

### Reasoning
- Five failed gates including the Gate 8 hard-trigger and Gate 6 no-moat. Per validator rules this is automatic KILL — no exceptions.
- The exact positioning ("practical NDIS automation, plain English, connect what you have") is already occupied by Conway Consulting Group — they have the brand, the case studies, the mailing list. You'd be a less-known second mover.
- ShiftCare and Lumary have built AI/automation directly into the NDIS-native platform a target buyer is already paying for. Many "I want my admin automated" calls end with "we just enabled ShiftCare automations" instead of buying consulting.
- This is also a services business — every dollar of revenue costs your hours, not someone else's. It is the opposite of leverage. AuditHQ is a SaaS that scales without your time; this consultancy doesn't.
- No buyer pre-commitment. Building a marketing site before having three named NDIS clinic owners say "yes I'd pay $1,200" is the same loop that burned Tender Writer for 6 days.

### Focus Instead On
**AuditHQ** — locked PRIMARY, $0 MRR, target $10K/mo. Per `active-revenue-projects.md` the rule is no new builds until AuditHQ hits $5K/mo or is formally parked. Push AuditHQ to first paying customer, or run `/saas-improve` against the current state to identify the conversion blocker.

If the admin-pain insight is real, the cheapest test is: pick 5 NDIS clinic owners from LinkedIn this week, send the hero copy as an email, see who replies "yes book a call". If 3 say yes with intent, you have a validated wedge — re-run this validator with named buyers and the verdict flips.

### Override clause
If you want to pursue this anyway, you must explicitly state: "I accept that Automation Agency delays AuditHQ by N weeks and that I have no named buyers." Otherwise this verdict stands and `/saas-build`, `/web-scaffold`, `/web-scope`, `/scaffold` will refuse the slug `automation-agency`.
