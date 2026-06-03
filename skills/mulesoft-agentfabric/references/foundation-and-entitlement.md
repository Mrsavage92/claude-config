# Strategic Gates — Foundation & Entitlement

Read this before proposing ANY Agent Fabric build. These are the two ways an agentic initiative wastes effort.

## Gate 1 — Foundation before agents
Agent Fabric consumes APIs; it does not create them. "APIs become agent-ready tools in minutes" assumes the APIs are already clean, deployed, governed.

**Check before any agent work:**
- Is the target API actually built and deployed to CloudHub 2.0? (If not → `/mulesoft-flow` + `/mulesoft-platform` first.)
- Does it have an OpenAPI/RAML spec? (Omni Gateway's OpenAPI→MCP needs one.)
- Is it governed in API Manager (auth, rate limit)? (Exposing an ungoverned API as an MCP tool = open attack surface.)

BDR status (per memory): Phase 1 broadband live in prod; Phase 2/3 + Account LWCs in sandbox. **The APIs are the foundation — they're being built in the right order.** AI/agents = Phase 6 of the enterprise roadmap (per `/mulesoft` orchestrator). Do not jump the queue.

## Gate 2 — Entitlement (subscription)
BDR tier: **"Customer – Integration Advanced"** (see `reference_bdr_anypoint_tier` memory). That tier is confirmed to include Anypoint Monitoring + Functional Monitoring. It is **NOT confirmed** to include Agent Fabric / Omni Gateway / LLM Proxy — these are newer paid add-on capabilities.

**HARD RULE (pairs with `feedback_check_subscription_before_build`):** before planning an Agent Fabric build, confirm BDR is entitled. Do not assume included; do not assume excluded. Verify with:
- The MuleSoft account team / account exec (route via Anil per org context).
- The Anypoint subscription/usage panel (what SKUs are active).
- AgentForce support case 471920541 (BDR's official support channel).

If not entitled → the answer is a commercial conversation (add-on SKU), not a build. Surface that honestly rather than building something that can't be deployed.

## Gate 3 — Concrete use case
"We'll use AI agents" is a direction. Refuse to scaffold agent networks/brokers until there's a specific task (e.g. "Agentforce agent answers broadband availability questions"). Generic agent scaffolding is banned (consistent with the no-speculative-abstractions rule).

## What you CAN do without clearing the gates
- Learn the landscape (this skill).
- Map which existing BDR APIs are good MCP-tool candidates (those already governed + spec'd).
- Prepare: ensure target APIs have clean OpenAPI specs and API Manager policies — useful regardless, and exactly what Omni Gateway needs later.

## Sources
- https://docs.mulesoft.com/general/exp-compare
- Memory: reference_bdr_anypoint_tier, feedback_check_subscription_before_build
