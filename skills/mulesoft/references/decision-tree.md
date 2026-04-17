# MuleSoft Skill Decision Tree

Use this to route a request to the right subskill.

## Quick Routing

```
Is the request about BDR project status, blockers, or stakeholders?
  YES → /mulesoft-bdr

Is it about configuring a connector or credentials?
  YES → /mulesoft-connector

Is it about building a flow or error handling?
  YES → /mulesoft-flow

Is it about transforming data between systems?
  YES → /mulesoft-dataweave

Is it about deploying, monitoring, or platform admin?
  YES → /mulesoft-platform

Is it multi-step spanning several areas?
  YES → /mulesoft (this orchestrator)

Don't know?
  → /mulesoft — will route you
```

## By Question Pattern

### "How do I...?"

| Question | Skill |
|---|---|
| "...set up the Salesforce connection?" | mulesoft-connector |
| "...poll NetSuite every 15 min?" | mulesoft-flow |
| "...map the entitystatus field?" | mulesoft-dataweave |
| "...deploy to Sandbox?" | mulesoft-platform |
| "...configure alerts in Runtime Manager?" | mulesoft-platform |
| "...chase Ben for the NS creds?" | mulesoft-bdr |

### "Why...?"

| Question | Skill |
|---|---|
| "...is my connection failing?" | mulesoft-connector (troubleshooting) |
| "...is my flow not processing records?" | mulesoft-flow (watermark/trigger) |
| "...is my transform producing null?" | mulesoft-dataweave (null safety) |
| "...is my app stopped in CloudHub?" | mulesoft-platform (monitoring/deploy) |
| "...is Phase 0B still blocked?" | mulesoft-bdr (blockers) |

### "Can I...?"

| Question | Skill |
|---|---|
| "...skip UAT?" | mulesoft-bdr + mulesoft-platform (answer: no) |
| "...hardcode this credential?" | mulesoft-connector (answer: no) |
| "...build this without error handling?" | mulesoft-flow (answer: no) |

## By Phase (BDR)

| Phase | Primary Skill | Secondary |
|---|---|---|
| 0A Preparation | mulesoft-bdr | — |
| 0B Discovery | mulesoft-bdr | — |
| 0C Platform Setup | mulesoft-connector | mulesoft-platform |
| Gate Check | mulesoft-bdr | — |
| 1A Build | mulesoft-flow | mulesoft-dataweave, mulesoft-connector |
| 1B Testing | mulesoft-platform | mulesoft-flow (for debugging) |
| 1C Production | mulesoft-platform | mulesoft-connector (JWT upgrade) |

## By User Intent

### Starting fresh
```
/mulesoft — let orchestrator route
→ Most likely: mulesoft-bdr (check where you are)
→ Then: relevant subskill for current phase work
```

### Debugging
```
Symptom-first:
- App stopped → mulesoft-platform
- Flow not triggering → mulesoft-flow
- Wrong data in target → mulesoft-dataweave
- Connection test fails → mulesoft-connector
- Credential rotation broke it → mulesoft-connector + mulesoft-platform
```

### Planning / architecture
```
- Gate check before build → mulesoft-bdr
- Data model validation → mulesoft-bdr + mulesoft-dataweave (ns-sf-mapping reference)
- Deploy strategy → mulesoft-platform (environments + deployment references)
- Scaling decisions → mulesoft-platform (vCore sizing)
```

## Escalation to External Resources

These subskills cover 80% of MuleSoft work. For the other 20%:

- **Expert Coaching** (free, Premier plan) — complex architecture decisions, unfamiliar patterns
- **AgentForce case 471920541** — official MuleSoft support for BDR
- **MuleSoft Documentation** — https://docs.mulesoft.com
- **Anypoint Exchange** — pre-built templates and connectors

When subskills can't answer, recommend one of these — don't guess.
