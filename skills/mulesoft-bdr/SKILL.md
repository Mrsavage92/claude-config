---
name: mulesoft-bdr
description: "BDR Group MuleSoft integration project tracker. Reads the Implementation Playbook, tracks phase progress (0A→0B→0C→1A→1B→1C), flags blockers by owner (Ben/Anil/Dave/Julie/Ryan/Nikith), maintains credential state, generates stakeholder status updates. Use whenever Adam asks about BDR MuleSoft status, blockers, next steps, or phase gates. NOT for generic MuleSoft work — use /mulesoft or subskills for that."
---

# Skill: BDR MuleSoft Project Tracker

## Hardened Rules (load-bearing)

1. **Anypoint control plane is EU.** Always `eu1.anypoint.mulesoft.com`. Applies to: UI login, Runtime Manager URL, Exchange Maven URL (`https://maven.eu1.anypoint.mulesoft.com/api/v3/maven`), pom `<uri>` in `mule-maven-plugin` `<cloudHub2Deployment>`, CloudHub deploy target (`Cloudhub-EU-West-1`), API Manager / Connected App / Access Management links, OAuth token endpoints. Wrong region = auth errors that don't say "wrong region."
2. **Deploy path = manual JAR upload via Runtime Manager.** ACB rocket stalls silently after the CloudHub 1 vs 2 selector. GitHub Actions CI needs 5 repo secrets that aren't set (`ANYPOINT_CLIENT_ID`, `ANYPOINT_CLIENT_SECRET`, `SF_USERNAME`, `SF_PASSWORD`, `SF_SECURITY_TOKEN`). Until those are populated, deploy by: build JAR with bundled Maven (`C:\Users\Adam\.vscode\extensions\salesforce.mule-dx-dependencies-1.6.1-win32-x64\build\deps\apache-maven-3.9.4\bin\mvn.cmd -B -U clean package -DskipTests -DskipMunitTests` after setting `JAVA_HOME` to the bundled JDK 17), upload via Runtime Manager → Settings → Applications → Choose File. Smoke test `/api/health` after rolling restart.
3. **GitHub account = `a-savage-bdr` ONLY in `.claude-work/` or `C:\Users\Adam\Mulesoft\bdr-integrations`.** Every other context = `Mrsavage92`. Run `gh auth status` before any push. Switch back to `Mrsavage92` immediately after BDR work — accidental pushes to BDR-named repos are a confidentiality breach. Read operations (`gh run view`, `gh pr view`, logs) without confirmation. Write operations (push, merge, close, delete, workflow trigger, secret/settings change) require explicit "do it" in the same turn.

4. **CloudHub 2.0 has NO Promote button in Runtime Manager** — that's CH1 legacy. For CH2 sandbox→prod **app deployment** the path is: download JAR from sandbox app's ⋯ menu (Settings → Application File → Download) → switch env → Runtime Manager → Deploy Application → Choose file → Import file from Exchange OR upload local file → set per-env Properties tab → Deploy. **However API Manager DOES have "Promote API from environment"** — that promotes the API instance + policies + SLAs (NOT the JAR). Don't conflate them: Runtime Manager handles binary; API Manager handles policy layer. Verified 2026-05-15 via [docs.mulesoft.com/cloudhub-2/ch2-update-apps](https://docs.mulesoft.com/cloudhub-2/ch2-update-apps).

5. **CloudHub 2.0 application name has a 48-character limit.** `broadband-availability-process-api-production` (47) fits but anything `≥38 chars + "-production"` is rejected at submit. Use `-prod` instead. The `deploy/deploy-production.json` `applicationName` field can aspirationally say `-production` but the Runtime Manager UI is source of truth — override at deploy.

6. **Last-Mile Security MUST be CHECKED on the Ingress tab for any prod CloudHub 2.0 app whose Mule listener is HTTPS.** Both BDR broadband Mule apps have HTTPS listeners on port 8081 with `keystore.jks`. Without LMS, CloudHub edge sends HTTP to the pod, app's HTTPS listener rejects, you get **502 Bad Gateway**. Sandbox has LMS on for the same reason. Forgot this on the 2026-05-15 ITS API prod deploy → 502 → fix is one tick + Apply Changes (rolling restart, ~1-2 min).

