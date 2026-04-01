---
name: power-automate-engineer
description: >
  Expert guidance for building, debugging, and governing Power Automate cloud flows and
  desktop flows. Use this skill whenever the user mentions Power Automate, cloud flows,
  desktop flows, flow triggers, connectors, approval flows, adaptive cards, expressions,
  flow runs, or any automation built on the Power Automate platform. Also trigger for
  questions about Dataverse triggers, HTTP connectors, error handling in flows, parallel
  branches, child flows, solution-aware flows, connection references, or DLP policies.
  Trigger when the user asks "how do I automate X" and the answer involves Power Automate,
  or when troubleshooting failed flow runs. Use even for simple questions like "how do I
  send an email when a record is created" or "why is my flow failing". Always prefer this
  skill over generic automation advice when Power Automate is the platform.
---

# Power Automate Flow Engineer

Expert-level guidance for designing, building, debugging, and governing Power Automate
flows - both cloud and desktop. Covers triggers, actions, expressions, error handling,
performance, and enterprise governance patterns.

---

## Flow Types and When to Use Each

| Type | Use When | Example |
|---|---|---|
| **Automated cloud flow** | Event-driven (something happens, respond) | Record created in Dataverse -> send notification |
| **Instant cloud flow** | User-triggered or API-triggered | Button press -> generate report |
| **Scheduled cloud flow** | Time-based recurring tasks | Every Monday 8am -> sync data |
| **Desktop flow** | Legacy app automation, RPA, screen scraping | Automate data entry in a desktop app with no API |
| **Business process flow** | Guide users through stages | Lead qualification -> Opportunity -> Close |

Default to cloud flows. Desktop flows add complexity (machine management, attended vs
unattended licensing) and should only be used when no API or connector exists.

---

## Trigger Patterns

### Dataverse Triggers

The most common trigger for Dynamics 365 work:

- **When a row is added** - fires on create only
- **When a row is added, modified or deleted** - fires on any change (use filtering attributes
  to avoid over-triggering)
- **When an action is performed** - fires on bound/unbound actions (useful for custom triggers)

Critical: always set **filtering attributes** on modification triggers. Without them, every
field change fires the flow - including system fields like `modifiedon`. This causes
unnecessary runs and can hit API limits fast.

```
Trigger: When a row is added, modified or deleted
Table: Case
Filtering attributes: statuscode, prioritycode, bdr_assignedteam
```

### Polling vs Webhook Triggers

- Dataverse triggers are **near-real-time webhooks** (not polling) - they fire within seconds
- SharePoint, Outlook, and many other connectors **poll** on intervals (typically 1-5 minutes)
- If you need instant response from a polling connector, consider using an HTTP webhook
  trigger instead and configuring the source system to call it

### HTTP Request Trigger

For external systems calling into Power Automate:

- Use "When an HTTP request is received" trigger
- Define the JSON schema for the expected body (use "Generate from sample" to build it fast)
- The trigger URL is generated after first save - copy it for the calling system
- Secure it: add a SAS token query parameter or use API Management in front

---

## Expression Reference

Power Automate expressions use Workflow Definition Language (WDL). Key patterns:

### String Operations
```
concat('Hello ', triggerOutputs()?['body/firstname'])
substring(variables('myString'), 0, 10)
toLower(triggerOutputs()?['body/email'])
replace(variables('text'), 'old', 'new')
split(variables('csvLine'), ',')
```

### Null/Empty Handling
```
coalesce(triggerOutputs()?['body/phone'], 'No phone provided')
if(empty(triggerOutputs()?['body/description']), 'N/A', triggerOutputs()?['body/description'])
```

### Date/Time
```
utcNow()
addDays(utcNow(), 7)
formatDateTime(utcNow(), 'yyyy-MM-dd')
convertFromUtc(utcNow(), 'AUS Eastern Standard Time', 'dd/MM/yyyy HH:mm')
```

### Conditional
```
if(equals(triggerOutputs()?['body/statuscode'], 1), 'Active', 'Inactive')
if(greater(length(variables('items')), 0), true, false)
```

### Array/Collection
```
length(variables('myArray'))
first(body('List_rows')?['value'])
last(outputs('Get_items')?['body/value'])
union(variables('array1'), variables('array2'))
```

### Dynamic Content Gotcha

When dynamic content panel doesn't show what you need, switch to expression mode and
reference it manually. The pattern is always:
```
triggerOutputs()?['body/fieldname']       // for trigger data
outputs('Action_Name')?['body/fieldname'] // for action outputs
body('Action_Name')?['fieldname']         // shorthand for body
```

Use `?` (safe navigation) everywhere to avoid null reference errors.

---

## Error Handling Patterns

### Configure Run After

Every action can be configured to run after the previous action succeeds, fails, is skipped,
or times out. This is the primary error handling mechanism.

**Pattern: Try-Catch-Finally**

```
Scope: Try
  -> Action 1
  -> Action 2
  -> Action 3

Scope: Catch (Configure Run After: "has failed", "has timed out")
  -> Log error details
  -> Send notification
  -> Optionally: terminate with failure

Scope: Finally (Configure Run After: "is successful", "has failed", "is skipped", "has timed out")
  -> Cleanup actions (always runs)
```

### Getting Error Details

