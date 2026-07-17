import type { Question } from '@/schemas';

/**
 * Independently authored practice questions for Domain 1: Prompting and Task
 * Execution.
 *
 * Grounded strictly in the CCAO-F study guide, Domain 1 section (golden rule,
 * XML tags, long-context ordering, prompt chaining, self-correction,
 * iteration against success criteria, and task-type adaptation including
 * extended/adaptive thinking, few-shot, and affirmative format control).
 * These are not official exam items.
 */

const V = '2026-07-17';

export const questionsD1: Question[] = [
  {
    id: 'q-d1-01',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-1',
    difficulty: 'easy',
    questionType: 'single-choice',
    prompt:
      'A marketing associate drafts this prompt for Claude: "Analyze the data and make it good." A colleague with only minimal context reads it and has no idea what data to use or what "good" means. Applying the golden rule for prompting, what should the associate do?',
    answerOptions: [
      { id: 'a', text: 'Send the prompt as-is, since Claude is more capable than a colleague and will figure it out.' },
      { id: 'b', text: 'Rewrite the prompt to explicitly state the data source, the analysis required, and the desired output format.' },
      { id: 'c', text: 'Add "please" and "thank you" so the tone is more polite.' },
      { id: 'd', text: "Ask the colleague to guess at the intent and proceed on that guess." },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'The golden rule states that if a low-context colleague would be confused by a prompt, Claude will be confused too. The fix is to make the role, data source, task, and output format explicit — not to change tone or leave the ambiguity in place.',
    explanationForEachOption: {
      a: 'Wrong. Capability does not resolve genuine ambiguity in the instruction itself.',
      b: 'Correct. Explicitly stating context, task, and format is exactly what the golden rule calls for.',
      c: 'Wrong. Politeness does not address the missing data source or missing definition of "good."',
      d: "Wrong. Guessing at intent is what the golden rule test is designed to prevent, not a resolution of it.",
    },
    keyExamClue: 'Golden rule: if a low-context colleague would be confused, so will Claude — replace vague asks with explicit role, context, and format.',
    learningObjective: 'Apply the golden-rule test to rewrite a vague prompt into an explicit, specific one.',
    relatedLessonIds: ['lesson-1-1'],
    relatedLabIds: ['lab-prompt-structure'],
    sourceIds: ['prompt-eng-overview', 'prompting-best-practices'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['golden-rule', 'clarity', 'prompting'],
    estimatedTimeSeconds: 50,
    enabled: true,
  },
  {
    id: 'q-d1-02',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-1',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'An operations analyst is writing an XML-tagged prompt so Claude can answer questions about a 15-page vendor contract. To follow the structure reported to improve quality, where should the contract text and the final question go?',
    answerOptions: [
      { id: 'a', text: 'The contract text near the top inside a document tag, with the specific question placed at the end of the prompt.' },
      { id: 'b', text: 'The question first, followed immediately by the raw contract text, with no tags at all.' },
      { id: 'c', text: 'The contract text and the question interleaved paragraph by paragraph.' },
      { id: 'd', text: 'The question repeated three times before the contract text for emphasis.' },
    ],
    correctAnswerIds: ['a'],
    explanation:
      'For long-context tasks, Anthropic guidance is to place the long document near the top, structured with XML tags, and put the query at the end of the prompt — an ordering reported to improve quality.',
    explanationForEachOption: {
      a: 'Correct. Document near the top in a tag, question at the end, is the recommended long-context structure.',
      b: 'Wrong. Putting the question before the document and dropping tags removes the structure that helps Claude parse the task.',
      c: 'Wrong. Interleaving fragments the document and the question, working against clear structure.',
      d: 'Wrong. Repeating the question adds noise rather than the structure this guidance calls for.',
    },
    keyExamClue: 'Long-context tasks: document near the top in XML tags, question at the end.',
    learningObjective: 'Structure a long-context prompt with the document-on-top, question-at-the-end pattern.',
    relatedLessonIds: ['lesson-1-1'],
    relatedLabIds: ['lab-xml-tags', 'lab-prompt-structure'],
    sourceIds: ['prompting-best-practices', 'prompt-eng-overview'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['long-context', 'xml-tags', 'prompt-structure'],
    estimatedTimeSeconds: 60,
    enabled: true,
  },
  {
    id: 'q-d1-03',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-2',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'A project manager sends one prompt asking Claude to "extract vendor names, validate them against the approved-vendor list, and produce a formatted report" in a single pass, and gets back a shallow, incomplete result. What should the manager do instead?',
    answerOptions: [
      { id: 'a', text: 'Split the task into sequential chained calls: extract vendor names, then validate against the list, then format the report.' },
      { id: 'b', text: 'Resend the exact same single prompt with a longer explanation of the goal.' },
      { id: 'c', text: 'Tell Claude to "work faster" on the same combined prompt.' },
      { id: 'd', text: 'Remove the validation step so the combined prompt is shorter.' },
    ],
    correctAnswerIds: ['a'],
    explanation:
      'Prompt chaining splits a complex task into sequential calls, where each output feeds the next step. Decomposing the extract-validate-format task this way lowers cognitive load per step and improves accuracy over a single mega-prompt.',
    explanationForEachOption: {
      a: 'Correct. Chaining the three subtasks sequentially is the recommended decomposition.',
      b: 'Wrong. Resending the same combined prompt does not reduce the cognitive load causing the shallow result.',
      c: 'Wrong. "Work faster" is not an instruction that changes structure or improves accuracy.',
      d: 'Wrong. Dropping a required step avoids the problem instead of solving it.',
    },
    keyExamClue: 'A shallow result from one mega-prompt is a signal to chain sequential subtasks, not to re-word the same prompt.',
    learningObjective: 'Decompose a multi-part business task into a sequential prompt chain.',
    relatedLessonIds: ['lesson-1-2'],
    relatedLabIds: ['lab-prompt-chaining'],
    sourceIds: ['chain-prompts', 'prompting-best-practices'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['prompt-chaining', 'decomposition', 'workflow'],
    estimatedTimeSeconds: 65,
    enabled: true,
  },
  {
    id: 'q-d1-04',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-2',
    difficulty: 'easy',
    questionType: 'single-choice',
    prompt:
      'A communications lead has Claude generate a press-release draft, then has Claude review that draft against a stated list of criteria, then produces a refined final version based on the review. Which pattern is this?',
    answerOptions: [
      { id: 'a', text: 'Few-shot prompting' },
      { id: 'b', text: 'The self-correction pattern: draft, then review against criteria, then refine' },
      { id: 'c', text: 'Extended thinking' },
      { id: 'd', text: 'Structured Outputs' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Draft, review against explicit criteria, then refine is the self-correction pattern — a specific, high-value form of prompt chaining for polishing business writing.',
    explanationForEachOption: {
      a: 'Wrong. Few-shot means steering output with example inputs and outputs, not a draft-review-refine loop.',
      b: 'Correct. Draft, review against criteria, refine is the self-correction pattern.',
      c: 'Wrong. Extended thinking is a reasoning-depth setting, not a multi-step writing workflow.',
      d: 'Wrong. Structured Outputs constrains JSON schema conformance; it has nothing to do with drafting prose.',
    },
    keyExamClue: 'Draft -> review against criteria -> refine = the self-correction pattern.',
    learningObjective: 'Recognize and apply the self-correction (draft-review-refine) pattern.',
    relatedLessonIds: ['lesson-1-2'],
    relatedLabIds: ['lab-draft-review-refine'],
    sourceIds: ['chain-prompts', 'prompting-best-practices'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['self-correction', 'iteration', 'drafting'],
    estimatedTimeSeconds: 50,
    enabled: true,
  },
  {
    id: 'q-d1-05',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-3',
    difficulty: 'difficult',
    questionType: 'single-choice',
    prompt:
      'An analyst has reworded the same multi-step financial-reasoning prompt a dozen times. Claude still cannot complete the reasoning correctly, and every response takes well over a minute. What is the most accurate diagnosis?',
    answerOptions: [
      { id: 'a', text: 'The prompt just needs one more round of wording tweaks.' },
      { id: 'b', text: 'The failure looks like a capability and latency limitation, not a wording problem — a different model or approach is needed.' },
      { id: 'c', text: 'The exact same prompt should be repeated until it eventually succeeds.' },
      { id: 'd', text: 'Success criteria are unnecessary here since the task is purely qualitative.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Not every evaluation failure is solvable by prompt engineering. Repeated failures on complex reasoning, combined with high latency, are a signal that the task exceeds the current model or approach, and escalation is the right move rather than more rewording.',
    explanationForEachOption: {
      a: 'Wrong. A dozen rewordings without progress is evidence the problem is not wording.',
      b: 'Correct. Persistent reasoning failure plus latency issues points to a model/approach limitation, not the prompt.',
      c: 'Wrong. Repeating an already-failing prompt has no reason to succeed on a later attempt.',
      d: 'Wrong. Multi-step financial reasoning is exactly the kind of task where measurable success criteria are needed to know when to stop iterating on wording.',
    },
    keyExamClue: 'If rewording repeatedly does not help, ask whether the model or approach — not the prompt — is the real bottleneck.',
    learningObjective: 'Distinguish a prompt-wording problem from a model-capability or latency problem.',
    relatedLessonIds: ['lesson-1-3'],
    relatedLabIds: [],
    sourceIds: ['prompting-tools', 'develop-tests'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['iteration', 'model-selection', 'success-criteria'],
    estimatedTimeSeconds: 75,
    enabled: true,
  },
  {
    id: 'q-d1-06',
    certificationId: 'ccao-f',
    domainId: 'd1',
    taskStatementId: 'ts-1-4',
    difficulty: 'moderate',
    questionType: 'multiple-response',
    prompt:
      "A team is adapting its prompting strategy for a complex, multi-step reasoning task and wants to follow Anthropic's task-type guidance. Which TWO practices should they apply? (Select TWO)",
    answerOptions: [
      { id: 'a', text: 'Enable extended/adaptive thinking and use a general nudge such as "think hard" rather than prescriptive step-by-step instructions.' },
      { id: 'b', text: 'Phrase constraints affirmatively ("do X") rather than as negative instructions ("do not do Y").' },
      { id: 'c', text: 'Provide 10+ examples covering every conceivable edge case as a laundry list.' },
      { id: 'd', text: 'Prescribe the exact reasoning steps Claude must follow, in order, for every response.' },
    ],
    correctAnswerIds: ['a', 'b'],
    explanation:
      'For reasoning-heavy tasks, Anthropic guidance favors extended/adaptive thinking with general nudges over prescriptive step lists, and affirmative phrasing over negative phrasing for format control — both apply regardless of task type.',
    explanationForEachOption: {
      a: 'Correct. General nudges like "think hard" are preferred over prescriptive step-by-step instructions for extended thinking.',
      b: 'Correct. Affirmative phrasing ("do X") is recommended over negative phrasing ("do not do Y").',
      c: 'Wrong. A 10+ example laundry list is discouraged in favor of 3–5 diverse, relevant examples.',
      d: 'Wrong. Prescribing exact reasoning steps is the opposite of the recommended general-nudge approach for adaptive thinking.',
    },
    keyExamClue: 'Reasoning tasks: prefer general thinking nudges over prescriptive steps, and affirmative phrasing over negative phrasing.',
    learningObjective: 'Select the correct combination of task-type-appropriate prompting techniques.',
    relatedLessonIds: ['lesson-1-4'],
    relatedLabIds: ['lab-few-shot'],
    sourceIds: ['extended-thinking', 'adaptive-thinking', 'prompting-best-practices'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['extended-thinking', 'format-control', 'task-adaptation', 'multiple-response'],
    estimatedTimeSeconds: 80,
    enabled: true,
  },
];
