import type { Lab } from '@/schemas';

/**
 * Hands-on labs for Domain 3 (Product and Model Selection), Domain 5
 * (Configuration and Knowledge Management), and the Domain 2/Domain 6
 * intersection (output evaluation meets governance).
 *
 * Every lab runs entirely inside the learner's own Claude.ai environment —
 * no API key, no external service. All example data is fictional (a made-up
 * company, "Meridian Logistics," dummy account numbers, invented numbers)
 * and safe to paste verbatim into a real Claude.ai chat.
 */

export const labs2: Lab[] = [
  {
    id: 'lab-code-execution',
    certificationId: 'ccao-f',
    domainIds: ['d3'],
    title: 'Analyze a CSV and Generate Charts with Code Execution',
    objective:
      'Use the Code Execution tool to run real Python in a sandboxed container, analyzing a small CSV dataset and producing a chart, instead of asking Claude to eyeball the numbers.',
    prerequisites: [],
    estimatedMinutes: 15,
    setup: [
      'Prepare a small CSV of order data for a fictional company (Meridian Logistics) with columns date, region, units, revenue — about a dozen rows spanning three regions.',
      'Open a new Claude.ai chat on a model that supports Code Execution.',
      'Have the CSV text ready to paste directly into the chat (no file upload required).',
    ],
    steps: [
      {
        title: 'Provide the dataset',
        detail:
          'Paste the CSV content directly into the chat and ask Claude to use code execution to load it into a pandas DataFrame and compute total revenue and units by region.',
      },
      {
        title: 'Request summary statistics',
        detail:
          'Ask for month-over-month totals as well, so Claude has to run an actual groupby/aggregation rather than a single sum.',
      },
      {
        title: 'Ask for a chart',
        detail:
          'Ask Claude to generate a bar chart of total revenue by region using matplotlib, with labeled axes and a title, and to show you the rendered image.',
      },
      {
        title: 'Filter and recompute',
        detail:
          "Ask Claude to filter the same DataFrame to a single region and recompute month-over-month growth, to see whether it reuses the already-loaded data or starts over.",
      },
      {
        title: 'Inspect the actual code',
        detail:
          'Expand the code block Claude ran and confirm it is real, runnable Python (pandas/matplotlib imports, no placeholder comments standing in for logic).',
      },
    ],
    prompts: [
      {
        label: 'Load and summarize',
        prompt: `Here is a CSV of Q1 orders for Meridian Logistics. Use code execution to load it into a pandas DataFrame and compute total revenue and total units by region.

date,region,units,revenue
2026-01-05,North,120,4800
2026-01-12,South,95,3610
2026-01-19,West,150,7200
2026-01-26,North,110,4400
2026-02-02,South,130,5330
2026-02-09,West,140,6580
2026-02-16,North,125,5100
2026-02-23,South,105,4095
2026-03-02,West,160,7840
2026-03-09,North,118,4720
2026-03-16,South,112,4368
2026-03-23,West,155,7595`,
      },
      {
        label: 'Chart it',
        prompt:
          'Using the same DataFrame, generate a bar chart of total revenue by region with matplotlib, with labeled axes and a title. Show me the chart.',
      },
      {
        label: 'Filter and recompute',
        prompt:
          "Filter the DataFrame to region == 'West' only, and recompute the month-over-month revenue growth rate for that region.",
      },
    ],
    expectedOutcome:
      'Claude runs actual Python in a sandboxed container (visible in an expandable code block), returns numerically correct totals, and produces a rendered chart image — not a hand-typed estimate.',
    whatToObserve: [
      'The code block is real, runnable Python (pandas/matplotlib imports), not narrated pseudocode.',
      'The sandbox has no internet access — Claude can only compute on the data you gave it, not fetch anything external.',
      'The numbers in the chart match the numbers in the text summary, with no arithmetic drift.',
      'Re-filtering reuses the already-loaded DataFrame instead of asking you to re-paste the CSV.',
    ],
    whyItMatters:
      "Code Execution is the right-fit feature whenever a task's verb is 'compute' — totals, statistics, chart generation — rather than 'answer from memory.' Recognizing when to expect a sandboxed run, and verifying the code is genuinely executed rather than narrated, is exactly the TS 3.1/3.4 judgment tested on the exam.",
    troubleshooting: [
      {
        problem: 'Claude answers with numbers but never shows a code block.',
        fix: "Ask explicitly: 'use code execution / run this in Python.' Some phrasings get answered from reasoning alone; confirm the feature is enabled if it never appears.",
      },
      {
        problem: "The chart doesn't render.",
        fix: 'Ask Claude to re-render or output it as an attached image; persistent failure may indicate the container hit a resource limit (5 GiB memory/disk) — simplify the dataset and retry.',
      },
    ],
    cleanup: [],
    sourceIds: ['code-execution-tool'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote:
      'Code Execution is available on Free and paid Claude.ai plans, but usage limits (container runtime, execution count) are lower on Free — heavy or repeated analysis may hit rate limits faster without a paid plan.',
  },
  {
    id: 'lab-context-management',
    certificationId: 'ccao-f',
    domainIds: ['d3'],
    title: 'Trigger Context Rot, Compact, and Restart with Carried-Over State',
    objective:
      'Deliberately grow a single conversation long enough to observe context rot, use pruning and compaction to keep going, then practice the restart-with-persisted-state countermeasure.',
    prerequisites: [],
    estimatedMinutes: 25,
    setup: [
      'Open a new chat in Claude.ai on a model with a large context window (Sonnet or Opus).',
      "Pick a fictional running scenario with enough substance for 15-20 turns — e.g., planning a product launch for Meridian Logistics' new tracking dashboard.",
      'Keep a scratch note outside the chat listing the 3-5 decisions you make, so you have ground truth to check recall against later.',
    ],
    steps: [
      {
        title: 'Build up the conversation',
        detail:
          'Discuss the fictional launch across at least 15-20 turns, introducing decisions (target date, pricing tier, feature list) and deliberately including a few unrelated tangents.',
      },
      {
        title: 'Test recall of an early decision',
        detail:
          'Near turn 15+, ask Claude to restate a decision from turn 2 or 3 verbatim. Compare against your scratch note for drift, contradiction, or vagueness.',
      },
      {
        title: 'Look for a compaction signal',
        detail:
          'Continue toward the context limit, or ask directly whether earlier turns have been automatically summarized, to check for the compaction countermeasure kicking in.',
      },
      {
        title: 'Prune manually',
        detail:
          'Ask Claude to explicitly disregard the unrelated tangents and restate only the launch-relevant decisions, then confirm whether accuracy improves.',
      },
      {
        title: 'Persist state and restart',
        detail:
          'Ask Claude for a short bullet summary of the settled decisions, open a brand-new chat, paste in only that summary, and continue planning from a clean context.',
      },
    ],
    prompts: [
      {
        label: 'Recall check',
        prompt:
          "Without scrolling up, restate the target launch date and pricing tier we settled on for Meridian Logistics' tracking dashboard, exactly as we agreed earlier in this conversation.",
      },
      {
        label: 'Persist state',
        prompt:
          "Summarize the settled decisions for the Meridian Logistics dashboard launch in 5 bullet points or fewer — only the decisions, not the discussion that led to them — so I can carry this into a new conversation.",
      },
      {
        label: 'Resume in a new session',
        prompt:
          'We previously settled these decisions for the Meridian Logistics dashboard launch: [paste the 5-bullet summary here]. Continue planning from here — next, draft the rollout communication plan.',
      },
    ],
    expectedOutcome:
      'You can point to a concrete moment where recall of an early decision degraded or wobbled, use pruning to recover accuracy in place, and cleanly resume in a fresh session using only a persisted summary rather than the full transcript.',
    whatToObserve: [
      'Whether the restated early decision matches your scratch note exactly or has drifted.',
      "Any signal — a banner, or Claude's own statement — that older turns were summarized or compacted.",
      "Whether pruning the tangents ('ignore X, Y') measurably sharpens the next answer.",
      'Whether the new session, seeded only with the summary, performs as well as the original long conversation without needing the full history replayed.',
    ],
    whyItMatters:
      'Context rot is invisible until you go looking for it. This lab makes the degradation, and the three countermeasures — prune, compact, restart-with-persisted-state — tangible instead of abstract exam definitions.',
    troubleshooting: [
      {
        problem: 'The conversation never seems to degrade even after 20+ turns.',
        fix: "Push further or add more genuinely irrelevant tangents — a short, focused conversation on a 1M-context model may not surface rot, and that's itself a valid observation for TS 3.4.",
      },
      {
        problem: 'No visible compaction indicator appears.',
        fix: 'Compaction is a beta, server-side mechanism and may not always surface a visible banner; ask Claude directly whether earlier turns were summarized, or rely on the manual prune/restart countermeasures instead.',
      },
    ],
    cleanup: ['Delete the scratch long conversation afterward if you do not want it cluttering your chat history.'],
    sourceIds: ['context-windows', 'compaction'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote:
      'Compaction (beta) requires a model that supports it (Sonnet 5, Opus 4.8/4.7/4.6, Fable 5) — check your plan and model access, since some lighter default models may not support it.',
  },
  {
    id: 'lab-research-mode',
    certificationId: 'ccao-f',
    domainIds: ['d3', 'd4'],
    title: 'Run an Agentic Multi-Source Research Task',
    objective:
      'Use Research mode to have Claude autonomously plan a search, traverse and cross-check multiple sources, and synthesize findings for an open-ended question — instead of a one-shot chat answer.',
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Open Claude.ai and enable or select Research mode from the chat composer or tools menu if it is not already visible.',
      "Pick an open-ended fictional research question tied to a business decision — e.g., market trends in third-party logistics tracking software for mid-size regional carriers, for fictional Meridian Logistics.",
      'Set aside 10-15 minutes, since agentic research runs longer than a normal chat turn.',
    ],
    steps: [
      {
        title: 'Frame an open-ended question',
        detail:
          'Submit a research prompt that requires gathering current, external information across multiple sources, not something answerable from a single document.',
      },
      {
        title: "Watch the plan",
        detail:
          "Observe Claude's stated research plan or progress before it delivers a final answer, noting that it decides its own path rather than following a fixed script.",
      },
      {
        title: 'Review the synthesis and citations',
        detail:
          'Read the final report, checking that claims are attributed to specific sources with links rather than asserted as bare fact.',
      },
      {
        title: 'Cross-check one claim',
        detail:
          'Pick one nontrivial claim from the report and open the cited source yourself to confirm it actually says what Claude claims it says.',
      },
      {
        title: 'Compare to a plain chat answer',
        detail:
          'Ask the same underlying question in a normal, non-research chat and compare depth, source count, and citation quality against the research-mode output.',
      },
    ],
    prompts: [
      {
        label: 'Open-ended research prompt',
        prompt:
          "Research current trends (last 12 months) in third-party logistics tracking software aimed at mid-size regional carriers. I run operations at a fictional company, Meridian Logistics, and I'm scoping a build-vs-buy decision for a shipment tracking dashboard. Compare at least three vendors or approaches and cite your sources.",
      },
      {
        label: 'Plain-chat comparison prompt',
        prompt:
          'Without using research mode, tell me what you know about current trends in third-party logistics tracking software for mid-size regional carriers.',
      },
    ],
    expectedOutcome:
      'Research mode produces a multi-source, cited report built from an autonomous, multi-step search, and you can point to at least one concrete citation you personally verified — visibly deeper than the same question asked as a plain chat turn.',
    whatToObserve: [
      'Research mode narrates or shows a plan or progress before delivering the final answer, rather than a single retrieval.',
      'The final report attributes specific claims to specific sources with links, letting you trace provenance.',
      'The plain-chat comparison answer is shallower, with fewer or no citations, and may lean on older training knowledge rather than fresh sources.',
      'At least one cited claim, checked against its source, holds up — or you catch one that does not, which is also a valid finding.',
    ],
    whyItMatters:
      "The exam's verb-to-feature table maps 'gather external info' specifically to Research mode because it is agentic and multi-source, unlike Code Execution's one-shot computation or a plain chat reply drawing only on training data. Practicing that distinction cements TS 3.1 and the Domain 4 pattern-selection judgment (research vs. workflow vs. direct prompt).",
    troubleshooting: [
      {
        problem: "Research mode isn't visible in the composer.",
        fix: "Check the tools or features menu (sometimes a paperclip, '+', or toggle icon), or confirm your plan's feature availability — Research may be gated to certain plans or need enabling in settings.",
      },
      {
        problem: "The report cites a source but the citation doesn't support the claim.",
        fix: 'Flag it as a fact-checking finding (Domain 2 territory) rather than assuming research mode is infallible — treat every citation as something to spot-check, not a guarantee.',
      },
    ],
    cleanup: [],
    sourceIds: ['building-effective-agents', 'claude-for-work'],
    relatedQuestionIds: [],
    requiresPaidFeature: true,
    paidFeatureNote:
      'Research mode availability and usage limits vary by plan — Pro/Max/Team/Enterprise typically get materially higher research usage than Free. Confirm it is enabled for your account before starting.',
  },
  {
    id: 'lab-artifacts',
    certificationId: 'ccao-f',
    domainIds: ['d3'],
    title: 'Create and Iterate a Reusable Artifact',
    objective:
      "Produce a deliverable in Claude's independent Artifacts panel and iterate on it with follow-up edits, distinguishing an Artifact from a normal inline chat reply.",
    prerequisites: [],
    estimatedMinutes: 12,
    setup: [
      'Open a new Claude.ai chat.',
      "Pick a naturally reusable fictional deliverable — e.g., a one-page new-hire onboarding checklist for Meridian Logistics' warehouse team.",
      'Set aside about 10 minutes to iterate through at least two rounds of edits.',
    ],
    steps: [
      {
        title: 'Request a reusable deliverable',
        detail:
          "Ask Claude to produce a structured document or checklist — a task whose verb is 'produce something to reuse,' not a one-off answer.",
      },
      {
        title: 'Confirm it opens as an Artifact',
        detail:
          "Check that the content lands in a separate panel with its own version history, not just inline in the chat.",
      },
      {
        title: 'Iterate with a targeted edit',
        detail:
          'Ask for a specific change (reorder a section, add a step) and confirm the Artifact updates in place rather than starting a new document.',
      },
      {
        title: 'Check version history',
        detail:
          "Open the Artifact's version history to confirm earlier drafts are still retrievable after the edit.",
      },
      {
        title: 'Reuse it in a new context',
        detail:
          'Ask a follow-up question referencing the Artifact to confirm Claude treats it as the current source of truth.',
      },
    ],
    prompts: [
      {
        label: 'Create the artifact',
        prompt:
          'Create a one-page new-hire onboarding checklist for warehouse associates at Meridian Logistics, organized as day-1, week-1, and month-1 sections. Make it a document I can keep editing.',
      },
      {
        label: 'Iterate',
        prompt:
          "Add a 'safety training sign-off' item to the day-1 section, and move 'assign a mentor' from week-1 to day-1.",
      },
      {
        label: 'Confirm reuse',
        prompt:
          'Using the checklist you just built, draft a two-sentence Slack message announcing it to the warehouse team.',
      },
    ],
    expectedOutcome:
      'A checklist document exists in the Artifacts panel, has been edited in place at least once, has retrievable prior versions, and a follow-up task correctly references its current, post-edit content.',
    whatToObserve: [
      'The deliverable opens in a distinct panel rather than as a chat message.',
      'A targeted edit changes only the requested part, not the whole document.',
      'Version history is available and lets you step back to the pre-edit draft.',
      'The follow-up Slack-message task pulls from the edited version, not the original draft.',
    ],
    whyItMatters:
      "Artifacts are the right-fit feature whenever the task's verb is 'produce a deliverable to reuse' rather than 'answer once.' Confirming Claude treats the Artifact as the live source of truth across follow-ups is exactly TS 3.1's practical judgment.",
    troubleshooting: [
      {
        problem: 'Claude answers inline instead of opening an Artifact.',
        fix: "Ask explicitly for 'a document/checklist I can keep editing' — Claude decides on Artifacts based on the request's shape, and some short requests default to inline chat.",
      },
      {
        problem: 'An edit request creates a whole new document instead of updating in place.',
        fix: "Reference the existing Artifact explicitly ('update the checklist above') rather than repeating the full original request.",
      },
    ],
    cleanup: ['Delete the Artifact from your Artifacts panel if you do not want to keep the fictional checklist.'],
    sourceIds: ['claude-for-work'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote:
      'Artifacts are available on Free and all paid Claude.ai plans; only very high-volume usage is likely to hit Free-tier rate limits.',
  },
  {
    id: 'lab-claude-projects',
    certificationId: 'ccao-f',
    domainIds: ['d5'],
    title: 'Configure a Claude Project with Instructions and Knowledge',
    objective:
      'Stand up a self-contained Project workspace with both required components — system-level instructions and knowledge sources — for a recurring fictional workflow.',
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Have a Claude.ai account (Free works, capped at 5 projects; paid plans raise the limit).',
      "Pick a recurring fictional workflow to scope the project around — e.g., weekly ops reports for Meridian Logistics.",
      'Prepare one short reference file to upload, such as a plain-text style guide or a past report you write yourself with fictional numbers.',
    ],
    steps: [
      {
        title: 'Create the project',
        detail:
          "In Claude.ai, click Projects > Create project, and name it something scoped to one purpose — not a catch-all workspace.",
      },
      {
        title: 'Write the instructions',
        detail:
          'Open the project Instructions field and write a role, a constraint, and an output format for this one recurring workflow.',
      },
      {
        title: 'Upload knowledge',
        detail:
          "Add your prepared fictional reference file under the project's Files/Knowledge section.",
      },
      {
        title: 'Test grounding',
        detail:
          'Start a new chat inside the project and ask a question answerable only from the uploaded file, confirming Claude cites it rather than guessing.',
      },
      {
        title: 'Check the purpose boundary',
        detail:
          "Ask an unrelated question outside this project's stated purpose, and observe whether the instructions steer Claude to decline or redirect versus answering from general knowledge.",
      },
    ],
    prompts: [
      {
        label: 'Draft instructions',
        prompt:
          "Draft project instructions for a 'Meridian Logistics Weekly Ops Report' project: role is a logistics operations analyst, constraint is answer 'unknown' for anything not in the uploaded reports, and output format is three sections (Summary, Metrics, Risks).",
      },
      {
        label: 'Test grounding',
        prompt:
          "Based only on the uploaded weekly report, what was last week's on-time delivery rate for Meridian Logistics?",
      },
    ],
    expectedOutcome:
      'A named, single-purpose Project exists with both instructions and at least one uploaded knowledge file, and a test question inside it is answered by grounding in the uploaded file — with an unknown fallback when the file does not cover something — not from general knowledge.',
    whatToObserve: [
      'The project has a distinct chat history and knowledge base, separate from your normal chat.',
      'The answer to the grounding-test question matches the numbers in your uploaded file exactly.',
      'When asked something the file does not cover, Claude says so rather than guessing, if you wrote that constraint.',
      'An off-topic question either gets redirected or declined per your instructions, or reveals that your instructions need tightening.',
    ],
    whyItMatters:
      'Projects are the foundational mechanism for fixing recurring work context. TS 5.1 tests exactly this: instructions and knowledge sources are two separate components whose combined quality determines output quality, and a project should stay scoped to a single purpose.',
    troubleshooting: [
      {
        problem: 'Claude answers from general knowledge instead of the uploaded file.',
        fix: "Add an explicit source-restriction line to the instructions ('ground only in uploaded materials, answer unknown otherwise') — uploading a file alone does not force grounding.",
      },
      {
        problem: 'Free plan will not let you create another project.',
        fix: 'Free is capped at 5 projects; archive or delete an unused one, or upgrade to a paid plan for a higher limit.',
      },
    ],
    cleanup: ['Delete the fictional test project when done, if you do not plan to keep using it.'],
    sourceIds: ['what-are-projects'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote:
      'Free plans can create up to 5 projects; automatic RAG expansion of knowledge capacity (about 10x) as knowledge approaches the context limit is a paid-plan (Pro/Max/Team/Enterprise) benefit.',
  },
  {
    id: 'lab-project-instructions',
    certificationId: 'ccao-f',
    domainIds: ['d5'],
    title: 'Write XML-Structured Project Instructions with a Restricted Source',
    objective:
      "Practice the TS 5.3 core skill: structure system-level instructions with XML tags across role, constraints, and format, and explicitly restrict Claude to only the uploaded source material.",
    prerequisites: ['A Claude.ai project already created (see lab-claude-projects), or willingness to create a quick one here.'],
    estimatedMinutes: 20,
    setup: [
      "Open or create a Claude.ai project for a fictional purpose, e.g., Meridian Logistics Contract Q&A.",
      'Upload one short fictional reference document as knowledge — a one-page invented vendor contract or policy with made-up terms and numbers only.',
      "Open the project's Instructions field for editing.",
    ],
    steps: [
      {
        title: 'Write a bad version first',
        detail:
          'Deliberately write one long unstructured paragraph mixing role, constraints, and format, and test it once to see the failure mode — buried rules, unclear priority.',
      },
      {
        title: 'Rewrite with XML structure',
        detail:
          'Rewrite using separate role/constraints/format tags, and add a priority or exception line if any requirements conflict (e.g., concise vs. comprehensive).',
      },
      {
        title: 'Add the source restriction',
        detail:
          "Add an explicit constraint telling Claude to ground only in the uploaded document and answer 'unknown' for anything not covered.",
      },
      {
        title: 'Re-test the same question',
        detail:
          'Ask the exact same test question against both versions and compare answer quality, structure adherence, and whether Claude guesses versus says unknown.',
      },
      {
        title: 'Apply the golden rule',
        detail:
          "Re-read the final instructions as if you were a colleague with only minimal context, and confirm they would not be confused.",
      },
    ],
    prompts: [
      {
        label: 'Bad instructions (control)',
        prompt:
          'You are a contracts assistant. Answer concisely. Do not guess what is not in the materials. Use a professional tone. But be comprehensive. Answer in three bullet points. Refer to the uploaded contract as needed.',
      },
      {
        label: 'Good instructions (XML-structured)',
        prompt: `<role>Contracts assistant for Meridian Logistics' vendor agreements.</role>
<constraints>
- Ground answers only in the uploaded contract document.
- If something is not covered in the document, say "unknown" — do not guess.
- Use a professional tone.
</constraints>
<format>Exactly three bullet points.</format>
<priority>Prioritize conciseness. Only exceed three bullet points if the question genuinely cannot be answered in three.</priority>`,
      },
      {
        label: 'Grounding test question',
        prompt:
          'What is the payment term (net days) specified in the uploaded Meridian Logistics vendor contract, and what happens if a vendor invoice is disputed?',
      },
    ],
    expectedOutcome:
      "The XML-structured version produces a clearer, correctly formatted answer than the one-paragraph version, and correctly says 'unknown' for any part of the test question not actually covered in the uploaded document.",
    whatToObserve: [
      "Whether the unstructured version's output ignores or blends some stated rules (e.g., drifts past three bullets, mixes tone with content).",
      'Whether the XML-structured version visibly follows every tag: role tone, exact bullet count, stated priority.',
      "Whether adding the explicit source-restriction line changes behavior on the part of the question the document doesn't cover — guessing versus 'unknown.'",
      "Whether the final instructions pass the 'colleague with minimal context' clarity check.",
    ],
    whyItMatters:
      'TS 5.3 is a core exam skill: packing role, constraints, and format into one paragraph causes the middle to be ignored, while XML-tag structure with explicit priorities keeps every rule enforceable — and knowledge sources are unreliable without an instruction explicitly restricting Claude to them.',
    troubleshooting: [
      {
        problem: 'Both versions produce roughly the same answer.',
        fix: "Make the test question harder to satisfy under contradictory demands (a genuine 'concise vs. comprehensive' tension) so the structural difference actually shows up.",
      },
      {
        problem: 'Claude still guesses even after adding the source-restriction constraint.',
        fix: 'Make the restriction its own explicit line inside <constraints>, not buried in a longer sentence, and confirm the document actually uploaded successfully as knowledge.',
      },
    ],
    cleanup: ['Remove the deliberately-bad instructions draft from the project once the comparison is done, leaving only the XML-structured version in place.'],
    sourceIds: ['prompting-best-practices', 'what-are-projects'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-project-knowledge',
    certificationId: 'ccao-f',
    domainIds: ['d5'],
    title: 'Upload Knowledge, Ground Responses, and Prune Stale Content',
    objective:
      'Practice the full knowledge-maintenance cycle from TS 5.2/5.4: upload a reference file, confirm grounding, then simulate staleness and prune it correctly.',
    prerequisites: ['A Claude.ai project (reuse the one from lab-claude-projects, or create a quick one).'],
    estimatedMinutes: 18,
    setup: [
      'Open a fictional project, e.g., Meridian Logistics Price List Q&A.',
      'Prepare a small fictional price-list document (v1) with 4-5 line items and prices.',
      'Prepare a revised version (v2) of the same document with 2-3 prices changed, to simulate a price update.',
    ],
    steps: [
      {
        title: 'Upload v1 and ground',
        detail:
          'Upload the v1 price list as project knowledge, then ask a question answerable only from it, confirming Claude cites the correct v1 numbers.',
      },
      {
        title: 'Simulate staleness',
        detail:
          'Upload v2 (the revised price list) into the same project without removing v1, then ask the same pricing question again.',
      },
      {
        title: 'Observe the conflict',
        detail:
          "Check whether Claude's answer is now ambiguous, wrong, or a mix of v1/v2 numbers, since two contradictory versions are present.",
      },
      {
        title: 'Prune the stale version',
        detail:
          "Remove or archive v1 from the project's knowledge, keeping only v2, and re-ask the same question.",
      },
      {
        title: 'Confirm clean grounding',
        detail:
          'Verify the answer now matches v2 exactly, with no residual contamination from the deleted v1.',
      },
    ],
    prompts: [
      {
        label: 'Grounding question (repeat before/after)',
        prompt:
          "What is the current per-pallet freight rate for the North region on Meridian Logistics' price list, and when did it last change?",
      },
      {
        label: 'Prompt the maintenance step',
        prompt:
          "I've just removed the outdated v1 price list and kept only the current v2 version in this project's knowledge. Confirm which price list you're now grounding answers in.",
      },
    ],
    expectedOutcome:
      'You can show a clear before/after: the answer degrades or becomes ambiguous once two contradictory knowledge files coexist, and recovers to be fully accurate once the stale file is pruned.',
    whatToObserve: [
      "Whether Claude flags the contradiction itself (e.g., 'I see two different rates') or silently picks one, when both v1 and v2 are present.",
      'Any citation or reference indicating which uploaded file a given number came from.',
      'Whether the answer becomes fully clean and correct immediately after pruning v1.',
      "Whether Claude's own summary of what's in the project's knowledge correctly reflects the post-prune state.",
    ],
    whyItMatters:
      'TS 5.4 tests exactly this cycle: knowledge goes stale (price revisions, policy updates) and must be actively maintained. Mixing contradictory materials in one project does not just add noise — it destabilizes which version Claude grounds in, so pruning stale content is a required maintenance step, not an optional tidy-up.',
    troubleshooting: [
      {
        problem: 'Claude keeps referencing the deleted v1 numbers after pruning.',
        fix: "Start a fresh chat inside the project after pruning — an existing chat thread may still be carrying the earlier retrieved content in its own context.",
      },
      {
        problem: 'Claude cannot tell the two files apart at all.',
        fix: "Give the files clearly different names (e.g., 'price-list-v1-ARCHIVED.txt' vs. 'price-list-v2-current.txt') so version identity is unambiguous even before you prune.",
      },
    ],
    cleanup: ['Delete the fictional v1/v2 price-list files from the project once the exercise is complete.'],
    sourceIds: ['what-are-projects', 'agent-memory'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote:
      'Paid plans (Pro/Max/Team/Enterprise) get automatic RAG expansion (about 10x) as knowledge volume grows, but pruning stale content matters at any plan tier.',
  },
  {
    id: 'lab-connector-scope',
    certificationId: 'ccao-f',
    domainIds: ['d5'],
    title: 'Connect a Connector at Minimal Scope (Not the Whole Drive)',
    objective:
      "Practice TS 5.2's key judgment: narrow a connector's scope to only the folder a project needs, instead of connecting an entire shared drive and hoping Claude ignores the rest.",
    prerequisites: ["A Google account with a Google Drive you're comfortable connecting, or willingness to create a small test folder."],
    estimatedMinutes: 20,
    setup: [
      "In Google Drive, create or identify one small, narrow test folder containing only 2-3 files clearly relevant to a fictional purpose (e.g., a 'Meridian Logistics - Q1 Ops Reports' folder).",
      'Make sure that folder sits alongside plenty of unrelated files elsewhere in the same Drive, so the scope contrast is in place.',
      "In a private Claude.ai project (sync connectors require a private, not shared, project), open the '+' menu and locate Connectors.",
    ],
    steps: [
      {
        title: 'Connect broad, on purpose, to see the failure mode',
        detail:
          'As a control, connect the Google Drive connector without scoping to a folder, and ask a question relevant only to your narrow test folder.',
      },
      {
        title: 'Disconnect and reconnect narrow',
        detail:
          "Remove the broad connection, then reconnect or configure folder-level scope where the connector UI allows it, pointing at only the test folder.",
      },
      {
        title: 'Re-ask the same question',
        detail:
          'Ask the identical question again and compare precision and relevance of the answer and citations against the broad-connection result.',
      },
      {
        title: 'Confirm access boundaries',
        detail:
          'Ask Claude a question about a file you know sits outside the connected folder, and confirm it correctly cannot see it.',
      },
      {
        title: 'Document the scope decision',
        detail:
          "Write one line in the project instructions noting which folder is connected and why, so future collaborators understand the intentional boundary.",
      },
    ],
    prompts: [
      {
        label: 'Scoped question',
        prompt:
          'Using the connected Google Drive folder, summarize the on-time delivery percentage reported across our Q1 ops reports for Meridian Logistics.',
      },
      {
        label: 'Boundary check',
        prompt:
          "Do you have access to anything in my Google Drive outside the connected folder — for example, a file called 'Personal Tax Notes 2025'? Answer only based on what you can actually retrieve.",
      },
    ],
    expectedOutcome:
      'The narrow-scope connection returns a tighter, more relevant answer than the broad connection, and Claude correctly reports it cannot see files outside the connected folder.',
    whatToObserve: [
      'Whether the broad-connection answer pulls in citations from clearly irrelevant files.',
      "Whether the narrow-connection answer is noticeably cleaner and easier to trust, citing only the intended folder's files.",
      "Confirmation that Claude respects your Drive permissions and the connector's configured boundary — it cannot see the unrelated file you asked about.",
      'Whether OAuth re-authentication or reconfiguration was needed when narrowing scope.',
    ],
    whyItMatters:
      "TS 5.2's central judgment is that 'connect everything and instruct Claude to ignore the rest' is unreliable — irrelevant files mix into the search target and accuracy drops. Practicing the narrow-vs-broad contrast directly, rather than just reading the rule, is what makes it stick for the exam and for real project design.",
    troubleshooting: [
      {
        problem: 'The connector UI only offers whole-Drive access, not folder-level scoping.',
        fix: "Move the relevant files into a single dedicated folder or shared drive first, since scope in Google Workspace connectors is often shaped by folder structure; also confirm whether your org (Team/Enterprise) has enabled the connector centrally.",
      },
      {
        problem: 'The sync connector option is missing entirely from the project.',
        fix: 'Confirm the project is private, not shared — sync connectors can only be added to private projects — and that a Team/Enterprise Owner has enabled the connector org-wide.',
      },
    ],
    cleanup: ['Disconnect the test Google Drive connector when the lab is done, if you do not want ongoing sync access.'],
    sourceIds: ['google-workspace-connectors'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote:
      'Google Workspace connectors (Gmail, Calendar, Drive) are available to all users; Team/Enterprise requires an Owner to enable connectors org-wide before individuals can authenticate.',
  },
  {
    id: 'lab-sensitive-data-handling',
    certificationId: 'ccao-f',
    domainIds: ['d6'],
    title: 'Anonymize Identifiers Before Upload — Commercial vs. Consumer Surface',
    objective:
      "Practice TS 6.2's core judgment: identify which surface (commercial vs. consumer) you're using, and anonymize personal identifiers before any data is shared with Claude — not after.",
    prerequisites: [],
    estimatedMinutes: 18,
    setup: [
      'Draft a small fictional customer record containing invented (never real) names, account numbers, and a support note — realistic in shape but entirely made up.',
      'Confirm which Claude surface you are currently on: Free/Pro/Max chat (consumer) versus Claude for Work or API (commercial).',
      'Have a text editor ready to build an anonymized version of the same record.',
    ],
    steps: [
      {
        title: 'Classify your surface first',
        detail:
          'Before touching any data, determine and write down whether your current session is commercial (not used for training) or consumer (used for training by default unless opted out).',
      },
      {
        title: 'Draft the raw fictional record',
        detail:
          'Write a fictional customer record with realistic-shaped identifiers: a fake full name, a dummy account number, and a one-line support note.',
      },
      {
        title: 'Anonymize before upload',
        detail:
          'Rewrite the record, replacing the name with a role-based label and the account number with a clearly-dummy placeholder pattern, before it ever goes into a Claude conversation.',
      },
      {
        title: 'Upload only the anonymized version',
        detail:
          'Paste the anonymized record into Claude and ask for the intended analysis, e.g., categorizing the support note\'s urgency.',
      },
      {
        title: 'Check the instruction-is-not-a-control trap',
        detail:
          "As a contrast test, ask Claude in the same chat whether 'please don't retain this' after sharing raw data would actually undo the fact that it was shared — and confirm why it would not.",
      },
    ],
    prompts: [
      {
        label: 'Anonymized record (safe to actually paste)',
        prompt: `Customer Record (anonymized):
Customer: Customer-0007
Account: ACCT-0001
Note: "Customer reports two consecutive late deliveries this month; requests a callback."

Classify the urgency of this support note as Low, Medium, or High, and suggest a one-sentence response.`,
      },
      {
        label: 'Surface confirmation',
        prompt:
          'Before I share any customer data in this conversation: am I currently on a commercial surface (not used for training) or a consumer surface (used for training by default)? What would I need to check or change in settings to confirm that?',
      },
    ],
    expectedOutcome:
      "You produce and actually use an anonymized version of a customer record — fake name replaced with a role label, account number replaced with a dummy pattern — on a surface you've explicitly confirmed as commercial or consciously accepted as consumer, and you can explain why asking Claude to 'not retain' data is not equivalent to anonymizing it beforehand.",
    whatToObserve: [
      'Whether you can name, without guessing, which surface (commercial or consumer) your current session is on.',
      'The concrete before/after of the record: a real-shaped identifier replaced by a role-based or dummy placeholder.',
      "Claude's answer to the urgency-classification task works fine on the anonymized version — nothing about the useful analysis required the real identifier.",
      "Your own reasoning for why a 'please don't retain this' instruction, issued after sharing, does not undo the fact that the data was already transmitted.",
    ],
    whyItMatters:
      "TS 6.2 is a core exam skill: sensitive data belongs on the commercial surface, anonymized before upload, never uploaded raw to a consumer account on the assumption that an opt-out toggle covers it. This lab forces the anonymize-first habit instead of the 'ask Claude to forget it' shortcut, which the guide explicitly calls out as not a real control.",
    troubleshooting: [
      {
        problem: "It's hard to tell whether a chat is commercial or consumer surface.",
        fix: 'Claude for Work, API-backed integrations, and enterprise-provisioned accounts are commercial; a personal Free/Pro/Max claude.ai login is consumer by default — check account or workspace settings, or ask your organization\'s admin before uploading anything sensitive.',
      },
      {
        problem: 'Anonymizing feels like it removes signal you need (e.g., to look up the real account later).',
        fix: 'Keep a separate, secured mapping table (name/account to placeholder) entirely outside of Claude, so you can still act on the real record afterward without ever exposing it to the model.',
      },
    ],
    cleanup: ['Delete the fictional raw (non-anonymized) draft record from your notes once the anonymized version has been used.'],
    sourceIds: ['commercial-terms', 'data-retention'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote:
      'Handling genuinely sensitive or regulated data in a real workflow should generally happen on Claude for Work or API (commercial) plans, which are contractually excluded from training, rather than Free/Pro/Max consumer accounts.',
  },
  {
    id: 'lab-human-review-decision',
    certificationId: 'ccao-f',
    domainIds: ['d2', 'd6'],
    title: 'Classify Use Cases and Route High-Risk Work to a Qualified Human',
    objective:
      "Practice TS 2.4/6.1's decision flow: classify a batch of proposed use cases against the AUP's layers, and for anything high-risk, define the human-in-the-loop reviewer and AI disclosure required before it ships.",
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Write out 4-5 fictional proposed use cases spanning different risk levels (e.g., meeting notes, a policy summary, a lending-decision letter, marketing copy, patient-facing treatment guidance).',
      "Have the AUP's three-layer structure at hand for reference — universal prohibition, high-risk, additional guidelines — no external tool needed.",
    ],
    steps: [
      {
        title: 'List the candidate use cases',
        detail: 'Write 4-5 fictional proposed use cases a business might consider handing to Claude.',
      },
      {
        title: 'Classify each against the three AUP layers',
        detail:
          'For each, decide: universal prohibition (immediate no), high-risk (the seven areas: legal, healthcare, insurance, finance, employment/housing, academic testing, media), or standard/additional-guidelines use.',
      },
      {
        title: 'Ask Claude to help classify, then verify independently',
        detail:
          'Have Claude propose a classification for each use case, but do not accept it as final — independently confirm against the seven high-risk areas yourself.',
      },
      {
        title: 'Design the control for each high-risk item',
        detail:
          'For every use case landing in the high-risk layer, write down who the qualified human reviewer would be and what AI-disclosure language would accompany the output.',
      },
      {
        title: 'Write the disclosure sentence',
        detail:
          'For the single highest-risk use case, draft the exact disclosure sentence a recipient would see, plus the review step that happens before anything reaches them.',
      },
    ],
    prompts: [
      {
        label: 'Classification request (verify, do not trust blindly)',
        prompt: `Classify each of these proposed use cases as: (a) prohibited under Anthropic's Usage Policy, (b) high-risk (requires qualified human review + AI disclosure), or (c) standard use. Explain which AUP layer applies to each.

1. Drafting internal weekly meeting notes for a logistics team.
2. Summarizing a public regulatory policy document for an internal FAQ.
3. Drafting a lending-decision letter for a loan applicant at a fictional regional bank.
4. Generating marketing copy for a fictional product launch.
5. Drafting patient-facing treatment guidance for a fictional clinic's after-visit summary.`,
      },
      {
        label: 'Design the control',
        prompt:
          'For the lending-decision letter and the patient-facing treatment guidance use cases above, write the specific AI-disclosure sentence that should appear to the recipient, and describe who the qualified human reviewer should be before either document is sent.',
      },
    ],
    expectedOutcome:
      'Each of the 4-5 use cases is independently classified into the correct AUP layer (not just accepted from Claude\'s own answer), the high-risk ones (lending decision, treatment guidance) have a named qualified-reviewer role and a concrete disclosure sentence attached, and the low-risk ones are correctly recognized as not requiring that overhead.',
    whatToObserve: [
      "Whether your own independent classification matches Claude's proposed classification, and if not, which one is actually correct per the AUP's seven high-risk areas.",
      "Whether the lending-decision letter and treatment guidance are both correctly flagged as high-risk (Finance and Healthcare), requiring both human review and disclosure — not just one of the two.",
      "Whether the disclosure sentence you write actually names AI involvement, rather than vaguely gesturing at 'this was reviewed.'",
      'Whether the low-risk use cases were correctly left out of the human-review requirement, avoiding the opposite mistake of over-applying it.',
    ],
    whyItMatters:
      "TS 6.1 and TS 2.4 converge exactly here: recognizing a high-risk use case is only half the judgment. The other half is that Claude's own self-check is never a substitute for a qualified human reviewing before dissemination, plus explicit AI disclosure to whoever receives the output — one of the most heavily tested judgments on the exam.",
    troubleshooting: [
      {
        problem: "It's tempting to just trust Claude's own classification of a use case as final.",
        fix: 'Treat any classification Claude gives you as a first draft only — cross-check it yourself against the seven named high-risk areas (Legal, Healthcare, Insurance, Finance, Employment/housing, Academic testing, Media) before accepting it.',
      },
      {
        problem: "It's unclear who counts as a 'qualified human reviewer' for a given case.",
        fix: 'Default to the licensed or credentialed professional in that specific domain (e.g., a licensed loan officer for lending, a licensed clinician for treatment guidance) — a generalist manager, or the same person who ran the prompt, does not satisfy the requirement.',
      },
    ],
    cleanup: [],
    sourceIds: ['usage-policy'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
];
