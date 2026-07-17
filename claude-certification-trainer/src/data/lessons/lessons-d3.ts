import type { Lesson } from '@/schemas';

export const lessonsD3: Lesson[] = [
  {
    id: 'lesson-3-1',
    certificationId: 'ccao-f',
    domainId: 'd3',
    taskStatementId: 'ts-3-1',
    title: 'Select the right Claude product feature',
    summary:
      'Reason backward from the task\'s purpose verb — Projects, Artifacts, Agent Skills, Code Execution, Research mode, and Memory each solve a different problem.',
    content: `## Six features, six purposes

| Feature | What it does | When to use it |
|---|---|---|
| Projects | Self-contained workspace with instructions + knowledge | Recurring work on the same premises |
| Artifacts | Editable, reusable deliverable in an independent panel | Documents, code, charts to reuse later |
| Agent Skills | Modular, on-demand expertise | Repeated domain instructions |
| Code Execution | Sandboxed Python/bash | Computation, data analysis, file generation |
| Research mode | Agentic search across sources | Open-ended information gathering |
| Memory | Persistent knowledge across sessions | Facts to reuse in future sessions |

## Key details worth knowing
**Projects** store files in a project knowledge base available to all users (Free is capped at 5 projects); on paid plans, RAG activates automatically as knowledge nears the context limit, expanding capacity roughly 10x. **Agent Skills** use progressive disclosure — Level 1 metadata (about 100 tokens, always loaded), Level 2 SKILL.md body (loaded when triggered, under 5k tokens), Level 3 resources and scripts (loaded only when needed) — so installing many idle Skills wastes little context. **Code Execution** runs in a sandbox with internet fully blocked and no runtime package installs, but pandas, numpy, scipy, and matplotlib-style libraries are preinstalled; limits are 5 GiB memory, 5 GiB disk, 1 CPU, and the container expires after 30 days. **Research mode** autonomously traverses and cross-checks multiple sources rather than following a fixed path. **Memory** holds settled facts, not raw conversation history.

## Choosing fast
Reduce the task to one purpose verb: "gather info" → Research mode; "compute" → Code Execution; "repeat on same premises" → Projects; "deliverable to reuse" → Artifacts; "expert procedure, often" → Agent Skills; "persist across sessions" → Memory. No match → inline chat reply.`,
    keyPrinciples: [
      'Six features map to six purposes: Projects, Artifacts, Agent Skills, Code Execution, Research mode, and Memory.',
      'Agent Skills load in three progressive-disclosure stages so idle Skills cost almost no context.',
      'Code Execution has no internet access and cannot install packages at runtime, but ships common data-science libraries preinstalled.',
      'Memory holds selectively persisted facts, not full conversation history.',
    ],
    decisionRules: [
      'Reduce the task to one purpose verb, then match it to the feature table before defaulting to inline chat.',
      'Use Projects for recurring work on the same premises; use Artifacts for deliverables to reuse later.',
      'Use Research mode for open-ended, multi-source information gathering rather than Code Execution.',
    ],
    commonPitfalls: [
      'Reaching for Code Execution when the actual need is external information gathering (Research mode).',
      'Assuming Memory retains full conversation history rather than curated, reusable facts.',
    ],
    sourceIds: ['agent-skills-overview', 'code-execution-tool'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-research-mode', 'lab-artifacts', 'lab-code-execution'],
    estimatedMinutes: 12,
  },
  {
    id: 'lesson-3-2',
    certificationId: 'ccao-f',
    domainId: 'd3',
    taskStatementId: 'ts-3-2',
    title: 'Differentiate Claude\'s model tiers',
    summary:
      'Haiku, Sonnet, Opus, and Fable trade capability against speed and cost in a fixed order — know each tier\'s position by heart.',
    content: `## The four tiers

| Model | Speed | Input / Output $ per MTok | Context | Max output | Best use |
|---|---|---|---|---|---|
| Haiku 4.5 | Fastest | $1 / $5 | 200k | 64k | High-volume, low-complexity, high-frequency |
| Sonnet 5 | Fast | $3 / $15 | 1M | 128k | Balance of speed and quality |
| Opus 4.8 | Moderate | $5 / $25 | 1M | 128k | Complex reasoning, agentic coding |
| Fable 5 | Slower | $10 / $50 | 1M | 128k | Long-running agents, hardest tasks |

## The cost gap is real
Haiku's input and output cost are each one-tenth of Fable's — processing one million input tokens costs $1 on Haiku versus $10 on Fable. Always defaulting to the top model wastes both cost and latency budget for work that does not need it.

## Other differences to know
Only Opus, Sonnet, and Fable can produce 128k output tokens in one request; Haiku is capped at 64k, which can be insufficient for a single long report or large code-generation pass. Knowledge cutoff also differs: Haiku's is Feb 2025, while Sonnet, Opus, and Fable share Jan 2026. Adaptive-thinking support varies too — Fable always has it on, Opus and Sonnet support it, and Haiku does not support adaptive thinking but is the only tier that supports extended thinking.

## Recite the tiers
High-volume, low-complexity → Haiku. Balance of speed and quality → Sonnet. Complex reasoning or agentic work → Opus. Hardest, longest-running work → Fable.`,
    keyPrinciples: [
      'Four tiers in order of rising capability, cost, and latency: Haiku, Sonnet, Opus, Fable.',
      'Haiku\'s per-token cost is one-tenth of Fable\'s for both input and output.',
      'Haiku caps output at 64k tokens; Sonnet, Opus, and Fable allow 128k.',
      'Haiku\'s knowledge cutoff (Feb 2025) trails the other three tiers (Jan 2026); Haiku alone lacks adaptive thinking but is the only tier with extended thinking.',
    ],
    decisionRules: [
      'Match task volume and complexity to a tier first: Haiku for high-volume simple work, Sonnet for balanced work, Opus/Fable for complex or agentic work.',
      'Do not default to the top-tier model — that wastes cost and latency for work a lower tier could handle.',
      'Check Haiku\'s 64k output cap before assigning it to a long single-pass report or large code-generation task.',
    ],
    commonPitfalls: [
      'Assuming a wider context window or higher tier is always the safer choice.',
      'Forgetting Haiku\'s older knowledge cutoff when the task needs very recent information.',
    ],
    sourceIds: ['models-overview'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-model-selection'],
    estimatedMinutes: 10,
  },
  {
    id: 'lesson-3-3',
    certificationId: 'ccao-f',
    domainId: 'd3',
    taskStatementId: 'ts-3-3',
    title: 'Align model selection with task requirements',
    summary:
      'Start from Haiku or Opus depending on the task, then adjust effort before escalating models — retrying the same model rarely helps.',
    content: `## Two starting points
**Start from Haiku** for cost-sensitive, high-volume, low-complexity work — prototyping, tight latency, routine processing — then escalate only the spots where capability falls short. **Start from Opus** for complex reasoning, science and math, nuanced understanding, or work where accuracy outweighs cost — then optimize the prompt and step down effort or model once stable.

## The order of levers
1. **Raise effort** — the effort parameter adjusts how deeply a model thinks within itself, trading intelligence against latency and cost on Opus/Sonnet. On Opus 4.8, \`high\` is the default everywhere; \`xhigh\` suits coding and highly autonomous work. Adjusting effort is often a better lever than switching models.
2. **Escalate the model** — Haiku → Sonnet → Opus → Fable, when effort alone does not fix a shallow or inaccurate output.
3. **Retry the same model** — almost no effect; meaningful only when the real problem is missing information, not capability.

## Core principle
**When capability is insufficient, escalate; re-running the same model brings no improvement.** Identify the cause first: if information is missing, supply it; if capability is missing, escalate.

## The cost trap
"Turn off a feature to cut cost" is the wrong answer — disabling features does not change a model's underlying cost, speed, and capability trade-off. The right move is switching to a lower-cost model that fits the task. Judge escalation or downgrade by benchmarking real prompts and data, not by feel.`,
    keyPrinciples: [
      'Two valid starting points: Haiku (cost-sensitive, high-volume) or Opus (complex, accuracy-critical), escalating or stepping down from there.',
      'Lever order: raise effort first, escalate the model second, retry the same model last (almost no effect).',
      'Retry only helps when information was missing, not when capability was the limiting factor.',
      'Disabling features does not change a model\'s cost/speed/capability trade-off — switch models instead to cut cost.',
    ],
    decisionRules: [
      'Before escalating a model, first try raising effort on Opus/Sonnet.',
      'Diagnose whether a shallow output is missing information or missing capability, then supply information or escalate accordingly — never just retry.',
      'To lower cost, switch to a lower-cost model that fits the task rather than disabling features.',
    ],
    commonPitfalls: [
      'Repeatedly retrying the same model on a capability-limited task.',
      'Disabling product features in an attempt to reduce cost instead of switching models.',
    ],
    sourceIds: ['choosing-a-model'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-model-selection'],
    estimatedMinutes: 10,
  },
  {
    id: 'lesson-3-4',
    certificationId: 'ccao-f',
    domainId: 'd3',
    taskStatementId: 'ts-3-4',
    title: 'Manage context limitations and memory',
    summary:
      'As context grows, precision and recall degrade (context rot) — prune, compact, or persist state to a new session to keep quality intact.',
    content: `## What fills the context window
The context window is Claude's working memory for a single request — not its training data. It holds the system prompt, all past messages, tool definitions and results, images, and the output and thinking tokens generated in that turn. Window size is 200k for Haiku and 1M for Sonnet, Opus, and Fable; exceeding the budget returns a "prompt is too long" error.

## Context rot
A wide window does not mean you should fill it. As token count grows, precision and recall degrade — a phenomenon called **context rot** — and information near the middle is easiest to miss. What you put in the context matters as much as how much room is left; pruning irrelevant information directly improves performance.

## Three countermeasures

| Countermeasure | When to use | Effect |
|---|---|---|
| Prune information | Irrelevant exchanges mixed in | Immediate improvement |
| Compaction | Continuing a long multi-turn conversation | Frees space without cutting it off |
| Restart in a new session | Whole conversation has degraded | Clean restart |

**Compaction** automatically summarizes older turns as the window nears its limit (beta on recent Fable, Opus, and Sonnet models). For agent workflows specifically, also clear stale tool results and old thinking blocks to free space.

## Carrying state forward
Some models support **context awareness**, tracking remaining budget and injecting it into the system prompt automatically. Before context runs out, persist key decisions, progress, and premises to memory or files, then restart — do not just carry the raw conversation forward.`,
    keyPrinciples: [
      'The context window is working memory for one request, not training data; it includes the system prompt, messages, tool data, images, and output/thinking tokens.',
      'Context rot: as tokens grow, precision and recall degrade, especially for information near the middle.',
      'Three countermeasures in order: prune irrelevant information, compact, or restart in a new session with persisted state.',
      'Context awareness lets supporting models track and inject remaining budget automatically.',
    ],
    decisionRules: [
      'When quality degrades in a long conversation, prune irrelevant exchanges first.',
      'If pruning is not enough, use compaction to summarize older turns rather than letting the conversation get cut off.',
      'If the whole conversation has degraded, persist key state to memory or files and restart in a new session rather than carrying the raw history forward.',
    ],
    commonPitfalls: [
      'Assuming a 1M-token window means packing in as much context as possible is safe.',
      'Persisting entire raw conversation history to memory instead of curated, valuable facts.',
    ],
    sourceIds: ['context-windows', 'compaction', 'effective-context-engineering'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-context-management'],
    estimatedMinutes: 11,
  },
];
