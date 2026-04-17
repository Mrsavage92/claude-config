# BDR MuleSoft Playbook — Condensed Reference

Source: `C:/Users/Adam/Documents/Claude/BDR/MuleSoft_Implementation_Playbook.docx`

## Programme Context

BDR Group is implementing MuleSoft as their enterprise integration platform. Phase 1 is Account Suspension: sync NetSuite entitystatus changes to a Salesforce On Stop flag that triggers a banner for the sales team. This is scaffolding for a 6-phase programme covering the full enterprise integration and AI capability.

**Platform:** eu1.anypoint.mulesoft.com (EU region)
**Environments:** Design → Sandbox → Production (no shortcuts)
**Confirmed greenfield:** 0 live integrations, 0 connected apps in use
**Licence:** Premier Plan (includes free Health Check, Expert Coaching, Trailhead 25% discount)

## Phase 0A Preparation (By 2 Apr)

**Salesforce Connected App** — OAuth Settings enabled, scopes: `api` + `refresh_token offline_access`, Require Secret for Web Server Flow ticked. Consumer Key + Secret stored securely.

**Integration User** — `mulesoft.integration@bdrgroup.co.uk`, System Administrator profile (or custom API profile), security token generated.

**Anypoint Platform Audit** — Confirmed platform is clean start.

**MuleSoft Health Check** — Book via AgentForce case 471920541. Free under Premier Plan. Effectively = Phase 0 platform audit by a MuleSoft architect.

## Phase 0B Discovery (3-14 Apr)

Critical dependencies from team:
- **Ben (NetSuite):** TBA setup → 5 credentials (account_id, consumer_key, consumer_secret, token_id, token_secret). Sandbox confirmation. Create Saved Search returning: internalId, companyName, entityStatus, lastModifiedDate.
- **Julie (Business):** Confirm which entitystatus values trigger On Stop (likely "CUSTOMER-ACCOUNT ON STOP" + variants).
- **Ryan (Liquidations):** Clarify data source — API? File drop? Email? Format?
- **Anil (Salesforce):** Confirm API name for the On Stop field in SF. Confirm if NetSuite Internal ID already exists as a custom field in SF (needs creating if not).

**Checkpoint: 8 April** — review progress against all 4 owners.

## Phase 0C Platform Setup (14-18 Apr)

**Day 1 (15 Apr):**
- Dave grants CloudHub Admin on Design, Sandbox, Production
- Book Expert Coaching session (free, 1:1 with MuleSoft architect)
- Download Anypoint Exchange templates: "Salesforce Account to NetSuite Customer Broadcast" + reverse direction
- Store credentials in Secrets Manager (Design + Sandbox environments, prod later)

**Day 2 (16 Apr):**
- Install Anypoint Studio (or use Anypoint Code Builder in VS Code)
- Create project `bdr-account-suspension` (or `bdr-integrations` for multi-flow)
- Add Salesforce + NetSuite connectors as dependencies
- Test both connections

**Day 3-4 (17-18 Apr):**
- Data Model validation — confirm field API names match both systems
- Cross-reference fields (NS Internal ID in SF, SF Account ID in NS)
- Source of truth rules: Customer/address → SF wins. Financial/entitystatus → NS wins. Internal IDs → each system owns its own.

## Gate Check (18-21 Apr)

Do NOT start building flows until ALL of:
- [ ] All discovery inputs received from Julie, Ryan, Ben, Anil
- [ ] Cross-reference fields confirmed in both systems
- [ ] On Stop SF field API name confirmed
- [ ] NetSuite Saved Search created and returning right data
- [ ] NS sandbox status confirmed (do we have one?)
- [ ] Expert Coaching session completed — architecture validated

If anything missing → delay build. Better to slip than build on assumptions.

## Phase 1A Build (21-25 Apr)

**Flow 1: netsuite-to-sf-onstop-sync**
- Scheduler trigger, 15-min polling
- Object Store Read → watermark (last-run timestamp)
- NetSuite Search against Saved Search (filter: lastModifiedDate > watermark)
- Transform: for each customer, set `On_Stop__c = entityStatus in triggerList`
- Salesforce Upsert (external ID = NetSuite_Internal_ID__c)
- Object Store Write → new watermark
- Logger + error handler with retry (3 retries, exponential backoff)

**First-run watermark problem:** Set initial watermark to "now" to skip historical records. Backfill separately if needed.

**Flow 2: Combined into Flow 1** — the transform evaluates status every poll, setting On_Stop__c true OR false. One flow, not two.

**Flow 3: Liquidations** — BLOCKED on Ryan's data source confirmation. Will likely use SFTP listener or scheduled API poll. Parallel upsert to NS + SF.

## Phase 1B Testing (28 Apr-2 May)

**Dev Testing (Design env):**
- Deploy flow
- Create test NS account with entitystatus = on-stop value → wait 15 min → verify SF flag
- Clear NS status → wait → verify SF flag cleared
- Break credential deliberately → verify error logged in Runtime Manager

**UAT (Sandbox env):**
- Re-deploy to Sandbox
- Test cases run by Ben (NS side), Anil (SF side), Julie (business validation)
- Written sign-off from all 3

## Phase 1C Production (Week of 5 May)

**Auth Upgrade:**
- Dev/Test used OAuth Username-Password (easier for initial testing)
- Prod uses OAuth JWT Bearer (no passwords stored)
- Steps: Create self-signed cert in SF → export to keystore → update Connected App with digital signature → update Connector config to JWT

**Deploy Sequence:**
1. Production Secrets Manager has prod credentials (Ben repeats TBA setup against prod NS account)
2. Deploy to Production
3. Verify Running in Runtime Manager
4. Smoke test on low-risk account

**Monitoring (Runtime Manager alerts):**
- App Stopped/Failed → notify Adam
- Error count > 5 in 10 min → notify Adam
- Flow stops responding → notify Adam

## Key Data Model Rules

**Source of truth:**
- Customer name, address, contact details → **Salesforce wins**
- Financial status, credit terms, entitystatus → **NetSuite wins**
- Internal IDs → each system owns its own, never overwrite

**Cross-reference fields:**
- `NetSuite_Internal_ID__c` in SF (custom field, external ID)
- Some SF Account ID reference in NS (field name TBC, Ben to confirm)

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| NS has no sandbox | Testing against live data | Ben to confirm; if no sandbox, use prod with low-risk test accounts only |
| Field API names wrong | Silent data corruption | Data Model Validation gate, Anil sign-off |
| First-run backfill | Mass updates at go-live | Set initial watermark to "now"; do controlled backfill separately |
| OAuth Username-Password in prod | Security/compliance | Mandatory JWT upgrade before prod deploy |
| Ryan's liquidations source unknown | Flow 3 blocked | Flow 3 can slip to Phase 1.5 — not a blocker for 1A/1B/1C |
