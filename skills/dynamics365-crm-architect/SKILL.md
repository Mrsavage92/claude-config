---
name: dynamics365-crm-architect
description: >
  Expert guidance for Dynamics 365 CRM and model-driven app architecture, configuration,
  and administration. Use this skill whenever the user mentions Dynamics 365, D365, CRM,
  model-driven apps, customer engagement, Dynamics CE, or asks about entity/table design,
  forms, views, business rules, security roles, dashboards, solution management, plugins,
  Power Fx in Dynamics, or environment strategy for Dynamics. Also trigger when discussing
  CRM data models, sales/service/marketing modules, case management, opportunity pipelines,
  or any configuration work inside Dynamics 365. Trigger even for questions like "how should
  I structure my CRM", "what tables do I need", or "help me design the Dynamics setup".
  Always use this skill instead of generic advice when Dynamics 365 is the platform.
---

# Dynamics 365 CRM Architect

Expert-level guidance for designing, configuring, and governing Dynamics 365 Customer
Engagement (CE) / model-driven apps. This skill covers architecture decisions, table design,
security, solution strategy, and operational patterns that scale.

---

## Core Architecture Principles

Every Dynamics 365 build should follow these fundamentals:

1. **Solution-first thinking** - never build directly in the default solution. Create a
   publisher with a meaningful prefix (not "new_"), create an unmanaged solution for dev,
   and export managed for downstream environments. This is non-negotiable for maintainability.

2. **Least-privilege security** - start with the minimum security role permissions and expand.
   Never clone System Administrator as a shortcut. Use business units to segment data access,
   teams for shared ownership, and field-level security for sensitive columns.

3. **Configuration over customisation** - exhaust what you can do with no-code/low-code
   (business rules, calculated columns, Power Automate) before reaching for plugins or
   custom code. Every line of code is a maintenance liability.

4. **Dataverse is the backbone** - Dynamics 365 sits on Dataverse. Understand that every
   table, column, relationship, and choice you create is a Dataverse object. Design for
   Dataverse, not just the Dynamics UI.

---

## Table Design Patterns

### When to Use Standard vs Custom Tables

Use standard tables (Account, Contact, Lead, Opportunity, Case, etc.) wherever they fit.
They come with pre-built relationships, views, dashboards, and integrations. Only create
custom tables when no standard table maps to the concept.

### Naming Conventions

- Publisher prefix: short, meaningful (e.g., `bdr_`)
- Table names: singular noun, PascalCase after prefix (e.g., `bdr_ProjectDeliverable`)
- Column names: descriptive, no abbreviations (e.g., `bdr_EstimatedCompletionDate`)
- Choice/OptionSet names: prefix + context (e.g., `bdr_TicketPriority`)

### Relationship Design

| Relationship | When to Use | Example |
|---|---|---|
| 1:N (lookup) | Parent-child ownership | Account -> Contacts |
| N:N | Peer associations, tagging | Contact <-> Skills |
| Customer lookup | Polymorphic Account/Contact ref | Case -> Customer |
| Regarding | Activity party pattern | Email -> Regarding (any table) |

Avoid circular lookups. If you need a "primary" record and also a "related" record of the
same type, use two separate lookups with clear names.

### Column Strategy

- Use choice columns over text for anything with a fixed set of values - they filter, report,
  and validate better than free text
- Calculated and rollup columns are powerful but have limitations (no cross-entity rollup
  without workarounds, 24-hour recalc for rollups)
- Currency columns automatically create exchange-rate-aware fields - use them for any money value
- Use the "Autonumber" column type for human-readable IDs (e.g., CASE-00001)

---

## Forms and Views

### Form Design

- Use **tabs and sections** to organise logically, not just pile fields onto one tab
- Put the most important fields in the header and first tab - users scan top-down, left-right
- Use **business rules** (client-side) for show/hide, required/optional, and simple validation
  before reaching for JavaScript
- Timeline control should be on every entity where interaction history matters
- Quick view forms let you surface parent record data inline - use them to reduce clicks
- Sub-grids for related records should have relevant views pre-configured

### View Design

