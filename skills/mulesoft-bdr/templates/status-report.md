# BDR MuleSoft Status Update Template

## WhatsApp / Teams — Team Channel

```
BDR MuleSoft Phase 1 Status — {DATE}

Where we are: Phase {0A/0B/0C/1A/1B/1C} — {short description}

Done this week:
- {item 1}
- {item 2}
- {item 3}

Blocked on:
- {owner}: {what they owe}
- {owner}: {what they owe}

Next 48 hours:
- {action 1}
- {action 2}

Go-live target: Week of 5 May 2026 — {on track / at risk / slipping}
```

## Email — Leadership / Dave Beach

```
Subject: BDR MuleSoft — Phase 1 {Week N} Update

Hi Dave,

Quick update on the MuleSoft Phase 1 Account Suspension integration.

**Progress:**
{3 bullets on what's complete}

**Current phase:** {phase name and dates}

**Risks / Blockers:**
{Table: owner | what's owed | days outstanding | impact}

**Next milestone:** {phase gate} on {date}

**Go-live:** {on track / slipping — by how much}

Let me know if you want me to escalate any of the above.

Adam
```

## Individual Chase — Ben (NetSuite)

```
Hi Ben,

Quick check on the NetSuite side for the MuleSoft integration — we need these before we can start testing connections:

1. TBA credentials from the guide I sent (5 values: account_id, consumer_key, consumer_secret, token_id, token_secret)
2. Confirmation whether we have a NetSuite sandbox we can test against
3. Saved Search returning: internalId, companyName, entityStatus, lastModifiedDate

We're at {current phase} and need this by {date} to stay on track for go-live {date}.

Anything I can help unblock from your side?

Thanks
```

## Individual Chase — Anil (Salesforce)

```
Hi Anil,

For the MuleSoft integration I need the SF side confirmed:

1. API name of the On Stop field on Account (e.g. On_Stop__c?)
2. Whether a NetSuite_Internal_ID__c custom field exists on Account — if not it needs creating as External ID, Text(18)
3. Quick review of the integration playbook for any SF-side concerns

Playbook is in {location}. Happy to walk through on a 15-min call if easier.

Thanks
```

## Individual Chase — Julie (Business)

```
Hi Julie,

One input needed from the business side for the On Stop integration:

Which exact NetSuite entitystatus values should trigger the On Stop banner in Salesforce?

E.g. "CUSTOMER-ACCOUNT ON STOP", "CUSTOMER-SUSPENDED", etc.

I need the exact string values as they appear in NetSuite — Ben can help confirm the spelling.

Thanks
```

## Phase Gate Pass — Internal Note

```
## Phase {N} Gate Check — {DATE}

Status: {PASS / FAIL / CONDITIONAL PASS}

Criteria met:
- [x] {criterion 1}
- [x] {criterion 2}

Criteria missed (if FAIL):
- [ ] {criterion} — {why missing, who owes, ETA}

Decision: {Proceed to next phase / Hold / Proceed with conditions}

Conditions (if conditional pass):
{list}

Next phase kickoff: {date}
```

## Go-Live Announcement

```
Subject: MuleSoft Phase 1 — Account Suspension Integration LIVE

Hi all,

Phase 1 of the MuleSoft integration programme is now live in production.

**What changed:**
- NetSuite entitystatus changes on a customer account now automatically update the On Stop flag in Salesforce
- The Salesforce banner will appear/clear within 15 minutes of the NS change
- No manual sync required

**What this means for you:**
- Sales team: you'll see accurate On Stop status without needing to check NetSuite
- Finance team: any entitystatus change you make in NS flows through automatically
- Support team: no more mismatch between systems

**Monitoring:**
I have alerts configured for failures. If you notice anything behaving unexpectedly, let me know immediately.

**What's next:**
- Phase 1.5: Liquidations sync (pending Ryan's data source confirmation)
- Phase 2: Broader enterprise integration architecture (per the 6-phase strategy)

Thanks to Ben, Anil, Julie, Dave, and the MuleSoft team for getting us here.

Adam
```
