---
name: mulesoft-agentfabric
description: "MuleSoft Agent Fabric / Omni Gateway / Enhanced MuleSoft Experience specialist — the AI-and-agents layer that sits ON TOP of classic Mule integrations. Covers the Agent Registry/Exchange catalog, Agent Broker (deterministic orchestration), Omni Gateway (MCP/A2A/LLM governance, formerly Flex Gateway), LLM Proxy, Agent Visualizer, Trusted Agent Identity, building agent networks in Anypoint Code Builder, and the MuleSoft → Salesforce Agentforce bridge. Use when exposing Mule APIs as agent-ready MCP tools, governing agent/LLM traffic, or building agentic workflows. NOT for classic integration (use /mulesoft-flow, -connector, -dataweave) or platform admin of standard Mule apps (use /mulesoft-platform)."
---

# Skill: MuleSoft Agent Fabric (AI & Agents Layer)

## Purpose
The AI-layer specialist for the `/mulesoft` suite. Agent Fabric is MuleSoft's **agentic control plane** — discover, govern, orchestrate, and observe AI agents, MCP servers, and LLM traffic from one place. It is the front-end you saw at `eu1.omni.mulesoft.com` (the **Enhanced MuleSoft Experience**).

This skill is for the AI/agent work. The classic build skills (`-flow`, `-connector`, `-dataweave`, `-platform`) remain the foundation Agent Fabric consumes.

## Read This First — Foundation Before Agents

**Agent Fabric does not replace integration skills — it consumes them.** The marketing line "your APIs become agent-ready tools in minutes" only holds if the APIs underneath are clean, governed, and deployed. BDR's classic System/Process API work (`salesforce-system-api`, broadband lookups) **is the substrate the agent layer plugs into.** Do not pause classic integration to chase agents; agents need those APIs to exist first.

Sequence: **build clean APIs → register them in Exchange → expose as governed MCP tools → let agents (Agentforce or external) consume them.**

## TWO HARD GATES before any agentic build

1. **Entitlement gate.** BDR's tier is *"Customer – Integration Advanced"* (see `reference_bdr_anypoint_tier` memory). Agent Fabric / Omni Gateway / LLM Proxy are **newer paid add-on capabilities that may NOT be in that SKU.** Same discipline that stopped the custom-monitoring build: **do not plan an Agent Fabric build until BDR's entitlement is confirmed** with the MuleSoft account team (Anil / account exec). VERIFY — do not assume included, do not assume excluded.
2. **Use-case gate.** "We'll use AI agents" is a direction, not a spec. Refuse to generate agent networks or broker config until there is a concrete task an agent should perform (e.g. "Agentforce agent runs broadband availability lookups in natural language"). Generic agent scaffolding is banned.

## When to Use
- Exposing existing Mule APIs as **MCP servers / agent-ready tools**
- Registering agents, MCP servers, or LLMs in **Exchange / Agent Registry**
- Governing **MCP / A2A / LLM traffic** via Omni Gateway (policies, rate limits, identity)
- Routing LLM calls through **LLM Proxy** (OpenAI, Gemini, Bedrock/Claude, NVIDIA)
- Building an **agent network** in Anypoint Code Builder
- Connecting Mule APIs/actions to **Salesforce Agentforce**
- Observing agent interactions via **Agent Visualizer**

## When NOT to Use
- Building/deploying a standard Mule app → `/mulesoft-flow`, `/mulesoft-platform`
- Connector auth, DataWeave, classic flow error handling → respective subskills
- BDR project status/blockers → `/mulesoft-bdr`
- Anything where entitlement or use-case gate is unmet → STOP, surface the gate

## The Agent Fabric Stack

```
Enhanced MuleSoft Experience (eu1.omni.mulesoft.com)
├── Anypoint Exchange / Agent Registry  ← catalog of agents, MCP servers, LLMs
├── Agent Broker                        ← intelligent A2A router; deterministic orchestration GA Jun 2026
├── Omni Gateway (was Flex Gateway)     ← governs MCP / A2A / LLM traffic, policies, identity
├── LLM Proxy                           ← one endpoint for OpenAI/Gemini/Bedrock(Claude)/NVIDIA
├── Agent Visualizer                    ← visual map + traces of agent interactions
└── Trusted Agent Identity              ← identity propagation; mobile auth for high-risk actions

Classic Anypoint Platform (eu1.anypoint.mulesoft.com)  ← UNCHANGED, still the foundation
└── Code Builder/Studio · Runtime Manager · CloudHub 2.0 · API Manager · Secrets Manager
```

