# Building an Agent Network (Anypoint Code Builder)

Source: https://docs.mulesoft.com/anypoint-code-builder/af-agent-networks (retrieved June 2026). The public page describes the model but **does not expose the full YAML schema** — that detail is flagged below as confirm-in-docs. Do NOT fabricate field names.

## What an agent network is
A coordinated group of **brokers, agents, and MCP servers** that acts as a central hub for defining, validating, and executing agentic processes. Authored as a **declarative, human-readable YAML file** in Anypoint Code Builder.

## The three building blocks (verified)
- **Brokers** — an intelligent routing service that coordinates task delegation across specialized A2A-compliant agents. Can be locally defined or pulled from Exchange.
- **Agents** — autonomous components that use goals, context, and available tools to execute actions. Locally defined, then published to Exchange.
- **MCP Servers** — services implementing the Model Context Protocol to expose tools and data to AI clients. Locally defined, then published to Exchange.

The Code Builder canvas groups these three visually.

## Build workflow (verified at the step level)
1. Create an **Agent Network project** in Anypoint Code Builder.
2. Define the network in **YAML** (optionally assisted by "MuleSoft Vibes").
3. **Publish assets to Anypoint Exchange** (agents, MCP servers).
4. **Deploy to CloudHub 2.0** — managed via Runtime Manager. *This is the same runtime + deploy path BDR already uses for classic Mule apps* — so `/mulesoft-platform` deploy discipline (env promotion, tagged commits, alerts) still applies.

## UNVERIFIED — confirm before authoring
- Exact YAML top-level keys and nested field names for agents/brokers/MCP servers.
- How tools/goals/context are declared on an agent.
- How an agent references an LLM (via LLM Proxy) in the spec.
- Validation/test commands.

→ When you reach the point of actually writing the YAML, fetch the linked **"Get Started with Agent Networks"** guide from the Code Builder docs and mirror its example verbatim. Do not approximate the schema from memory.

## BDR application (when a use case is locked)
The natural first network for BDR, given the Salesforce shop + existing APIs:
- **MCP server** = the broadband availability lookup API (already built, Phase 1–3) exposed via Omni Gateway OpenAPI→MCP conversion.
- **Agent** = a lookup agent with the goal "answer broadband availability questions" and the MCP server as its tool.
- **Consumer** = Agentforce (see `agentforce-bridge.md`).

This reuses existing API investment rather than building net-new — consistent with research-and-reuse discipline.

## Sources
- https://docs.mulesoft.com/anypoint-code-builder/af-agent-networks
- https://docs.mulesoft.com/agent-fabric/
