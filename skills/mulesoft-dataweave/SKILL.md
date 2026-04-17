---
name: mulesoft-dataweave
description: "DataWeave 2.0 transformation expert for MuleSoft. Covers syntax (types, variables, functions), common patterns (object map, filter, reduce, groupBy), format handling (JSON/XML/CSV/Java/Form), field mapping between systems (NS ↔ SF ↔ DB), watermark logic, date/time manipulation, and error-safe defaults. Use when writing any ee:transform, debugging a DataWeave script, or mapping fields between source and target systems."
---

# Skill: DataWeave 2.0 Transformations

## Purpose
Write correct, readable, error-safe DataWeave 2.0 transforms for MuleSoft flows. Covers the 80% of patterns used in real integrations: field mapping, filtering, format conversion, date handling, defaults, null-safety.

## When to Use
- Mapping fields between source and target systems (NS → SF, SF → DB, etc.)
- Converting between JSON, XML, CSV, Java, and Form formats
- Filtering, grouping, or reshaping collections
- Computing watermarks or derived fields
- Handling null-safety and defaults

## When NOT to Use
- Flow structure, triggers, or routing — use `/mulesoft-flow`
- Connector config — use `/mulesoft-connector`
- Deploying — use `/mulesoft-platform`

## Non-Negotiable Rules

1. **Always declare `output` at the top** — e.g. `output application/json`
2. **Always handle nulls** — use `default` operator or `?` safe navigation
3. **Never hardcode magic values** — declare as `var` at top
4. **Never silent-coerce types** — explicit `as String`, `as Number`, `as Date` where ambiguous
5. **Always separate variables (`var`) and functions (`fun`)** at the top, mapping logic at the bottom
6. **Always comment non-obvious transforms** — future you will forget what "1 day before settlement" logic meant

## Standard DataWeave Structure

```dwl
%dw 2.0
output application/json

// Variables
var onStopTriggers = ["CUSTOMER-ACCOUNT ON STOP", "CUSTOMER-SUSPENDED"]

// Functions
fun isOnStop(status) = status in onStopTriggers

// Transformation (after ---)
---
payload map (customer) -> {
  id: customer.internalId,
  onStop: isOnStop(customer.entityStatus.name) default false
}
```

## Modes

| Mode | When | Reference |
|---|---|---|
| Field mapping | Map source → target fields | `references/mapping-patterns.md` |
| Format conversion | JSON ↔ XML ↔ CSV ↔ Java | `references/format-handling.md` |
| Date/time | Timestamps, timezones, watermarks | `references/date-time.md` |
| Null safety | Defaults, optionals, safe navigation | `references/null-safety.md` |
| Collections | map, filter, reduce, groupBy | `references/collection-operations.md` |
| NS ↔ SF mapping | BDR-specific field mappings | `references/ns-sf-mapping.md` |

## Core Operators

| Operator | Use |
|---|---|
| `map` | Transform each element of a collection |
| `filter` | Keep elements matching a condition |
| `reduce` | Aggregate a collection to a single value |
| `groupBy` | Group collection by a key |
| `pluck` | Extract values from an object as a list |
| `default` | Fallback for null/missing |
| `++` | Concatenate strings or collections |
| `--` | Remove keys from object |
| `as` | Explicit type coercion |
| `?` | Safe navigation (returns null if path missing) |

## Output Formats

```dwl
output application/json              // JSON
output application/xml               // XML
output application/csv               // CSV
output application/java              // Java objects (for DB inserts)
output application/x-www-form-urlencoded  // Form data
output application/dw                // DataWeave (debugging)
```

## Templates

| Template | Purpose |
|---|---|
| `templates/ns-to-sf-onstop.dwl` | BDR Phase 1A transform |
| `templates/sf-to-ns-customer.dwl` | Reverse direction |
| `templates/csv-to-json.dwl` | CSV parsing |
| `templates/json-to-csv.dwl` | CSV generation |
| `templates/field-defaults.dwl` | Null-safe field mapping pattern |

## Proactive Triggers

- DataWeave script without `output` declaration → flag as broken
- Field access without `default` on optional fields → flag as null-risk
- Magic strings hardcoded in mapping → flag, suggest extract to `var`
- Date handling without explicit timezone → flag as timezone-ambiguous
- Collection operations on potentially-null payload → flag for null-check

## Anti-Patterns (do NOT do these)

- Writing transforms without `output` — won't compile
- Accessing nested fields without null-safety (`payload.address.city` crashes if address is null — use `payload.address?.city default ""`)
- Hardcoding trigger values in the mapping instead of a named `var`
- Using string concat for building SQL or URLs — use placeholders
- Swallowing DataWeave errors with `try` blocks around entire script — surface them

## Related Skills
- Use `/mulesoft-flow` for the flow that wraps the transform
- Use `/mulesoft-connector` for understanding source/target data shapes
- Use `/mulesoft-bdr` for BDR-specific field name mappings