- Every table needs at minimum: an Active view, an Inactive view, and a "My [Records]" view
- Use system views for org-wide defaults, personal views for individual preferences
- Column widths matter - set them intentionally, don't leave defaults
- Add find columns to views so quick-find actually works on the fields users expect

---

## Security Model

### Layered Approach

```
Business Units (data segmentation)
  -> Security Roles (table-level CRUD + append/share)
    -> Teams (shared ownership, role inheritance)
      -> Field Security Profiles (column-level read/write)
        -> Column Security (on specific sensitive fields)
```

### Security Role Design

- Create custom roles per persona (e.g., "Sales Rep", "Service Agent", "Manager")
- Never edit out-of-box roles - copy them if you need a starting point
- Use Business Unit scope carefully: BU-level access means users only see their BU's data
- Organisation-level read is common for reference data (products, price lists)
- Append and Append To are the permissions people forget - they control relationship creation

### Common Patterns

- **Manager hierarchy**: enable hierarchy security so managers auto-inherit access to
  direct reports' records
- **Access teams**: for ad-hoc record sharing without creating permanent teams
- **Owner teams**: for shared mailboxes, queues, and team-owned records

---

## Solution Management

### Solution Architecture

For any non-trivial deployment, use a **segmented solution strategy**:

- **Core/Platform solution**: shared components (publisher, common choice sets, base security roles)
- **Module solutions**: per-functional-area (Sales, Service, Custom Module X)
- **Integration solution**: connection references, environment variables, integration flows

This avoids the "monolith solution" problem where one massive solution becomes unmergeable.

### Environment Strategy

| Environment | Purpose | Solution Type |
|---|---|---|
| Dev | Active build work | Unmanaged |
| Test/UAT | Validation, user testing | Managed |
| Production | Live operations | Managed |

Use environment variables for connection strings, URLs, and config values that change
between environments. Never hardcode environment-specific values.

---

## Business Rules vs Alternatives

| Need | Tool | Why |
|---|---|---|
| Show/hide fields | Business Rule | Client-side, no code, instant |
| Set field value on change | Business Rule | Simple and maintainable |
| Complex conditional logic | Power Fx (modern) or JavaScript | Business rules can't handle nested conditions well |
| Cross-entity validation | Plugin or Power Automate | Business rules are single-entity only |
| Async processing | Power Automate | Don't block the UI for heavy operations |
| Sync validation before save | Plugin (pre-validation/pre-operation) | When you absolutely must block save server-side |

---

## Integration Touchpoints

Dynamics 365 commonly integrates via:

- **Power Automate** - first choice for event-driven automation (trigger on create/update/delete)
- **Dataverse Web API** - REST API for external system CRUD operations
- **Virtual Tables** - surface external data as if it's native Dataverse (read-heavy, low-write scenarios)
- **Data Export Service / Azure Synapse Link** - for analytics and reporting pipelines
- **Dual-write** - Finance & Operations <-> CE synchronisation (complex, plan carefully)
- **MuleSoft Anypoint** - enterprise iPaaS for complex multi-system orchestration

When deciding between Power Automate and MuleSoft for a given integration, consider: is this
a simple A-to-B sync, or does it involve transformation, error handling across multiple systems,
and central governance? Simple = Power Automate. Complex = MuleSoft.

---

## Performance and Governance

- **Plugins**: keep them lean. No external HTTP calls in synchronous plugins. Use async where possible.
- **Views**: avoid views with too many columns or complex filters on large tables - they time out
- **Bulk operations**: use batch API calls, not individual creates in a loop
- **Storage**: monitor Dataverse storage (database, file, log). Audit logs eat storage fast - 
  configure retention policies
- **API limits**: Dynamics 365 has API request limits per user per 24 hours. Design integrations
  to batch, not spam individual calls

---

## Checklist: Before Go-Live

1. All solutions exported as managed and imported to production
2. Security roles tested with actual user accounts (not admin)
3. Environment variables set for production values
4. Audit logging configured for sensitive tables
5. Backup/restore strategy documented
6. User training materials and adoption plan in place
7. Data migration validated (duplicate detection rules active)
8. Integration connection references updated for production endpoints
