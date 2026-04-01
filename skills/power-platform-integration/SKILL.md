---
name: power-platform-integration
description: >
  Expert guidance for integration patterns involving Power Platform, bridging Power Automate
  with MuleSoft, custom connectors, HTTP actions, webhooks, Azure Service Bus, and external
  APIs. Use this skill whenever the user asks about connecting Power Platform to external
  systems, building custom connectors, deciding between Power Automate and MuleSoft for an
  integration, setting up webhooks, calling REST APIs from flows, Azure Service Bus triggers,
  event-driven architecture with Power Platform, or any scenario where data needs to flow
  between Power Platform and another system (ConnectWise, Salesforce, 8x8, Webex, IT Glue,
  Microsoft 365, or any other API). Also trigger for questions like "should this be a flow
  or a MuleSoft integration", "how do I call an external API from Power Automate", or
  "how do I connect ConnectWise to Dynamics". Trigger for any cross-system data flow
  question involving Power Platform as a participant.
---

# Power Platform Integration Patterns

Expert-level guidance for integrating Power Platform with external systems. Covers the
decision framework for choosing integration tools, patterns for REST APIs, webhooks,
message queues, and the boundary between Power Automate and enterprise iPaaS like MuleSoft.

---

## The Decision Framework

The first question for any integration: **what's the right tool?**

### Power Automate vs MuleSoft vs Direct API

| Factor | Power Automate | MuleSoft | Direct API (custom code) |
|---|---|---|---|
| Complexity | Simple A-to-B, low transform | Multi-system orchestration, complex logic | Unique protocol, niche SDK |
| Volume | Low-medium (< 10K events/day) | High (millions/day) | Any |
| Error handling | Basic (retry, run-after) | Advanced (error routing, dead letter, replay) | Custom |
| Governance | Per-flow, visible in admin center | Centralised API Manager, policies | Manual |
| Monitoring | Flow run history, alerts | Anypoint Monitoring, Visualizer, Titanium | Custom |
| Skill level | Citizen developer to pro | Integration specialist | Developer |
| Cost | Included/per-flow license | MuleSoft licensing (vCores) | Compute costs |
| Reusability | Limited (each flow is standalone) | High (API-led, reusable experience/process/system APIs) | Depends |

### Decision Rules

1. **Simple trigger-action with 1-2 systems?** - Power Automate
   - Example: Dynamics case created -> post to Teams channel
   
2. **Data sync between 2 systems with transforms?** - Power Automate if transforms are
   simple, MuleSoft if complex or if the same data needs to go to 3+ targets

3. **Central integration hub connecting 5+ systems?** - MuleSoft (API-led connectivity)
   - Example: ConnectWise + Salesforce + 8x8 + M365 + IT Glue context unification

4. **Real-time, high-volume event processing?** - MuleSoft or Azure Service Bus + Functions
   - Power Automate's 25 concurrent runs limit makes it unsuitable for burst traffic

5. **User-facing automation (approvals, notifications)?** - Power Automate
   - It has native Teams integration, adaptive cards, and approval workflows

6. **Need centralised API governance?** - MuleSoft API Manager
   - Rate limiting, SLA tiers, consumer keys, usage analytics

### The Hybrid Pattern

In practice, many enterprise setups use **both**:

```
External Systems (ConnectWise, Salesforce, etc.)
    |
    v
MuleSoft (orchestration, transformation, API governance)
    |
    v
Dataverse (via MuleSoft System API or Dataverse Web API)
    |
    v
Power Automate (last-mile automation: notifications, approvals, UI triggers)
```

MuleSoft handles the heavy integration lifting. Power Automate handles the human-facing
automation and Dynamics-native event responses.

---

## Custom Connectors

Custom connectors let you wrap any REST API as a reusable Power Automate connector.

### When to Build One

- You're calling the same API from multiple flows
- You want the dynamic content panel to surface API response fields
- You want citizen developers to use the API without knowing HTTP details
- You need OAuth 2.0 or API key auth managed once, not per-flow

### Building a Custom Connector

