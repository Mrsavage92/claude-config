# Investigation report template

Fill every section. If a section genuinely doesn't apply (e.g. no fix needed, it's expected
behaviour), say that explicitly rather than omitting it - an omitted section reads as "forgot,"
a stated non-applicability reads as "checked."

---

## Summary

One or two sentences: what's wrong, for whom, since when.

## Evidence gathered

- Org(s) queried, with alias
- Record Id(s) / example(s) examined
- Relevant object(s), field(s), automation (flows/Apex/validation rules) inspected
- Setup Audit Trail window checked (dates)
- Snapshot comparison: **state explicitly whether this was possible** given the known baseline
  gaps (UAT-only, no logic diff) - don't imply a comparison happened if it didn't

## Root cause

State it, then a confidence level: **Confirmed** (direct evidence - e.g. an audit trail entry
timestamped exactly against the regression) / **Likely** (strong circumstantial evidence, one
plausible alternative) / **Unclear** (evidence doesn't converge - list the live hypotheses and
what would resolve them).

## Impact

- Which records/users are affected, and how many (query-backed count, not a guess)
- Whether it's ongoing or a one-time event
- Any related processes that share the same root cause (e.g. the same flow feeds two objects)

## Recommended fix

What should change, and where (Apex/Flow/validation rule/permission set/config). Note whether
this is a code change (needs the normal build+test+deploy path) or a config-only change (CMT
value, Setup toggle) - they have different handoff paths.

## Validation plan

How to confirm the fix actually resolves it, post-deploy - specific enough that someone other
than the investigator could run it. Re-use existing verify scripts where they exist
(`bdr-integrations/scripts/verify-*.ps1`) rather than inventing a new one per incident.

## Rollback plan

Only if the fix carries real risk (schema change, sharing model change, anything touching a
shared/prod-GA'd code path). Skip this section explicitly for a low-risk fix rather than padding
it out.

## Human action required

Who needs to do what, next. Be specific: "Adam reviews and, if agreed, packages for Nikith per
the standard prod-handoff format" beats "someone should fix this."