Inside a Catch scope, use these expressions to capture what went wrong:

```
result('Try')?[0]?['error']?['message']
actions('Specific_Action_Name')?['error']?['message']
workflow()?['run']?['name']   // flow run ID for troubleshooting
```

### Retry Policies

For flaky external APIs, configure retry on individual HTTP actions:

- Type: Fixed interval or Exponential
- Count: 3-4 retries max
- Interval: start at PT30S (30 seconds), increase for exponential

---

## Approval Flows

### Basic Approval Pattern

```
1. Trigger (record created/modified)
2. Get approver (lookup from record, or hardcoded)
3. Start and wait for approval
   - Type: Approve/Reject (First to respond OR Everyone must approve)
   - Assigned to: approver email(s)
   - Details: include relevant context, link back to record
4. Condition: outcome equals 'Approve'
   - Yes: update record status, notify requestor
   - No: update record status, notify requestor with rejection reason
```

### Adaptive Cards for Rich Approvals

Instead of basic approval actions, use "Post adaptive card and wait for response" in Teams
for richer UX. You can include:

- Formatted data from the triggering record
- Input fields for the approver (comments, dropdown selections)
- Action buttons beyond just Approve/Reject

Build cards at https://adaptivecards.io/designer/ then paste the JSON into the flow action.

---

## Performance and Limits

### Key Limits to Know

| Limit | Value | Impact |
|---|---|---|
| Actions per flow run | 100,000 | Pagination loops can hit this |
| Flow run duration | 30 days | Long-running approvals are fine |
| API calls per connection per 24h | Varies by license (typically 10,000-25,000) | Batch operations, don't loop individual calls |
| Concurrent flow runs | 25 (default) | Configure concurrency control on trigger |
| Nested flow depth | 8 levels | Don't over-nest child flows |

### Performance Patterns

- **Concurrency control**: set on the trigger to limit parallel runs (prevents race conditions
  on shared data)
- **Pagination**: enable on "List rows" actions to get more than 5,000 records, but be aware
  of API limit consumption
- **Select + Filter**: do server-side filtering (OData filter in the action) rather than
  getting all records and using conditions in the flow
- **Compose over Variables**: use Compose actions for intermediate values - they're faster
  than initialising and setting variables
- **Parallel branches**: use for independent operations that don't depend on each other -
  significantly reduces run time

---

## Solution-Aware Flows

All production flows should be solution-aware (created inside a solution). Benefits:

- **Environment variables** for configuration (URLs, email addresses, thresholds)
- **Connection references** for managing connections across environments (dev/test/prod
  use different service accounts)
- **ALM support** - export as managed solution, import to downstream environments
- **Dependency tracking** - see what the flow depends on

When creating flows, always start from inside the solution in make.powerautomate.com, not
from the "My flows" area.

---

## Connector Strategy

### Standard vs Premium vs Custom

- Standard connectors (SharePoint, Outlook, Teams, Dataverse) are included in most licenses
- Premium connectors (HTTP, SQL Server, Salesforce, custom connectors) require Power Automate
  Premium or per-flow licensing
- Custom connectors: build your own connector wrapping any REST API

### Common Integration Connectors

| Connector | Use For |
|---|---|
| Dataverse | Dynamics 365 / Dataverse CRUD operations |
| HTTP | Calling any REST API (premium) |
| HTTP with Azure AD | Calling Microsoft Graph and secured APIs |
| Office 365 Outlook | Sending emails with formatting |
| Microsoft Teams | Posting messages, adaptive cards, channel notifications |
| SharePoint | Document management, list operations |
| SQL Server | Direct database operations (premium) |
| Custom Connector | Wrapping ConnectWise, 8x8/Webex, IT Glue, or any REST API |

### Custom Connector Tips

- Use OpenAPI/Swagger definitions when available - import and go
- Set up authentication properly (API key, OAuth 2.0, basic auth)
- Define response schemas so the dynamic content works in downstream actions
- Test each operation individually before building flows on top

---

## Governance and DLP

### Data Loss Prevention (DLP) Policies

DLP policies control which connectors can be used together in the same flow. Set up policies
to prevent sensitive data leaking between business and non-business connectors.

- **Business** group: connectors handling org data (Dataverse, SharePoint, Outlook)
- **Non-business** group: personal or external connectors
- **Blocked** group: connectors you don't want used at all

### Flow Ownership and Management

- Use service accounts (shared mailbox or dedicated M365 user) as flow owners for
  production flows - avoids the "person leaves, flows break" problem
- Document every production flow: what it does, what triggers it, who owns it, what
  systems it connects to
- Use the Power Platform admin center to monitor flow runs across the tenant

---

## Debugging Checklist

When a flow fails:

1. Open the flow run history - click the failed run
2. Look at the red X - which specific action failed?
3. Expand the action - read the error message and status code
4. Common culprits:
   - **400 Bad Request**: malformed data, wrong field name, missing required field
   - **401/403**: connection expired or insufficient permissions
   - **404**: record not found (deleted between trigger and action?)
   - **429**: throttling - too many requests, add retry/delay
   - **500**: target system error - check the other side
5. Check expressions: use "Peek code" on the action to see the raw expression evaluation
6. Test in isolation: use "Test" with trigger data to replay