1. **Get the API spec** - OpenAPI/Swagger if available, otherwise create one manually
2. **Create in a solution** (not standalone) for ALM support
3. **Define authentication** - API Key, Basic, OAuth 2.0, or Azure AD
4. **Define operations** - each API endpoint becomes an action in the connector
5. **Define request/response schemas** - this powers the dynamic content in the flow designer
6. **Test each operation** - verify auth, inputs, outputs
7. **Share** - add the connector to your DLP business group

### Example: ConnectWise Manage Connector

```
Authentication: API Key (companyId + publicKey + privateKey in Authorization header)
Base URL: https://api-na.myconnectwise.net/v4_6_release/apis/3.0

Operations:
  - GET /service/tickets/{id} -> Get Ticket
  - GET /service/tickets?conditions={filter} -> List Tickets
  - PATCH /service/tickets/{id} -> Update Ticket
  - POST /service/tickets -> Create Ticket
  - GET /company/companies/{id} -> Get Company
  - GET /company/contacts/{id} -> Get Contact
```

Response schema: define the key fields you care about (id, summary, status, priority,
company.name, contact.name) so they show in dynamic content.

### Example: IT Glue Connector

```
Authentication: API Key (x-api-key header)
Base URL: https://api.itglue.com

Operations:
  - GET /organizations/{id} -> Get Organization
  - GET /configurations?filter[organization_id]={id} -> List Configurations
  - GET /flexible_assets?filter[organization_id]={id} -> List Flexible Assets
  - GET /passwords/{id} -> Get Password (requires elevated permissions)
```

---

## HTTP Action Patterns

When a full custom connector isn't warranted, use the HTTP action directly.

### Basic GET with Auth

```
Method: GET
URI: https://api.example.com/v1/records?status=active
Headers:
  Authorization: Bearer @{variables('apiToken')}
  Content-Type: application/json
```

### POST with Dynamic Body

```
Method: POST
URI: https://api.example.com/v1/tickets
Headers:
  Authorization: ApiKey @{variables('apiKey')}
  Content-Type: application/json
Body:
{
  "summary": "@{triggerOutputs()?['body/title']}",
  "description": "@{triggerOutputs()?['body/description']}",
  "priority": @{if(equals(triggerOutputs()?['body/prioritycode'], 1), 1, 3)}
}
```

### Pagination Loop Pattern

Many APIs return paginated results. Handle with a Do Until loop:

```
Initialize variable: allResults (Array) = []
Initialize variable: nextPageUrl (String) = "https://api.example.com/v1/records?page=1"

Do Until: empty(variables('nextPageUrl'))
  - HTTP GET: variables('nextPageUrl')
  - Append to array: union(variables('allResults'), body('HTTP')?['data'])
  - Set variable nextPageUrl: body('HTTP')?['pagination']?['next']
    (set to empty string if null to exit loop)
```

### OAuth 2.0 Token Management

For APIs requiring OAuth 2.0 (client credentials flow):

```
1. HTTP POST to token endpoint:
   URI: https://auth.example.com/oauth/token
   Body: grant_type=client_credentials&client_id=xxx&client_secret=xxx
   
2. Parse JSON: extract access_token from response

3. Use token in subsequent calls:
   Authorization: Bearer @{body('Parse_Token')?['access_token']}
```

Store client_id and client_secret as environment variables, not hardcoded.

---

## Webhook Patterns

### Inbound Webhooks (External System -> Power Automate)

Use "When an HTTP request is received" trigger:

1. Create the flow with the HTTP trigger
2. Define expected JSON schema
3. Save - get the trigger URL
4. Configure the external system to POST to that URL

Security options:
- SAS token in the URL (default, auto-generated)
- Restrict by IP range (configure in flow settings)
- Azure API Management in front for full auth/throttling

### Outbound Webhooks (Power Automate -> External System)

Register a webhook subscription with the external system's API:

```
POST https://api.example.com/v1/webhooks
{
  "url": "https://your-logic-app-trigger-url",
  "events": ["ticket.created", "ticket.updated"],
  "secret": "your-hmac-secret"
}
```

Then validate incoming webhooks by checking the HMAC signature.

---

## Azure Service Bus Integration

For high-volume, decoupled, reliable messaging between systems:

### When to Use

- Systems produce events faster than Power Automate can process (burst traffic)
- You need guaranteed delivery (messages persist in the queue until processed)
- Fan-out scenarios (one event triggers multiple consumers)
- MuleSoft publishes events, Power Automate subscribes (or vice versa)

