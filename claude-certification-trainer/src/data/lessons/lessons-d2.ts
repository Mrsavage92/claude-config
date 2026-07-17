import type { Lesson } from '@/schemas';

export const lessonsD2: Lesson[] = [
  {
    id: 'lesson-2-1',
    certificationId: 'ccao-f',
    domainId: 'd2',
    taskStatementId: 'ts-2-1',
    title: 'Evaluate outputs for accuracy and completeness',
    summary:
      'Judge every output against the HHH framework and measurable, multi-dimensional success criteria — never against a vague sense of quality.',
    content: `## The HHH framework
Anthropic frames quality with three axes: **Helpful, Honest, and Harmless (HHH)** — the same axes used to train Claude. Honest is the axis to watch most closely: it includes providing accurate information, avoiding hallucination, and **acknowledging limits** ("I don't know" is part of being Honest). Walking through the three axes in order when you first read an output catches most oversights.

## Make quality measurable
HHH is qualitative, so translate it into indicators that are **Specific, Measurable, Achievable, and Relevant**. "A good output" cannot drive a decision; "citation precision," "response agreement rate," or "toxicity flag rate per 10,000 runs" can. Multi-dimensional evaluation — combining faithfulness, consistency, relevance, tone, privacy, and safety — is the default, since the weight of each dimension shifts by use case (citation precision matters in a medical app, not in casual chat).

## Choosing a scoring method

| Method | Speed | Reliability | Best for |
|---|---|---|---|
| Code-based | Fastest | Highest | Exact match, keywords, regex |
| Human | Slow | High | Complex judgment, tone, nuance |
| LLM-based | Fast | Medium | Large-volume rubric scoring |

Automate whatever code can decide first; reserve human judgment for the complex calls. Many slightly coarse automated scores usually beat a few high-quality human ones — include edge cases when testing.`,
    keyPrinciples: [
      'HHH = Helpful, Honest, and Harmless; Honest includes acknowledging limits.',
      'Success criteria must be Specific, Measurable, Achievable, and Relevant.',
      'Multi-dimensional evaluation combines several dimensions; the weighting shifts by use case.',
      'Scoring priority: code-based first, then LLM-based, then human for complex judgment.',
    ],
    decisionRules: [
      'Walk through Helpful, Honest, and Harmless in order before accepting an output.',
      'Convert vague quality goals into measurable indicators before judging an output.',
      'Automate anything code can decide; reserve human scoring for nuance and complexity.',
    ],
    commonPitfalls: [
      'Judging quality against a single metric instead of multiple weighted dimensions.',
      'Treating "a good output" as an evaluable criterion instead of converting it to a measurable indicator.',
    ],
    sourceIds: ['glossary', 'develop-tests'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-long-document-grounding'],
    estimatedMinutes: 10,
  },
  {
    id: 'lesson-2-2',
    certificationId: 'ccao-f',
    domainId: 'd2',
    taskStatementId: 'ts-2-2',
    title: 'Spot hallucinations, inconsistencies, and bias',
    summary:
      'Confidence and accuracy are unrelated — train your eye on the four tell-tale hallucination patterns and check for fair treatment on sensitive topics.',
    content: `## Confidence is not accuracy
Claude's own system prompt acknowledges hallucination can occur on minor topics and citations — this is a structural property of LLMs that predict the next token probabilistically, not a flaw unique to Claude. **The degree of confidence and the degree of accuracy are unrelated**; self-reported confidence is never a signal of correctness.

## Four tell-tale signs
- **Fabricated citations** — plausible-looking paper titles, URLs, or statistics that do not exist.
- **Invented specifics** — numbers or statistics not present in the source material, phrased as "it is said that…"
- **Internal contradictions** — the first half of an answer asserts A; the second half affirms the opposite of A.
- **Unsupported assertions** — confident claims ("It is definitely…") with no stated basis.

A citation being present does not make an output safe — verification that never opens the citation is not verification.

## Watching for bias
Bias shows up as supporting only one side, ignoring opposing viewpoints, or treating a group unfairly. Anthropic measures political bias across 1,350 opposing-viewpoint pairs spanning 150 topics and 9 task types, scoring fairness, acknowledgement of opposing views, and refusal rate. On sensitive topics, consciously check whether both sides are treated fairly.

## Reporting problems
Inaccurate, biased, or harmful output can be reported via usersafety@anthropic.com or in-product feedback (e.g., a thumbs-down) — the Usage Policy names this channel explicitly.`,
    keyPrinciples: [
      'Confidence and accuracy are unrelated; self-reported confidence signals nothing about correctness.',
      'The four tell-tale signs: fabricated citations, invented specifics, internal contradictions, unsupported assertions.',
      'A citation\'s mere presence does not make an output verified.',
      'Bias appears as one-sided support, ignored opposing views, or unfair treatment of a group.',
    ],
    decisionRules: [
      'Scan every output for the four hallucination patterns before trusting it.',
      'On sensitive topics, explicitly check whether opposing viewpoints are represented fairly.',
      'Report inaccurate, biased, or harmful outputs via usersafety@anthropic.com or in-product feedback.',
    ],
    commonPitfalls: [
      'Trusting a confident tone as evidence of accuracy.',
      'Accepting a citation as proof without opening and checking it.',
    ],
    sourceIds: ['reduce-hallucinations', 'transparency-hub', 'usage-policy'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-hallucination-check'],
    estimatedMinutes: 9,
  },
  {
    id: 'lesson-2-3',
    certificationId: 'ccao-f',
    domainId: 'd2',
    taskStatementId: 'ts-2-3',
    title: 'Apply fact-checking and validation techniques',
    summary:
      'Reduce hallucination with prompting techniques, then verify by tracing claims to a primary source — not by asking Claude to check itself.',
    content: `## Reducing hallucination before it happens
Three prompting techniques cut hallucination at the source: letting Claude say **"I don't know"** when information is insufficient (the single most effective technique), grounding answers in **direct quotes**, and requiring **citations** for every claim so unsupported ones can be withdrawn. For long documents (over 20k tokens), instruct Claude to extract verbatim quotes first, then answer from them.

## Stronger verification techniques
- **Restrict external knowledge** — "use only the provided document" prevents memory-based filling-in.
- **Best-of-N verification** — ask the same question multiple times; disagreement between answers flags a likely hallucination.
- **RAG** grounds answers in a retrieved knowledge base but is only as reliable as the retrieved documents — using RAG is not automatically "safe."

## The verification depth ladder

| Level | What happens |
|---|---|
| 0 Repost | Reuse Claude's answer as-is (not verification) |
| 1 Surface | Only check a citation exists |
| 2 Cross-check | Open the citation, confirm the content against a primary source |
| 3 Deep dig | One found error means treating every other claim with suspicion |

Asking Claude "is this correct?" is never a substitute for opening the source yourself. Finding one error is a signal that others likely exist — dig further rather than stopping.`,
    keyPrinciples: [
      'Letting Claude answer "I don\'t know" is the single most effective hallucination-reduction technique.',
      'Verbatim quote extraction grounds long-document summarization and prevents invention.',
      'RAG is only as reliable as the documents it retrieves — it does not guarantee accuracy.',
      'Verification means opening a primary source yourself, not re-asking Claude.',
    ],
    decisionRules: [
      'For long documents, require verbatim quote extraction before the task, and mandate a citation per claim.',
      'Use Best-of-N verification (ask the same question multiple times) for important answers.',
      'When you find one factual error, assume others exist and audit the rest of the output.',
    ],
    commonPitfalls: [
      'Treating "Claude cited a source" as equivalent to "the source was checked."',
      'Assuming RAG output is reliable simply because it is retrieval-grounded.',
      'Asking Claude to re-verify its own answer instead of consulting an authoritative source.',
    ],
    sourceIds: ['reduce-hallucinations', 'glossary'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-citation-verification', 'lab-hallucination-check'],
    estimatedMinutes: 11,
  },
  {
    id: 'lesson-2-4',
    certificationId: 'ccao-f',
    domainId: 'd2',
    taskStatementId: 'ts-2-4',
    title: 'Decide when human review is required',
    summary:
      'In seven high-risk areas defined by the Usage Policy, a qualified professional must review the output and AI use must be disclosed — Claude cannot self-verify in these cases.',
    content: `## The seven high-risk areas
The Usage Policy requires human-in-the-loop review and AI disclosure whenever subjective decisions directly affect individuals or consumers:

- **Legal** — legal interpretation, contract drafting
- **Healthcare** — medical diagnosis, treatment plans
- **Insurance** — underwriting, benefits decisions
- **Finance** — lending decisions, investment advice
- **Employment and housing** — hiring, promotion, admission review
- **Academic testing** — entrance exams, certification exams
- **Media / journalism** — reporting, article writing

## The non-negotiable rule
**In high-risk areas, Claude must not self-verify.** Asking Claude "is this medical information correct?" and feeling reassured is not a substitute for review by a qualified professional — someone licensed or expert in that field. Disclosure of AI use must happen at minimum at the start of the session; hiding that AI was used is not allowed. Separately, all consumer-facing chatbots — regardless of risk area — must disclose that the user is interacting with AI.

## Why this holds
Self-reported confidence is not a reliable signal of accuracy: Claude can be wrong while sounding certain, and there is no correlation between expressed confidence and correctness. That is exactly why high-risk areas require an independent qualified human, even when Claude itself sounds sure.`,
    keyPrinciples: [
      'Seven high-risk areas: Legal, Healthcare, Insurance, Finance, Employment/housing, Academic testing, Media/journalism.',
      'Human-in-the-loop applies when subjective decisions directly affect an individual\'s rights, health, money, or opportunity.',
      'Claude must never self-verify its own output in a high-risk area.',
      'All consumer-facing chatbots must disclose AI use, regardless of risk area.',
    ],
    decisionRules: [
      'If an output touches an individual\'s rights, health, money, or opportunity, route it to a qualified professional before use.',
      'Disclose AI use to the affected person at minimum at the start of the session.',
      'Never accept Claude\'s own reassurance ("is this correct?") as a substitute for professional review.',
    ],
    commonPitfalls: [
      'Treating Claude\'s confident self-check as equivalent to a qualified professional\'s review.',
      'Forgetting that AI-use disclosure applies to all consumer chatbots, not only high-risk ones.',
    ],
    sourceIds: ['usage-policy'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-human-review-decision'],
    estimatedMinutes: 10,
  },
  {
    id: 'lesson-2-5',
    certificationId: 'ccao-f',
    domainId: 'd2',
    taskStatementId: 'ts-2-5',
    title: 'Edit and refine outputs for the intended audience',
    summary:
      'Correct content still fails if it does not fit the reader — adjust tone, detail, and format deliberately, since the prompt\'s style shapes the output\'s style.',
    content: `## Three ways to adjust tone and format
Claude's tone, format, and style can be adjusted by specifying role and style in the system prompt, setting preferences in Claude.ai settings, or switching styles with the style feature. The same correct content should look different depending on who reads it:

| Reader | Tone | Detail | Format |
|---|---|---|---|
| Executives | Concise, assertive | Key points only | Bullet points |
| Frontline practitioners | Practical, procedural | Detailed | Step-by-step |
| External partners | Polite, formal | Sufficient | Tidy prose |
| Internal engineers | Precise, technical | High density | Code blocks and tables |

## Countering a cold tone
Newer models trend toward a more direct style. To avoid sounding cold, state tone explicitly ("use a warm, collaborative tone and acknowledge the user's framework before answering") — acknowledging the other party's position before the main point is a concrete empathy technique that measurably changes felt warmth.

## The prompt shapes the output
A useful principle: **the style of the prompt influences the style of the output.** An unadorned, markdown-free prompt tends to produce unadorned output; a bulleted prompt tends to produce bulleted output. To change the output's form, change the prompt's form first.

Never ship Claude's first draft as-is — always refine at least once from the reader's perspective, defining "who reads this" before editing.`,
    keyPrinciples: [
      'Tone, format, and style can be set via the system prompt, Claude.ai settings, or the style feature.',
      'The optimal expression of the same content changes with the reader.',
      'Acknowledging the user\'s framework before answering is a concrete empathy technique.',
      'The style of the prompt influences the style of the output.',
    ],
    decisionRules: [
      'Before editing, state in one phrase who will read the output.',
      'To reduce a cold tone, explicitly instruct warmth and acknowledgement in the prompt.',
      'To change the output\'s form, change the prompt\'s form to match it.',
    ],
    commonPitfalls: [
      'Shipping Claude\'s first draft without refining it for the specific reader.',
      'Assuming one tone fits executives, practitioners, and engineers equally.',
    ],
    sourceIds: ['system-prompts-release'],
    relatedQuestionIds: [],
    relatedLabIds: [],
    estimatedMinutes: 8,
  },
  {
    id: 'lesson-2-6',
    certificationId: 'ccao-f',
    domainId: 'd2',
    taskStatementId: 'ts-2-6',
    title: 'Organize information and select an output format',
    summary:
      'Choose artifacts, inline prose, or structured data by how the deliverable will be used, and remember Structured Outputs guarantee syntax, not semantics.',
    content: `## Three format choices

| Format | Characteristic | Best for |
|---|---|---|
| Artifacts | Editable, reusable, independent panel | Documents, code, charts to reuse |
| Inline prose | The chat response itself | One-off explanations |
| Structured data (JSON/XML) | Easy for downstream systems | API integration, extraction, batch processing |

If a human reads it, use inline prose or an artifact; if a downstream system processes it, use structured data.

## Structured Outputs guarantee syntax, not semantics
**Structured Outputs (constrained decoding)** forces a response to conform to a JSON schema, eliminating parse errors, missing fields, and type violations. General consistency techniques (asking nicely for a format, giving examples) cannot reliably prevent schema violations — use Structured Outputs when you need strict JSON.

But a strict schema only guarantees the **shape** is correct:
- Guaranteed: JSON validity, required fields present, correct types, no parse errors.
- Not guaranteed: numeric accuracy, whether totals add up, whether values land in the right field, logical soundness.

## Five techniques to improve consistency
Be explicit about format, bind with few-shot examples, use retrieval for contextual consistency, chain prompts for complex tasks, and keep Claude in character.

Choose the format by how the deliverable will be used, then still confirm semantic correctness separately — by a human or by code — since fluency is never proof of accuracy.`,
    keyPrinciples: [
      'Choose format by how the deliverable will be used: human reader vs. downstream system.',
      'Structured Outputs (constrained decoding) eliminates parse errors, missing fields, and type violations.',
      'A schema guarantees shape only — not numeric accuracy or logical soundness.',
      'Five consistency techniques: explicit format, few-shot binding, retrieval, prompt chaining, keeping Claude in character.',
    ],
    decisionRules: [
      'Use an artifact for documents, code, or charts to reuse; inline prose for one-off answers; Structured Outputs for downstream JSON.',
      'When strict JSON is required, use Structured Outputs rather than just asking for JSON in the prompt.',
      'Even after schema validation passes, separately confirm semantic correctness (totals, field placement, logic).',
    ],
    commonPitfalls: [
      'Assuming a validated JSON schema means the content\'s values are also correct.',
      'Relying on wording alone ("respond in JSON") instead of Structured Outputs when strictness is required.',
    ],
    sourceIds: ['structured-outputs', 'increase-consistency'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-output-format-selection'],
    estimatedMinutes: 9,
  },
];
