import type { Lesson } from '@/schemas';

export const lessonsD6: Lesson[] = [
  {
    id: 'lesson-6-1',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-1',
    title: 'Classify use cases against the AUP',
    summary:
      'The Acceptable Use Policy is written in three layers — universal prohibitions, high-risk requirements, and additional guidelines — and every proposed use case should be classified against them in that order.',
    content: `The **Acceptable Use Policy (AUP)** is the first clue to judging whether a proposed use case is acceptable on Claude. It is written in three layers, and a proposed use case should be classified against them in order.

The first layer, **Universal Usage Standards**, is not conditional — it is a list of "what you must not do," grouped into eight clusters: illegal activity, severe harm (weapons, CBRN, incitement, CSAM), privacy violation, disinformation and election interference, surveillance/predictive policing/criminal justice (including non-consensual location or emotion tracking, facial recognition, credit scoring), fraud and exploitation, platform abuse (jailbreaking, distillation, scraping), and sexually explicit content. A universal-prohibition match is an immediate "no."

The second layer, **high-risk requirements**, covers seven areas where a decision directly affects an individual's rights, livelihood, or property: Legal, Healthcare, Insurance, Finance, Employment and housing, Academic testing, and Media/journalism. Note that wellness advice (sleep, stress, nutrition) is *not* Healthcare. High-risk use is conditionally permitted but requires two things: a qualified professional reviews the output before it is disseminated or acted on (human-in-the-loop), and AI use is disclosed to the individual, at minimum at the start of the session. Asking Claude to self-check its own high-risk output is never a substitute for that review.

The third layer, **additional guidelines**, applies to specific product forms regardless of risk level: consumer-facing chatbots must disclose they are AI, products aimed at minors need COPPA compliance and age verification, and agentic use remains fully bound by the AUP.`,
    keyPrinciples: [
      'The AUP has three layers: universal prohibitions, high-risk requirements, additional guidelines.',
      'Universal prohibitions group into eight clusters and produce an immediate "no."',
      'Seven high-risk areas require qualified-professional review plus AI disclosure.',
      'Wellness advice is not high-risk Healthcare.',
      'Claude self-checking its own high-risk output is not a substitute for human review.',
    ],
    decisionRules: [
      'Classify a proposed use case into universal, high-risk, or additional-guidelines before deciding.',
      'A universal-prohibition match ends the evaluation immediately — do not proceed.',
      'A high-risk match requires both qualified-professional review and disclosure, not one or the other.',
      'For chatbots, minors, or agents, check the matching additional guideline even if not high-risk.',
    ],
    commonPitfalls: [
      'Treating wellness coaching as regulated Healthcare (or the reverse — assuming Healthcare is always fine because it "feels like wellness").',
      'Accepting Claude\'s own reassurance ("this looks correct") as the human-in-the-loop check.',
      'Assuming an agentic workflow is exempt from the AUP because no human sees each step.',
    ],
    sourceIds: ['usage-policy', 'minors-guidelines'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-human-review-decision'],
    estimatedMinutes: 12,
  },
  {
    id: 'lesson-6-2',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-2',
    title: 'Apply data sensitivity and privacy rules',
    summary:
      'Commercial surfaces are never trained on customer content while consumer surfaces are by default; sensitive data belongs on the commercial surface, anonymized, with retention periods and DPA protections understood.',
    content: `Once a use case is judged acceptable, confirm the sensitivity and regulatory posture of the data involved. The first branch is **commercial versus consumer**. Under the Commercial Terms of Service, Anthropic may not train models on Customer Content from commercial services (API, Claude for Work). The consumer surface (Free/Pro/Max) is, by default, used for model improvement unless the user opts out in settings. Because an opt-out can be forgotten, **sensitive data should always go on the commercial surface**, never consumer.

| Item | Commercial | Consumer |
|---|---|---|
| Training use | Not used | Used by default |
| Opt-out needed | No | Yes |

Retention periods matter for judgment: deleted conversations disappear from the backend within 30 days; data used in training is retained up to 5 years in de-identified form; inputs/outputs flagged as AUP violations up to 2 years (classification scores up to 7 years); feedback data up to 5 years. Incognito chats are excluded from training even with model-improvement enabled.

A commercial contract includes a **Data Processing Addendum (DPA)**, under which the customer is controller and Anthropic is processor. Key protections: AES-256 encryption at rest, TLS 1.2+ in transit, breach notification within 48 hours, deletion within 30 days of contract termination, RBAC plus MFA for access, and Standard Contractual Clauses (SCC) for EU/UK/Swiss transfers.

Before uploading sensitive data, remove or anonymize personal identifiers — instructing Claude to "ignore" or "not retain" data is not a control, because the data has already been shared.`,
    keyPrinciples: [
      'Commercial surfaces are contractually excluded from training; consumer surfaces train by default unless opted out.',
      'Sensitive data belongs on the commercial surface, anonymized before upload.',
      'Retention: deleted data 30 days; training data 5 years de-identified; AUP-flagged data 2 years (scores 7 years); feedback 5 years.',
      'The DPA sets controller/processor roles and protections: AES-256, TLS 1.2+, 48-hour breach notice, 30-day post-termination deletion, RBAC+MFA, SCC.',
      'Telling Claude not to retain data is not a substitute for removing it before upload.',
    ],
    decisionRules: [
      'For any sensitive data, confirm commercial surface first — do not rely on a consumer opt-out toggle.',
      'Anonymize or remove identifiers before the data is shared, not after.',
      'For GDPR/HIPAA-covered data, confirm SCC or a compliant plan is active before uploading.',
    ],
    commonPitfalls: [
      'Uploading customer PII to a consumer account and assuming the opt-out setting covers it.',
      'Believing an instruction like "don\'t remember this" prevents data from being processed.',
      'Confusing the 30-day deletion window with the 5-year de-identified training retention.',
    ],
    sourceIds: ['commercial-terms', 'dpa', 'data-retention'],
    relatedQuestionIds: [],
    relatedLabIds: ['lab-sensitive-data-handling'],
    estimatedMinutes: 13,
  },
  {
    id: 'lesson-6-3',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-3',
    title: 'Follow governance standards: RSP, ASL, PBC, LTBT',
    summary:
      'Anthropic\'s Responsible Scaling Policy stages safety requirements by AI Safety Level, while its PBC charter and Long-Term Benefit Trust provide structural evidence that safety is not sacrificed for short-term commercial pressure.',
    content: `After confirming data sensitivity, measure the developer's own governance against your organization's policy. Two frameworks matter.

The **Responsible Scaling Policy (RSP)** is Anthropic's pledge not to train or deploy a model unless its safety can be confirmed, raising the required safety bar as capability grows — the principle of proportional protection. The RSP defines staged **AI Safety Levels (ASL)**, modeled on biosafety levels: ASL-1 is basic capability (roughly chess-bot level); **ASL-2 is the operating level of all current models**; ASL-3 is triggered when a model can provide meaningful assistance for CBRN weapons; ASL-4+ is a future tier tied to autonomous AI R&D risk. The RSP addresses catastrophic risk and is complementary to the AUP, which addresses everyday harmful use (fraud, disinformation).

Corporate-governance structure is separate, structural evidence of safety. Anthropic is incorporated as a Delaware **Public Benefit Corporation (PBC)** — legally obligated to pursue public benefit alongside shareholder interests. The **Long-Term Benefit Trust (LTBT)** is an independent trust with authority to appoint some directors, designed to buffer the board from short-term commercial pressure that could compromise safety.

For an organization's own AI-use policy, the procedure is: confirm your organization's acceptable-risk standard, confirm current models operate at ASL-2, and revisit the correspondence between ASL and your standard as higher-capability models are deployed. Use RSP/ASL and PBC/LTBT together as decision material for whether the developer imposes safety discipline on itself.`,
    keyPrinciples: [
      'The RSP raises the required safety bar as model capability rises (proportional protection).',
      'ASL is staged like biosafety levels; all current models operate at ASL-2.',
      'ASL-3 is triggered by meaningful CBRN assistance risk; ASL-4+ concerns autonomous AI R&D.',
      'The RSP covers catastrophic risk; the AUP covers everyday harmful use — the two are complementary.',
      'PBC charter and LTBT oversight are structural evidence against short-term pressure overriding safety.',
    ],
    decisionRules: [
      'Confirm current models operate at ASL-2 before assuming a higher safety standard applies.',
      'When a higher-capability model is deployed, re-check the ASL threshold against your organization\'s risk tolerance.',
      'Use PBC/LTBT as supporting governance evidence, not as a control that replaces your own review process.',
    ],
    commonPitfalls: [
      'Confusing the RSP (catastrophic risk) with the AUP (everyday harmful use) as if one framework covers both.',
      'Assuming ASL-3 already applies to current production models.',
      'Treating the PBC/LTBT structure as a technical safety control rather than a corporate-governance safeguard.',
    ],
    sourceIds: ['rsp', 'company'],
    relatedQuestionIds: [],
    relatedLabIds: [],
    estimatedMinutes: 10,
  },
  {
    id: 'lesson-6-4',
    certificationId: 'ccao-f',
    domainId: 'd6',
    taskStatementId: 'ts-6-4',
    title: 'Weigh the ethical implications of AI usage',
    summary:
      'Claude\'s Constitution ranks safety above ethics above guidelines above helpfulness; the Transparency Hub publishes the evaluations that back that priority order, and four ethical questions turn it into practical judgment.',
    content: `The final step in evaluating a use case is holistic ethical judgment, rooted in Claude's **Constitution** — the document defining Claude's values and shaping its training, with which all other guidance is designed to be consistent.

The Constitution sets a four-level priority order for resolving conflicts, from highest to lowest: (1) **broadly safe** — do not undermine human oversight; (2) **broadly ethical** — honest, benevolent values; (3) **Anthropic's guidelines** — more specific instructions; (4) **genuinely helpful** — benefit the user and society. When helpfulness conflicts with safety, safety wins; when guidelines conflict with ethics, ethics wins.

Within "broadly safe," the emphasized property is **corrigibility** — humans can stop or redirect Claude, and Claude does not act to undermine appropriate human oversight even when confident in its own judgment. Four ethical principles follow: honesty (says "I don't know," avoids overconfidence), no meaningful CBRN assistance under any circumstance (a hard constraint), respect for corrigibility, and good judgment over rigid rules — the Constitution distinguishes hard constraints (predictable, always upheld) from flexible principles (contextual, less predictable).

The **Transparency Hub** publishes safety processes and outcomes across model reports, system reliability, and voluntary commitments, evaluating CBRN, autonomy, cybersecurity, alignment, political bias (150 topics, 9 task types, 1,350 opposing-viewpoint pairs), and child safety.

When evaluating a use case, ask four questions: Are you verifying output rather than trusting it blindly (honesty)? Could someone be harmed (harm, check the seven high-risk areas)? Has a qualified professional reviewed it (oversight)? Are you finishing with your own judgment rather than shipping the raw output (augmentation)?`,
    keyPrinciples: [
      'Constitution priority order: broadly safe > broadly ethical > Anthropic\'s guidelines > genuinely helpful.',
      'Corrigibility means humans can stop or redirect Claude even when Claude is confident.',
      'Hard constraints (e.g., no CBRN assistance) are always upheld; flexible principles are judged by context.',
      'The Transparency Hub evaluates CBRN, autonomy, cybersecurity, alignment, political bias, and child safety.',
      'Four ethical questions: honesty, harm, human oversight, augmentation.',
    ],
    decisionRules: [
      'When helpfulness and safety conflict, safety takes priority every time.',
      'When Anthropic\'s specific guidelines conflict with broader ethics, ethics takes priority.',
      'Treat a use case as augmentation only if a human finishes with independent judgment, not a rubber stamp.',
    ],
    commonPitfalls: [
      'Assuming "genuinely helpful" outranks safety because helpfulness is the visible goal of a request.',
      'Treating corrigibility as blind obedience rather than not undermining appropriate oversight.',
      'Skipping the four ethical questions because the output "looks polished."',
    ],
    sourceIds: ['constitution', 'transparency-hub'],
    relatedQuestionIds: [],
    relatedLabIds: [],
    estimatedMinutes: 11,
  },
];
