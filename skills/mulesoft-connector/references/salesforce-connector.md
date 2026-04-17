# Salesforce Connector Reference

**Current stable version:** 11.4.0+

## Maven Dependency

```xml
<dependency>
    <groupId>com.mulesoft.connectors</groupId>
    <artifactId>mule-salesforce-connector</artifactId>
    <version>11.4.0</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

## Authentication Patterns

### 1. OAuth Username-Password (Development ONLY)

Simplest for testing. DO NOT use in production.

**Prerequisites in Salesforce:**
- Connected App with OAuth enabled
- Consumer Key, Consumer Secret from Connected App
- Integration user account exists
- Integration user security token generated (Setup → My Personal Info → Reset My Security Token)
- OAuth scopes: `api` + `refresh_token offline_access`
- "Require Secret for Web Server Flow" ticked

**XML config:**

```xml
<salesforce:sfdc-config name="Salesforce_Config">
  <salesforce:oauth-user-pass-connection
    consumerKey="${salesforce.consumer_key}"
    consumerSecret="${salesforce.consumer_secret}"
    username="${salesforce.username}"
    password="${salesforce.password}"
    securityToken="${salesforce.security_token}"
    authorizationUrl="${salesforce.authorization_url}" />
</salesforce:sfdc-config>
```

**Authorization URLs:**
- Production: `https://login.salesforce.com/services/Soap/u/66.0`
- Sandbox: `https://test.salesforce.com/services/Soap/u/66.0`

### 2. OAuth JWT Bearer (Production)

Recommended for production. No passwords stored.

**Prerequisites in Salesforce:**
1. Setup → Certificate and Key Management → Create Self-Signed Certificate
2. Name: `mulesoft_jwt_cert` → Save → Download Certificate (.crt)
3. Export to Keystore (.jks) with a password
4. Connected App:
   - Enable Digital Signature
   - Upload the certificate
   - Set Permitted Users → "Admin approved users are pre-authorized"
   - Assign integration user profile to the Connected App
5. Copy `.jks` file to `src/main/resources/`

**XML config:**

```xml
<salesforce:sfdc-config name="Salesforce_Config_Prod">
  <salesforce:oauth-jwt-connection
    consumerKey="${salesforce.consumer_key}"
    keyStore="${salesforce.keystore_file}"
    storePassword="${salesforce.keystore_password}"
    principal="${salesforce.integration_username}"
    audienceUrl="${salesforce.audience_url}" />
</salesforce:sfdc-config>
```

**Audience URLs:**
- Production: `https://login.salesforce.com`
- Sandbox: `https://test.salesforce.com`

### 3. OAuth Client Credentials (Server-to-Server, newer)

Preferred over Username-Password for non-interactive flows that don't need user context.

**Prerequisites:**
- Connected App with "Enable Client Credentials Flow" ticked
- Run As user selected in Connected App
- SF org has Client Credentials flow enabled

**XML config:**

```xml
<salesforce:sfdc-config name="Salesforce_Config_CC">
  <salesforce:oauth-client-credentials-connection>
    <salesforce:oauth-client-credentials
      clientId="${salesforce.client_id}"
      clientSecret="${salesforce.client_secret}"
      tokenUrl="${salesforce.token_url}" />
  </salesforce:oauth-client-credentials-connection>
</salesforce:sfdc-config>
```

**Token URLs:**
- Production: `https://login.salesforce.com/services/oauth2/token`
- Sandbox: `https://test.salesforce.com/services/oauth2/token`

### 4. Basic Authentication

Deprecated. Supported only on older API versions (< v64). Do not use for new work.

## Property File Keys

```yaml
salesforce:
  # OAuth Username-Password (dev)
  consumer_key: ""
  consumer_secret: ""
  username: ""
  password: ""
  security_token: ""
  authorization_url: "https://test.salesforce.com/services/Soap/u/66.0"

  # OAuth JWT Bearer (prod)
  keystore_file: "mulesoft_jwt_cert.jks"
  keystore_password: "${secure::sf-keystore-password}"
  integration_username: "mulesoft.integration@bdrgroup.co.uk"
  audience_url: "https://login.salesforce.com"

  # OAuth Client Credentials
  client_id: ""
  client_secret: ""
  token_url: "https://test.salesforce.com/services/oauth2/token"
```

## Common Operations

| Operation | Use Case |
|---|---|
| `query` | SOQL query, returns up to 2000 records |
| `query-all` | Includes deleted/archived records |
| `create` | Insert new records |
| `update` | Update existing records by ID |
| `upsert` | Insert or update based on External ID |
| `delete` | Soft delete (recoverable) |
| `on-modified-object` | Streaming trigger — fires on record change |
| `replay-topic-listener` | Platform Events subscription |
| `bulk-create` / `bulk-update` | Bulk API v2 for high-volume loads |

## Upsert Pattern (used in BDR integration)

```xml
<salesforce:upsert
  config-ref="Salesforce_Config"
  objectType="Account"
  externalIdFieldName="NetSuite_Internal_ID__c">
  <salesforce:records>#[payload]</salesforce:records>
</salesforce:upsert>
```

The `externalIdFieldName` must match an External ID custom field that exists on the object. For BDR: `NetSuite_Internal_ID__c` on Account.

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "INVALID_LOGIN: Invalid username, password, security token; or user locked out" | Security token stale or password changed | Reset security token, update property file |
| "INVALID_OAUTH_CLIENT" | Consumer Key wrong or Connected App disabled | Re-copy Consumer Key, check Connected App status |
| "API_DISABLED_FOR_ORG" | Profile has no API access | Use System Administrator profile or add "API Enabled" to custom profile |
| "INVALID_FIELD: No such column" | Field API name wrong | Check API name in SF Setup → Object Manager → Fields |
| "Certificate expired" | JWT cert has expired | Regenerate cert in SF, update keystore |

## BDR-Specific Notes

- Integration user `mulesoft.integration@bdrgroup.co.uk` requested but not yet provisioned
- For initial testing: can use existing integration account OR Adam's personal account if API access granted
- Production will use JWT Bearer — plan cert generation into Phase 1C
- On_Stop__c and NetSuite_Internal_ID__c field names are placeholders — confirm with Anil before flow build
