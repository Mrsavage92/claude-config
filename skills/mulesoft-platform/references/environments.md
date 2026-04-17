# Environment Promotion

## BDR Environment Structure

| Environment | Purpose | Data | Access |
|---|---|---|---|
| **Design** | Individual dev work, local testing | Test/dummy data | Dev team only |
| **Sandbox** | UAT, integration testing | Sanitised prod-like data | Dev + UAT stakeholders |
| **Production** | Live workloads | Real data | Platform admin + ops |

Promotion path: **Design → Sandbox → Production**. Strictly sequential. No shortcuts.

## Why This Matters

Each environment has:
- Different credentials (Secrets Manager separately configured)
- Different data (never share real customer data with dev)
- Different SLAs (prod needs monitoring, dev doesn't)
- Different change controls (prod changes need approval)

Skipping Sandbox → prod surprises that only surface at scale.

## Environment Switching at Deploy

### Via Maven property

```bash
mvn clean deploy -DmuleDeploy -Denv=sandbox
mvn clean deploy -DmuleDeploy -Denv=production
```

The `env` property switches which `config-${env}.yaml` is loaded.

### Via CloudHub UI property

Runtime Manager → app → **Settings** → **Properties** → add:
- Key: `env`
- Value: `sandbox` (or `production`)

Restart app for change to apply.

## Configuration Property Files per Environment

```
src/main/resources/
├── config-design.yaml       # Design env creds + config
├── config-sandbox.yaml      # Sandbox creds (or Secrets Manager refs)
└── config-production.yaml   # Production refs to Secrets Manager
```

All reference the same keys (e.g. `salesforce.consumer_key`), but values differ.

## Secrets Manager per Environment

Each environment has its own Secret Groups. A `BDR-Integrations` group in Design is separate from `BDR-Integrations` in Sandbox.

Secret values differ — test creds in Design, real creds in Production.

## Promotion Checklist

Before promoting Sandbox → Production:

- [ ] UAT test cases passed in Sandbox
- [ ] Sign-off received in writing from Ben, Anil, Julie
- [ ] No critical defects outstanding
- [ ] Production Secrets Manager populated with prod creds
- [ ] Production SF uses JWT Bearer (not Username-Password)
- [ ] Production NS creds generated (separate from sandbox)
- [ ] SF production Integration User exists and has required permissions
- [ ] Runtime Manager alerts configured for production
- [ ] Git tag created for rollback
- [ ] Stakeholders notified of deploy window

## Before Promoting Design → Sandbox

- [ ] All dev test cases pass
- [ ] Error handling tested (deliberately broken credential, retry, etc.)
- [ ] No hardcoded values in flow XML
- [ ] pom.xml has correct runtime version
- [ ] Sandbox NS credentials stored in Secrets Manager (Sandbox env)
- [ ] Sandbox SF credentials stored in Secrets Manager (Sandbox env)

## Anypoint App Naming Convention

Include environment in app name to avoid confusion:

- `bdr-integrations-design`
- `bdr-integrations-sandbox`
- `bdr-integrations-production`

Or use environment suffix via CI/CD template.

## Region Consistency

All BDR environments deploy to **EU1** (`eu1.anypoint.mulesoft.com`, `eu-west-1` region).

Never deploy sandbox to US and prod to EU — data residency rules + latency.

## Version Tagging

Tag git on every prod deploy:

```bash
git tag v1.0.0 -m "Phase 1A: NS→SF On Stop sync"
git push origin v1.0.0
```

Convention: `vMAJOR.MINOR.PATCH`
- MAJOR: new integration or major rewrite
- MINOR: new flow or significant feature
- PATCH: bug fix, config change

## Rollback Across Environments

If a prod deploy breaks:

1. Runtime Manager → prod app → **History** → find last working version
2. Click **Redeploy**
3. Investigate offline in Design env
4. Fix → promote back through Sandbox → Production

Never "quick fix in prod" — every prod change passes through the pipeline.

## Environment-Specific Feature Flags

Sometimes a flow should behave differently per env (e.g. send to real external API in prod, mock in dev).

### Via property

```yaml
# config-design.yaml
features:
  use_mock_external_api: true

# config-production.yaml
features:
  use_mock_external_api: false
```

```xml
<choice>
  <when expression="#[p('features.use_mock_external_api') == true]">
    <flow-ref name="mock-api" />
  </when>
  <otherwise>
    <flow-ref name="real-api" />
  </otherwise>
</choice>
```

Keep feature flags minimal — delete them once the flow is stable in prod.

## Data Seeding in Sandbox

Sandbox should have representative data for UAT. Options:

1. **Refresh from prod** — NS sandbox refresh (Ben's responsibility). Strips PII by masking.
2. **Synthetic data** — create test accounts manually in each system
3. **Export / import** — sanitise prod data, load into sandbox

For BDR: Ben to confirm if NS sandbox is refreshed from prod, and what PII masking is applied.
