# MuleSoft → Salesforce Agentforce Bridge

Source: MuleSoft "MuleSoft for Agentforce" + Agent Fabric pages (June 2026). The strategic shape is verified; step-by-step Agentforce wiring is NOT in the public docs reviewed — flagged below.

## Why this matters for BDR
BDR is a **Salesforce shop**. The highest-leverage agentic path is not building a standalone agent UI — it's making BDR's existing Mule APIs into **actions an Agentforce agent can call**. Agentforce provides the conversational agent; MuleSoft provides the governed connection to enterprise systems (NetSuite, broadband providers, Salesforce data).

## The division of labour (verified)
- **Agentforce** — the agent runtime/UX inside Salesforce. Reasons, plans, talks to users.
- **Agent Fabric** — connects those agents to the work: discovery (Exchange), orchestration (Agent Broker), governance (Omni Gateway), observability (Agent Visualizer).
- **MuleSoft APIs/MCP servers** — the actual tools/actions the agent invokes to do real work against enterprise systems.

> "Agent Fabric connects AI agents to the work they need to do, while Omni Gateway governs the traffic those agents generate." — Salesforce

## The BDR pattern (when use case + entitlement are confirmed)
```
User in Salesforce: "Is broadband available at 12 High St?"
        │
   Agentforce agent (reasoning)
        │  invokes action
   MCP tool  ◀── Omni Gateway (OpenAPI→MCP, governed)
        │
   Broadband lookup Mule API on CloudHub 2.0  (already built, Phase 1–3)
        │
   Broadband provider / NetSuite / SF data
```
This reuses existing API investment — no net-new integration, just expose + govern + connect.

## UNVERIFIED — confirm before building
- Exact steps to register a Mule API/MCP server as an Agentforce action.
- Whether this goes through Agentforce's own action/topic config, the Agent Registry, or both.
- Auth/identity handshake between Agentforce and Omni Gateway (likely Trusted Agent Identity — confirm).

→ Fetch the "MuleSoft for Agentforce" docs and the Agent Fabric getting-started guide before implementing. Do not approximate the wiring.

## Cross-skill note
The Salesforce side of any Agentforce work (Apex actions, LWC, flows) is covered by `anthropic-skills:salesforce-lwc-apex`. This skill owns the MuleSoft side (the API/MCP tool + governance). Coordinate across both for an end-to-end Agentforce build.

## Sources
- https://www.mulesoft.com/ai/agent-fabric
- https://docs.mulesoft.com/agent-fabric/
- https://www.salesforce.com/blog/mulesoft-omni-gateway-agentic-ai-governance/
- https://architect.salesforce.com/docs/architect/fundamentals/guide/mulesoft-agent-fabric-deep-dive (403 to automated fetch — read in browser)
