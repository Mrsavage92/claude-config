---
name: mulesoft-flow
description: "MuleSoft flow construction expert. Covers flow structure (flow vs sub-flow vs private flow), triggers (Scheduler, Listener, Object Store watermark), processors (Transform, Logger, Choice, Scatter-Gather), error handling (On Error Propagate vs Continue, retry, DLQ), batch jobs, idempotency, and watermarking patterns. Use when building any integration flow, debugging flow behaviour, or adding error handling to existing flows."
---

# Skill: MuleSoft Flow Construction

## Purpose
Build production-grade MuleSoft flows that are reliable, idempotent, and observable. Every flow follows the same backbone: trigger → read → transform → validate → write → checkpoint → log, with an error handler attached.

## When to Use
- Building a new integration flow from scratch
- Adding triggers (Scheduler, Listener, Object Store poll)
- Wiring error handling and retries
- Debugging silent failures or duplicate processing

## When NOT to Use
- Configuring connector auth — use `/mulesoft-connector`
- Writing DataWeave transforms — use `/mulesoft-dataweave`
- Deploying to Anypoint Platform — use `/mulesoft-platform`

## Flow Backbone

```
Trigger → Source Read → Transform → Validate → Target Write → Checkpoint → Log
+ Error Handler attached
```

## Modes

| Mode | When | Reference |
|---|---|---|
| Polling flow | Scheduler + watermark pattern | `references/polling-patterns.md` |
| Event flow | HTTP / MQ / Streaming trigger | `references/event-triggered.md` |
| Batch flow | High-volume record processing | `references/batch-jobs.md` |
| Error handling | Retries, DLQ, circuit breaker | `references/error-handling.md` |
| Idempotency | Prevent duplicate writes | `references/idempotency.md` |

## Non-Negotiable Rules

1. Every flow has an error handler (inline or referenced global).
2. Every external call has an `until-successful` wrapper OR a documented fail-fast decision.
3. Every polling flow uses Object Store watermarks. Never re-scan all records each poll.
4. Every flow is idempotent — safe to run twice without duplicate writes.
5. Every flow ends with a Logger (record count + correlation ID).
6. No hardcoded values — use `${property.name}` placeholders.

## Core Processors

| Processor | Purpose |
|---|---|
| `ee:transform` | DataWeave transformation |
| `logger` | Write to Mule logs |
| `set-variable` / `set-payload` | Flow state |
| `choice` | Branching logic |
| `foreach` / `parallel-foreach` | Iterate collection |
| `scatter-gather` | Fan out to multiple targets |
| `try` / `error-handler` | Exception handling |
| `until-successful` | Retry wrapper |
| `os:store` / `os:retrieve` | Object Store (watermarks, idempotency) |

## Templates

| Template | Purpose |
|---|---|
| `templates/polling-flow.xml` | Scheduler + watermark (BDR pattern) |
| `templates/event-flow.xml` | HTTP Listener trigger |
| `templates/batch-flow.xml` | Batch job processing |
| `templates/error-handler.xml` | Reusable error handler |
| `templates/bdr-onstop-sync-flow.xml` | BDR NS→SF On Stop flow |

## Proactive Triggers

- `<scheduler>` trigger without Object Store read → flag as non-watermarked
- External write without `<until-successful>` → flag as fragile
- Flow without error handler → flag immediately (silent failures risk)
- Flow without final Logger → flag as unobservable
- `parallel-foreach` without `maxConcurrency` → flag rate-limit risk
- Polling flow without deduplication → flag duplicate-write risk

## Anti-Patterns (do NOT do these)

- Building without error handling — silent failures in prod
- Re-scanning all records on every poll — use watermarks
- Setting initial watermark to "beginning of time" — causes mass backfill at go-live
- `parallel-foreach` without concurrency limit — trips rate limits
- Catching errors and continuing silently — worst pattern, always log AND decide

## Related Skills
- `/mulesoft-connector` — connector configs the flow references
- `/mulesoft-dataweave` — Transform step inside flows
- `/mulesoft-platform` — deploy and monitor
- `/mulesoft-bdr` — BDR-specific flow patterns
