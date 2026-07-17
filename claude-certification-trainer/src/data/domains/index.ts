import type { Domain, TaskStatement } from '@/schemas';

/**
 * The seven CCAO-F domains and their task statements, with official blueprint
 * weightings. Weightings sum to 1.0 (14 + 21 + 12 + 16 + 12 + 15 + 10).
 */

export const taskStatements: TaskStatement[] = [
  // Domain 1
  { id: 'ts-1-1', domainId: 'd1', code: '1.1', title: 'Create effective prompts for business and technical tasks' },
  { id: 'ts-1-2', domainId: 'd1', code: '1.2', title: 'Apply task decomposition techniques to structure complex requests' },
  { id: 'ts-1-3', domainId: 'd1', code: '1.3', title: 'Iterate prompts to improve output quality' },
  { id: 'ts-1-4', domainId: 'd1', code: '1.4', title: 'Adapt prompting strategies based on task type' },
  // Domain 2
  { id: 'ts-2-1', domainId: 'd2', code: '2.1', title: 'Evaluate Claude-generated outputs for accuracy and completeness' },
  { id: 'ts-2-2', domainId: 'd2', code: '2.2', title: 'Identify hallucinations, inconsistencies, and biases in responses' },
  { id: 'ts-2-3', domainId: 'd2', code: '2.3', title: 'Apply fact-checking and validation techniques' },
  { id: 'ts-2-4', domainId: 'd2', code: '2.4', title: 'Determine when human review or additional verification is required' },
  { id: 'ts-2-5', domainId: 'd2', code: '2.5', title: 'Edit, adapt, refine, and compare outputs for the intended audience' },
  { id: 'ts-2-6', domainId: 'd2', code: '2.6', title: 'Organize and curate information and select appropriate output formats' },
  // Domain 3
  { id: 'ts-3-1', domainId: 'd3', code: '3.1', title: 'Select appropriate Claude product features' },
  { id: 'ts-3-2', domainId: 'd3', code: '3.2', title: 'Differentiate between Claude model types (Haiku, Sonnet, Opus)' },
  { id: 'ts-3-3', domainId: 'd3', code: '3.3', title: 'Align model selection with task requirements (cost, speed, quality)' },
  { id: 'ts-3-4', domainId: 'd3', code: '3.4', title: 'Understand and manage context limitations and memory considerations' },
  // Domain 4
  { id: 'ts-4-1', domainId: 'd4', code: '4.1', title: 'Apply Claude to analyze requirements and use cases' },
  { id: 'ts-4-2', domainId: 'd4', code: '4.2', title: 'Leverage Claude for research, planning, and process optimization' },
  { id: 'ts-4-3', domainId: 'd4', code: '4.3', title: 'Use Claude to support solution design, development, and iteration' },
  { id: 'ts-4-4', domainId: 'd4', code: '4.4', title: 'Integrate Claude into existing workflows to augment or redesign them' },
  { id: 'ts-4-5', domainId: 'd4', code: '4.5', title: "Communicate Claude's value and limitations to stakeholders" },
  // Domain 5
  { id: 'ts-5-1', domainId: 'd5', code: '5.1', title: 'Configure Claude Projects with instructions and knowledge sources' },
  { id: 'ts-5-2', domainId: 'd5', code: '5.2', title: 'Manage uploaded knowledge and connectors (e.g., Google Drive, Gmail)' },
  { id: 'ts-5-3', domainId: 'd5', code: '5.3', title: 'Create effective system-level instructions' },
  { id: 'ts-5-4', domainId: 'd5', code: '5.4', title: 'Inform, maintain, and update Claude configurations, knowledge sources, and instructions' },
  // Domain 6
  { id: 'ts-6-1', domainId: 'd6', code: '6.1', title: 'Identify appropriate and inappropriate use cases' },
  { id: 'ts-6-2', domainId: 'd6', code: '6.2', title: 'Apply data sensitivity, regulatory, and privacy considerations' },
  { id: 'ts-6-3', domainId: 'd6', code: '6.3', title: 'Follow organizational AI policies and governance standards' },
  { id: 'ts-6-4', domainId: 'd6', code: '6.4', title: 'Understand the ethical implications of AI usage' },
  // Domain 7
  { id: 'ts-7-1', domainId: 'd7', code: '7.1', title: 'Identify, diagnose, and resolve issues with underperforming prompts or poor outputs' },
  { id: 'ts-7-2', domainId: 'd7', code: '7.2', title: 'Adjust approach based on feedback and results' },
  { id: 'ts-7-3', domainId: 'd7', code: '7.3', title: 'Optimize workflows for efficiency and effectiveness' },
];

