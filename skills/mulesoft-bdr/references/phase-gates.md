# BDR MuleSoft Phase Gates

Exit criteria that must ALL be true before moving to the next phase. Do not handwave any criterion. Verify by reading actual files, Anypoint state, or direct confirmation.

## Gate: Exit Phase 0A → Enter Phase 0B

- [ ] Salesforce Connected App created (visible in SF Setup → App Manager)
- [ ] Consumer Key + Consumer Secret stored in password manager (NOT in plaintext docs)
- [ ] Integration user created with System Administrator profile (or custom API profile with required permissions)
- [ ] Integration user security token generated and stored
- [ ] Anypoint Platform audit completed — confirmed 0 live integrations, 0 connected apps in use
- [ ] MuleSoft Health Check booked via AgentForce (case 471920541)
- [ ] Implementation playbook shared with Ben, Julie, Anil, Ryan

## Gate: Exit Phase 0B → Enter Phase 0C

- [ ] Ben completed NetSuite TBA setup — 5 credentials received
- [ ] Julie confirmed entitystatus trigger list (exact string values)
- [ ] Ryan confirmed liquidations data source OR formal decision to defer Flow 3
- [ ] Anil confirmed SF On Stop field API name
- [ ] Anil confirmed whether `NetSuite_Internal_ID__c` exists on Account (or will be created)
- [ ] Expert Coaching session booked with Nikith

## Gate: Exit Phase 0C → Enter Gate Check (pre-build)

- [ ] Dave Beach granted CloudHub Admin on Design + Sandbox + Production **[DONE]**
- [ ] Anypoint Studio OR Anypoint Code Builder installed and logged into EU org
- [ ] Project created (`bdr-integrations` or equivalent) with:
  - pom.xml includes `mule-salesforce-connector`
  - pom.xml includes `mule-netsuite-connector`
  - `global-config.xml` in `src/main/mule/` with both connector configs
  - `config-design.yaml`, `config-sandbox.yaml`, `config-production.yaml` in `src/main/resources/`
- [ ] Credentials stored in Anypoint Secrets Manager (Design + Sandbox)
- [ ] Salesforce connection test returned success
- [ ] NetSuite connection test returned success

## Gate: Exit pre-build → Enter Phase 1A Build

- [ ] ALL Phase 0B discovery inputs received and reviewed for completeness
- [ ] Cross-reference fields confirmed in both systems
- [ ] On Stop SF field API name confirmed (written down, verified by reading SF Setup)
- [ ] NetSuite Saved Search created by Ben, tested, returning right data
- [ ] NetSuite sandbox status confirmed (or explicit decision to test against prod with low-risk accounts)
- [ ] Expert Coaching session completed — architecture validated

**If ANY of the above is missing → STOP. Do not start Phase 1A. Delay by days rather than build on assumptions.**

## Gate: Exit Phase 1A Build → Enter Phase 1B Testing

- [ ] Flow 1 `netsuite-to-sf-onstop-sync` deployed to Design environment
- [ ] Flow has error handler with retry (3x exponential backoff)
- [ ] Object Store watermark pattern implemented
- [ ] DataWeave transform handles both setting and clearing On_Stop__c
- [ ] Flow tested with at least 1 test NS account in Design env
- [ ] Logger outputs visible in Runtime Manager
- [ ] (If applicable) Flow 3 liquidations — either built, or formally deferred

## Gate: Exit Phase 1B Testing → Enter Phase 1C Production

- [ ] UAT deployment to Sandbox environment
- [ ] Dev test cases all passing (forward sync, reverse sync, error handling)
- [ ] UAT sign-off from Ben (NS side)
- [ ] UAT sign-off from Anil (SF side)
- [ ] UAT sign-off from Julie (business validation)
- [ ] No unresolved critical defects

**Sign-off must be in writing (Slack/email/Teams screenshot saved).**

## Gate: Exit Phase 1C → Go-Live

- [ ] SF auth upgraded to OAuth JWT Bearer
  - Self-signed cert created in SF
  - Keystore .jks in `src/main/resources`
  - Connected App has digital signature enabled
  - Integration user profile assigned to Connected App
  - JWT connection tested — no password/token in config
- [ ] Production Secrets Manager populated (Ben completed TBA against prod NS)
- [ ] Production SF credentials verified (same Connected App, prod integration user confirmed exists)
- [ ] Deployed to Production via Anypoint Platform
- [ ] Runtime Manager shows Running status for all flows
- [ ] Smoke test passed on at least one low-risk account
- [ ] Alerts configured in Runtime Manager:
  - App Stopped/Failed → Adam
  - Error count > 5 in 10 min → Adam
  - Flow stops responding → Adam
- [ ] Stakeholders notified: Ben, Anil, Julie, Dave, Phase 1 is live

## Post Go-Live Watch (Week 1)

- [ ] Day 1: Manual check of Runtime Manager logs every 2 hours
- [ ] Day 1: Verify at least one actual production status change flowed correctly end-to-end
- [ ] Day 2-7: Daily check of error rates
- [ ] End of Week 1: Retrospective — any issues? Patterns to build into Phase 2?
