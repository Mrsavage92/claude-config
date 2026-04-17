---
name: mulesoft-platform
description: "Anypoint Platform operations expert. Covers Runtime Manager (deploying, monitoring, alerts), Secrets Manager, Exchange (assets, templates), environment promotion (Design → Sandbox → Production), Access Management (roles, permissions), vCore allocation, Object Store, Runtime Fabric, and CI/CD via Maven. Use for any platform admin task, deployment, monitoring setup, or governance configuration."
---

# Skill: Anypoint Platform Operations

## Purpose
Operate Anypoint Platform like a platform admin — deploy apps, manage credentials, configure monitoring, promote across environments, and govern integrations at scale. Everything beyond `mvn deploy` and before "it's running in prod".

## When to Use
- Deploying an app to Design / Sandbox / Production
- Configuring Secrets Manager for credentials
- Setting up Runtime Manager alerts
- Managing user access and environment permissions
- Downloading or publishing Exchange assets
- Setting up Maven deploy in CI/CD

## When NOT to Use
- Writing connector configs — use `/mulesoft-connector`
- Building flows — use `/mulesoft-flow`
- DataWeave transforms — use `/mulesoft-dataweave`
- BDR project tracking — use `/mulesoft-bdr`

## The Platform Stack

```
Anypoint Platform (eu1.anypoint.mulesoft.com)
├── Access Management      ← Users, Teams, Business Groups, Environment permissions
├── Runtime Manager        ← Deploy, monitor, alert, vCore allocation
├── Secrets Manager        ← Credential storage per environment
├── Exchange               ← Assets, templates, connectors, APIs
├── API Manager            ← API gateway, policies, analytics
├── Design Center          ← API design (RAML, OAS)
├── Monitoring             ← Dashboards, logs, metrics
└── Object Store           ← Shared key-value store for watermarks
```

## Non-Negotiable Rules

1. **Production credentials live ONLY in Secrets Manager.** Never in source code, property files, or deploy commands.
2. **Environment promotion is Design → Sandbox → Production.** No shortcuts. Every app passes through all three.
3. **Every production app has Runtime Manager alerts configured** — app stopped, error rate, flow unresponsive.
4. **Never deploy straight to production without UAT sign-off** in Sandbox.
5. **Production deploys happen during low-traffic windows** unless absolutely critical.
6. **Every deploy produces a tagged Git commit** for rollback.

## Modes

| Mode | When | Reference |
|---|---|---|
| Deploy app | New deploy or update existing | `references/deployment.md` |
| Configure Secrets | Before first deploy to each env | `references/secrets-manager.md` |
| Set up monitoring | After production deploy | `references/monitoring.md` |
| Manage access | Grant/revoke roles, add users | `references/access-management.md` |
| Environment promotion | Design → Sandbox → Prod | `references/environments.md` |
| Maven / CI/CD | Automated deploys | `references/maven-cicd.md` |

## Core Concepts

| Term | Meaning |
|---|---|
| **Organization** | Top-level account (BDR Group) |
| **Business Group** | Sub-org for multi-tenant setups |
| **Environment** | Design / Sandbox / Production (BDR has 3) |
| **Worker** | Unit of CloudHub runtime (0.1, 0.2, 1, 2 vCores) |
| **vCore** | Virtual CPU allocation for a worker |
| **Runtime** | Mule Runtime version (4.11.x) |
| **App** | Deployed integration project |
| **Asset** | Exchange item — connector, template, API, custom |
| **Secret Group** | Collection of secrets in Secrets Manager |

## BDR Environment Model

Confirmed from Access Management screenshot:

| Environment | Purpose | CloudHub Admin | vCores Allocated |
|---|---|---|---|
| Design | Dev, individual work | Adam (granted) | TBC |
| Sandbox | UAT, pre-prod testing | Adam (granted) | TBC |
| Production | Live workloads | Adam (granted) | TBC |

vCore allocation — check Runtime Manager → Usage. BDR has Premier plan, specific allocation to be confirmed.

## Proactive Triggers

- App deployed to production without Runtime Manager alerts configured → flag immediately
- Credentials in plaintext `config-production.yaml` → flag as security risk
- CloudHub deploy using `--skipTests=true` → flag as quality gap
- App running on 0.1 vCore in production → flag as undersized
- Multiple apps sharing the same Secret Group → flag as blast radius risk
- Production deploy without corresponding git tag → flag for rollback difficulty

## Templates

| Template | Purpose |
|---|---|
| `templates/maven-settings.xml` | Maven settings with Anypoint repository auth |
| `templates/cloudhub-deploy.yaml` | CloudHub deploy config |
| `templates/alerts-config.md` | Recommended Runtime Manager alerts |
| `templates/github-actions-deploy.yml` | GitHub Actions workflow for CI/CD |

## Anti-Patterns (do NOT do these)

- Storing production credentials in property files committed to git
- Deploying directly to production without passing through Sandbox UAT
- Sharing one Connected App across all environments (SF)
- Using "Share everything with everyone" in Access Management
- Skipping Test Connection before deploy
- Deploying without a rollback plan (git tag, previous worker version)
- Running production on 0.1 vCore "to save money" — it'll OOM under load

## Related Skills
- Use `/mulesoft-connector` for Secrets Manager secrets setup
- Use `/mulesoft-flow` for the app being deployed
- Use `/mulesoft-dataweave` for transforms inside the app
- Use `/mulesoft-bdr` for BDR-specific deploy coordination
