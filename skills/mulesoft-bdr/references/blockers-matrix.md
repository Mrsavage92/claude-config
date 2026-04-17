# BDR MuleSoft Blocker Matrix

## Active Blockers (as of 2026-04-17)

### Ben — NetSuite Admin
**Owes:**
1. NetSuite TBA setup completed → 5 credentials
   - account_id (include sandbox suffix `_SB1` if sandbox)
   - consumer_key
   - consumer_secret
   - token_id
   - token_secret
2. Saved Search created returning: internalId, companyName, entityStatus, lastModifiedDate
3. NetSuite sandbox status confirmation (does one exist? If not → Flow 3 and testing strategy change)
4. Confirmation whether SF Account ID already exists as an external reference field in NS

**Guidance:** TBA guide provided. Requires NS role with 'Log in using Access Tokens' and 'Web Services' permissions. WSDL version V2020_2 or later.

**Chase log:** Chased multiple times. Pending.

**Escalation if still blocked by 2026-04-21:** Escalate to BDR systems lead / director. Gate check delay flagged.

---

### Julie — Business Owner
**Owes:**
1. Confirmed list of entitystatus values that trigger On Stop behaviour
   - Likely candidates: "CUSTOMER-ACCOUNT ON STOP", "CUSTOMER-SUSPENDED", "CUSTOMER-DEBT COLLECTION"
   - Needs exact string values as they appear in NS

**Chase log:** Chased.

**Why critical:** The transform's filter list (`vars.onStopTriggerList`) depends on this. Wrong values = banner never triggers OR triggers on wrong accounts.

---

### Anil — Salesforce Admin
**Owes:**
1. On Stop field API name in SF (e.g. `On_Stop__c`, `Account_Status__c` — unknown)
2. On Stop Status text field API name (holds the NS status string, e.g. `On_Stop_Status__c`)
3. Confirmation whether `NetSuite_Internal_ID__c` custom field exists on Account
   - If not → needs creating as External ID, Text(18)
4. Review of playbook for any SF-side concerns

**Chase log:** Chased.

**Why critical:** DataWeave transform writes to these field API names. Wrong name = runtime error OR silent no-op.

---

### Ryan — Liquidations Data Source
**Owes:**
1. Where does liquidation data come from? (API / file / email / FTP / website download)
2. Format? (CSV / Excel / JSON / other)
3. Fields in the source
4. Trigger — scheduled, notified, manual check?

**Chase log:** Ben chasing on Ryan.

**Why critical:** Flow 3 cannot be designed without this. However Flow 3 is NOT a blocker for Phase 1A/B/C (suspension flow). Flow 3 can slip to Phase 1.5.

---

## Resolved Blockers

### Dave Beach — Anypoint Org Owner
**Owed:** CloudHub Admin on Design, Sandbox, Production environments.
**Status:** RESOLVED per Access Management screenshot — all permissions ticked across all 3 environments.

---

## Blocker Prioritisation

**Critical path blockers (affect Phase 1A build start on 21 Apr):**
1. Anil — field API names (DataWeave transform depends on this)
2. Ben — TBA credentials (can't test connector without these)
3. Julie — entitystatus list (can't filter correctly without this)

**Non-critical (can slip to Phase 1.5):**
- Ryan — liquidations (Flow 3 only, not suspension flow)

## Escalation Path

1. Chase directly (WhatsApp, email)
2. Follow up in person if 3+ business days
3. Escalate to line manager / BDR systems lead
4. Flag to Dave Beach (Org Owner) as platform-level blocker
5. Raise in next Software/Systems meeting

## External Blockers

- **MuleSoft Expert Coaching** — book via AgentForce case 471920541. Target: session before 21 Apr. Nikith is the contact.
- **MuleSoft Health Check** — book via AgentForce. Free under Premier Plan.

## Self-Blockers (Adam's own tasks)

- Salesforce integration user account — requested via internal ticket, not yet provisioned. Working around with existing int account or personal account for testing where feasible.
- Salesforce admin access — requested.
