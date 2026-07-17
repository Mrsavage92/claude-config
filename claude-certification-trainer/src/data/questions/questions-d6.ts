import type { Question } from '@/schemas';

/**
 * Domain 6 — Governance, Risk, and Responsible Use.
 *
 * Independently authored, scenario-based items grounded in the CCAO-F source
 * guide (Domain 6, lines 905–1142): the AUP's three-layer structure and
 * seven high-risk areas, commercial vs. consumer data handling and
 * retention, the DPA, RSP/ASL and PBC/LTBT governance, and the
 * Constitution's ethical priority order.
 */

const V = '2026-07-17';

export const questionsD6: Question[] = [
  {
    id: 'q-d6-01',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-1',
    difficulty: 'easy',
    questionType: 'single-choice',
    prompt:
      'An HR team wants to use Claude to give employees general wellness tips (sleep hygiene, stress management, light exercise ideas) inside an internal chatbot. Does this fall under the AUP\'s high-risk "Healthcare" area requiring qualified-professional review?',
    answerOptions: [
      { id: 'a', text: 'Yes — anything touching health-related topics is automatically high-risk Healthcare.' },
      { id: 'b', text: 'No — general wellness advice (sleep, stress, nutrition, exercise) is not included in the Healthcare high-risk area.' },
      { id: 'c', text: 'Yes, but only if the chatbot is customer-facing rather than internal.' },
      { id: 'd', text: 'No, because internal-only tools are always exempt from the AUP regardless of subject matter.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'The Healthcare high-risk area covers things like medical diagnosis and treatment plans. Wellness advice (sleep, stress, nutrition, exercise) is explicitly noted as not included in that high-risk category.',
    explanationForEachOption: {
      a: 'Wrong. Not every health-adjacent topic qualifies — wellness advice is specifically excluded from the Healthcare high-risk area.',
      b: 'Correct. General wellness advice is explicitly not part of the Healthcare high-risk area.',
      c: 'Wrong. The audience (internal vs. customer-facing) is not what determines the wellness exclusion.',
      d: 'Wrong. Internal use does not blanket-exempt a use case from the AUP; the reasoning here is the specific wellness-advice exclusion, not internal-only status.',
    },
    keyExamClue: 'Wellness advice (sleep, stress, nutrition, exercise) is NOT included in the Healthcare high-risk area.',
    learningObjective: 'Distinguish general wellness advice from the AUP\'s Healthcare high-risk category.',
    relatedLessonIds: ['lesson-6-1'],
    relatedLabIds: ['lab-human-review-decision'],
    sourceIds: ['usage-policy'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['aup', 'high-risk', 'healthcare'],
    estimatedTimeSeconds: 55,
    enabled: true,
  },
  {
    id: 'q-d6-02',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-1',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'A startup proposes using Claude to build a facial-recognition system for a retail store that tracks shoppers without their consent to build behavioral profiles. How should this proposal be classified under the AUP?',
    answerOptions: [
      { id: 'a', text: 'High-risk (Employment and housing) — conditionally permitted with qualified-professional review and disclosure.' },
      { id: 'b', text: 'A universal prohibition (surveillance / non-consensual tracking) — an immediate no, not something reviewable into compliance.' },
      { id: 'c', text: 'Acceptable as long as a disclaimer is shown to shoppers on entry.' },
      { id: 'd', text: 'Acceptable if the store discloses that AI is being used, since disclosure satisfies chatbot-style guidelines.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Non-consensual facial recognition and location/behavior tracking fall under the universal prohibition cluster covering surveillance and predictive policing. Universal prohibitions are not conditional — they are an immediate "no," unlike high-risk areas which are conditionally permitted with review.',
    explanationForEachOption: {
      a: 'Wrong. This is not a high-risk area needing review — it is a universal prohibition, which cannot be brought into compliance by adding review.',
      b: 'Correct. Non-consensual facial recognition/tracking is a universal prohibition category — an immediate no regardless of safeguards.',
      c: 'Wrong. A disclaimer does not convert a universal prohibition into an acceptable use.',
      d: 'Wrong. Disclosure requirements apply to permitted use cases (like chatbots); they do not override a universal prohibition.',
    },
    keyExamClue: 'Universal prohibitions (e.g., non-consensual surveillance) are an immediate no — no review path makes them acceptable.',
    learningObjective: 'Classify a proposed use case correctly as a universal prohibition versus a conditionally-permitted high-risk area.',
    relatedLessonIds: ['lesson-6-1'],
    relatedLabIds: ['lab-human-review-decision'],
    sourceIds: ['usage-policy'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['aup', 'universal-prohibition', 'surveillance'],
    estimatedTimeSeconds: 70,
    enabled: true,
  },
  {
    id: 'q-d6-03',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-2',
    difficulty: 'moderate',
    questionType: 'multiple-response',
    prompt:
      'A compliance officer is briefing new hires on how Anthropic handles customer data across different account types. Which TWO statements are accurate? (Select TWO)',
    answerOptions: [
      { id: 'a', text: 'On the commercial surface (API, Claude for Work), Anthropic may not train models on Customer Content from Services.' },
      { id: 'b', text: 'On the consumer surface (Free/Pro/Max), conversation content may be used for training by default unless the user opts out.' },
      { id: 'c', text: 'Incognito chats are still used for training even when the model-improvement setting is on.' },
      { id: 'd', text: 'The commercial surface requires an explicit opt-out to be excluded from training, the same as the consumer surface.' },
      { id: 'e', text: 'Deleted conversations are retained indefinitely on the backend for legal reasons.' },
    ],
    correctAnswerIds: ['a', 'b'],
    explanation:
      'The Commercial Terms state that Anthropic may not train on Customer Content from commercial Services. The consumer surface is the opposite default: used for training unless the user opts out in settings.',
    explanationForEachOption: {
      a: 'Correct. Commercial Customer Content is excluded from training per the Commercial Terms.',
      b: 'Correct. Consumer surfaces train by default unless the user opts out.',
      c: 'Wrong. Incognito chats are NOT used for training, even with model-improvement enabled — that is the point of Incognito mode.',
      d: 'Wrong. The commercial surface is excluded from the start; no opt-out action is required, unlike the consumer surface.',
      e: 'Wrong. Deleted conversations disappear from the backend within up to 30 days, not indefinitely.',
    },
    keyExamClue: 'Commercial = no training, no opt-out needed. Consumer = trains by default, opt-out required. Incognito never trains.',
    learningObjective: 'Correctly state the commercial-vs-consumer training defaults and the role of Incognito chats.',
    relatedLessonIds: ['lesson-6-2'],
    relatedLabIds: ['lab-sensitive-data-handling'],
    sourceIds: ['commercial-terms', 'data-retention'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['privacy', 'training', 'multiple-response'],
    estimatedTimeSeconds: 85,
    enabled: true,
  },
  {
    id: 'q-d6-04',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-2',
    difficulty: 'difficult',
    questionType: 'single-choice',
    prompt:
      'A vendor asks how quickly Anthropic must notify a customer under the DPA if a security incident affecting Customer Content occurs, and what happens to data after the contract ends. Which answer matches the DPA\'s stated protections?',
    answerOptions: [
      { id: 'a', text: 'Notification within 48 hours; data deleted within 30 days of contract termination.' },
      { id: 'b', text: 'Notification within 7 days; data deleted within 90 days of contract termination.' },
      { id: 'c', text: 'Notification within 24 hours; data retained indefinitely for audit purposes.' },
      { id: 'd', text: 'No notification requirement exists; deletion timing is left entirely to the customer\'s discretion.' },
    ],
    correctAnswerIds: ['a'],
    explanation:
      'The DPA specifies security incident notification within 48 hours and data deletion within 30 days after contract termination, alongside protections like AES-256 encryption at rest and TLS 1.2+ in transit.',
    explanationForEachOption: {
      a: 'Correct. 48-hour incident notification and 30-day post-termination deletion are the DPA\'s stated figures.',
      b: 'Wrong. These figures (7 days, 90 days) do not match the DPA.',
      c: 'Wrong. 24-hour notification is not the stated figure, and indefinite retention contradicts the 30-day post-termination deletion commitment.',
      d: 'Wrong. The DPA does specify both a notification window and a deletion timeline.',
    },
    keyExamClue: 'DPA: 48-hour breach notification; data deleted within 30 days after contract termination.',
    learningObjective: 'Recall the DPA\'s specific incident-notification and post-termination deletion timelines.',
    relatedLessonIds: ['lesson-6-2'],
    relatedLabIds: ['lab-sensitive-data-handling'],
    sourceIds: ['dpa'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['dpa', 'retention', 'security'],
    estimatedTimeSeconds: 65,
    enabled: true,
  },
  {
    id: 'q-d6-05',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-3',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'A risk committee asks whether current Claude models are subject to the ASL-3 safety standard, and what would trigger a move to it. Based on the RSP\'s staged AI Safety Levels, what is the accurate answer?',
    answerOptions: [
      { id: 'a', text: 'All current models operate at ASL-2; ASL-3 would be triggered by reaching the threshold for meaningful assistance with CBRN weapons.' },
      { id: 'b', text: 'All current models already operate at ASL-3, since Claude is a highly capable model family.' },
      { id: 'c', text: 'ASL levels apply only to open-source models, not to Claude.' },
      { id: 'd', text: 'ASL-3 is triggered whenever a new model version is released, regardless of capability.' },
    ],
    correctAnswerIds: ['a'],
    explanation:
      'The RSP defines staged AI Safety Levels; all current models operate at ASL-2. Reaching the capability threshold for meaningful CBRN weapons assistance is one of the defined triggers for the stricter ASL-3 standard.',
    explanationForEachOption: {
      a: 'Correct. Current models are at ASL-2; the CBRN meaningful-assistance threshold is a defined ASL-3 trigger.',
      b: 'Wrong. Current models operate at ASL-2, not ASL-3.',
      c: 'Wrong. ASL is Anthropic\'s own framework for its models, not an open-source-specific standard.',
      d: 'Wrong. A version release alone does not trigger ASL-3 — a capability threshold (CBRN or autonomous R&D) does.',
    },
    keyExamClue: 'Current models = ASL-2. ASL-3 triggers on reaching the CBRN meaningful-assistance capability threshold.',
    learningObjective: 'State the current ASL operating level and the capability threshold that would raise it.',
    relatedLessonIds: ['lesson-6-3'],
    relatedLabIds: [],
    sourceIds: ['rsp'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['rsp', 'asl', 'governance'],
    estimatedTimeSeconds: 65,
    enabled: true,
  },
  {
    id: 'q-d6-06',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-4',
    difficulty: 'difficult',
    questionType: 'single-choice',
    prompt:
      'While handling a request, Claude determines that following the user\'s literal instruction would conflict with Anthropic\'s specific guidelines, but the guideline in question does not itself raise a safety or broad-ethics concern. Under the Constitution\'s priority order, which consideration wins, and why?',
    answerOptions: [
      { id: 'a', text: 'The user\'s instruction wins, because "genuinely helpful" is the top priority.' },
      { id: 'b', text: 'Anthropic\'s guidelines win over pursuing pure helpfulness, since guidelines rank above helpfulness (though still below safety and ethics) in the priority order.' },
      { id: 'c', text: 'Neither wins; Claude should refuse to respond entirely whenever any conflict exists.' },
      { id: 'd', text: 'The user\'s instruction always wins whenever no CBRN risk is present.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'The Constitution\'s four-level order is broadly safe > broadly ethical > Anthropic\'s guidelines > genuinely helpful. With no safety or ethics concern in play, the next-highest consideration — Anthropic\'s guidelines — outranks pursuing helpfulness for its own sake.',
    explanationForEachOption: {
      a: 'Wrong. Helpful is the lowest of the four priorities, not the top.',
      b: 'Correct. Guidelines rank above helpfulness in the order (safe > ethical > guidelines > helpful).',
      c: 'Wrong. The Constitution provides a priority order specifically so Claude does not need to default to blanket refusal.',
      d: 'Wrong. The absence of CBRN risk does not by itself make the user\'s instruction the top priority — guidelines still outrank pure helpfulness.',
    },
    keyExamClue: 'Constitution order: safe > ethical > guidelines > helpful — guidelines outrank helpfulness absent a safety/ethics issue.',
    learningObjective: 'Apply the Constitution\'s four-level priority order to a guidelines-vs-helpfulness conflict.',
    relatedLessonIds: ['lesson-6-4'],
    relatedLabIds: [],
    sourceIds: ['constitution'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['constitution', 'priority-order', 'ethics'],
    estimatedTimeSeconds: 75,
    enabled: true,
  },
];
