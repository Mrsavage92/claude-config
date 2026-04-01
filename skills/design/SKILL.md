Use the cto-architect agent to create a comprehensive system architecture design.

Gather context if not provided:
1. What are you building? (system type, core functionality)
2. Scale expectations? (users, requests/sec, data volume, growth timeline)
3. Organizational context? (team size, existing stack, timeline to MVP, budget constraints)

Then deliver:
- **Executive Summary** — business impact and timeline estimates
- **System Architecture** — components, data flows, service boundaries
- **Technology Stack** — specific choices with trade-off analysis for each
- **Phased Roadmap** — MVP → production → scale phases with milestones
- **Risk Assessment** — technical debt, bottlenecks, single points of failure
- **Code Examples** — key integration patterns and critical interfaces
- **Deployment Strategy** — infrastructure, monitoring, CI/CD approach

Use the systems-architect agent for evidence-based trade-off analysis if the decision space is complex.

Prioritize: Maintainability (100%) > Scalability (90%) > Performance (70%) > Short-term gains (30%).

If no system is specified in the arguments, ask what needs to be designed.
