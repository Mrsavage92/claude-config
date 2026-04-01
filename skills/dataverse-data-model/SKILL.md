---
name: dataverse-data-model
description: >
  Expert guidance for Microsoft Dataverse schema design, data modelling, and data management.
  Use this skill whenever the user mentions Dataverse, Dataverse tables, Dataverse columns,
  relationships, choice fields, alternate keys, business process flows, calculated columns,
  rollup columns, data migration, Dataverse API, FetchXML, OData, or any data layer work
  that underpins Dynamics 365 or Power Platform. Also trigger for questions about Dataverse
  storage, elastic tables, file/image columns, audit configuration, duplicate detection,
  bulk data operations, data import/export, or Dataverse for Teams. Trigger even for
  questions like "how should I model this data", "what column type should I use", or
  "how do I migrate data into Dataverse". Use this skill whenever the conversation is
  about the data layer rather than the UI or automation layer of Power Platform.
---

# Dataverse Data Model

Expert-level guidance for designing, building, and managing data in Microsoft Dataverse -
the data platform that underpins Dynamics 365, Power Apps, Power Automate, and Power Pages.

---

## Dataverse Fundamentals

Dataverse is a cloud-hosted relational data store with built-in security, business logic,
and API access. Every Power Platform environment gets one Dataverse instance.

Key characteristics:
- Relational tables with typed columns (not a document store)
- Row-level security via business units, teams, and security roles
- Built-in audit trail, versioning, and duplicate detection
- REST API (OData v4) and FetchXML for data access
- Managed solutions for ALM (application lifecycle management)
- Elastic tables for high-volume, schema-flexible scenarios

---

## Column Types Reference

| Type | Use For | Notes |
|---|---|---|
| Single line of text | Names, short descriptions | Max 4,000 chars, default 100 |
| Multiple lines of text | Long descriptions, notes | Plain text or rich text |
| Whole number | Counts, quantities | -2,147,483,648 to 2,147,483,647 |
| Decimal | Precise values | Up to 10 decimal places |
| Float | Scientific, less precision | 5 decimal places max |
| Currency | Money values | Auto-creates base currency + exchange rate fields |
| Choice | Single selection from list | Local (table-specific) or global (shared) |
| Choices | Multi-selection | Stored as comma-separated internally, limited in filtering |
| Yes/No | Boolean flags | Two-option with customisable labels |
| Date and time | Timestamps | User local or date only - choose intentionally |
| Lookup | Foreign key to another table | Creates a 1:N relationship |
| Customer | Polymorphic lookup | Points to Account OR Contact |
| File | Attachments | Up to 10GB per file, stored in Azure Blob |
| Image | Profile photos, logos | Primary image column shows in record header |
| Autonumber | Sequential IDs | Format: prefix + number (e.g., CASE-{SEQNUM:5}) |
| Formula | Real-time calculated | Power Fx, evaluates on read (preview feature) |
| Calculated | Derived values | Recalculates on read, limited to same-table fields + related lookups |
| Rollup | Aggregated child data | Recalculates every 12 hours (or manual refresh), min/max/sum/count/avg |

### Column Type Decisions

- Use **Choice** over text whenever the set of values is predictable - enables filtering, reporting,
  and dashboards. Only use text when values are truly freeform
- **Calculated vs Formula**: calculated columns use classic syntax, formula columns use Power Fx.
  Formula is the future direction but still has gaps - check feature parity before choosing
- **Rollup limitations**: they recalculate on a 12-hour cycle by default. If you need real-time
  aggregation, use a Power Automate flow to compute and stamp the value on create/update of children
- **Choices (multi-select)** has significant limitations: you can't use them in views as filter
  criteria, they don't work well in reports, and querying them via API requires contains operators.
  Consider a N:N relationship as an alternative for complex tagging

---

## Relationship Patterns

### One-to-Many (1:N)

The most common relationship. Creates a lookup column on the child table.

- **Cascade behaviour** matters - define what happens to child records when the parent is
  reassigned, shared, unshared, merged, or deleted
- Default cascade delete is "Remove link" (nullify the lookup) - change to "Restrict" if
  children should block parent deletion, or "Cascade" if children should be deleted too
- Parental relationships (a subset of 1:N) - children inherit security from parent. Use for
  true parent-child where children can't exist independently

### Many-to-Many (N:N)

Creates an intersect/bridge table automatically. Use for peer associations where neither
side owns the other.

- You can't add custom columns to the auto-generated intersect table
- If you need metadata on the relationship (e.g., "role" or "start date"), create a custom
  intersect table with two lookups instead of using native N:N

### Self-Referencing Relationships

A table relating to itself (e.g., Employee -> Manager, Account -> Parent Account).
Dataverse supports this natively. Be careful with cascading - circular cascades will
throw errors.

### Polymorphic Lookups

