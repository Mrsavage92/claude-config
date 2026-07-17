---
name: sf-investigate
description: "Read-only Salesforce root-cause investigation for BDR orgs (bdr-prod, bdr-uat, bdr-sandbox). Gathers live evidence via sf CLI, checks it against the bdr-salesforce-config-docs metadata snapshot, checks Setup Audit Trail + recent deployments for what changed and when, and produces a structured investigation report. Use whenever asked to investigate, root-cause, or debug a Salesforce issue - a broken flow, a wrong field value, an approval stuck, a permission error, unexpected automation behaviour. Triggers: '/sf-investigate', 'why is this record wrong', 'investigate this Salesforce bug', 'what changed to cause X'. NEVER creates, edits, deletes, or deploys anything - read-only, always. NOT for making the actual fix (hand the report to the normal deploy process / Nikith-scope rule) and NOT for generic Salesforce how-to questions with no live incident behind them."
---

# Skill: Salesforce Investigation (read-only)

## Hardened rule (load-bearing)

**This skill NEVER writes to Salesforce.** Not a field update, not a metadata deploy, not a Setup change - nothing. Every command it runs is describe/query/retrieve only. If an investigation concludes a fix is needed, the output is a *recommendation* handed to a person - who then runs it through the normal process (dry-run vs UAT, Nikith paste-from-Teams for prod, per `reference_nikith_scope`). If you ever find yourself about to run `sf project deploy`, `sf data update/create/delete`, or anything that mutates the org from inside this skill - STOP. That is out of scope for this skill, no exceptions, no "just this once."

## Known limitation - say this out loud when it's relevant

The historical baseline (`bdr-salesforce-config-docs`) is **not yet complete**. As of now:
- Only `orgs/uat/` has been extracted. `orgs/prod/` and `orgs/sandbox/` are empty placeholders.
- Every extraction's `_meta.json` has `extractedAtUtc: null` - the snapshot doesn't actually know its own age (real age must be inferred from `git log` on that file).
- Apex classes, triggers, and flows are captured as **name + active/inactive status only** - no source body. The snapshot can tell you a component *exists*, not whether its *logic* changed.
- Permission sets are a name/label list only - no field-level security detail.

Don't present a "compared against the snapshot" step as more authoritative than this. If the investigation actually needs Apex/flow logic diffed, use `retrieve_metadata` (below) to pull live source and diff it by eye or against a known-good commit - the snapshot repo can't do that yet.

## When to use
- A record, flow, approval, or automation is behaving unexpectedly and someone needs the root cause before touching anything.
- "What changed to cause X" - a regression with no obvious recent code change on the BDR side.
- Pre-fix diligence: before handing a change to Nikith, confirm what's actually live vs what source says.

## When NOT to use
- Making the fix itself - this skill stops at a recommendation.
- Generic "how does Salesforce do X" questions with no live incident.
- Anything requiring a write - immediately out of scope, don't try to route around it.

## Canonical sources
1. `~/.claude-work/projects/bdr-salesforce-config-docs/` - the metadata snapshot baseline (UAT only, see limitation above)
2. `~/.claude-work/projects/bdr-integrations/CLAUDE.md` Section D - decisions already made; check before assuming something is a bug rather than a documented design choice
3. `~/.claude/projects/.../memory/reference_bdr_sf_3tier_deploy.md` - org tier structure (Dev Sandbox -> UAT Sandbox -> Production)
4. `~/.claude/projects/.../memory/reference_bdr_uat_partial_copy.md` - UAT is a **partial copy** of prod (~10k rows/object cap). Never compute volume/percentage stats from UAT - confirm against prod read-only.
5. `~/.claude/projects/.../memory/reference_nikith_scope.md` - who deploys what, and how a recommendation gets handed off

## The investigation sequence

Run these in order. Each step's evidence should inform the next - don't skip to a conclusion.

### 1. Understand the problem
Get from whoever's asking: the symptom, one or more example record Ids (or enough to find them), expected vs actual behaviour, and roughly when it started. If any of these is missing, ask before running queries blind - a vague symptom wastes the whole investigation.

### 2. Gather live evidence
Read-only against the relevant org alias (`bdr-prod` unless told otherwise - see `references/safe-commands.md` for the exact command palette). Pull: the record(s) in question, the object's describe (fields, picklists, validation-relevant metadata), any permission sets/FLS bearing on the user who hit the issue, and the flows/Apex/validation rules touching that object.

### 3. Check it against the snapshot
Compare live state to `bdr-salesforce-config-docs/orgs/uat/` - **only if the org in question is UAT**, or the object/component happens to also exist in one of BDR's `metadata/prod/` project pulls (currently just the CreditSafe-related components). If neither applies, say so and skip this step rather than fake a comparison.

### 4. Check what actually changed
Query Setup Audit Trail and recent deployments (see `references/safe-commands.md`) for anything touching the relevant object/component in the window between "last known good" and "when it started." This is usually the highest-signal step - a change that lines up in time with the symptom is a strong lead, one that doesn't is a strong reason to look elsewhere.

### 5. Report, don't guess
Use `references/report-template.md`. State a confidence level honestly - "likely" is fine, don't dress up a guess as certainty. If the evidence doesn't converge on one cause, say what's still ambiguous and what would resolve it (e.g. "need to confirm with Ryan whether reps edited this manually").

### 6. Hand off
Output goes to whoever asked - pasted into the relevant Salesforce Case, or Teams if there's no Case yet. If a fix is recommended, it goes through the normal deploy process; this skill's job ends at the report.

## Anti-patterns (do NOT do these)

- **Running any write command "just to check something"** — retrieve is fine, deploy/create/update/delete never is, no exceptions.
- **Presenting the UAT snapshot comparison as authoritative** when the object/component was never actually extracted, or when the question needs Apex/flow logic diffed and the snapshot only has name+status.
- **Treating UAT data volumes as real** — UAT is a partial, sampled copy of prod (~10k rows/object cap). A count from UAT is not a percentage of anything real.
- **Concluding root cause from Setup Audit Trail correlation alone** — a change that lines up in time is a lead, not proof. Say "likely," not "confirmed," unless there's direct evidence.
- **Skipping step 1** — investigating without a clear symptom, example record, and expected-vs-actual wastes every query that follows it.

## Related skills
- `/mulesoft-bdr` - if the root cause turns out to be Mule-side (Process/System API), hand off there
- `salesforce-lwc-apex` (anthropic-skills) - if writing the actual Apex/LWC fix once approved
- `codebase-onboarding` - if someone new needs the bigger picture of how BDR's Salesforce + Mule estate fits together first
