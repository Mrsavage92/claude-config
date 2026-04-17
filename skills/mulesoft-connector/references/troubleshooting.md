# Connection Troubleshooting Playbook

## Diagnostic Flow

When a connection test fails, work through in this order:

1. **Is the credential correct?** — copy-paste from source, look for trailing whitespace
2. **Is the auth URL / endpoint correct?** — prod vs sandbox URLs differ
3. **Are the permissions granted?** — API access, role permissions, OAuth scopes
4. **Is the network reachable?** — firewall, VPN, IP allowlist
5. **Is the connector version current?** — schema breaking changes happen

## Salesforce Specific

### Error: INVALID_LOGIN

**Causes:**
- Password incorrect
- Security token stale (changes when password changes)
- User locked out after too many failed attempts
- IP restrictions on profile blocking integration

**Diagnosis:**
1. Log in to SF UI with same credentials — does it work?
2. Check Setup → Security → Login History for the integration user
3. Check Profile IP Ranges — if restricted, add MuleSoft CloudHub IPs

### Error: INVALID_OAUTH_CLIENT

**Causes:**
- Consumer Key wrong
- Connected App disabled or deleted
- Connected App not yet "active" (takes 2-10 min after creation)

**Diagnosis:**
1. Setup → App Manager → find the Connected App → View
2. Click Manage Consumer Details — copy Consumer Key fresh
3. Check OAuth Policies — Permitted Users should be "All users may self-authorize" for Username-Password, or "Admin approved users are pre-authorized" for JWT

### Error: API_DISABLED_FOR_ORG

**Causes:**
- Profile has no API access
- Org itself has no API enabled (rare — usually Essentials edition)

**Fix:**
- Change profile to System Administrator or custom profile with "API Enabled" permission

### Error: INVALID_FIELD or "No such column"

**Causes:**
- Field API name wrong (case matters on some, not others)
- Field exists in sandbox but not prod (deploy incomplete)
- Field deleted

**Diagnosis:**
- Setup → Object Manager → {Object} → Fields — check exact API name
- Use SF Inspector browser extension to verify field presence

## NetSuite Specific

### Error: INVALID_CREDENTIAL

**Causes:**
- Any of 5 TBA creds wrong
- Account ID missing sandbox suffix
- Signature algorithm mismatch (must be HMAC_SHA256 for current NS)

**Diagnosis:**
1. Verify each of 5 values character-by-character (common: trailing whitespace on copy-paste)
2. Account ID: check Setup → Company → Company Information
3. If sandbox, account ID ends in `_SB1` (or `_SB2` etc.)

### Error: INSUFFICIENT_PERMISSION

**Causes:**
- Role missing "Log in using Access Tokens" permission
- Role missing "Web Services" permission
- Role missing record-type permissions (e.g. Customer)

**Fix:**
- Setup → Users/Roles → Manage Roles → edit integration role → Permissions tab
- Required: Setup subtab → "Log in using Access Tokens" = Full
- Required: Setup subtab → "Web Services" = Full
- Required: Lists subtab → relevant record types (Customer, etc.)

### Error: SSS_AUTH_FAILURE

**Causes:**
- Wrong account ID
- Wrong data center (rare — auto-detected in recent connector versions)
- Signature algorithm downgrade attempt

**Fix:**
- Verify account ID including suffix
- Update connector to latest version
- Ensure `signatureAlgorithm="HMAC_SHA256"` in config

## HTTP/REST Specific

### Error: SSL handshake failed

**Causes:**
- Server cert not in Mule truststore
- Self-signed cert on target server
- Cert chain incomplete

**Diagnosis:**
```bash
openssl s_client -connect api.example.com:443 -showcerts
```

**Fix:**
- Extract cert from output
- Import into Mule truststore: `keytool -importcert -alias server -keystore truststore.jks -file server.crt`
- Reference truststore in connector config

### Error: Connection refused

**Causes:**
- Wrong host or port
- Service down
- Firewall blocking outbound

**Diagnosis:**
```bash
curl -v https://api.example.com/health
telnet api.example.com 443
```

### Error: 403 Forbidden on OAuth call

**Causes:**
- Token expired (most common)
- Scope mismatch — token has different scope than endpoint requires
- IP not allowlisted on partner API

## Generic Mule Issues

### Error: Schema not found

**Cause:** XML namespace declared but schema not available.

**Fix:** Check xsi:schemaLocation in top of XML — should include the connector's xsd.

### Error: "No suitable connector found"

**Cause:** Dependency missing from pom.xml or not yet downloaded.

**Fix:**
- Verify `pom.xml` has the dependency
- Run `mvn clean install` to re-download
- Right-click project → Maven → Update Project (in Studio)

### Error: Property not resolved (`${some.key}`)

**Causes:**
- Property file not loaded (check `<configuration-properties>` element exists)
- Property name typo
- Wrong environment file loaded

**Diagnosis:**
- Check `global-config.xml` has `<configuration-properties file="config-${env}.yaml" />`
- Check `${env}` system property is set at deploy time (default: `dev`)
- Check the exact key path in YAML matches XML reference

## Environment-Specific Testing

Switch environment at deploy time:

```
mvn clean package -DmuleDeploy -Denv=sandbox
```

Or via CloudHub deploy UI → Environment Properties tab → add `env=sandbox`.

## When All Else Fails

1. **Upgrade connector** — `pom.xml` → bump version → refresh dependencies
2. **Check Anypoint status page** — https://status.mulesoft.com
3. **Contact MuleSoft Support** via AgentForce (case 471920541 for BDR Premier plan)
4. **Expert Coaching session** — free 1:1 with MuleSoft architect under Premier plan
