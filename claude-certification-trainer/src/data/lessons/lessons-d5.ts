import type { Lesson } from '@/schemas';

export const lessonsD5: Lesson[] = [
  {
    id: 'lesson-5-1',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-1',
    title: 'Configure a project: instructions vs. knowledge',
    summary:
      'A project fixes the work context with two separate components — instructions (base settings) and knowledge sources (grounding material) — and the quality of each drives output quality.',
    content: `A **project** is a self-contained Claude.ai workspace: independent chat history, independent knowledge base, no context shared with other projects. The basic practice is to split projects by purpose — sales materials, research, weekly reports — rather than running everything through one general-purpose project. Free users get up to 5 projects; paid plans relax the limit.

Every project has exactly two components, and separating them is the starting point of good design:

- **Instructions** — a system-level prompt defining role, tone, and rules. The "base settings" applied to every chat in the project.
- **Knowledge sources** — the collective term for uploaded files and connected data, the "materials" Claude grounds responses in.

Uploaded files are read-only project knowledge (text, PDF, spreadsheets, code). Because Claude answers from document content instead of guessing, unsupported responses decrease. On paid plans, **RAG** activates automatically as knowledge volume approaches the context limit, expanding effective capacity roughly 10x — so large knowledge bases keep working without a manual re-architecture.

The core principle: **instruction quality and knowledge quality together determine output quality.** Mixing contradictory materials into one project leaves Claude unable to decide which to trust, destabilizing output. When a project's purpose diverges, split it rather than overloading one.`,
    keyPrinciples: [
      'A project is self-contained: its own chat history and knowledge, no cross-project sharing.',
      'Instructions = base settings (role, tone, rules); knowledge sources = grounding materials (files + connectors).',
      'Uploaded files are read-only and ground responses instead of relying on guesses.',
      'RAG activates automatically on paid plans as knowledge nears the context limit, expanding capacity ~10x.',
    ],
    decisionRules: [
      'Split projects by purpose rather than running unrelated work through one project.',
      'Write role, constraints, and format in instructions; place only purpose-relevant materials in knowledge sources.',
      'If a project starts serving two different purposes, split it into two projects.',
    ],
    commonPitfalls: [
      'Mixing contradictory materials into one project and expecting Claude to resolve which to trust.',
      'Treating instructions and knowledge sources as interchangeable instead of two distinct components.',
    ],
    sourceIds: ['what-are-projects'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-claude-projects', 'lab-project-knowledge'],
    estimatedMinutes: 10,
  },
  {
    id: 'lesson-5-2',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-2',
    title: 'Connectors and the minimal-scope rule',
    summary:
      'Sync sources continuously reflect external providers under the user’s own permissions; the core judgment is narrowing every connector to the minimum scope it needs.',
    content: `Knowledge sources split into two kinds. **Uploaded files** are static, fixed at import time. **Sync sources** via connectors are living — continuously synchronized and always current. Supported providers: **Google Drive, Gmail, GitHub, Slack, Salesforce, Google Calendar, Asana, Outline, and MCP** resources.

Connectors respect the user's own permissions — a file unreadable in Google Drive stays unreadable through the connector. Claude accesses data only when explicitly asked, retrieving the minimum necessary.

| Connector | Can | Cannot |
|---|---|---|
| Gmail | Search, read, draft email | Send |
| Google Calendar | Check and create events | Delete events (limited) |
| Google Drive | Read Docs, Sheets, Slides, PDFs | Edit |

Responses cite sources with links, so provenance stays traceable. On Team/Enterprise, an Owner or Primary Owner must enable connectors org-wide before individual authentication; adding sync connectors is enabled only for **private** projects, disabled for shared ones.

The exam-critical judgment: **narrow every connector's scope to the minimum necessary.** "Connect the whole shared drive and tell Claude to ignore the rest" is unreliable — irrelevant files mix into search and accuracy drops. Connecting only the relevant folder keeps the search target clean. For providers standard connectors don't cover, the general-purpose **MCP connector** links external tools (its technical depth is CCA-F territory; here, know only that it exists as the extension point).`,
    keyPrinciples: [
      'Uploaded files are static; sync sources via connectors are continuously updated.',
      'Sync-source providers: Google Drive, Gmail, GitHub, Slack, Salesforce, Google Calendar, Asana, Outline, MCP.',
      'Connector access follows the user’s own permissions, and Claude retrieves only the minimum needed.',
      'Gmail connector can search, read, and draft — never send.',
      'Narrow every connector to the minimum necessary scope; over-broad scope drops accuracy.',
    ],
    decisionRules: [
      'Connect a specific folder or label, never an entire shared drive or full inbox, by default.',
      'Disconnect connectors that are no longer used, rather than leaving them wired in.',
      'On Team/Enterprise, confirm org-level connector enablement and private-project status before wiring sync sources.',
    ],
    commonPitfalls: [
      'Connecting the entire shared drive and relying on instructions to tell Claude to ignore irrelevant files.',
      'Assuming Gmail’s connector can send email on the user’s behalf.',
      'Trying to add a sync connector to a shared project and being surprised it is disabled there.',
    ],
    sourceIds: ['google-workspace-connectors', 'compliance-activities', 'mcp-connector'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-connector-scope'],
    estimatedMinutes: 11,
  },
  {
    id: 'lesson-5-3',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-3',
    title: 'Write effective system-level instructions',
    summary:
      'Structure instructions with XML tags around role, constraints, and format; state priorities for contradictions; and explicitly restrict the source to prevent guessing.',
    content: `Project instructions are the base setting for "how to behave in this project." The practical bar is the **golden rule**: show the prompt to a colleague with minimal context — if they'd be confused, Claude will be too.

Instructions cover three elements, each best wrapped in its own XML tag: **role** (focuses tone and behavior — even one sentence helps), **constraints** ("answer 'unknown' for anything not in the materials, do not guess"), and **format** ("three bullet points"). Maintain appropriate altitude: precise enough to be judged without extra context, not so rigid it becomes childish.

The core failure mode: **packing multiple rules into one long paragraph causes the middle rules to be ignored**, and unresolved contradictions (e.g., "be concise" and "be comprehensive") leave Claude guessing which wins. The fix is topic-based XML sections plus an explicit priority: \`<priority>Prioritize conciseness; exceed three points only if unavoidable</priority>\`.

For long or knowledge-intensive tasks (20k+ tokens), place data **on top, question at the bottom** — reported to improve quality — and wrap documents in \`<document>\`, \`<document_content>\`, \`<source>\` tags. Use 3–5 diverse few-shot examples in \`<example>\` tags to stabilize tone and structure.

Finally: uploading materials is not enough on its own. Unless instructions explicitly **restrict the source** ("look only at these materials, answer 'unknown' for anything not in them"), Claude fills gaps with general knowledge.`,
    keyPrinciples: [
      'The golden rule: if a low-context colleague would be confused, Claude will be too.',
      'Structure role, constraints, and format as separate topic-based sections, ideally in XML tags.',
      'One long paragraph buries middle rules; state an explicit priority for contradictory requirements.',
      'For long/knowledge-intensive tasks, place data on top and the question at the bottom.',
      'Restrict the source explicitly, or Claude fills gaps with general knowledge despite uploaded materials.',
    ],
    decisionRules: [
      'Always include role, constraints, and format as distinct instruction sections.',
      'When two requirements conflict, state which one wins rather than leaving both unresolved.',
      'After uploading reference materials, add an explicit source-restriction instruction.',
      'For long documents, place the document content before the question, not after.',
    ],
    commonPitfalls: [
      'Writing instructions as one long paragraph where later rules get buried and ignored.',
      'Uploading materials but never restricting Claude to them, so it guesses from general knowledge.',
      'Leaving contradictory instructions (concise vs. comprehensive) without a stated priority.',
    ],
    sourceIds: ['prompting-best-practices', 'what-are-projects'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-project-instructions'],
    estimatedMinutes: 12,
  },
  {
    id: 'lesson-5-4',
    certificationId: 'ccao-f',
    domainId: 'd5',
    taskStatementId: 'ts-5-4',
    title: 'Maintain configuration, memory, and Skills',
    summary:
      'Break the knowledge-staleness cycle with periodic maintenance, design memory stores small and read_only for untrusted input, and audit and vet Skills.',
    content: `A project is not set-and-forget. Left alone, price lists go stale, policies get revised, folders get reorganized — and Claude keeps answering from outdated information, with reliability declining gradually. The cycle is: add knowledge (accurate) → leave it → staleness → periodic maintenance (archive/delete old versions, reconfirm scope, update policies) → cycle continues. The longer neglect runs, the worse the damage.

**Memory stores** hold information across sessions — preferences, conventions, past corrections, domain knowledge. The design principles:

| Principle | Detail |
|---|---|
| Narrow by purpose | Split by user, shared knowledge, or project — never one giant store |
| Tidy before it fills | Delete or compress old memories near the limit |
| When expanding scope | Add a new store; keep the original read-only |
| Restrict writes | Mark untrusted inputs (user prompts, fetched content, tool output) \`read_only\` |

**Memory versions** give a 30-day audit trail of who changed what, when. **Redact** removes secret information from historical versions while preserving the trail — for secret-key erasure or deletion requests.

**Skills** are modular extensions (\`SKILL.md\` + YAML frontmatter) with **progressive disclosure**: Level 1 metadata (~100 tokens, always loaded), Level 2 body (<5k tokens, loaded when triggered), Level 3 resources (loaded only when needed) — so installing many Skills barely costs idle context. A Skill's \`description\` must state both what it does and when to use it. Use only trusted (self-authored or Anthropic-provided) Skills, audit them, and disable unused ones early.`,
    keyPrinciples: [
      'Knowledge goes stale on a cycle: add → neglect → staleness → maintenance → repeat.',
      'Memory stores should be small and purpose-scoped (per user, shared knowledge, or project), not one giant store.',
      'Untrusted inputs get read_only memory access; expanding scope means a new store, original kept read-only.',
      'Memory versions retain a 30-day audit trail; redact removes secrets while preserving that trail.',
      'Skills use progressive disclosure (metadata → body → resources) so idle Skills cost minimal context.',
    ],
    decisionRules: [
      'Schedule periodic maintenance: archive/delete stale versions, reconfirm scope, refresh policies and price lists.',
      'Mark untrusted input sources read_only in memory to prevent malicious writes.',
      'When a memory store approaches its limit, compress or delete before adding more, or split into a new scoped store.',
      'Vet Skills for trusted origin before installing, and disable unused Skills promptly.',
    ],
    commonPitfalls: [
      'Leaving a project unmaintained and letting Claude answer from outdated prices or policies.',
      'Building one giant general-purpose memory store instead of small, purpose-scoped ones.',
      'Granting read_write memory access to untrusted or externally-sourced input.',
    ],
    sourceIds: ['agent-memory', 'agent-skills-overview'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-project-knowledge'],
    estimatedMinutes: 12,
  },
];