7. **Process API listener path is `/api/v1/*`, NOT `/api/*` like ITS API.** Process API health URL = `/api/v1/health`. ITS API health URL = `/api/health`. Hitting wrong path returns APIKit "No listener for endpoint: /api/health" 404. Same in sandbox + prod. `PROD-CUTOVER-CHECKLIST.md` and `BROADBAND-RUNBOOK.md` both had wrong URL — flagged for correction. Memorise: **ITS → `/api/health`, Process → `/api/v1/health`**.

8. **Client ID Enforcement is OWASP API02 baseline for prod APIs even with one known consumer.** Per OWASP "default-deny" + MuleSoft Compliance category, leaving any prod API without CIE is a security gap, not a feature. Audit MULE-H1 in `docs/DEEP-DIVE-AUDIT-2026-05-13.md` correctly flagged this. Sandbox currently has no policy either (gap from before audit). For prod: EXPERT-PURE = "apply CIE to sandbox first (with new Connected App + SF External Credential update), retest, then prod"; EXPERT-PRAGMATIC = "ship parity (no policy) today, calendar v1.0.3 hardening for both envs in week 1". Don't recommend "ship without it and forget" (negligent path).

9. **BDR Anypoint deep-link IDs (captured 2026-05-15):** Org ID `4d23f27b-2a82-4617-8ac1-56cb3ea622aa`. Production env ID `dfc0161d-daed-4c93-b71d-5b8fe4701ee4`. API Manager URL pattern: `https://eu1.anypoint.mulesoft.com/apimanager/bdr-group/#/organizations/{org-id}/environments/{env-id}/apis`. Runtime Manager: `https://eu1.anypoint.mulesoft.com/cloudhub/`. Exchange: `https://eu1.anypoint.mulesoft.com/exchange/`. Env switcher is in top-right of UI, not in URL path.

10. **Anypoint Secret Groups are for Anypoint Runtime Fabric, NOT CloudHub 2.0 Shared Space.** BDR is on CH2 Shared Space. For CH2 secrets, use Runtime Manager → app → Settings → Properties → tick "Secure" — that IS encrypted-at-rest secure storage, fit for purpose. Don't suggest creating Secret Groups; they aren't consumable from CH2 apps.

11. **Maven IS available locally on Adam's Windows machine** — bundled with the Salesforce Mule DX VS Code extension at `C:\Users\Adam\.vscode\extensions\salesforce.mule-dx-dependencies-1.6.1-win32-x64\build\deps\apache-maven-3.9.4\bin\mvn.cmd`. Set `JAVA_HOME` to the bundled JDK 17 first. So local builds DO work — just not via plain `mvn` on PATH. Don't claim "no local Maven" anymore.

## Purpose
Track the BDR Group MuleSoft integration programme against the Implementation Playbook. Phase 1 scope is NetSuite entitystatus → Salesforce On Stop flag. Future phases expand to liquidations sync, event-driven workflows, and platform-wide integration per the 6-Phase Enterprise strategy.

## When to Use
- Status check — "where am I on BDR MuleSoft?"
- Blocker audit — "what am I waiting on and who owns it?"
- Phase gate check — "can I start building yet?"
- Stakeholder update — "draft a message for Dave/Ben/Julie"
- Discovery input review — "has Ben sent the TBA creds?"

## When NOT to Use
- Building flows, DataWeave, connector configs — use `/mulesoft-flow`, `/mulesoft-dataweave`, `/mulesoft-connector`
- Anypoint Platform admin tasks — use `/mulesoft-platform`
- Generic MuleSoft questions — use `/mulesoft`

## Canonical Sources
Always read these before answering:
1. `C:/Users/Adam/Documents/Claude/BDR/MuleSoft_Implementation_Playbook.docx` — primary truth
2. `C:/Users/Adam/Documents/Claude/BDR/MuleSoft/Phase 1-6 *.txt` — enterprise strategy
3. `~/.claude/projects/.../memory/project_bdr_mulesoft.md` — current state
4. `C:/Users/Adam/MuleSoft/bdr-integrations/` — actual project directory

## Modes

### Mode 1 — Status Check
Report current phase, % complete, active blockers, next 3 actions.
Read `references/playbook-summary.md` for the phase structure.