Some built-in columns can point to multiple table types:
- Customer (Account or Contact)
- Regarding (on Activity tables - can point to almost any table)
- Owner (User or Team)

You can't create custom polymorphic lookups. If you need one, create separate lookup
columns and a choice field to indicate which one is populated.

---

## Alternate Keys

Alternate keys define uniqueness constraints beyond the primary key (GUID). Use them for:

- **Integration matching** - match incoming records from external systems by a natural key
  (e.g., external ID, email) instead of requiring the Dataverse GUID
- **Upsert operations** - the API can create-or-update based on alternate key values
- **Data quality** - prevent duplicate records on key fields

Constraints:
- Max 5 alternate keys per table
- Only certain column types: single line of text, whole number, decimal, lookup, date/time
- Composite keys supported (multiple columns)

---

## Business Process Flows (BPFs)

BPFs guide users through a series of stages on a record. They're visual (shown as a
progress bar at the top of the form) and data-backed (each stage completion is stored).

Design principles:
- Keep stages to 4-7 - more than that overwhelms users
- Each stage should have 2-5 required fields - not every field belongs in the BPF
- Branching is supported (stage A -> if condition -> stage B1 or B2) but keep it simple
- BPFs can span multiple tables (e.g., Lead -> Opportunity -> Order)
- The active stage is stored on the record - you can report on it and automate based on it

---

## Data Migration

### Import Methods

| Method | Best For | Volume |
|---|---|---|
| Data Import Wizard (UI) | Simple CSV/Excel imports, one-off | < 50,000 rows |
| Power Automate | Ongoing sync, event-driven | Continuous, low-medium volume |
| SSIS + KingswaySoft | Large-scale ETL, complex transforms | Millions of rows |
| Dataverse SDK (.NET) | Custom migration scripts | Unlimited (with batching) |
| Azure Data Factory + Dataverse connector | Cloud-native ETL | Large scale |

### Migration Best Practices

1. **Map data before you migrate** - create a field-level mapping document between source
   and target before writing any code
2. **Handle lookups carefully** - migrate reference/parent data first, then children. Use
   alternate keys for matching
3. **Disable plugins and flows** during bulk import to avoid cascading side effects and
   performance degradation
4. **Validate in batches** - import a sample of 100-1,000 records first, verify, then full load
5. **Preserve history** - if migrating from another CRM, decide what historical data matters.
   Don't migrate everything just because you can
6. **De-duplicate first** - clean source data before migration, don't import duplicates and
   try to fix later

---

## Duplicate Detection

Dataverse has built-in duplicate detection rules:

- Define matching criteria (e.g., same email OR same company name + phone)
- Rules can be published to block duplicates on create/update, or run as batch jobs
- Configure the duplicate detection dialog to show on record creation in model-driven apps
- Use fuzzy matching for names (e.g., "Jon" matches "John") via matchcode columns

---

## API and Querying

### OData Queries

Standard REST API pattern:
```
GET /api/data/v9.2/accounts?
  $select=name,revenue
  &$filter=revenue gt 1000000
  &$orderby=name asc
  &$top=50
  &$expand=primarycontactid($select=fullname,emailaddress1)
```

### FetchXML

More powerful than OData for complex queries (aggregation, outer joins, linked entities):

```xml
<fetch aggregate="true">
  <entity name="opportunity">
    <attribute name="estimatedvalue" alias="total" aggregate="sum"/>
    <filter>
      <condition attribute="statecode" operator="eq" value="0"/>
    </filter>
    <link-entity name="account" from="accountid" to="parentaccountid">
      <attribute name="name" alias="account_name" groupby="true"/>
    </link-entity>
  </entity>
</fetch>
```

FetchXML supports: aggregation (sum, count, avg, min, max), grouping, linked entity
joins (inner and outer), paging cookies for large result sets, and distinct.

### Batch Operations

For bulk CRUD, use the batch API (POST to $batch endpoint with changesets). This:
- Sends multiple operations in one HTTP call
- Supports transactional changesets (all-or-nothing)
- Drastically reduces API call count vs individual requests

---

## Storage and Performance

### Storage Types

| Type | Counts Toward | Examples |
|---|---|---|
| Database | DB storage quota | Table rows, metadata |
| File | File storage quota | Attachments, file columns, notes with attachments |
| Log | Log storage quota | Audit logs, plugin trace logs |

### Monitoring

- Power Platform admin center shows storage breakdown per environment
- Audit logs are the biggest log storage consumer - set retention policies (default is forever)
- Delete old workflow jobs (flow run history) periodically - they consume database storage

### Performance Tips

- Add indexes via alternate keys on columns you frequently filter/sort on
- Use $select to retrieve only needed columns (don't fetch everything)
- Server-side filtering always (OData $filter / FetchXML conditions), never client-side
- Pagination: use @odata.nextLink or FetchXML paging cookies for large result sets
- Elastic tables for tables expected to exceed millions of rows with high-throughput needs