### Pattern: Event Bus

```
Source System (ConnectWise, Salesforce, etc.)
    |
    v
MuleSoft or Azure Function (publishes message to Service Bus)
    |
    v
Azure Service Bus Topic
    |          |          |
    v          v          v
Sub 1:     Sub 2:     Sub 3:
PA Flow    PA Flow    MuleSoft
(notify)   (sync CRM) (analytics)
```

Power Automate has a native Service Bus connector:
- Trigger: "When a message is received in a topic subscription"
- Action: "Send message to a topic" or "Send message to a queue"

### Queue vs Topic

- **Queue**: one sender, one receiver. Message consumed once.
- **Topic + Subscriptions**: one sender, many receivers. Each subscription gets a copy.

Use topics for fan-out (multiple systems need to react to the same event).

---

## Dataverse Web API for External Callers

External systems can CRUD Dataverse data directly via the Web API:

```
Base URL: https://{org}.api.crm.dynamics.com/api/data/v9.2

Authentication: Azure AD OAuth 2.0 (app registration with Dynamics CRM permissions)

# Create a record
POST /accounts
{ "name": "Acme Corp", "revenue": 5000000 }

# Update a record
PATCH /accounts({guid})
{ "revenue": 6000000 }

# Upsert by alternate key
PATCH /accounts(bdr_externalid='EXT-001')
{ "name": "Acme Corp", "revenue": 6000000 }

# Query with OData
GET /cases?$filter=statecode eq 0&$select=title,ticketnumber&$top=50
```

This is how MuleSoft System APIs typically connect to Dynamics - via the Dataverse Web API
using a registered Azure AD application with appropriate API permissions.

---

## Error Handling for Integrations

### Idempotency

Design every integration to be safe to retry. This means:
- Use upsert (alternate keys) instead of create where possible
- Include a correlation/transaction ID in every message
- Check for existing records before creating duplicates

### Dead Letter Pattern

For messages that fail processing after retries:

1. Try processing the message
2. On failure (after N retries), move to a dead letter queue/table
3. Alert the operations team
4. Provide a mechanism to replay dead-lettered messages after fixing the root cause

In Power Automate, implement this with a Dataverse "Integration Errors" table:

| Column | Type | Purpose |
|---|---|---|
| Source System | Choice | Where the message came from |
| Message Type | Text | What kind of event (ticket.created, etc.) |
| Payload | Multi-line text | The raw JSON message |
| Error Detail | Multi-line text | What went wrong |
| Status | Choice | New / Investigating / Resolved / Replayed |
| Correlation ID | Text | Trace back to source |

### Monitoring Dashboard

Build a model-driven app view or Power BI dashboard showing:
- Integration flow run success/failure rates (last 24h, 7d, 30d)
- Dead letter queue depth
- Average processing time per integration
- API call consumption vs limits

---

## Real-World Integration Scenarios

### ConnectWise -> Dynamics 365 Ticket Sync

```
Option A (Power Automate only):
  ConnectWise callback URL -> PA HTTP trigger -> Parse ticket JSON ->
  Upsert Case in Dataverse (match on external ticket ID)

Option B (MuleSoft + PA):
  ConnectWise callback -> MuleSoft Process API (transform, enrich) ->
  Dataverse Web API (upsert Case) -> Dataverse trigger fires PA flow
  for notifications/routing
```

### Salesforce <-> Dynamics 365 Account Sync

```
MuleSoft recommended (bidirectional sync with conflict resolution):
  Salesforce Change Data Capture -> MuleSoft Process API ->
  Dataverse Web API (upsert Account)
  
  AND
  
  Dataverse webhook -> MuleSoft Process API ->
  Salesforce REST API (upsert Account)
  
  Conflict resolution: last-write-wins with timestamp comparison,
  or source-of-truth field to determine which system owns which attributes
```

### 8x8/Webex Call Events -> Dynamics Activity

```
Telephony platform webhook -> PA HTTP trigger or MuleSoft ->
Create Phone Call Activity in Dataverse ->
Associate via Regarding lookup to matching Contact/Account
```

Choose PA for simple event capture. Choose MuleSoft if you need to enrich the call
data with additional context from other systems before writing to Dynamics.
