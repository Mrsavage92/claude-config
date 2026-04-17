---
name: mulesoft-connector
description: "MuleSoft connector configuration expert for Salesforce, NetSuite, HTTP, Database, JMS, FTP/SFTP, and File connectors. Covers authentication patterns (OAuth Username-Password, OAuth JWT Bearer, OAuth Client Credentials, TBA, Basic Auth), global config structure, property-file integration, environment promotion, and Secrets Manager references. Use when setting up a new connection, debugging a connection test failure, or upgrading auth from dev to production."
---

# Skill: MuleSoft Connector Configuration

## Purpose
Configure any MuleSoft connector (SF, NS, HTTP, DB, JMS, FTP, File) with production-grade patterns. Every configuration follows three rules: credentials in property files (or Secrets Manager), global config element referenced by flows, environment-specific property file switched at deploy time.

## When to Use
- Adding a new connector to a project
- Setting up OAuth/TBA/Basic Auth connection
- Debugging a connection test failure
- Upgrading dev auth (Username-Password) to prod auth (JWT Bearer)
- Wiring Secrets Manager into the project

## When NOT to Use
- Building the flow that USES the connector — use `/mulesoft-flow`
- Transforming data in/out of the connector — use `/mulesoft-dataweave`
- Deploying the app to an environment — use `/mulesoft-platform`
- BDR-specific project tracking — use `/mulesoft-bdr`

## Non-Negotiable Rules

1. **Never hardcode credentials in XML.** Always use `${property.name}` placeholders.
2. **Never commit `config-sandbox.yaml` or `config-production.yaml` with real values.** Add to `.gitignore` or use Secure Properties encryption.
3. **Global config goes in `global-config.xml`**, not in the flow file. Flows reference configs by name.
4. **Every environment has its own property file:** `config-design.yaml`, `config-sandbox.yaml`, `config-production.yaml`.
5. **Production credentials live in Anypoint Secrets Manager**, not property files. Property file references them as `${secure::key-name}`.
6. **Test Connection before deploying.** If the connection fails in Code Builder, it WILL fail on CloudHub.

## Supported Connectors

| Connector | Primary Auth Pattern | Reference |
|---|---|---|
| Salesforce | OAuth Username-Password (dev) → OAuth JWT Bearer (prod) | `references/salesforce-connector.md` |
| NetSuite | Token-Based Authentication (TBA) | `references/netsuite-connector.md` |
| HTTP Listener / Requester | Basic Auth, OAuth 2.0, mTLS | `references/http-connector.md` |
| Database (JDBC) | Username/Password, Vault | `references/database-connector.md` |
| JMS / AMQP | Broker-specific, SASL | `references/messaging-connector.md` |
| FTP / SFTP | Username/Password, SSH key | `references/file-connectors.md` |

## Modes

### Mode 1 — Add a New Connector
1. Add dependency to `pom.xml`
2. Read the relevant `references/{connector}.md` for auth patterns
3. Add config block to `global-config.xml`
4. Add placeholder keys to all 3 `config-*.yaml` files
5. Test Connection in Anypoint Code Builder
6. Commit the config change separately from any flow change

### Mode 2 — Upgrade Auth (Dev → Prod)
Mostly applicable to Salesforce (Username-Password → JWT Bearer).
Read `references/salesforce-connector.md` → "JWT Bearer" section.

### Mode 3 — Wire Secrets Manager
For production deploy.
Read `references/secrets-manager-integration.md`.

### Mode 4 — Debug Connection Failure
Read `references/troubleshooting.md`. Top causes: wrong API version, missing OAuth scopes, expired security token, sandbox suffix missing from account ID.

## Project Structure (Standard)

```
bdr-integrations/
├── src/main/mule/
│   ├── global-config.xml         # All connector configs here
│   └── <flow-name>.xml           # Flows reference configs by name
├── src/main/resources/
│   ├── config-design.yaml        # Dev credentials
│   ├── config-sandbox.yaml       # UAT credentials
│   └── config-production.yaml    # References Secrets Manager
├── pom.xml                       # Dependencies listed here
└── .gitignore                    # MUST include config-sandbox/production yaml
```

## Templates

| Template | Purpose |
|---|---|
| `templates/global-config.xml` | Starting `global-config.xml` with properties loader |
| `templates/sfdc-user-pass.xml` | Salesforce OAuth Username-Password (dev only) |
| `templates/sfdc-jwt-bearer.xml` | Salesforce OAuth JWT Bearer (production) |
| `templates/ns-tba.xml` | NetSuite Token-Based Authentication |
| `templates/http-listener.xml` | HTTP Listener for triggered flows |
| `templates/http-requester.xml` | HTTP Requester for outbound API calls |
| `templates/config-design.yaml` | Dev property file |
| `templates/config-production.yaml` | Prod property file with `${secure::}` refs |

## Proactive Triggers

- If you see `password=""` or `consumerKey=""` literal in XML → flag immediately
- If a project has connectors but no `global-config.xml` → flag as anti-pattern
- If `config-sandbox.yaml` is tracked by git and contains real credentials → flag as security risk
- If production deploy uses OAuth Username-Password for Salesforce → flag as compliance risk
- If NetSuite Account ID is missing `_SB1` suffix when using a sandbox → flag as misconfiguration
- If WSDL version in NetSuite config is older than V2020_2 → recommend upgrade

## Anti-Patterns (do NOT do these)

- **Hardcoding credentials in XML** — always use `${prop.name}` placeholders
- **Putting connector configs inside flow files** — global configs go in `global-config.xml`, flows reference them
- **Committing real credentials to git** — use `.gitignore` or Secure Properties encryption
- **Skipping Test Connection** — if it fails in Code Builder, it WILL fail on deploy
- **Mixing environments in one property file** — one file per environment, switched via `${env}` placeholder
- **Using the same credentials for Design + Sandbox + Production** — each env has its own creds

## Related Skills
- Use `/mulesoft-flow` to build the flow that uses this connector
- Use `/mulesoft-dataweave` to transform data going through the connector
- Use `/mulesoft-platform` to deploy and configure Secrets Manager
- Use `/mulesoft-bdr` for BDR-specific credential tracking
