import type { Lesson } from '@/schemas';

export const lessonsD7: Lesson[] = [
  {
    id: 'lesson-7-1',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-1',
    title: 'Diagnose and fix underperforming prompts',
    summary:
      'Match the fix to the failure symptom — grounding for hallucinations, Structured Outputs and few-shot for inconsistent formatting, repositioning for missed long-input content, decomposition for shallow analysis — and know when retrying cannot help.',
    content: `Troubleshooting a weak prompt or output starts with **diagnosis by symptom**, not a generic reword. Each failure mode has a distinct signature and a distinct fix:

- **Fabricated facts (hallucination)** — allow Claude to say "I don't know," ground claims in quotes from the source, and restrict the answer to the provided document.
- **Inconsistent formatting** — apply Structured Outputs and few-shot examples that demonstrate the exact target format.
- **Missed content in a long input** — reposition key data near the top and bottom of the context, and consider extracting relevant quotes first before asking the actual question.
- **Shallow analysis** — decompose the task into chained subtasks rather than asking for everything in one pass.

The **prompt improver** can be used to systematically debug a complex prompt rather than guessing at fixes by trial and error.

A crucial judgment call: **when the required information is simply not present in the source, retrying the same prompt has no effect.** No amount of rewording, temperature adjustment, or re-running extracts a fact that was never supplied. In that case the correct move is to obtain the missing source material or escalate, not to keep prompting.

Correct diagnosis before treatment is the core skill here — applying a formatting fix to a hallucination problem, or grounding instructions to a decomposition problem, wastes iteration cycles without addressing the actual cause.`,
    keyPrinciples: [
      'Hallucinations are fixed by grounding, allowing "I don\'t know," and restricting to the provided document.',
      'Inconsistent formatting is fixed by Structured Outputs plus few-shot examples.',
      'Missed long-input content is fixed by repositioning key data and extracting quotes first.',
      'Shallow analysis is fixed by decomposing into chained subtasks.',
      'Retrying does not help when the needed information is missing from the source.',
    ],
    decisionRules: [
      'Identify the failure category first — hallucination, formatting, missed content, or shallow analysis — before choosing a fix.',
      'Use the prompt improver for systematic debugging of a complex, hard-to-diagnose prompt.',
      'If retries repeatedly fail to surface a fact, stop and obtain the missing source instead of continuing to retry.',
    ],
    commonPitfalls: [
      'Applying a few-shot formatting fix to what is actually a hallucination problem.',
      'Re-running the same prompt hoping a missing fact will appear.',
      'Treating "shallow analysis" as a model-capability limit when decomposition would have fixed it.',
    ],
    sourceIds: ['reduce-hallucinations', 'prompting-tools'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-hallucination-check'],
    estimatedMinutes: 11,
  },
  {
    id: 'lesson-7-2',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-2',
    title: 'Adjust approach from feedback and results',
    summary:
      'The self-correction chain (draft, review against criteria, refine) improves output when paired with concrete validation errors in the retry prompt — but retries only fix format, structural, and arithmetic errors, never missing information.',
    content: `Improving output based on feedback follows the **self-correction chain pattern**: generate a draft, review it against explicit criteria, then refine based on that review. This is the single most reliable pattern for raising the quality of a deliverable through iteration.

The quality of the *refine* step depends heavily on how concrete the feedback is. Including **concrete validation errors** in a retry prompt guides correction far more effectively than vague dissatisfaction. Compare "this is wrong, fix it" against something like: *"total=150 but sum(line_items)=145. Recheck the values."* The second version tells the model exactly what discrepancy to resolve.

This distinction matters because **retries do not fix every category of error**. Retrying works well for format errors, structural errors, and arithmetic errors — cases where the needed information already exists and just needs to be recombined or recalculated correctly. Retrying does **not** work when the underlying information required for a correct answer is simply missing from the input; no number of additional attempts manufactures a fact that was never provided.

Practically, this means a troubleshooter must recognize *when to stop retrying* and instead escalate the issue or go obtain the missing source material. Continuing to retry past that point wastes cycles and can produce increasingly confident-sounding but still wrong output.`,
    keyPrinciples: [
      'Self-correction chain: draft, then review against criteria, then refine.',
      'Concrete validation errors in a retry prompt ("total=150 but sum=145") outperform vague feedback.',
      'Retries fix format, structural, and arithmetic errors.',
      'Retries cannot fix missing information — no attempt count substitutes for the missing source.',
    ],
    decisionRules: [
      'When refining, state the specific discrepancy, not just that the output is "wrong."',
      'Before retrying again, classify whether the error is format/structural/arithmetic (retry-fixable) or missing-information (not retry-fixable).',
      'If an error is missing-information, obtain the source or escalate instead of issuing another retry.',
    ],
    commonPitfalls: [
      'Giving vague feedback ("this looks off") instead of a concrete, checkable discrepancy.',
      'Retrying indefinitely when the real problem is a gap in the supplied information.',
      'Skipping the review-against-criteria step and refining from intuition alone.',
    ],
    sourceIds: ['increase-consistency', 'develop-tests'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-draft-review-refine'],
    estimatedMinutes: 9,
  },
  {
    id: 'lesson-7-3',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-3',
    title: 'Optimize workflows for efficiency and effectiveness',
    summary:
      'Match model to task complexity and adjust effort before switching models; curate context to the minimal high-signal set; prefer code-based evaluation at scale; and use consistency techniques such as format specification, examples, and retrieval.',
    content: `Optimizing a workflow spans model choice, context management, evaluation, and consistency.

**Model-to-task mapping.** Use Haiku-class models for high-volume, low-complexity work, and Opus-class models for complex reasoning. Before escalating to a more expensive model, adjust effort on the current model — a stronger prompt or added reasoning budget often closes the gap more cheaply than a model upgrade.

**Context curation.** Find the minimal set of high-signal tokens rather than passing everything available. Trim tool results down to the fields that are actually relevant, and use compaction to keep long conversations from accumulating noise and cost over time. Bloated context degrades both latency and accuracy.

**Automating evaluation.** Prefer code-based scoring where correctness is objectively checkable — it is fast and scales cleanly. Reserve human scoring for judgments that genuinely need nuance, such as tone or persuasiveness, where code cannot reliably grade the output.

**Consistency techniques.** To keep output consistent across many runs: specify the exact format required, bind behavior with concrete examples, use retrieval to ground contextually variable facts, chain prompts for multi-step consistency, and keep Claude in character across a long interaction rather than letting drift accumulate.

The general discipline is: match effort and model to the task's real complexity, feed only what is needed, automate what can be objectively checked, and reserve expensive resources — larger models, human review — for where they add real value.`,
    keyPrinciples: [
      'Haiku suits high-volume low-complexity tasks; Opus suits complex reasoning.',
      'Adjust effort (prompt, reasoning budget) before switching to a more expensive model.',
      'Context curation means the minimal high-signal token set, trimmed tool results, and compaction for long conversations.',
      'Code-based evaluation scales; human scoring is reserved for judgments needing nuance.',
      'Consistency techniques: format specification, examples, retrieval, chaining, staying in character.',
    ],
    decisionRules: [
      'Before upgrading model tier, try increasing effort on the current model first.',
      'Trim and compact context proactively in long-running or agentic conversations, not only when latency becomes a problem.',
      'Choose code-based scoring by default; escalate to human scoring only for genuinely subjective judgments.',
    ],
    commonPitfalls: [
      'Defaulting to the most expensive model for every task regardless of complexity.',
      'Passing entire raw tool outputs into context instead of trimming to relevant fields.',
      'Using human review for checks that a deterministic script could score just as reliably.',
    ],
    sourceIds: ['choosing-a-model', 'effective-context-engineering', 'prompting-best-practices'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-model-selection', 'lab-context-management'],
    estimatedMinutes: 12,
  },
];
