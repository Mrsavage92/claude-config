import type { Lab } from '@/schemas';

/**
 * Hands-on labs for CCAO-F Domains 1–3 (Prompting/Task Execution,
 * Output Evaluation/Validation, Claude Product & Model Selection).
 *
 * Every lab runs entirely inside a learner's own Claude.ai session (Free or
 * paid) — no API key, no console. Prompts use safe, fictional data only.
 */
export const labs1: Lab[] = [
  {
    id: 'lab-prompt-structure',
    certificationId: 'ccao-f',
    domainIds: ['d1'],
    title: 'Write a structured prompt with role, context, format, and constraints',
    objective:
      'Practice writing one prompt that explicitly states a role, the business context, the required output format, and hard constraints — then see the difference against a vague version of the same request.',
    prerequisites: [],
    estimatedMinutes: 15,
    setup: [
      'Open a new chat at claude.ai (Free plan is fine).',
      'Have a blank note ready to paste both prompt versions into for comparison.',
    ],
    steps: [
      {
        title: 'Send the vague version first',
        detail:
          'Paste Prompt 1 ("Vague version") and read the reply. Notice how much Claude has to guess: audience, length, tone, and what counts as done are all undefined.',
      },
      {
        title: 'Send the structured version',
        detail:
          'In a NEW chat (so the vague answer cannot bias the second one), paste Prompt 2 ("Structured version"). It states role, context, format, and constraints as separate, explicit pieces.',
      },
      {
        title: 'Apply the golden rule',
        detail:
          'Re-read Prompt 2 as if you were a colleague with only minimal context. Check that every instruction is followable without asking a clarifying question. If something is ambiguous, that is a prompt bug, not a Claude bug.',
      },
      {
        title: 'Compare the two outputs side by side',
        detail:
          'Line up both replies. Check specifically for: does the structured version hit the exact word count band, does it use the requested format, and does it avoid the constraint you told it to avoid?',
      },
    ],
    prompts: [
      {
        label: 'Vague version',
        prompt: `Write something about our Q2 sales for Northwind Traders to send to the team.`,
      },
      {
        label: 'Structured version',
        prompt: `You are a sales operations analyst writing for a busy VP of Sales who reads on their phone between meetings.

Context: Northwind Traders' Q2 revenue was $4.2M, up 11% quarter-over-quarter. The Northeast region missed its target by 6%; every other region beat target.

Task: Write a summary of Q2 performance for the VP.

Format: Exactly 3 bullet points, each one sentence, no more than 25 words per bullet.

Constraints: Do not use the words "synergy" or "leverage." Do not recommend any specific action — this is a status update only, not a proposal.`,
      },
    ],
    expectedOutcome:
      'The vague prompt produces a generic, differently-shaped reply each time you try it. The structured prompt reliably returns exactly 3 short bullets, in the VP tone, respecting both the word banned and the "no recommendations" constraint.',
    whatToObserve: [
      'The vague version invents its own length, tone, and structure — none of which you specified.',
      'The structured version follows the 3-bullet, 25-word constraint almost exactly, because the constraint was explicit.',
      'The structured version does not slip into giving recommendations, because you explicitly ruled that out.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 1.1 tests the judgment that Claude responds best to explicit role, context, format, and constraints — and that an under-specified prompt is a prompt problem, not a model-quality problem.',
    troubleshooting: [
      {
        problem: 'Both versions look similar in quality.',
        fix: 'Make the vague prompt shorter and remove any implicit format cues (no bullets, no numbers) so the contrast is genuine, then re-run.',
      },
      {
        problem: 'The structured version still gives a recommendation.',
        fix: 'Restate the constraint using affirmative phrasing, e.g. "This is a status update only" rather than only "do not recommend."',
      },
    ],
    cleanup: [],
    sourceIds: ['prompt-eng-overview', 'prompting-best-practices'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-xml-tags',
    certificationId: 'ccao-f',
    domainIds: ['d1'],
    title: 'Use XML tags to separate instructions, context, input, and examples',
    objective:
      'Practice wrapping a multi-part prompt in XML tags (instructions, context, input, examples) so Claude can parse each piece without ambiguity, and see what breaks when the same content is sent unstructured.',
    prerequisites: ['lab-prompt-structure'],
    estimatedMinutes: 15,
    setup: [
      'Open a new chat at claude.ai.',
      'No files needed — all content is inline in the prompts below.',
    ],
    steps: [
      {
        title: 'Send the unstructured version',
        detail:
          'Paste Prompt 1, which mixes instructions, a policy excerpt, and the actual customer message into one undifferentiated block of text.',
      },
      {
        title: 'Send the XML-tagged version',
        detail:
          'In a new chat, paste Prompt 2. Notice the same three ingredients (instructions, context, input) are now wrapped in `<instructions>`, `<context>`, and `<input>` tags.',
      },
      {
        title: 'Check which text Claude actually classified as "the input"',
        detail:
          'In the tagged version\'s reply, confirm Claude responded to the content inside `<input>` specifically — not to a sentence from `<context>` — proving the tags did their job of disambiguating.',
      },
      {
        title: 'Try nesting tags for hierarchy',
        detail:
          'Send a follow-up asking Claude to also comment on two example replies. Wrap each one in `<example>` inside an outer `<examples>` tag and confirm Claude addresses both individually.',
      },
    ],
    prompts: [
      {
        label: 'Unstructured version',
        prompt: `Here are the refund rules: refunds are allowed within 30 days with a receipt, no refunds on final-sale items. A customer named Jamie wrote in: "I bought a final-sale lamp from Northwind Traders 10 days ago, can I get a refund, I have my receipt." Classify this request as Approve or Deny and explain why, using the rules I just gave you and only those rules.`,
      },
      {
        label: 'XML-tagged version',
        prompt: `<instructions>
Classify the customer message in <input> as Approve or Deny, using only the policy in <context>. Give one sentence of reasoning.
</instructions>

<context>
Refunds are allowed within 30 days with a receipt. No refunds on final-sale items, regardless of receipt or days elapsed.
</context>

<input>
Customer: Jamie
Message: "I bought a final-sale lamp from Northwind Traders 10 days ago, can I get a refund, I have my receipt."
</input>`,
      },
      {
        label: 'Nested examples follow-up',
        prompt: `<examples>
<example>
Customer message: "I bought a non-final-sale mug 5 days ago, no receipt." Correct classification: Deny (no receipt).
</example>
<example>
Customer message: "I bought a non-final-sale desk 45 days ago, with receipt." Correct classification: Deny (outside 30 days).
</example>
</examples>

Given these two examples of correct classification, re-check your answer for Jamie above and confirm it is consistent with the same rule logic.`,
      },
    ],
    expectedOutcome:
      'Both versions classify Jamie\'s request as Deny (final-sale overrides the receipt/30-day rule), but the tagged version is unambiguous about which text is the rule, which is the customer message, and reliably repeats that structure correctly across repeated tries.',
    whatToObserve: [
      'In the unstructured prompt, instructions, policy, and customer message run together in one paragraph.',
      'In the tagged version, Claude\'s reasoning explicitly references "the policy in context" and "the input" as separate things.',
      'The nested `<examples>`/`<example>` follow-up is addressed example-by-example rather than as one blob.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 1.1 explicitly calls out XML tags (`<instructions>`, `<context>`, `<input>`, `<example>`, `<examples>`) as the mechanism for letting Claude parse complex prompts without ambiguity, including nesting for hierarchical content.',
    troubleshooting: [
      {
        problem: 'The unstructured version already gets the right answer.',
        fix: 'That is expected for a simple case — the value of tags shows up as prompts grow longer and mix more sources; try adding a second unrelated policy paragraph to the unstructured version and watch it get confused about which rule applies.',
      },
      {
        problem: 'Unsure the tags changed anything.',
        fix: 'Ask Claude directly: "Which part of my prompt did you treat as the customer input?" — a tagged prompt gets a precise answer, an unstructured one gets a paraphrase.',
      },
    ],
    cleanup: [],
    sourceIds: ['prompt-eng-overview', 'prompting-best-practices'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-few-shot',
    certificationId: 'ccao-f',
    domainIds: ['d1'],
    title: 'Give 3–5 diverse few-shot examples for consistent formatting',
    objective:
      'Practice supplying diverse few-shot examples in `<example>` tags to lock in a specific output format, and observe how output consistency improves compared to zero-shot instructions alone.',
    prerequisites: ['lab-xml-tags'],
    estimatedMinutes: 15,
    setup: [
      'Open a new chat at claude.ai.',
      'No files needed — the task is classifying short fictional support messages.',
    ],
    steps: [
      {
        title: 'Try zero-shot first',
        detail:
          'Paste Prompt 1 and ask Claude to tag each message with a category and urgency. Note the exact shape of the reply (does it use a table? a list? consistent field names?).',
      },
      {
        title: 'Add 3–5 diverse examples',
        detail:
          'In a new chat, paste Prompt 2, which supplies four `<example>` blocks covering different categories and urgency levels before giving the same batch to classify.',
      },
      {
        title: 'Check diversity of the examples themselves',
        detail:
          'Confirm the four examples are not near-duplicates — they should span different categories (billing, technical, general) and different urgency levels, not four variations of the same case.',
      },
      {
        title: 'Re-run the zero-shot batch and compare formats',
        detail:
          'Run Prompt 1 again in a fresh chat and compare its output shape to Prompt 2\'s. Confirm the few-shot version\'s output field names and order match the examples exactly, while the zero-shot version varies run to run.',
      },
    ],
    prompts: [
      {
        label: 'Zero-shot batch',
        prompt: `Classify each support message below by category (Billing, Technical, General) and urgency (Low, Medium, High):

1. "My Northwind Traders invoice charged me twice this month."
2. "The dashboard has been down for our whole team since this morning."
3. "What are your business hours?"
4. "I was charged for a plan I cancelled two months ago and need this fixed today."`,
      },
      {
        label: 'Few-shot version with diverse examples',
        prompt: `<instructions>
Classify each message in <input> using the exact format shown in the examples: "Message N — Category: X, Urgency: Y — Reason: one short clause."
</instructions>

<examples>
<example>
Message: "How do I reset my password?"
Message 1 — Category: General, Urgency: Low — Reason: routine self-serve question.
</example>
<example>
Message: "I was billed $400 instead of $40, please refund the difference."
Message 2 — Category: Billing, Urgency: Medium — Reason: billing error, not urgent outage.
</example>
<example>
Message: "Our entire team has been locked out of the account for 3 hours during a live client demo."
Message 3 — Category: Technical, Urgency: High — Reason: active outage during business-critical use.
</example>
<example>
Message: "Do you offer an annual pricing option?"
Message 4 — Category: General, Urgency: Low — Reason: informational, no account impact.
</example>
</examples>

<input>
1. "My Northwind Traders invoice charged me twice this month."
2. "The dashboard has been down for our whole team since this morning."
3. "What are your business hours?"
4. "I was charged for a plan I cancelled two months ago and need this fixed today."
</input>`,
      },
    ],
    expectedOutcome:
      'The few-shot version returns all four messages in the exact "Message N — Category: X, Urgency: Y — Reason: ..." format from the examples, consistently across repeated runs. The zero-shot version is usually correct on content but varies in structure and field naming from run to run.',
    whatToObserve: [
      'The few-shot output field names and ordering mirror the examples exactly.',
      'The zero-shot output format is plausible but not guaranteed to repeat identically on a second run.',
      'The four examples deliberately span all three categories and both ends of the urgency scale — that diversity is what taught the pattern instead of a narrow rule.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 1.4 specifies 3–5 highly relevant and diverse examples as the technique for formatting and consistency, choosing zero/one/few-shot according to task complexity.',
    troubleshooting: [
      {
        problem: 'Zero-shot already looks consistent enough.',
        fix: 'Run the zero-shot prompt three separate times in three fresh chats and diff the outputs — minor structural drift (different labels, different ordering) usually appears by the third run.',
      },
      {
        problem: 'Few-shot output ignores one example\'s pattern.',
        fix: 'Check that example is not contradicting the others (e.g. same urgency word describing different severities) — few-shot examples must be internally consistent to teach a single rule.',
      },
    ],
    cleanup: [],
    sourceIds: ['prompting-best-practices', 'prompt-eng-overview'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-prompt-chaining',
    certificationId: 'ccao-f',
    domainIds: ['d1'],
    title: 'Decompose a task into sequential chained prompts',
    objective:
      'Practice splitting one complex request into a sequence of chained prompts, where each step\'s output becomes the next step\'s input, and compare the result against doing everything in a single mega-prompt.',
    prerequisites: ['lab-prompt-structure'],
    estimatedMinutes: 20,
    setup: [
      'Open a new chat at claude.ai for the chained version.',
      'Open a second, separate chat for the single-prompt comparison.',
    ],
    steps: [
      {
        title: 'Try the single mega-prompt first',
        detail:
          'In chat 1, paste Prompt 1, which asks for metadata extraction, data extraction, validation, and a refined summary all in one shot. Read the result and note anything shallow or skipped.',
      },
      {
        title: 'Step 1 of the chain: extract metadata',
        detail:
          'In chat 2, paste Prompt 2 (metadata extraction only) and copy Claude\'s reply somewhere you can paste it back in.',
      },
      {
        title: 'Step 2 of the chain: extract and validate the numbers',
        detail:
          'Paste Prompt 3, which feeds in the report text again and asks Claude to extract and cross-check the key figures, explicitly building on the metadata from step 1.',
      },
      {
        title: 'Step 3 of the chain: refine into the final deliverable',
        detail:
          'Paste Prompt 4, referencing the validated numbers from step 2, and ask for the polished executive summary. Compare this final output\'s accuracy and completeness against the single mega-prompt result from step 1.',
      },
    ],
    prompts: [
      {
        label: 'Single mega-prompt (for comparison)',
        prompt: `Here is a report excerpt: "Northwind Traders Q2 2026 update. Revenue reached $4.2M, up from $3.9M in Q1 (a 7.7% rise, not the 11% some teams cited). The Northeast region posted $0.6M, missing its $0.7M target. All other regions met or beat target." Extract the report metadata, extract and validate the key numbers, and write a refined 3-sentence executive summary — all in one response.`,
      },
      {
        label: 'Chain step 1: extract metadata',
        prompt: `<input>
Northwind Traders Q2 2026 update. Revenue reached $4.2M, up from $3.9M in Q1 (a 7.7% rise, not the 11% some teams cited). The Northeast region posted $0.6M, missing its $0.7M target. All other regions met or beat target.
</input>

Extract only the metadata from this report excerpt: company name, reporting period, and how many distinct regional results are mentioned. Do not summarize the content yet.`,
      },
      {
        label: 'Chain step 2: extract and validate numbers',
        prompt: `Using the same report excerpt below, extract every numeric claim (revenue figures, percentages, region-level results) into a short list, then validate the math: does $3.9M to $4.2M actually round to 7.7% or to 11%? Flag any number in the text that does not check out.

<input>
Northwind Traders Q2 2026 update. Revenue reached $4.2M, up from $3.9M in Q1 (a 7.7% rise, not the 11% some teams cited). The Northeast region posted $0.6M, missing its $0.7M target. All other regions met or beat target.
</input>`,
      },
      {
        label: 'Chain step 3: refine into final summary',
        prompt: `Using the validated numbers from the previous step (use the correct percentage, not the disputed 11% figure), write a refined 3-sentence executive summary of Northwind Traders' Q2 2026 performance for a VP audience.`,
      },
    ],
    expectedOutcome:
      'The mega-prompt often glosses over the 7.7% vs. 11% discrepancy since it is buried in one large ask. The chained version catches it explicitly at the validation step (step 2) because that step\'s entire job is checking the numbers, and step 3\'s summary correctly uses 7.7%.',
    whatToObserve: [
      'Whether the single mega-prompt actually flags the 7.7%/11% discrepancy or just repeats one of the numbers unexamined.',
      'The chain\'s validation step (step 2) is where the arithmetic gets checked explicitly.',
      'Each chain step is a separate, inspectable call — you can point to exactly which step would need fixing if something goes wrong.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 1.2 tests decomposing a complex request into focused sequential steps (metadata extraction → data extraction → validation → refinement) and recognizing that separate calls let you log, evaluate, or branch at each stage.',
    troubleshooting: [
      {
        problem: 'The mega-prompt actually catches the discrepancy too.',
        fix: 'That can happen on a short example — the value of chaining grows with document length and number of claims; try re-running with two additional made-up numeric claims that also do not add up and compare which approach catches all of them.',
      },
      {
        problem: 'Not sure how to "carry" the output from one step to the next.',
        fix: 'Copy-paste the previous reply\'s relevant sentence directly into the next prompt — that copy-paste is the chain link in a learner\'s own Claude.ai session (no API state is shared automatically).',
      },
    ],
    cleanup: [],
    sourceIds: ['chain-prompts', 'prompting-best-practices'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-draft-review-refine',
    certificationId: 'ccao-f',
    domainIds: ['d1', 'd7'],
    title: 'Run a self-correction chain: draft, review against criteria, refine',
    objective:
      'Practice the draft -> review -> refine self-correction pattern by generating a piece of writing, having Claude review its own draft against explicit criteria, and refining based on that specific feedback.',
    prerequisites: ['lab-prompt-chaining'],
    estimatedMinutes: 20,
    setup: [
      'Open a new chat at claude.ai.',
      'Decide on the three review criteria in advance (a sample set is provided in the prompts below).',
    ],
    steps: [
      {
        title: 'Generate the initial draft',
        detail:
          'Paste Prompt 1 to get a first-pass draft of a short internal announcement. Do not edit it yourself — this is the raw draft the rest of the chain will operate on.',
      },
      {
        title: 'Review the draft against explicit criteria',
        detail:
          'Paste Prompt 2, which asks Claude to review its own draft against three named criteria (clarity, tone, completeness) and call out specific problems — not a vague "looks good."',
      },
      {
        title: 'Refine based on the specific feedback',
        detail:
          'Paste Prompt 3, asking Claude to produce a refined version that fixes only the specific problems named in the review, not a full rewrite from scratch.',
      },
      {
        title: 'Verify the refinement actually addressed the review',
        detail:
          'Go back through the review\'s bullet points one by one and confirm each specific criticism was actually fixed in the refined draft — do not just trust that "refine" happened.',
      },
    ],
    prompts: [
      {
        label: 'Step 1: initial draft',
        prompt: `Write a short internal announcement (4-5 sentences) from Northwind Traders' operations team telling all staff that the new expense-reporting tool goes live next Monday and old paper forms will no longer be accepted.`,
      },
      {
        label: 'Step 2: review against criteria',
        prompt: `Review the announcement you just wrote against these three criteria: (1) Clarity — is the action staff need to take unambiguous? (2) Tone — does it sound helpful rather than punitive? (3) Completeness — does it say what to do if someone has an in-progress paper form already? List specific problems found for each criterion, or state "no issue" if none.`,
      },
      {
        label: 'Step 3: refine based on the review',
        prompt: `Produce a refined version of the announcement that fixes only the specific problems you identified in your review above. Keep everything that already met the criteria unchanged.`,
      },
    ],
    expectedOutcome:
      'The review step names at least one concrete gap (commonly: no instruction for in-progress paper forms, since the original draft did not address that). The refined draft explicitly adds that missing piece while keeping the rest of the announcement intact.',
    whatToObserve: [
      'Whether the review step gives specific, checkable problems rather than generic praise.',
      'Whether the refine step targets exactly the named problems instead of rewriting the whole announcement from scratch.',
      'Whether anything the review called "no issue" changed anyway in the refined version (it should not).',
    ],
    whyItMatters:
      'CCAO-F Task Statement 1.2 names the self-correction pattern (draft -> review against criteria -> refine) directly, and Task Statement 1.3 requires iterating against specific feedback about what is wrong rather than vague dissatisfaction.',
    troubleshooting: [
      {
        problem: 'The review step just says "this is great, no changes needed."',
        fix: 'Make the criteria more concrete and specific (e.g. name the exact missing scenario you expect it to catch) so the review has something checkable to evaluate against.',
      },
      {
        problem: 'The refine step rewrites everything, including parts that already passed review.',
        fix: 'Explicitly instruct "keep everything that already met the criteria unchanged" as shown in Prompt 3, and re-run if the model still over-rewrites.',
      },
    ],
    cleanup: [],
    sourceIds: ['chain-prompts', 'develop-tests'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-long-document-grounding',
    certificationId: 'ccao-f',
    domainIds: ['d2'],
    title: 'Extract verbatim quotes first, then summarize a long document',
    objective:
      'Practice the "extract verbatim quotes first" technique for grounding a summary of a long document in its source text, and compare it against summarizing directly without that intermediate step.',
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Open a new chat at claude.ai.',
      'Use the fictional long-form policy excerpt provided in Prompt 1 below (a shortened stand-in for a >20k-token document, since this is a learner exercise, not a production one).',
      'Open a second chat for the direct-summarize comparison.',
    ],
    steps: [
      {
        title: 'Summarize directly first (baseline)',
        detail:
          'In chat 1, paste Prompt 1 as-is and ask for a direct 3-bullet summary with no quote-extraction step. Note any claim in the summary you cannot immediately point to in the source text.',
      },
      {
        title: 'Extract verbatim quotes first',
        detail:
          'In chat 2, paste Prompt 2, which asks Claude to first pull out verbatim quotes relevant to each topic before writing anything else.',
      },
      {
        title: 'Summarize from the extracted quotes only',
        detail:
          'Paste Prompt 3 in the same chat, asking Claude to write the 3-bullet summary using only the quotes it just extracted, and to drop any claim it cannot support with a quote.',
      },
      {
        title: 'Audit both summaries against the source',
        detail:
          'For every bullet in both summaries, find the exact sentence in the source document that supports it. Note any bullet from the direct-summarize baseline that has no exact matching sentence.',
      },
    ],
    prompts: [
      {
        label: 'Source document + direct summary (baseline)',
        prompt: `<document>
Northwind Traders Data Retention Policy, v3.

Section 1: Customer order records are retained for 7 years to satisfy tax and audit requirements. Section 2: Support ticket transcripts are retained for 2 years, after which they are permanently deleted. Section 3: Marketing email engagement data is retained for 18 months. Section 4: Employee access logs to the customer database are retained for 5 years. Section 5: Any data subject to an active legal hold is retained until the hold is lifted, regardless of the standard schedule above.
</document>

Summarize this policy in exactly 3 bullet points covering the most important retention periods.`,
      },
      {
        label: 'Step 1: extract verbatim quotes first',
        prompt: `<document>
Northwind Traders Data Retention Policy, v3.

Section 1: Customer order records are retained for 7 years to satisfy tax and audit requirements. Section 2: Support ticket transcripts are retained for 2 years, after which they are permanently deleted. Section 3: Marketing email engagement data is retained for 18 months. Section 4: Employee access logs to the customer database are retained for 5 years. Section 5: Any data subject to an active legal hold is retained until the hold is lifted, regardless of the standard schedule above.
</document>

Before summarizing, extract the verbatim sentence from the document that states the retention period for each of: customer order records, support ticket transcripts, marketing email data, employee access logs, and legal-hold data. Quote each sentence exactly, do not paraphrase.`,
      },
      {
        label: 'Step 2: summarize from the extracted quotes only',
        prompt: `Now write a 3-bullet summary of the most important retention periods, using only the quotes you just extracted. If you cannot support a claim with one of those exact quotes, drop it rather than including it from memory.`,
      },
    ],
    expectedOutcome:
      'Both summaries are likely accurate on this short example, but the quote-first version is auditable: every bullet in the final summary can be traced back to one of the five extracted verbatim sentences, while the direct-summary baseline has no such paper trail.',
    whatToObserve: [
      'Whether the direct-summarize baseline blends or rounds any of the retention periods (e.g. misstating "18 months" as "2 years").',
      'Whether the quote-extraction step captures all five retention periods verbatim, including the legal-hold override in Section 5.',
      'Whether the final quote-grounded summary includes the legal-hold exception, since it is the easiest one to drop when summarizing directly.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 2.3 names extracting verbatim quotes first as the specific technique for grounding responses to long documents (over 20k tokens) and preventing free invention, best used for exactly this kind of long-text summarization.',
    troubleshooting: [
      {
        problem: 'The direct summary already looks perfectly accurate.',
        fix: 'This short example is a stand-in for a real >20k-token document; the technique\'s value grows with document length and topic density — try pasting in a longer real policy document (with sensitive details removed) to see a bigger gap.',
      },
      {
        problem: 'The quote-extraction step paraphrases instead of quoting exactly.',
        fix: 'Re-send with an explicit instruction: "Quote character-for-character from the document; do not paraphrase or shorten."',
      },
    ],
    cleanup: [],
    sourceIds: ['reduce-hallucinations'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-hallucination-check',
    certificationId: 'ccao-f',
    domainIds: ['d2'],
    title: 'Allow "I don\'t know" and run a Best-of-N consistency check',
    objective:
      'Practice the two highest-leverage hallucination-reduction techniques: explicitly permitting "I don\'t know," and running the same question multiple times to check whether the answers agree (Best-of-N verification).',
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Open a new chat at claude.ai for the baseline test.',
      'Open two to three additional fresh chats for the Best-of-N repeats (each run must be a separate chat so prior answers cannot bias later ones).',
    ],
    steps: [
      {
        title: 'Ask a question with no "I don\'t know" permission',
        detail:
          'In chat 1, paste Prompt 1 — a specific, obscure-sounding factual question about a fictional company that Claude has no way to actually know the answer to. See whether it invents a plausible-sounding but unverifiable answer.',
      },
      {
        title: 'Re-ask with explicit permission to say "I don\'t know"',
        detail:
          'In a new chat, paste Prompt 2, identical except it explicitly states that saying "I don\'t know" is an acceptable and preferred answer if the information is not available. Compare the response.',
      },
      {
        title: 'Run Best-of-N on a reasoning-heavy question',
        detail:
          'Paste Prompt 3 into 3 separate fresh chats. Prompt 3 asks for a specific numeric calculation embedded in a scenario. Record all three final answers.',
      },
      {
        title: 'Check for disagreement across the 3 runs',
        detail:
          'Compare the three answers from step 3. If any of the three differs from the others, treat that as a flag: the disagreeing location is a likely hallucination, and none of the answers should be trusted without independent verification.',
      },
    ],
    prompts: [
      {
        label: 'Step 1: question without "I don\'t know" permission',
        prompt: `What was Northwind Traders' exact customer satisfaction score for Q3 2019, according to their internal reporting?`,
      },
      {
        label: 'Step 2: same question, with "I don\'t know" explicitly allowed',
        prompt: `What was Northwind Traders' exact customer satisfaction score for Q3 2019, according to their internal reporting? If you do not have reliable information to answer this, say "I don't know" rather than estimating or guessing — an honest "I don't know" is the preferred answer here.`,
      },
      {
        label: 'Step 3: Best-of-N reasoning question (run in 3 separate chats)',
        prompt: `Northwind Traders bought 340 units at $18.75 each, then sold 210 of them at $29.99 each. Of the remaining units, 40 were returned as defective and written off at full cost. What is the net profit or loss so far? Show your work and give one final number.`,
      },
    ],
    expectedOutcome:
      'Step 1 often produces a specific-sounding invented number for data that does not exist. Step 2, with permission to decline, is much more likely to say it cannot know this. In step 3, the three runs should agree on the same final number if the calculation is genuinely solid; any disagreement flags a hallucination risk in the reasoning.',
    whatToObserve: [
      'Whether step 1 states a confident, specific figure for a number that could not plausibly be known.',
      'Whether step 2\'s explicit permission to say "I don\'t know" changes the response from a fabricated figure to an honest refusal.',
      'Whether all 3 Best-of-N runs in step 3 land on the identical final dollar figure, or whether they diverge.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 2.3 ranks "allow I don\'t know" as the single most effective hallucination-reduction technique (a default for all contexts) and names Best-of-N verification (running the same question multiple times and checking agreement) as a cheap, practical way to detect hallucination through inconsistency.',
    troubleshooting: [
      {
        problem: 'Step 1 already says it does not know.',
        fix: 'Try a question that sounds more answerable (a plausible-sounding statistic) rather than one that\'s obviously unknowable — the gap is most visible on borderline questions.',
      },
      {
        problem: 'All 3 Best-of-N runs agree even though the math looks suspicious.',
        fix: 'Independently verify the calculation by hand (or with Code Execution) rather than trusting agreement alone — Best-of-N flags likely hallucination but consistent answers can still all be wrong if the model makes the same mistake every time.',
      },
    ],
    cleanup: [],
    sourceIds: ['reduce-hallucinations'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-citation-verification',
    certificationId: 'ccao-f',
    domainIds: ['d2'],
    title: 'Trace citations back to primary sources through verification depth levels',
    objective:
      'Practice moving through the four verification depth levels (repost, surface, cross-check, deep dig) on a set of Claude-generated citations, to feel the difference between "a citation exists" and "a citation is actually correct."',
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Open a new chat at claude.ai.',
      'Have a browser tab ready to actually attempt to look up any citation Claude produces (Level 2 requires genuinely trying to trace it, not just eyeballing the reply).',
    ],
    steps: [
      {
        title: 'Ask for a citation-dense answer',
        detail:
          'Paste Prompt 1, asking Claude to summarize a niche topic with inline citations to named sources. Niche, specific topics are more likely to surface an unverifiable or fabricated-sounding citation for this exercise.',
      },
      {
        title: 'Level 0/1: repost and surface check',
        detail:
          'First, just read the reply as-is (Level 0 — not verification). Then check only whether each citation "looks like" a real source name or title (Level 1 — surface). Notice how little confidence either level actually earns.',
      },
      {
        title: 'Level 2: cross-check by actually tracing one citation',
        detail:
          'Pick the citation that sounds most specific (e.g. names an exact report, statistic, or study) and actually try to find and open it. Record whether it is genuinely traceable to a real primary source, or whether it does not check out.',
      },
      {
        title: 'Level 3: deep dig from the one miss you found',
        detail:
          'If step 3 turned up any issue (a citation that could not be verified, or a real source that does not actually say what was claimed), treat that as the "known-miss signal" and re-check every other citation in the reply with the same scrutiny, rather than assuming the rest are fine.',
      },
    ],
    prompts: [
      {
        label: 'Step 1: request a citation-dense summary',
        prompt: `Summarize the main historical developments in the standardization of shipping container sizes in the 20th century. Include specific named sources, studies, or reports for at least 3 of your claims, with inline citations.`,
      },
      {
        label: 'Step 3 follow-up: ask Claude to name its most specific citation',
        prompt: `Of the citations in your answer above, which one is the most specific (an exact report name, study, or statistic)? Restate that one citation on its own, with as much identifying detail (author, publisher, year, title) as possible, so I can look it up myself.`,
      },
    ],
    expectedOutcome:
      'At least one citation in the reply is difficult or impossible to independently verify as stated (a title that does not exist as given, a misattributed statistic, or a source that on inspection does not support the specific claim). The exercise is successful once you can point to a specific citation you personally traced and confirmed either checks out or does not.',
    whatToObserve: [
      'How confident the citation sounds (Level 1) versus whether it actually resolves to a real, checkable primary source (Level 2).',
      'Whether the most "specific-sounding" citation is actually the easiest or hardest one to verify.',
      'Whether finding one shaky citation changes how much you trust the other citations in the same reply.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 2.3 defines the verification trap (a citation existing is not proof it is correct) and the known-miss signal (one confirmed error means treat the rest of the output with suspicion) as core exam judgments, distinguished from the four-level verification depth model (repost, surface, cross-check, deep dig).',
    troubleshooting: [
      {
        problem: 'Every citation seems to check out fine.',
        fix: 'Try a more obscure or narrower topic, or ask for a specific numeric statistic with a named year and publisher — narrower, more specific claims are more likely to reveal a fabricated or misattributed detail.',
      },
      {
        problem: 'Unsure how to actually "trace" a citation without leaving Claude.ai.',
        fix: 'A real trace means an independent search outside the chat (a web search, a library catalog, an official site) — asking Claude itself "are you sure this citation is real?" is Level 0/1 at best, never Level 2.',
      },
    ],
    cleanup: [],
    sourceIds: ['reduce-hallucinations', 'glossary'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-output-format-selection',
    certificationId: 'ccao-f',
    domainIds: ['d2'],
    title: 'Choose Artifact vs. inline prose vs. Structured Outputs JSON',
    objective:
      'Practice the judgment of choosing an output format by "how the deliverable will be used" — producing the same underlying content as an Artifact, as inline prose, and as schema-constrained JSON, and comparing when each is the right choice.',
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Open a new chat at claude.ai (Free or paid; Artifacts are available broadly).',
      'No files needed — the content is a short fictional product one-pager.',
    ],
    steps: [
      {
        title: 'Ask for a one-off answer as inline prose',
        detail:
          'Paste Prompt 1, a quick one-time question. Confirm the reply arrives as an ordinary chat message, not a separate panel — appropriate since nothing here needs to be reused or edited later.',
      },
      {
        title: 'Ask for a reusable deliverable as an Artifact',
        detail:
          'Paste Prompt 2, asking for a one-page product brief meant to be edited and shared. Confirm Claude opens it in the Artifact panel rather than inline, and that you can edit it there.',
      },
      {
        title: 'Ask for the same facts as strict JSON for a downstream system',
        detail:
          'Paste Prompt 3, framing the request as data a downstream system will parse (name, price, category fields). Note whether Claude produces JSON, and whether it explicitly uses a schema-oriented instruction (naming exact field names and types) rather than a loose "give me JSON."',
      },
      {
        title: 'Name the boundary: syntax vs. semantics',
        detail:
          'Look at the JSON from step 3 and deliberately check one field for semantic correctness (e.g. does the stated price actually match what was in the brief?). Confirm for yourself that valid JSON shape does not by itself guarantee the value is correct — that check has to be done separately.',
      },
    ],
    prompts: [
      {
        label: 'Step 1: one-off inline question',
        prompt: `In one sentence, what's a good elevator-pitch tagline for a fictional productivity app called "Northwind Flow"?`,
      },
      {
        label: 'Step 2: reusable deliverable (expect an Artifact)',
        prompt: `Write a one-page product brief for "Northwind Flow," a fictional task-management app aimed at small teams. Include sections for Overview, Key Features (3 bullets), Target Customer, and Pricing ($12/user/month). I want to keep editing this document over the next few days, so format it as something I can reuse.`,
      },
      {
        label: 'Step 3: structured data for a downstream system',
        prompt: `Extract the following from the "Northwind Flow" brief above into JSON with exactly these fields: "productName" (string), "pricePerUserMonthly" (number), "targetCustomer" (string), "featureCount" (integer). This JSON will be parsed by a downstream script, so the field names and types must match exactly — no extra commentary outside the JSON.`,
      },
    ],
    expectedOutcome:
      'Step 1 stays inline (correctly — it is a one-off answer). Step 2 opens in the Artifact panel (correctly — it is a reusable, editable deliverable). Step 3 returns JSON with the requested field names and types (correctly — it is meant for a downstream system), and on inspection the JSON is syntactically valid even before you separately check whether pricePerUserMonthly correctly equals 12.',
    whatToObserve: [
      'Whether step 1 stays as a plain chat reply rather than unnecessarily opening an Artifact for a one-off answer.',
      'Whether step 2 actually lands in the Artifact panel, confirming it is being treated as an editable, reusable document.',
      'Whether step 3\'s JSON has exactly the four requested fields with correct types (string vs. number vs. integer) — that is what a schema-shape check looks like.',
    ],
    whyItMatters:
      'CCAO-F Task Statement 2.6 frames format choice as a business decision — Artifacts for documents/code to reuse, inline prose for one-off answers, structured JSON for downstream systems — and stresses that Structured Outputs guarantee syntax (valid JSON, required fields, correct types) but never guarantee semantic correctness of the values.',
    troubleshooting: [
      {
        problem: 'Step 2 replies inline instead of opening an Artifact.',
        fix: 'Make the "reuse it later / keep editing" intent more explicit in the prompt, since Claude infers Artifact-worthiness partly from stated reuse intent, not length alone.',
      },
      {
        problem: 'Step 3\'s JSON has extra commentary or markdown code fences around it.',
        fix: 'Re-state "no extra commentary outside the JSON" and, if it still wraps the JSON in prose, note that this is exactly the gap that dedicated Structured Outputs (constrained decoding) is designed to close beyond what a plain instruction can guarantee.',
      },
    ],
    cleanup: [],
    sourceIds: ['structured-outputs', 'increase-consistency'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
  {
    id: 'lab-model-selection',
    certificationId: 'ccao-f',
    domainIds: ['d3'],
    title: 'Assign Haiku/Sonnet/Opus by task, and adjust effort before switching models',
    objective:
      'Practice the Domain 3 core judgment: pick a model tier by task nature (high-volume/low-complexity vs. balanced vs. complex reasoning), then practice raising effort as the first lever before escalating to a higher-tier model.',
    prerequisites: [],
    estimatedMinutes: 20,
    setup: [
      'Open claude.ai and confirm which models are available on your plan (model picker in the chat composer).',
      'Have three short fictional tasks ready to route: a bulk tagging task, an everyday drafting task, and a complex reasoning task (all provided below).',
    ],
    steps: [
      {
        title: 'Route task 1: high-volume, low-complexity',
        detail:
          'Read Prompt 1 (tagging 5 short support messages by category). State out loud which tier you would assign before running it — this should be Haiku: high-volume, low-complexity, routine work.',
      },
      {
        title: 'Route task 2: balanced everyday work',
        detail:
          'Read Prompt 2 (drafting a client-facing email that needs decent nuance but is not high-stakes). State which tier fits — this should be Sonnet: the balance-of-speed-and-quality tier for everyday nuanced work.',
      },
      {
        title: 'Route task 3: complex reasoning',
        detail:
          'Read Prompt 3 (a multi-step business logic puzzle where a wrong answer has real consequences). State which tier fits — this should be Opus: complex reasoning where accuracy outweighs cost.',
      },
      {
        title: 'Practice "raise effort before switching models"',
        detail:
          'If your plan/model picker exposes an effort or thinking-depth control on Sonnet or Opus, and a reply to Prompt 3 feels shallow, try raising effort/thinking depth on the SAME model first. Only if that does not help would you escalate to a higher tier — confirm you can explain why re-running the same settings again would not help if the real issue is capability.',
      },
    ],
    prompts: [
      {
        label: 'Task 1: high-volume, low-complexity (routes to Haiku)',
        prompt: `Tag each of these 5 support messages with a single category (Billing, Technical, or General) — one word answers only, no explanation needed:
1. "Can I change my billing address?"
2. "App crashes on launch."
3. "What time do you close?"
4. "I was double-charged this month."
5. "Password reset isn't sending an email."`,
      },
      {
        label: 'Task 2: balanced everyday work (routes to Sonnet)',
        prompt: `Draft a short, warm-but-professional email to a client at "Riverside Consulting" letting them know their project deliverable will be 3 business days late due to a scope change they requested mid-project, without sounding like we're blaming them.`,
      },
      {
        label: 'Task 3: complex reasoning (routes to Opus; try raising effort here first)',
        prompt: `Northwind Traders is deciding between two vendor contracts. Vendor A: $50,000/year, 2-year lock-in, includes a 5% early-termination penalty on remaining balance. Vendor B: $58,000/year, month-to-month, no lock-in. Northwind expects a 40% chance they'll need to switch vendors within 14 months due to an unrelated planned system migration. Walk through the expected cost of each option under that probability and recommend one, showing your reasoning step by step.`,
      },
    ],
    expectedOutcome:
      'Task 1 is correctly routed to Haiku (fast, cheap, simple categorical tagging at volume). Task 2 is correctly routed to Sonnet (everyday nuanced writing). Task 3 is correctly routed to Opus (multi-step expected-value reasoning with real stakes), and you can articulate that if Task 3\'s answer feels shallow, raising effort on Opus is the first fix to try — not repeatedly re-running the same prompt, and not immediately assuming a different model is required.',
    whatToObserve: [
      'Whether your stated tier assignment for each task matches "high-volume/low-complexity -> Haiku," "balanced/everyday -> Sonnet," "complex reasoning/high-stakes -> Opus."',
      'Whether Task 3\'s expected-value math is actually shown step by step, or whether the model skips straight to a recommendation without the arithmetic.',
      'Whether you can articulate, in your own words, why re-running Task 3 again on the same model/effort setting would not fix a genuinely shallow answer, while raising effort or escalating tier might.',
    ],
    whyItMatters:
      'CCAO-F Task Statements 3.2 and 3.3 test both the tier map (Haiku for high-volume/low-complexity, Sonnet for balance, Opus for complex reasoning/agentic work) and the escalation order: raise effort within the same model first, escalate to a higher tier second, and treat a same-model retry as pointless unless the real problem is missing information rather than capability.',
    troubleshooting: [
      {
        problem: 'My plan does not expose model choice or effort controls directly.',
        fix: 'Do the exercise as a judgment call using the model picker available to you, and reason through what you *would* pick if all four tiers were available — the exam tests the judgment, not necessarily hands-on API effort tuning.',
      },
      {
        problem: 'Task 3\'s answer looks shallow even on Opus.',
        fix: 'Before switching to a different model, check the "Is information missing?" branch first — if the prompt is missing a fact the model would need (e.g. tax treatment of the penalty), supplying that information may fix it faster than escalating.',
      },
    ],
    cleanup: [],
    sourceIds: ['models-overview', 'choosing-a-model'],
    relatedQuestionIds: [],
    requiresPaidFeature: false,
    paidFeatureNote: '',
  },
];
