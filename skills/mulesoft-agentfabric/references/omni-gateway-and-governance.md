# Omni Gateway & Governance — Exposing APIs as Agent Tools

Source: MuleSoft Omni Gateway announcement + AI governance pages (June 2026). Capabilities verified; exact policy field names NOT verified — confirm in docs/tenant.

## What Omni Gateway is
Flex Gateway, **renamed and extended** to govern not just REST traffic but also **MCP, A2A, and LLM** traffic — across MuleSoft, Kong, Apigee, AWS, and Azure gateway estates. It is the single governance plane for the agentic enterprise.

## The headline workflow: API → agent-ready MCP tool
Omni Gateway performs **OpenAPI-to-MCP conversion** — REST, gRPC, GraphQL, and WebSocket APIs become governed, agent-ready MCP tools. This is the bridge from BDR's existing APIs to the agent layer:

```
Existing Mule API  ──(OpenAPI spec)──▶  Omni Gateway: OpenAPI→MCP  ──▶  governed MCP tool
                                                │
                                        policies applied: auth, rate limit, identity, tracing
```

## Verified governance capabilities
- **Federated policy enforcement** across multi-vendor gateways.
- **Centralized token management with LLM routing** (works with LLM Proxy).
- **Correlation-ID traceability** — trace a request across agent → broker → tool → LLM.
- **Identity propagation** for A2A and agent-to-application interactions (ties to Trusted Agent Identity).

## Governance discipline (carry over from classic API work)
- **Never expose an ungoverned API as an MCP tool.** No auth + no rate limit on an agent tool = an open attack surface an agent (or a prompt-injected agent) can hammer. Apply auth + rate-limit policy *before* publishing to the registry.
- **Identity must propagate.** An agent acting on a user's behalf should carry that identity to the underlying API, not a shared service account — otherwise RLS/permission checks are bypassed.
- **High-risk actions gate via Trusted Agent Identity** (mobile auth / human-in-the-loop). Decide which BDR actions are "high-risk" (e.g. anything that writes to NetSuite/Salesforce prod) and gate them.

## UNVERIFIED — confirm before authoring
- Exact Omni Gateway policy names/properties for MCP and LLM traffic.
- Whether OpenAPI→MCP is self-service in the Enhanced Experience UI or requires CLI/config.
- Rate-limit/token-budget configuration syntax.

→ Confirm against the Omni Gateway docs or a live tenant. Do not invent policy YAML.

## Relationship to classic API Manager
Classic REST policies (Client ID Enforcement, rate limiting on standard APIs) still live in **API Manager** — see `/mulesoft-platform` `references/api-manager-policies.md`. Omni Gateway is the agentic superset. For BDR today, classic API Manager covers the live APIs; Omni Gateway becomes relevant only when those APIs are exposed to agents.

## Sources
- https://blogs.mulesoft.com/news/mulesoft-omni-gateway/
- https://www.mulesoft.com/platform/ai/ai-agent-governance
- https://www.salesforce.com/blog/mulesoft-omni-gateway-agentic-ai-governance/
- https://futurumgroup.com/insights/mulesoft-omni-gateway-as-close-to-an-agent-control-plane-as-it-gets/
