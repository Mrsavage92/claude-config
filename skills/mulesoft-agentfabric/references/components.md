# Agent Fabric — Components in Detail

Source: MuleSoft/Salesforce official docs + announcements, retrieved June 2026. Verified items vs flagged-unverified are marked.

## Anypoint Exchange / Agent Registry
- **What:** the central catalog for all AI assets — agents, MCP servers, LLMs. Built on the existing Anypoint Exchange BDR already uses for connectors/templates/APIs.
- **Agent Registry:** the AI-asset view of Exchange. Includes a **curated catalog of public, vendor-hosted remote MCP servers** hosted by their providers — so you can consume external MCP servers under the same governance as your own.
- **Developer action:** publish your APIs and MCP servers here; discover and reuse existing ones (in-house, SaaS-embedded, or external).

## Omni Gateway (formerly Flex Gateway)
- **What:** the governance/traffic layer. Flex Gateway, renamed and extended to also govern **MCP, A2A, and LLM** traffic — not just REST.
- **Verified capabilities:** federated policy enforcement across MuleSoft/Kong/Apigee/AWS/Azure estates; **OpenAPI-to-MCP conversion** (REST/gRPC/GraphQL/WebSocket → governed agent tools); centralized token management with LLM routing; correlation-ID traceability; identity propagation A2A and agent-to-app.
- **Relationship to API Manager:** classic REST API policies (Client ID Enforcement, rate limiting) still configured in API Manager — see `/mulesoft-platform` `references/api-manager-policies.md`. Omni Gateway is the superset that adds the agentic protocols.
- **Unverified:** exact policy property/field names. Confirm against docs/tenant before authoring policy config.

## LLM Proxy
- **What:** a single unified endpoint fronting multiple LLM providers.
- **Verified providers:** Gemini, OpenAI, Amazon Bedrock (incl. Anthropic Claude models), NVIDIA Nemotron.
- **Why use it (vs calling a provider direct from a Mule app):** centralized token management, model routing, cost control, governance, provider failover. A Mule HTTP-connector call straight to `api.openai.com` bypasses all of this.

## Agent Broker
- **What:** an intelligent routing *agent* that plans and delegates work to specialized A2A-compliant agents based on intent, policies, identity, and runtime state.
- **Roadmap (verified):** deterministic orchestration beta began **April 2026**; full GA — including the **visual authoring canvas** and **Salesforce model support** — **June 2026** (this month).

## Agent Visualizer
- **What:** a visual map of the agent network plus per-interaction observability.
- **Foundation:** rides on **Anypoint Monitoring** (metrics, logs, traces) — which BDR's "Integration Advanced" tier already includes. So observability of agents reuses monitoring infra you have.

## Trusted Agent Identity
- **What:** identity propagation across agent-to-agent and agent-to-application interactions; **mobile authorization for high-risk agent actions** (human-in-the-loop gate before an agent does something sensitive).
- **Status (verified):** GA, alongside AI Gateway and MCP Bridge.

## Other named GA features
- **AI Gateway** — GA.
- **MCP Bridge** — GA. (Bridges MCP traffic; confirm exact scope in docs before relying on specifics.)

## How it all fits
```
External / Agentforce agent
        │  (A2A)
   Agent Broker  ──routes──▶  specialized agents ──use──▶ MCP servers / tools
        │                                                      │
        ▼                                                      ▼
   Omni Gateway  ──governs all MCP/A2A/LLM traffic──▶  LLM Proxy ──▶ Claude/GPT/Gemini
        │
        ▼
   Your Mule APIs (CloudHub 2.0)  ◀── the foundation, built with /mulesoft-flow etc.
```

## Sources
- https://docs.mulesoft.com/agent-fabric/
- https://docs.mulesoft.com/general/exp-compare
- https://blogs.mulesoft.com/news/mulesoft-omni-gateway/
- https://blogs.mulesoft.com/news/public-mcp-servers-in-agent-registry/
- https://www.mulesoft.com/ai/agent-fabric
- https://www.salesforce.com/blog/mulesoft-omni-gateway-agentic-ai-governance/