### Mode 2 — Blocker Audit
Who owes what. Include chase history and escalation path.
Read `references/blockers-matrix.md` for the full dependency grid.

### Mode 3 — Phase Gate Review
Before recommending "start building" or "deploy to prod", check gate criteria.
Read `references/phase-gates.md` for exit criteria per phase.

### Mode 4 — Stakeholder Comms
Generate WhatsApp/email update to team members.
Use `templates/status-report.md` as the base.

## Phase Map (Condensed)

| Phase | Dates | State | Owner |
|---|---|---|---|
| 0A Prep | By 2 Apr 2026 | SF Connected App, integration user, Anypoint audit | Adam |
| 0B Discovery | 3-14 Apr 2026 | TBA creds, entitystatus list, SF field names, liquidations source | Ben, Julie, Anil, Ryan |
| 0C Platform Setup | 14-18 Apr 2026 | CloudHub perms, Studio install, connectors tested | Adam + Dave |
| Gate Check | 18-21 Apr 2026 | All discovery inputs received, data model validated, Expert Coaching done | Adam |
| 1A Build | 21-25 Apr 2026 | Flow 1 (NS→SF On Stop set), Flow 2 (clear), Flow 3 (liquidations, may slip) | Adam |
| 1B Testing | 28 Apr-2 May 2026 | Dev + UAT, sign-off from Ben/Anil/Julie | Adam + owners |
| 1C Production | Week of 5 May 2026 | JWT upgrade, deploy, monitoring, smoke test | Adam |

## Key People Map

| Name | Role | What They Owe | Status Check |
|---|---|---|---|
| Dave Beach | Anypoint Org Owner | CloudHub Admin on all 3 envs | DONE per access management screenshot |
| Ben | NetSuite admin | 5 TBA credentials + Saved Search + sandbox confirmation | CHASED, pending |
| Julie | Business owner | entitystatus trigger list confirmation | CHASED |
| Anil | Salesforce admin | On Stop field API name + SF field review | CHASED |
| Ryan | Liquidations owner | Data source/format/trigger spec | CHASED |
| Nikith | MuleSoft Premier support | Expert Coaching session | Book via case 471920541 |

## Proactive Triggers

- If Adam mentions building flows and 0B discovery inputs aren't all received → flag gate risk
- If Adam mentions deploying to production and JWT auth isn't configured → flag security gap
- If a blocker has been "chased" for >3 business days without resolution → escalate to Dave Beach
- If Adam asks about NetSuite sandbox without it being confirmed → flag as testing risk
- If an action is taken against live production data without UAT sign-off → STOP and log

## Output Artifacts

| Request | Deliverable | Format |
|---|---|---|
| "Where am I on BDR MuleSoft?" | Phase status + blockers + next 3 actions | Markdown summary |
| "What am I chasing?" | Blocker table with owners + chase log | Markdown table |
| "Draft an update for Dave/Ben/team" | Stakeholder message | Copyable text |
| "Can I start building?" | Gate check report (pass/fail criteria) | Markdown checklist |
| "Update project memory" | Updated `project_bdr_mulesoft.md` | Memory file |

## Anti-Patterns (do NOT do these)

- **Assuming phase completion without verification** — always check actual state (files, credentials in config yaml, Anypoint screenshots) before marking done
- **Generic MuleSoft advice** — always ground in the playbook. If the playbook says OAuth Username-Password for dev and JWT for prod, don't recommend something else
- **Ignoring the enterprise strategy** — Phase 1 Account Suspension is scaffolding for the larger programme. Decisions here affect Phase 2-6. Don't optimise locally at the expense of the bigger architecture
- **Hardcoding credentials in docs or memory** — always reference by variable name (`${sf.consumer.key}`), never paste actual values

## Related Skills
- Use `/mulesoft-connector` when setting up the SF/NS connectors during Phase 0C
- Use `/mulesoft-flow` when building the polling flow during Phase 1A
- Use `/mulesoft-dataweave` for the NS→SF field mapping during Phase 1A
- Use `/mulesoft-platform` for Secrets Manager and deploy during Phase 1C
- Use `/mulesoft` for routing when the ask spans multiple subskills
