# Anypoint Secrets Manager Integration

Secrets Manager holds credentials outside the codebase. Production deployments MUST use it.

## Setup in Anypoint Platform

1. Log into `eu1.anypoint.mulesoft.com`
2. Access Management → Secret Groups (or direct: Secrets Manager)
3. Select environment (Design / Sandbox / Production)
4. Create Secret Group: `BDR-Integrations`
5. Add secrets:
   - `sf-consumer-key`
   - `sf-consumer-secret`
   - `sf-username`
   - `sf-password`
   - `sf-security-token`
   - `ns-account-id`
   - `ns-consumer-key`
   - `ns-consumer-secret`
   - `ns-token-id`
   - `ns-token-secret`

## Reference in Property Files

```yaml
salesforce:
  consumer_key: "${secure::sf-consumer-key}"
  consumer_secret: "${secure::sf-consumer-secret}"
  username: "${secure::sf-username}"
  password: "${secure::sf-password}"
  security_token: "${secure::sf-security-token}"
  authorization_url: "https://login.salesforce.com/services/Soap/u/66.0"

netsuite:
  account_id: "${secure::ns-account-id}"
  consumer_key: "${secure::ns-consumer-key}"
  consumer_secret: "${secure::ns-consumer-secret}"
  token_id: "${secure::ns-token-id}"
  token_secret: "${secure::ns-token-secret}"
```

## Mule Secure Properties Alternative

For keeping encrypted secrets IN the project (less preferred than Secrets Manager):

1. Add dependency:

```xml
<dependency>
    <groupId>com.mulesoft.modules</groupId>
    <artifactId>mule-secure-configuration-property-module</artifactId>
    <version>1.2.6</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

2. Encrypt the value using Anypoint Studio's Secure Properties tool or Mule Encryption Tool
3. Reference in YAML:

```yaml
salesforce:
  password: "![encrypted-base64-value]"
```

4. Config module in `global-config.xml`:

```xml
<secure-properties:config name="Secure_Properties"
  file="config-${env}.yaml"
  key="${encryption.key}">
</secure-properties:config>
```

5. The `encryption.key` is passed at deploy time (system property or CloudHub env var) — NOT stored in repo.

## Environment Promotion Pattern

| Env | Storage Strategy |
|---|---|
| Design (dev) | Plain YAML with test credentials, `.gitignore`'d from main branch |
| Sandbox (UAT) | Anypoint Secrets Manager (Sandbox env group) |
| Production | Anypoint Secrets Manager (Production env group) — different secrets, prod creds only |

## Access Control

- Assign team members to Secret Groups with read/write/admin roles
- Production Secret Group: restrict write access to platform admins only
- Audit trail: Secrets Manager logs access — review via Audit Logs

## Best Practices

1. **Rotate credentials** at least yearly, or immediately when a team member with access leaves
2. **Never output secrets in logs** — sanitize log configs
3. **Use different credentials per environment** — never share creds across Design/Sandbox/Prod
4. **Separate Secret Groups per app** where possible (e.g. `BDR-Integrations`, `BDR-Analytics`) for blast radius containment
5. **Document what's in each Secret Group** in internal wiki — but never the values
