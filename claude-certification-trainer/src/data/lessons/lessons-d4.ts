import type { Lesson } from '@/schemas';

export const lessonsD4: Lesson[] = [
  {
    id: 'lesson-4-1',
    certificationId: 'ccao-f',
    domainId: 'd4',
    taskStatementId: 'ts-4-1',
    title: 'Find where Claude adds value',
    summary:
      'Use the Claude for work learning hub and an enterprise AI diagnostic to surface and prioritize use cases before building anything.',
    content: `Before writing a single prompt or wiring a single connector, the first job is finding **where** Claude actually adds value in a business process.

The **Claude for work** learning hub organizes this by department — Engineering, HR, Marketing, Product Management, Sales — with department-specific guides that map common workflows onto Claude capabilities. Starting from a department guide is faster than starting from a blank page, because it shows analogous use cases already validated elsewhere.

Enterprise AI diagnostic methods exist to make this discovery systematic rather than anecdotal: walk a business process step by step, and at each step ask whether Claude could remove manual effort, reduce error, or speed a decision. The output is a *ranked* list of candidate use cases, not a single pet idea.

Prioritization has two axes: **impact** (how much time, cost, or risk the use case touches) and **feasibility** (how ready the data, tooling, and stakeholders are). A high-impact, low-feasibility idea is a roadmap item, not a starting point — begin with something both meaningful and buildable now.

The discipline here is sequencing: surface and prioritize use cases *before* building, so effort lands on the process that matters most rather than the one that happened to be top of mind.`,
    keyPrinciples: [
      'Department-specific guides (Engineering, HR, Marketing, Product, Sales) accelerate use-case discovery.',
      'Enterprise AI diagnostics turn use-case discovery into a systematic walk of the process, not guesswork.',
      'Prioritize by impact and feasibility together, not either alone.',
      'Surface and prioritize use cases before building anything.',
    ],
    decisionRules: [
      'When starting fresh, consult the department-specific Claude for work guide before designing a solution.',
      'Rank candidate use cases by impact and feasibility before committing engineering time.',
      'Prefer a use case that is both meaningful and buildable now over one that is only high-impact.',
    ],
    commonPitfalls: [
      'Building a solution for the first idea raised in a meeting instead of the highest-priority one.',
      'Chasing high-impact use cases that are not yet feasible given current data or tooling.',
    ],
    sourceIds: ['claude-for-work', 'anthropic-academy'],
    relatedQuestionIds: [],
    relatedLabIds: [],
    estimatedMinutes: 9,
  },
  {
    id: 'lesson-4-2',
    certificationId: 'ccao-f',
    domainId: 'd4',
    taskStatementId: 'ts-4-2',
    title: 'Choose the simplest workflow pattern',
    summary:
      'Research mode handles agentic multi-source search; workflows and agents trade predictability for flexibility; chaining, routing, and parallelization compose multi-step processes.',
    content: `Once a use case is picked, the next judgment is **which pattern solves it with the least machinery**.

**Research mode** is agentic multi-source search — it plans a search, follows leads across sources, and synthesizes findings, pairing well with analysis tools and Google Docs integration for planning work.

For multi-step processes, there is a foundational distinction between **workflows** and **agents**. Workflows orchestrate LLM calls along predefined paths — high predictability, easy to audit. Agents autonomously direct their own process — high flexibility, lower predictability. Neither is universally better; the choice depends on how much the task can be specified in advance.

Three simple, composable workflow patterns cover most cases:

| Pattern | What it does | When to use |
|---|---|---|
| Prompt chaining | Sequential subtasks, output feeds next input | A task decomposes cleanly into ordered steps |
| Routing | Classify then dispatch (e.g., easy items to Haiku, hard items to Sonnet) | Inputs vary in difficulty or type |
| Parallelization | Sectioning or voting across concurrent calls | Independent subtasks or need for consensus |

The Associate-level judgment is to **choose the simplest composable pattern that solves the problem** — reach for routing or parallelization only when a single chained sequence genuinely cannot do the job.`,
    keyPrinciples: [
      'Research mode is agentic multi-source search, useful for planning and process optimization.',
      'Workflows = predefined paths, high predictability; agents = self-directed, high flexibility.',
      'Prompt chaining handles sequential subtasks.',
      'Routing classifies and dispatches (e.g., easy to Haiku, hard to Sonnet); parallelization sections or votes.',
    ],
    decisionRules: [
      'Choose the simplest composable pattern that solves the problem before reaching for a more complex one.',
      'Use routing when inputs vary meaningfully in difficulty or type.',
      'Use parallelization when subtasks are independent or a consensus check is needed.',
      'Prefer a workflow over an agent when the path can be predefined and predictability matters.',
    ],
    commonPitfalls: [
      'Reaching for a fully autonomous agent when a predictable chained workflow would do.',
      'Routing everything to the most expensive model instead of classifying difficulty first.',
    ],
    sourceIds: ['building-effective-agents', 'claude-for-work'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-research-mode'],
    estimatedMinutes: 11,
  },
  {
    id: 'lesson-4-3',
    certificationId: 'ccao-f',
    domainId: 'd4',
    taskStatementId: 'ts-4-3',
    title: 'Start simple, iterate, combine',
    summary:
      'The most successful Claude implementations start with direct prompts, iterate against success criteria, and combine Claude with existing tools rather than replacing them.',
    content: `Solution design has a consistent shape across the most successful Claude implementations: **start simple**.

Begin with direct prompts and built-in product features. Add complexity — chaining, routing, custom tooling — only when the simple approach has been tried and a specific gap has been confirmed. Complexity added pre-emptively is often complexity that was never needed.

Iteration follows the same discipline as Domain 1: **iterate against defined success criteria**, not toward an imagined ideal. A solution refined against concrete feedback on a real failure mode converges faster than one polished by intuition alone.

The third principle is about scope: **combining Claude with existing tools and knowledge is usually more effective than replacing an entire workflow.** A team that already has a CRM, a shared drive, and a ticketing system doesn't need Claude to replace those — it needs Claude wired into them. Rebuilding a working workflow from scratch to "add AI" discards institutional investment for no proportional gain.

Put together, the loop is: **simplest viable version → real feedback → targeted complexity → integrate rather than replace.**`,
    keyPrinciples: [
      'Start with direct prompts and built-in features; add complexity only when justified.',
      'Iterate against defined success criteria, not intuition.',
      'Combining Claude with existing tools and knowledge usually beats replacing the workflow.',
      'Complexity should be a confirmed response to a gap, not a default.',
    ],
    decisionRules: [
      'Ship the simplest approach first and confirm its effect before adding complexity.',
      'When refining a solution, iterate against a defined success criterion and specific feedback.',
      'Default to wiring Claude into existing tools rather than rebuilding the workflow around it.',
    ],
    commonPitfalls: [
      'Designing a complex multi-agent solution before trying a direct prompt.',
      'Replacing a working CRM or ticketing workflow instead of integrating Claude into it.',
    ],
    sourceIds: ['claude-for-work', 'building-effective-agents'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-draft-review-refine'],
    estimatedMinutes: 9,
  },
  {
    id: 'lesson-4-4',
    certificationId: 'ccao-f',
    domainId: 'd4',
    taskStatementId: 'ts-4-4',
    title: 'Augment or redesign the workflow',
    summary:
      'Judge whether to wire Claude into existing tools (augment) or rebuild the process (redesign), using integrations across GitHub, Google Docs, Projects, Artifacts, and Skills.',
    content: `Every integration decision reduces to one question: **augment the existing workflow, or redesign it?**

Augmenting means wiring Claude into the tools already in place — GitHub, Google Docs, connectors to shared drives or messaging — so teams connect Claude to their workflow without replacing it. This is the lower-risk, lower-disruption path, and it is the default per Task Statement 4.3's "start simple" principle.

Redesign means rebuilding the process around Claude — appropriate when the existing workflow is fundamentally broken, not merely slow, and no amount of augmentation would fix its structure.

The available tool surface for augmentation is broad: **GitHub** for code and issue context, **Google Docs** for shared documents, **analysis tools** for computation, **Research** for multi-source lookup, **Projects** for persistent context, **Artifacts** for standalone deliverables, and **Skills** for packaged, reusable procedures. Most business workflows can be meaningfully improved by connecting a subset of these without touching the underlying process design.

The judgment call: default to **augment**. Reach for **redesign** only when the workflow's structure — not just its speed — is the problem, and augmentation has been genuinely tried first.`,
    keyPrinciples: [
      'Augment = wire Claude into existing tools without replacing the workflow.',
      'Redesign = rebuild the workflow around Claude, reserved for structurally broken processes.',
      'Tool surface for augmentation spans GitHub, Google Docs, analysis tools, Research, Projects, Artifacts, and Skills.',
      'Default to augment; redesign only when structure, not speed, is the actual problem.',
    ],
    decisionRules: [
      'Ask whether the workflow is slow (augment) or structurally broken (consider redesign) before choosing.',
      'Connect Claude via existing integrations and connectors before proposing a rebuild.',
      'Reserve full redesign for cases where augmentation has been tried and found insufficient.',
    ],
    commonPitfalls: [
      'Recommending a full workflow redesign when the real problem is a missing integration.',
      'Treating "augment" and "redesign" as equally likely defaults instead of augment-first.',
    ],
    sourceIds: ['claude-for-work', 'building-effective-agents'],
    relatedQuestionIds: [],
    relatedLabIds: [],
    estimatedMinutes: 9,
  },
  {
    id: 'lesson-4-5',
    certificationId: 'ccao-f',
    domainId: 'd4',
    taskStatementId: 'ts-4-5',
    title: "Communicate Claude's value and limits",
    summary:
      'Quantify outcomes, frame Claude as augmentation rather than replacement, be transparent on cost, and disclose limitations alongside value.',
    content: `Stakeholders trust numbers over adjectives. Anthropic's enterprise solutions page backs this with quantified outcomes: **97 minutes saved per user per week on Slack**, an **87% reduction in support time at Lyft**, and **Moody's compressing credit-memo creation from 40 hours to 2 minutes**. Whatever the internal use case, the same discipline applies — measure a concrete before/after, not a vague impression of "it helps."

Four communication patterns make stakeholder conversations durable:

- **Quantify outcomes** — time saved, error rate reduced, throughput gained, in units stakeholders already track.
- **Frame as augmentation, not replacement** — Claude redirects human capacity toward higher-value work rather than eliminating the role.
- **Be transparent on cost** — API/seat spend, and the cost of oversight, are real inputs to the decision, not footnotes.
- **Reinvest freed capacity into reskilling** — time saved should visibly go somewhere, not just disappear as an unaccounted efficiency gain.

Communicating value alone is incomplete and, over time, erodes trust. Limitations — cost, model drift, the ongoing need for human oversight — must be disclosed **alongside** the value, in the same conversation, not as a separate caveat raised only when something goes wrong.`,
    keyPrinciples: [
      'Quantified outcomes (time saved, cost reduced, cycle time compressed) are the currency of stakeholder trust.',
      'Frame AI as augmentation that redirects capacity, not replacement that eliminates roles.',
      'Be transparent about cost as part of the pitch, not an afterthought.',
      'Disclose limitations — cost, drift, oversight needs — alongside value, not separately.',
    ],
    decisionRules: [
      'Lead stakeholder communication with a measured before/after number, not a qualitative claim.',
      'Frame every value statement in terms of augmentation and redirected capacity.',
      'Pair every value claim with its cost and limitations in the same communication.',
    ],
    commonPitfalls: [
      'Pitching Claude purely as headcount replacement instead of augmentation.',
      'Presenting value without disclosing cost, drift risk, or the ongoing need for human oversight.',
    ],
    sourceIds: ['enterprise-solutions', 'claude-for-work'],
    relatedQuestionIds: [],
    relatedLabIds: [],
    estimatedMinutes: 10,
  },
];