export const domains: Domain[] = [
  {
    id: 'd1',
    certificationId: 'ccao-f',
    title: 'Prompting and Task Execution',
    description:
      'Write clear, explicit prompts; decompose complex requests; iterate against success criteria; and adapt prompting strategy to the task type.',
    weighting: 0.14,
    order: 1,
    taskStatementIds: ['ts-1-1', 'ts-1-2', 'ts-1-3', 'ts-1-4'],
    lessonIds: ['lesson-1-1', 'lesson-1-2', 'lesson-1-3', 'lesson-1-4'],
    sourceIds: ['prompt-eng-overview', 'prompting-best-practices', 'chain-prompts', 'prompting-tools', 'extended-thinking', 'adaptive-thinking'],
  },
  {
    id: 'd2',
    certificationId: 'ccao-f',
    title: 'Output Evaluation and Validation',
    description:
      "Judge whether an output can be trusted: evaluate accuracy and completeness, spot hallucinations and bias, fact-check to primary sources, decide when a human must review, and refine and format for the reader.",
    weighting: 0.21,
    order: 2,
    taskStatementIds: ['ts-2-1', 'ts-2-2', 'ts-2-3', 'ts-2-4', 'ts-2-5', 'ts-2-6'],
    lessonIds: ['lesson-2-1', 'lesson-2-2', 'lesson-2-3', 'lesson-2-4', 'lesson-2-5', 'lesson-2-6'],
    sourceIds: ['reduce-hallucinations', 'increase-consistency', 'structured-outputs', 'develop-tests', 'glossary', 'system-prompts-release', 'transparency-hub', 'usage-policy'],
  },
  {
    id: 'd3',
    certificationId: 'ccao-f',
    title: 'Product and Model Selection',
    description:
      'Choose the right Claude.ai product feature, assign the right model tier, and manage context and memory to balance cost, speed, and quality.',
    weighting: 0.12,
    order: 3,
    taskStatementIds: ['ts-3-1', 'ts-3-2', 'ts-3-3', 'ts-3-4'],
    lessonIds: ['lesson-3-1', 'lesson-3-2', 'lesson-3-3', 'lesson-3-4'],
    sourceIds: ['models-overview', 'choosing-a-model', 'context-windows', 'compaction', 'agent-skills-overview', 'code-execution-tool', 'agent-memory', 'effective-context-engineering'],
  },
  {
    id: 'd4',
    certificationId: 'ccao-f',
    title: 'Workflow Integration and Solution Design',
    description:
      'Find where Claude adds value, choose the simplest composable pattern, decide whether to augment or redesign a workflow, and communicate value and limits to stakeholders.',
    weighting: 0.16,
    order: 4,
    taskStatementIds: ['ts-4-1', 'ts-4-2', 'ts-4-3', 'ts-4-4', 'ts-4-5'],
    lessonIds: ['lesson-4-1', 'lesson-4-2', 'lesson-4-3', 'lesson-4-4', 'lesson-4-5'],
    sourceIds: ['claude-for-work', 'building-effective-agents', 'enterprise-solutions', 'anthropic-academy'],
  },
  {
    id: 'd5',
    certificationId: 'ccao-f',
    title: 'Configuration and Knowledge Management',
    description:
      'Configure Projects with instructions and knowledge sources, manage connectors at minimal scope, write structured system instructions, and maintain configurations so they do not go stale.',
    weighting: 0.12,
    order: 5,
    taskStatementIds: ['ts-5-1', 'ts-5-2', 'ts-5-3', 'ts-5-4'],
    lessonIds: ['lesson-5-1', 'lesson-5-2', 'lesson-5-3', 'lesson-5-4'],
    sourceIds: ['what-are-projects', 'google-workspace-connectors', 'compliance-activities', 'mcp-connector', 'agent-memory', 'agent-skills-overview', 'prompting-best-practices'],
  },
  {
    id: 'd6',
    certificationId: 'ccao-f',
    title: 'Governance, Risk, and Responsible Use',
    description:
      'Classify use cases against the Usage Policy, apply data-sensitivity and privacy safeguards, align with developer governance (RSP/ASL, PBC/LTBT), and reason about ethics via the Constitution.',
    weighting: 0.15,
    order: 6,
    taskStatementIds: ['ts-6-1', 'ts-6-2', 'ts-6-3', 'ts-6-4'],
    lessonIds: ['lesson-6-1', 'lesson-6-2', 'lesson-6-3', 'lesson-6-4'],
    sourceIds: ['usage-policy', 'commercial-terms', 'dpa', 'privacy-policy', 'data-retention', 'minors-guidelines', 'rsp', 'constitution', 'regional-compliance', 'transparency-hub', 'company'],
  },
  {
    id: 'd7',
    certificationId: 'ccao-f',
    title: 'Troubleshooting and Optimization',
    description:
      'Diagnose prompt and output failures by symptom, adjust with concrete feedback and self-correction, and optimize workflows for cost, latency, and quality.',
    weighting: 0.1,
    order: 7,
    taskStatementIds: ['ts-7-1', 'ts-7-2', 'ts-7-3'],
    lessonIds: ['lesson-7-1', 'lesson-7-2', 'lesson-7-3'],
    sourceIds: ['reduce-hallucinations', 'increase-consistency', 'prompting-tools', 'develop-tests', 'choosing-a-model', 'effective-context-engineering', 'prompting-best-practices'],
  },
];

export const domainById = Object.fromEntries(domains.map((d) => [d.id, d]));
export const taskStatementById = Object.fromEntries(taskStatements.map((t) => [t.id, t]));
