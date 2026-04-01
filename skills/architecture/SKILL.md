---
name: architecture
description: Generate Architecture Decision Records (ADRs), system design documents, tech stack recommendations, and architecture review notes. Use when making a significant technical decision, documenting existing architecture, or reviewing a proposed system design.
---

# Architecture Advisor

## Purpose

Produces structured architecture documentation: ADRs, system design overviews, tech stack comparisons, and architectural review notes. Helps teams make and document technical decisions clearly.

## When to Use

- Making a significant technical decision (database, infra, framework, API design)
- Documenting existing architecture for a new team or audit
- Reviewing a proposed system design for risks and gaps
- Comparing technology options (e.g. Postgres vs MongoDB, REST vs GraphQL)
- Preparing architecture for a technical due diligence
- Defining service boundaries in a microservices migration

## Modes

### Mode 1: Architecture Decision Record (ADR)
For a specific technical decision. Standard format used by engineering teams.

**Input:** The decision to be made + context + options considered

```
# ADR-[number]: [Decision Title]

## Status
Proposed | Accepted | Deprecated | Superseded by ADR-X

## Date
[YYYY-MM-DD]

## Context
[What is the situation that requires a decision? What forces are at play?]

## Decision
[The decision that was made. Written as a positive statement: "We will use..."]

## Rationale
[Why this option over the alternatives? Key factors that drove the decision.]

## Options Considered

### Option A: [Name]
- Pros: [list]
- Cons: [list]

### Option B: [Name]
- Pros: [list]
- Cons: [list]

## Consequences
### Positive
[What becomes easier or better?]

### Negative
[What becomes harder or worse? What debt does this create?]

### Risks
[What could go wrong? What are the unknowns?]

## References
[Links to relevant docs, RFCs, benchmarks]
```

### Mode 2: System Design Overview
For documenting or designing an entire system or component.

**Input:** System description + scale requirements + existing constraints

Covers:
- Component diagram (described in text/ASCII)
- Data flow
- Key design decisions and why
- Scalability considerations
- Security boundaries
- Failure modes and mitigations
- Monitoring and observability hooks

### Mode 3: Tech Stack Comparison
For choosing between technology options.

**Input:** The choice to make + your constraints (team size, scale, budget, timeline)

Produces a scored comparison across:
- Developer experience
- Operational complexity
- Performance at your expected scale
- Ecosystem / community / longevity
- Cost
- Fit with existing stack
- Time to production

### Mode 4: Architecture Review
For reviewing a proposed design.

Checks:
- Single points of failure
- Data consistency guarantees
- Security surface area
- Scalability bottlenecks
- Coupling and blast radius of failures
- Observability gaps
- Deployment and rollback strategy

## Output

Specify which mode you need. Default is ADR for specific decisions, System Design for broader scope questions.