**Key fact (verified):** the Enhanced Experience is **complementary, not a replacement** ([docs](https://docs.mulesoft.com/general/exp-compare)). Classic build/deploy (Code Builder, CI/CD, CloudHub 2.0, Exchange, API Manager) is unchanged. Agent networks themselves **deploy to CloudHub 2.0** — the same runtime BDR already uses.

## Components (detail in references/components.md)

| Component | What it does | What you build/configure |
|---|---|---|
| **Exchange / Agent Registry** | Central catalog of AI assets | Register/publish APIs, MCP servers, agents; discover public MCP servers |
| **Omni Gateway** | Flex Gateway + MCP/A2A/LLM governance | Federated policies, OpenAPI→MCP conversion, token mgmt, correlation-ID tracing |
| **LLM Proxy** | Unified multi-provider LLM endpoint | Model routing, centralized token/cost mgmt, provider failover |
| **Agent Broker** | A2A router that plans + delegates | Intent/policy/identity-based routing; deterministic orchestration (GA Jun 2026) |
| **Agent Visualizer** | Observability for agent networks | Visual map; rides on Anypoint Monitoring metrics/logs/traces |
| **Trusted Agent Identity** | Identity for agent actions | Identity propagation A2A & agent-to-app; mobile auth for high-risk actions |

## Modes

| Mode | When | Reference |
|---|---|---|
| Learn the landscape | New to Agent Fabric (current state) | `references/components.md` |
| Expose an API as MCP tool | Make a Mule API agent-ready | `references/omni-gateway-and-governance.md` |
| Govern agent/LLM traffic | Apply policies, identity, rate limits | `references/omni-gateway-and-governance.md` |
| Build an agent network | Author + deploy in Code Builder | `references/agent-networks.md` |
| Connect to Agentforce | Mule APIs as Agentforce actions | `references/agentforce-bridge.md` |
| Strategic gates | Before any build | `references/foundation-and-entitlement.md` |

## Honesty Markers — what is verified vs needs doc confirmation

This skill was built from official docs + announcements (June 2026). Some build-level specifics were **not exposed in public docs** and are explicitly flagged in the references rather than fabricated:

- **Verified:** component purposes, Enhanced-vs-classic complementarity, CloudHub 2.0 deploy target, LLM Proxy providers, GA dates (AI Gateway/MCP Bridge/Trusted Agent Identity GA; deterministic orchestration beta Apr 2026 → GA Jun 2026).
- **NOT verified (do not invent — confirm against docs or a live tenant):** exact agent-network YAML field names/schema, Omni Gateway policy property names, BDR's Agent Fabric entitlement/SKU, Agentforce integration step-by-step.

When a reference says "confirm in docs," fetch `https://docs.mulesoft.com/agent-fabric/` or the linked guide — do not guess field names.

## Proactive Triggers

- User asks to build an agent network / broker without a concrete use case → STOP, surface use-case gate.
- User asks to enable Omni Gateway / LLM Proxy without confirming entitlement → STOP, surface entitlement gate (pairs with `feedback_check_subscription_before_build`).
- User wants to expose an API as an MCP tool but the API isn't deployed/governed yet → route to classic skills first (foundation-before-agents).
- User conflates Omni Gateway with classic API Manager → clarify: Omni Gateway = Flex Gateway extended for MCP/A2A/LLM; classic REST API policies still live in API Manager (`/mulesoft-platform`).
- User assumes Enhanced Experience replaced Anypoint Platform → correct: complementary, classic workflow unchanged.

## Anti-Patterns (do NOT do these)

- Fabricating agent-network YAML schemas or Omni Gateway policy names — public docs were thin; confirm against docs/tenant.
- Planning an agentic build before entitlement is confirmed.
- Generic "AI agent" scaffolding with no concrete task.
- Treating Agent Fabric as a replacement for integration skills — it's a layer on top.
- Routing LLM calls direct to providers from a Mule app when LLM Proxy exists (loses token mgmt, governance, failover).
- Exposing an ungoverned API as an MCP tool (no auth/rate limit = open agent attack surface).

## Related Skills
- `/mulesoft` — orchestrator; routes here for AI-layer work
- `/mulesoft-platform` — classic deploy, API Manager policies, monitoring (the foundation)
- `/mulesoft-flow`, `/mulesoft-connector`, `/mulesoft-dataweave` — build the APIs agents consume
- `/mulesoft-bdr` — BDR project state; AI is Phase 6 of the enterprise roadmap
- `/sync-knowledge-base` — run after editing this skill
