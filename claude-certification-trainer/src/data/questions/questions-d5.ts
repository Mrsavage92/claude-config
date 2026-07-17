import type { Question } from '@/schemas';

/**
 * Domain 5 — Configuration and Knowledge Management.
 *
 * Independently authored, scenario-based items grounded in the CCAO-F source
 * guide (Domain 5, lines 693–902): Projects (instructions + knowledge
 * sources), connectors/sync sources, system-level instruction structure, and
 * maintenance of knowledge and memory.
 */

const V = '2026-07-17';

export const questionsD5: Question[] = [
  {
    id: 'q-d5-01',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-1',
    difficulty: 'easy',
    questionType: 'single-choice',
    prompt:
      'A team lead is setting up a new Claude Project for "weekly sales reporting." She plans to paste the report template and last quarter\'s numbers directly into the Project instructions field, reasoning that "it will always be right there for Claude to see." What is the best guidance to give her?',
    answerOptions: [
      { id: 'a', text: 'Keep the template and past numbers in the instructions field — that keeps everything in one place.' },
      { id: 'b', text: 'Put the role, tone, and rules in instructions, and move the template and past numbers into knowledge sources (uploaded files).' },
      { id: 'c', text: 'Skip instructions entirely and only use knowledge sources.' },
      { id: 'd', text: 'Create a separate Project for every weekly report so nothing has to be reused.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'A Project separates two components: instructions (the system-level base settings — role, tone, rules) and knowledge sources (the materials Claude grounds responses in). Reference materials like templates and past deliverables belong in knowledge sources, not instructions, so the instructions stay a clean, reusable set of rules.',
    explanationForEachOption: {
      a: 'Wrong. Instructions are the base settings for the Project, not a place to dump reference materials — mixing the two blurs the design and makes instructions harder to maintain.',
      b: 'Correct. Instructions hold role/tone/rules; templates and past deliverables belong in knowledge sources, which is exactly what they ground responses against.',
      c: 'Wrong. Omitting instructions loses the role, constraints, and format guidance that shapes every chat in the Project.',
      d: 'Wrong. Recurring work is exactly the case for permanently mounting materials in one Project\'s knowledge sources, not re-creating a Project each time.',
    },
    keyExamClue: 'Instructions = role/tone/rules; knowledge sources = materials that ground answers. Keep them separate.',
    learningObjective: 'Distinguish Project instructions from knowledge sources and place content in the correct component.',
    relatedLessonIds: ['lesson-5-1'],
    relatedLabIds: ['lab-claude-projects'],
    sourceIds: ['what-are-projects'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['projects', 'instructions', 'knowledge-sources'],
    estimatedTimeSeconds: 60,
    enabled: true,
  },
  {
    id: 'q-d5-02',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-2',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'An operations analyst wants Claude to reference the "Q3 Contracts" folder in the company shared drive. To save setup time, she connects the entire shared drive (which also holds HR files, accounting data, and old archives) and adds an instruction telling Claude to "only look at the Q3 Contracts folder." What is wrong with this approach?',
    answerOptions: [
      { id: 'a', text: 'Nothing — the instruction fully compensates for the broad connector scope.' },
      { id: 'b', text: 'Connecting the whole drive lets irrelevant files mix into the search target, lowering accuracy; the connector scope itself should be narrowed to the Q3 Contracts folder.' },
      { id: 'c', text: 'Connectors cannot be scoped to a single folder, so this is the only option.' },
      { id: 'd', text: 'The instruction should have been placed in a knowledge source file instead of the Project instructions.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Narrowing a connector\'s scope to the minimum necessary is the key judgment for connectors. "Connect everything and instruct Claude to ignore the rest" is unreliable because irrelevant files still enter the search target and degrade accuracy; the fix is to scope the connector itself to the relevant folder.',
    explanationForEachOption: {
      a: 'Wrong. An instruction to "only look at X" does not remove the other files from the searchable scope — accuracy still degrades.',
      b: 'Correct. Over-broad scope mixes irrelevant files into search; the connector itself should be narrowed to the specific folder needed.',
      c: 'Wrong. Connectors can and should be scoped to specific folders or threads, not the entire drive or inbox.',
      d: 'Wrong. The problem is not where the instruction lives — it is that the connector scope itself is too wide.',
    },
    keyExamClue: '"Connect everything, instruct Claude to ignore the rest" is unreliable — narrow the connector scope itself.',
    learningObjective: 'Apply the minimal-scope principle when configuring connectors.',
    relatedLessonIds: ['lesson-5-2'],
    relatedLabIds: ['lab-connector-scope'],
    sourceIds: ['google-workspace-connectors', 'compliance-activities'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['connectors', 'scope', 'sync-sources'],
    estimatedTimeSeconds: 70,
    enabled: true,
  },
  {
    id: 'q-d5-03',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-2',
    difficulty: 'easy',
    questionType: 'single-choice',
    prompt:
      'A sales rep connects Gmail to her Claude Project and asks Claude to "reply to this prospect\'s email and send it." What will actually happen, given what the Gmail connector supports?',
    answerOptions: [
      { id: 'a', text: 'Claude will send the reply directly through Gmail on her behalf.' },
      { id: 'b', text: 'Claude can search, read, and draft the reply in Gmail, but cannot send it — she must send it herself.' },
      { id: 'c', text: 'Claude will refuse to touch Gmail at all, since it is read-only.' },
      { id: 'd', text: 'Claude will schedule the email to send automatically after a delay.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'The Gmail connector supports searching, reading, and drafting email, but not sending. A drafted reply still requires the human user to review and send it.',
    explanationForEachOption: {
      a: 'Wrong. Sending is explicitly outside what the Gmail connector can do.',
      b: 'Correct. Gmail connector capability is search/read/draft; sending remains a manual, human step.',
      c: 'Wrong. Gmail is not read-only — Claude can create drafts, just not send them.',
      d: 'Wrong. There is no delayed auto-send behavior; sending is not something the connector performs at all.',
    },
    keyExamClue: 'Gmail connector: search, read, draft — never send.',
    learningObjective: 'Recall the specific capabilities and limits of the Gmail connector.',
    relatedLessonIds: ['lesson-5-2'],
    relatedLabIds: ['lab-connector-scope'],
    sourceIds: ['google-workspace-connectors'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['gmail', 'connectors', 'capabilities'],
    estimatedTimeSeconds: 50,
    enabled: true,
  },
  {
    id: 'q-d5-04',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-3',
    difficulty: 'difficult',
    questionType: 'single-choice',
    prompt:
      'A support-desk Project instruction currently reads as one paragraph: "You are a support agent. Answer concisely. Do not guess anything not in the knowledge base. Be thorough and cover every angle. Reply in three bullet points. Use a friendly tone." Reviewers notice Claude sometimes writes long, comprehensive answers and sometimes clipped ones, inconsistently. What is the most likely cause and fix?',
    answerOptions: [
      { id: 'a', text: 'The Project needs more knowledge sources uploaded; the instructions are fine as written.' },
      { id: 'b', text: 'Packing contradictory rules ("concise" vs. "thorough") into one long paragraph buries the middle rules; restructure into topic-based XML-tagged sections and state an explicit priority.' },
      { id: 'c', text: 'The Project should be switched to a different underlying model to fix the inconsistency.' },
      { id: 'd', text: 'The instructions should be shortened to a single word, "helpful," to remove any ambiguity.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Packing multiple rules into one long paragraph causes middle rules to be ignored, and unresolved contradictions (concise vs. thorough) leave Claude to guess which to prioritize. The fix is topic-based XML-tagged sections (role, constraints, format) plus an explicit priority/exception for the conflicting requirements.',
    explanationForEachOption: {
      a: 'Wrong. More knowledge sources do not resolve a structural, contradictory-instruction problem.',
      b: 'Correct. Structure instructions into XML-tagged, topic-based sections and state an explicit priority for the "concise vs. thorough" conflict.',
      c: 'Wrong. Switching models does not fix an instruction-design problem.',
      d: 'Wrong. A single vague word removes all the useful constraints along with the ambiguity — it does not add clarity.',
    },
    keyExamClue: 'One long paragraph buries the middle; use topic-based XML tags and an explicit priority for contradictions.',
    learningObjective: 'Diagnose unstable output caused by unstructured, contradictory instructions and apply the XML-tagged fix.',
    relatedLessonIds: ['lesson-5-3'],
    relatedLabIds: ['lab-project-instructions'],
    sourceIds: ['prompting-best-practices', 'what-are-projects'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['instructions', 'xml-tags', 'priority'],
    estimatedTimeSeconds: 85,
    enabled: true,
  },
  {
    id: 'q-d5-05',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-4',
    difficulty: 'moderate',
    questionType: 'single-choice',
    prompt:
      'A Project uses a shared memory store to hold notes for an agent that also processes fetched web content and third-party tool output as part of its normal operation. What access-rights design does the guidance recommend for that untrusted content?',
    answerOptions: [
      { id: 'a', text: 'Grant read_write access broadly so the agent can freely update the store from anything it encounters.' },
      { id: 'b', text: 'Mark untrusted inputs (user prompts, fetched web content, external tool output) as read_only, reserving read_write for sessions that legitimately add new memories.' },
      { id: 'c', text: 'Disable the memory store entirely whenever any untrusted content is involved.' },
      { id: 'd', text: 'Apply read_only to everything, including trusted sessions that are meant to add new memories.' },
    ],
    correctAnswerIds: ['b'],
    explanation:
      'Restricting writes is a core memory-store design principle: untrusted inputs should be marked read_only to prevent malicious content from being written into the store, while read_write is reserved for sessions that legitimately add new memories.',
    explanationForEachOption: {
      a: 'Wrong. Broad read_write access to untrusted content is exactly the risk the read_only restriction is meant to prevent.',
      b: 'Correct. read_only for untrusted inputs, read_write reserved for legitimate memory-adding sessions.',
      c: 'Wrong. Disabling the store entirely is not the recommended control — scoped access rights are.',
      d: 'Wrong. Blanket read_only would also block legitimate sessions from adding new memories, which defeats the store\'s purpose.',
    },
    keyExamClue: 'Untrusted inputs → read_only; legitimate memory-adding sessions → read_write.',
    learningObjective: 'Apply memory-store access-rights design to prevent malicious writes from untrusted content.',
    relatedLessonIds: ['lesson-5-4'],
    relatedLabIds: ['lab-project-knowledge'],
    sourceIds: ['agent-memory'],
    provenance: 'independently-authored',
    verifiedAt: V,
    tags: ['memory', 'access-rights', 'security'],
    estimatedTimeSeconds: 70,
    enabled: true,
  },
];
