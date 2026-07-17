import type { Question } from '@/schemas';

/**
 * Domain 7 — Troubleshooting and Optimization.
 *
 * Independently authored, scenario-based items grounded in the CCAO-F source
 * guide (Domain 7, lines 1145–1192): symptom-based diagnosis of prompt
 * failures, self-correction with concrete feedback, when retries are
 * useless, and workflow optimization (model/effort mapping, context
 * curation, evaluation automation).
 */

const V = '2026-07-17';

export const questionsD7: Question[] = [
  {
    id: 'q-d7-01',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-1',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'A researcher notices that when Claude summarizes a 60-page legal filing, it occasionally invents a clause number that does not appear anywhere in the document. What category of failure is this, and what is the best-fit remedy?',
    answerOptions: [
      { id: 'a', text: 'Inconsistent formatting — switch to Structured Outputs with a JSON schema.' },
      { id: 'b', text: 'Hallucination — allow Claude to say "I don\'t know," ground it with extracted quotes, and restrict it to the provided document.' },
      { id: 'c', text: 'Shallow analysis — decompose the task into chained subtasks.' },
      { id: 'd', text: 'Missed long-input content — reposition the query to the top of the prompt.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Inventing a specific-looking detail (a clause number) that is not in the source is a hallucination. The fix is to permit "I don\'t know," ground responses in quotes extracted from the actual document, and restrict Claude to the provided material rather than general knowledge.',
    explanationForEachOption: {
      a: 'Wrong. The symptom is fabricated content, not inconsistent structure — Structured Outputs fixes schema conformance, not invention.',
      b: 'Correct. A fabricated clause number is a hallucination; ground with quotes, restrict to the document, and allow "I don\'t know."',
      c: 'Wrong. The failure described is fabrication, not shallow or under-decomposed analysis.',
      d: 'Wrong. Repositioning helps when content is missed, not when content is invented that never existed.',
    },
    keyExamClue: 'Fabricated specific-looking detail = hallucination → ground with quotes, restrict to source, allow "I don\'t know."',
    learningObjective: 'Diagnose a hallucination symptom and apply the correct grounding-based fix.',
    relatedLessonIds: ['lesson-7-1'],
    relatedLabIds: ['lab-hallucination-check'],
    sourceIds: ['reduce-hallucinations'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['hallucination', 'diagnosis', 'grounding'],
    estimatedTimeSeconds: 65,
    enabled: true,
  },
  {
    id: 'q-d7-02',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-1',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'A workflow feeds Claude a 45,000-token onboarding manual and asks it a specific question about a policy buried in the middle of the document. Claude\'s answer consistently misses that policy even though it is clearly present in the text. What is the best-fit remedy for this symptom?',
    answerOptions: [
      { id: 'a', text: 'Reposition the long document to the top of the prompt and the question to the end, and extract quotes first.' },
      { id: 'b', text: 'Switch to Structured Outputs so the answer is guaranteed to be schema-valid.' },
      { id: 'c', text: 'Lower the temperature to zero.' },
      { id: 'd', text: 'Ask Claude to try again with the exact same prompt.' },
    ],
    correctAnswerIds: ['a'],
    explanation:
      'Missed long-input content calls for repositioning key data (document at the top, question at the end) and extracting quotes first, which is the documented fix for long-context recall issues.',
    explanationForEachOption: {
      a: 'Correct. Reposition the document to the top and question to the end, and extract quotes first — the fix for missed long-input content.',
      b: 'Wrong. Structured Outputs guarantees schema conformance, not that buried content will be found and used.',
      c: 'Wrong. Temperature affects randomness, not whether long-context content is located and used.',
      d: 'Wrong. Retrying with the identical prompt does not change how the model attends to the document; the fix is positional/structural.',
    },
    keyExamClue: 'Missed long-input content → reposition document on top / question at bottom, extract quotes first.',
    learningObjective: 'Diagnose a missed-long-input-content symptom and apply the repositioning/quote-extraction fix.',
    relatedLessonIds: ['lesson-7-1'],
    relatedLabIds: ['lab-hallucination-check'],
    sourceIds: ['prompting-best-practices', 'reduce-hallucinations'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['long-context', 'diagnosis', 'repositioning'],
    estimatedTimeSeconds: 65,
    enabled: true,
  },
  {
    id: 'q-d7-03',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-2',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'Claude returns a syntactically valid invoice JSON object, but the "total" field does not equal the sum of the line items. The team wants a self-correction step before accepting the output. Which retry approach best matches the recommended self-correction pattern?',
    answerOptions: [
      { id: 'a', text: 'Retry with the generic instruction "please double-check your work and try again."' },
      { id: 'b', text: 'Retry with a concrete validation error, e.g., "total=150 but sum(line_items)=145. Recheck the values," and have Claude self-correct against it.' },
      { id: 'c', text: 'Abandon JSON output and switch to a free-text invoice description instead.' },
      { id: 'd', text: 'Increase max_tokens so Claude has more room to think before answering.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'The self-correction chain pattern works best when the retry prompt includes concrete validation errors (e.g., the exact mismatch found), which guides Claude to the specific correction needed. Retries work well for this kind of arithmetic/structural error.',
    explanationForEachOption: {
      a: 'Wrong. A generic "double-check" instruction gives no concrete signal about what is wrong or where.',
      b: 'Correct. Concrete validation errors in the retry prompt are the recommended way to guide self-correction for arithmetic/structural errors.',
      c: 'Wrong. Abandoning the format sidesteps the fix rather than correcting the underlying arithmetic error.',
      d: 'Wrong. More output room does not supply the specific information needed to correct the mismatch.',
    },
    keyExamClue: 'Retry prompts should carry concrete validation errors (e.g., "total=150 but sum=145") to drive self-correction.',
    learningObjective: 'Construct a retry prompt using concrete validation errors for the self-correction chain pattern.',
    relatedLessonIds: ['lesson-7-2'],
    relatedLabIds: ['lab-draft-review-refine'],
    sourceIds: ['prompting-best-practices', 'structured-outputs'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['self-correction', 'retry', 'validation'],
    estimatedTimeSeconds: 70,
    enabled: true,
  },
  {
    id: 'q-d7-04',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-2',
    difficulty: 'difficult',
    questionType: 'single-choice',
    prompt:
      'Claude is asked to fill in a customer\'s shipping-cost field, but that figure was never provided anywhere in the conversation or the attached documents. Claude guesses a plausible-sounding number. The team retries the exact same prompt three times hoping for a correct value. What is the most accurate assessment?',
    answerOptions: [
      { id: 'a', text: 'Retrying is the correct approach; eventually the model will recall the right figure.' },
      { id: 'b', text: 'Retrying has no effect here, because the required information was never in the source — the fix is to supply the missing shipping-cost data, not to retry.' },
      { id: 'c', text: 'The fix is to increase max_tokens so Claude has more space to search its own memory.' },
      { id: 'd', text: 'The fix is to switch to a more capable model, which will have the shipping cost memorized.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Retries work for format, structural, and arithmetic errors, but when the required information is simply missing from the source, retrying has no effect — the only real fix is to supply or locate the missing data.',
    explanationForEachOption: {
      a: 'Wrong. Retrying the same prompt cannot recover information that was never present anywhere in context.',
      b: 'Correct. Missing-information failures are not fixed by retrying; the missing source data itself must be supplied.',
      c: 'Wrong. More output space does not manufacture a fact that was never given to the model.',
      d: 'Wrong. A different model does not have access to this specific customer\'s shipping cost either; the data must come from the actual source.',
    },
    keyExamClue: 'When the required information is not in the source, retrying has no effect — get the missing data instead.',
    learningObjective: 'Recognize when retrying is futile because the failure stems from missing source information.',
    relatedLessonIds: ['lesson-7-2'],
    relatedLabIds: ['lab-draft-review-refine'],
    sourceIds: ['reduce-hallucinations', 'prompting-best-practices'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['retry', 'missing-information', 'troubleshooting'],
    estimatedTimeSeconds: 70,
    enabled: true,
  },
  {
    id: 'q-d7-05',
    certificationId: 'ccao-f',
    domainId: 'd7',
    taskStatementId: 'ts-7-3',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'A team runs thousands of short, simple ticket-triage classifications per day using Opus, and separately runs a handful of complex root-cause investigations per week using Haiku. Latency and cost on the triage workload are high, and the root-cause investigations often come back shallow. What is the best-fit fix?',
    answerOptions: [
      { id: 'a', text: 'Leave the model assignments as-is and only adjust temperature for each workload.' },
      { id: 'b', text: 'Swap the assignments — use a faster, lower-cost model for the high-volume, low-complexity triage, and reserve the more capable model for the complex root-cause investigations.' },
      { id: 'c', text: 'Use the most capable model for both workloads to maximize quality everywhere.' },
      { id: 'd', text: 'Use the fastest, cheapest model for both workloads to control cost everywhere.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'The model-to-task mapping principle is: a faster, lower-cost model for high-volume, low-complexity work, and a more capable model reserved for complex reasoning. This team has the assignments backwards, which explains both the high triage cost/latency and the shallow investigations.',
    explanationForEachOption: {
      a: 'Wrong. Temperature does not address a cost/latency-vs-capability mismatch between workload and model tier.',
      b: 'Correct. High-volume/low-complexity work should use the faster, cheaper model; complex reasoning should use the more capable model.',
      c: 'Wrong. Always using the top-tier model wastes cost and latency budget on the simple, high-volume triage work.',
      d: 'Wrong. Always using the cheapest model under-serves the complex root-cause investigations that need deeper reasoning.',
    },
    keyExamClue: 'Match model tier to task: high-volume/low-complexity → cheaper/faster model; complex reasoning → more capable model.',
    learningObjective: 'Apply model-to-task mapping to optimize a workflow for cost, latency, and quality.',
    relatedLessonIds: ['lesson-7-3'],
    relatedLabIds: ['lab-model-selection'],
    sourceIds: ['choosing-a-model', 'effective-context-engineering'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['model-selection', 'optimization', 'cost'],
    estimatedTimeSeconds: 75,
    enabled: true,
  },
];
