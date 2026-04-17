# Anypoint Secrets Manager

Production-grade credential storage. Replaces plaintext property files.

## Why Use It

- Keeps production credentials out of source code
- Environment-scoped (Design, Sandbox, Production have separate groups)
- Rotation without code changes
- Audit trail on access
- Per-user permissions

## Creating a Secret Group

1. Log into `eu1.anypoint.mulesoft.com`
2. Navigate: **Access Management → Secret Groups** (or direct: Secrets Manager)
3. Select the **environment** tab (Design / Sandbox / Production)
4. Click **Create Secret Group**
5. Name: e.g. `BDR-Integrations`
6. Add secrets (key + value pairs)

## BDR Secret Group Structure

**Group name:** `BDR-Integrations`
**Environments:** Create in each of Design, Sandbox, Production (with different values)

### Salesforce secrets

- `sf-consumer-key` — Connected App Consumer Key
- `sf-consumer-secret` — Connected App Consumer Secret
- `sf-username` — Integration user
- `sf-password` — Integration user password (dev/test only; not used in prod JWT)
- `sf-security-token` — Security token (dev/test only)
- `sf-keystore-password` — JWT keystore password (prod only)
- `sf-integration-username` — JWT principal (prod)

### NetSuite secrets

- `ns-account-id` — NS account (with `_SB1` suffix for sandbox)
- `ns-consumer-key`
- `ns-consumer-secret`
- `ns-token-id`
- `ns-token-secret`

## Referencing Secrets in Mule

### In property YAML

```yaml
salesforce:
  consumer_key: "${secure::sf-consumer-key}"
  consumer_secret: "${secure::sf-consumer-secret}"
  username: "${secure::sf-username}"
```

### In XML directly (less common)

```xml
<salesforce:oauth-user-pass-connection
  consumerKey="${secure::sf-consumer-key}"
  consumerSecret="${secure::sf-consumer-secret}" />
```

## Deploy-Time Integration

When deploying to CloudHub, the runtime auto-resolves `${secure::...}` references by querying Secrets Manager for the current environment. No extra config needed.

## Local Dev Pattern

Local dev doesn't connect to Secrets Manager. Two options:

### Option 1: Plain property file, .gitignore'd

```
# config-design.yaml (gitignored)
salesforce:
  consumer_key: "actual-dev-key"
  consumer_secret: "actual-dev-secret"
```

### Option 2: Mule Secure Configuration Properties

Encrypt values in `config-design.yaml`, decrypt at runtime using a master key.

```xml
<secure-properties:config name="Secure_Properties"
  file="config-${env}.yaml"
  key="${encryption.key}" />
```

Master key passed at deploy time via system property (never committed):

```bash
mvn clean deploy -DmuleDeploy -Dencryption.key=$MASTER_KEY
```

## Rotation Procedure

1. Generate new credential in source system (e.g. regenerate NS TBA token)
2. Update Secrets Manager:
   - Access Management → Secret Groups → `BDR-Integrations` → edit
   - Update the specific secret value
3. Restart the Mule app (Runtime Manager → Restart)
4. Verify functionality
5. Revoke old credential in source system

Zero code changes. Zero redeploy.

## Access Control

Per Secret Group, assign users/teams:

- **Read** — can reference the secret at runtime (deploy apps using it)
- **Write** — can update secret values (credential rotation)
- **Admin** — full control including access delegation

**Recommended pattern for BDR:**

| Group | Who | Permissions |
|---|---|---|
| `BDR-Integrations` (Design) | Adam, dev team | Read + Write |
| `BDR-Integrations` (Sandbox) | Adam + platform admin | Read + Write |
| `BDR-Integrations` (Production) | Platform admin only | Admin. Adam = Read. |

## Audit Trail

**Access Management → Audit Logs** — shows every secret access, with timestamp and user.

Review monthly:
- Unexpected access patterns
- Failed reads (wrong permissions)
- Unauthorized modification attempts

## Best Practices

1. **Separate Secret Groups per app** — if `BDR-Integrations` is compromised, other apps aren't
2. **Different values per environment** — Design test creds ≠ Sandbox creds ≠ Prod creds
3. **Rotate at least yearly** — or immediately when team member with access leaves
4. **Never paste secrets in Slack / email** — use Secrets Manager links
5. **Alert on unusual access** — set up audit log review cadence

## Migration from Property Files

If you have existing credentials in `config-production.yaml`:

1. Copy values to Secrets Manager (Production env, `BDR-Integrations` group)
2. Replace values in YAML with `${secure::key-name}` references
3. Redeploy — runtime resolves from Secrets Manager
4. Verify working
5. **Remove plaintext values from repo history** (git filter-branch or BFG Repo-Cleaner) — secrets leaked via commits can't be undone by just deleting
6. Rotate all secrets that were ever in plaintext

## Troubleshooting

| Issue | Fix |
|---|---|
| "Secure property not found" at runtime | Check Secret Group exists in TARGET environment, not just Design |
| Secret value showing literal `${secure::key}` | Runtime can't reach Secrets Manager — check network/IAM |
| "Access denied" for secret | User/deployed app lacks Read permission |
| Secret value seems cached | Restart app — secrets are loaded at app start |
