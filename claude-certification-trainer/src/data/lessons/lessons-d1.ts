import type { Lesson } from '@/schemas';

export const lessonsD1: Lesson[] = [
  {
    id: 'lesson-1-1',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-1',
    title: 'Create effective prompts',
    summary:
      'Clear, explicit, specific instructions — structured with XML tags, a role, and stated context — are the foundation of good output.',
    content: `Claude responds best to **clear, explicit, and specific** instructions. A useful *golden rule*: show your prompt to a colleague who has only minimal context and ask them to follow it. If that colleague would be confused, Claude will be too.

Four building blocks make a prompt reliable:

- **Role** — the system prompt defines behaviour and tone. Even one sentence ("You are a helpful coding assistant specializing in Python") meaningfully narrows the response.
- **Context and rationale** — explaining *why* an instruction exists helps Claude return a more focused answer.
- **Structure with XML tags** — wrap parts of a complex prompt in tags such as \`<instructions>\`, \`<context>\`, \`<input>\`, \`<example>\` so Claude can parse them without ambiguity. Nest tags for hierarchical content.
- **Format and ordering** — use numbered lists when sequence matters. For long-context tasks, place long documents **near the top** and the question **at the end**; this ordering has been reported to improve quality.

Explicitly stating role, context, format, and constraints removes the guesswork that produces vague or off-target answers.`,
    keyPrinciples: [
      'Clear, explicit, specific instructions beat clever or terse ones.',
      'The golden rule: if a low-context colleague would be confused, so will Claude.',
      'XML tags separate instructions, context, examples, and input reliably.',
      'For long context, put the document near the top and the question at the end.',
    ],
    decisionRules: [
      'Always state role, context, output format, and constraints explicitly.',
      'Give the rationale behind an instruction, not just the instruction.',
      'Use numbered lists when order or completeness matters.',
    ],
    commonPitfalls: [
      'Assuming Claude shares context it was never given.',
      'One long unstructured paragraph where the middle rules get lost.',
      'Putting the question before a long document instead of after it.',
    ],
    sourceIds: ['prompt-eng-overview', 'prompting-best-practices'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-prompt-structure', 'lab-xml-tags'],
    estimatedMinutes: 10,
  },
  {
    id: 'lesson-1-2',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-2',
    title: 'Decompose complex requests',
    summary:
      'Break big tasks into focused sequential steps. Prompt chaining and the draft→review→refine pattern lower cognitive load and raise accuracy.',
    content: `Complex requests are more reliable when broken into smaller steps. Breaking a task down **lowers the model's cognitive load** and improves accuracy.

**Prompt chaining** splits a task into sequential calls, where the output of one prompt becomes the input to the next (for example: *metadata extraction → data extraction → validation → refinement*). Because each step is a separate call, you can log, evaluate, or branch at any point.

The **self-correction pattern** is a specific chain: generate a draft, review it against explicit criteria, then refine based on that review. It is the single most useful decomposition pattern for business writing and analysis.

Design chained pipelines when a multi-step task must be predictable and repeatable.`,
    keyPrinciples: [
      'Decomposition lowers cognitive load and improves accuracy.',
      'Prompt chaining feeds one step\'s output into the next as separate calls.',
      'Separate calls let you log, evaluate, or branch at each step.',
      'Self-correction = draft → review against criteria → refine.',
    ],
    decisionRules: [
      'When an answer is shallow, split the task into focused sequential subtasks.',
      'Use a self-correction chain when quality of a single deliverable matters.',
      'Chain (not one mega-prompt) when the process must be repeatable.',
    ],
    commonPitfalls: [
      'Asking for everything in one prompt and getting a shallow result.',
      'Skipping the review step and shipping the first draft.',
    ],
    sourceIds: ['chain-prompts', 'prompting-best-practices'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-prompt-chaining', 'lab-draft-review-refine'],
    estimatedMinutes: 9,
  },
  {
    id: 'lesson-1-3',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-3',
    title: 'Iterate prompts to improve quality',
    summary:
      'Iterate against success criteria and evaluations, not intuition. Recognize when the problem is the prompt versus the model.',
    content: `Prompt improvement works best as a **structured loop**, not guesswork. Start from an initial draft template, then refine based on *specific* feedback about what is wrong with the output.

Effective iteration needs three things: **success criteria**, **empirical testing**, and a **draft prompt** to iterate from. Anthropic also publishes prompt-improvement guidance and offers a prompt generator and prompt improver (tools aimed at API developers; optional for the Associate).

A crucial judgment: **not every failure is a prompt problem.** Latency or cost issues are often better solved by choosing a different model, and a capability shortfall is solved by escalating the model — not by rewording the same prompt again.`,
    keyPrinciples: [
      'Iterate against success criteria and evaluations, not by feel.',
      'Refine on specific feedback about what is wrong, not vague dissatisfaction.',
      'Some failures need a different model, not a different prompt.',
    ],
    decisionRules: [
      'Define measurable success criteria before iterating.',
      'If rewording repeatedly does not help, ask whether the model or missing information is the real cause.',
    ],
    commonPitfalls: [
      'Endlessly rewording a prompt when the model lacks the needed capability.',
      'Iterating without any success criterion to measure against.',
    ],
    sourceIds: ['prompting-tools', 'develop-tests', 'prompting-best-practices'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-draft-review-refine'],
    estimatedMinutes: 8,
  },
  {
    id: 'lesson-1-4',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-4',
    title: 'Adapt strategy to task type',
    summary:
      'Match technique to task: extended/adaptive thinking for reasoning, few-shot for formatting, affirmative format control, cross-checking for research.',
    content: `Different task types call for different prompting strategies.

- **Research / information gathering** — set clear success criteria, encourage cross-checking across sources, and use competing hypotheses with self-critique.
- **Math, coding, analysis** — use **extended thinking**. With **adaptive thinking**, Claude dynamically decides whether and how deeply to think. Prefer general nudges like "think hard" over prescriptive "think step by step."
- **Formatting and consistency** — use **few-shot** examples: 3–5 highly relevant, diverse examples. Choose zero/one/few-shot by task complexity.
- **Format control** — use XML format instructions and **affirmative phrasing** ("do X" rather than "do not do Y").

Adapting structure to the task — analysis, research, drafting, brainstorming — and adding self-check instructions ("verify the answer against [criteria] before finishing") reliably raises quality.`,
    keyPrinciples: [
      'Extended/adaptive thinking suits math, coding, and analysis.',
      'Few-shot (3–5 relevant, diverse examples) steers formatting and consistency.',
      'Affirmative phrasing ("do X") beats negative phrasing ("do not do Y").',
      'Prefer general thinking nudges ("think hard") over prescriptive steps.',
    ],
    decisionRules: [
      'Pick the technique from the task type before writing the prompt.',
      'For reasoning-heavy work, enable extended thinking and add a self-check.',
      'For consistent formatting, add 3–5 diverse few-shot examples.',
    ],
    commonPitfalls: [
      'Using a laundry list of 10+ examples instead of 3–5 diverse ones.',
      'Prescribing exact reasoning steps when a general nudge works better.',
    ],
    sourceIds: ['extended-thinking', 'adaptive-thinking', 'prompting-best-practices'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-few-shot'],
    estimatedMinutes: 10,
  },
];
