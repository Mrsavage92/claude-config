# NetSuite Connector Reference

**Current stable version:** 11.10.1+

## Maven Dependency

```xml
<dependency>
    <groupId>com.mulesoft.connectors</groupId>
    <artifactId>mule-netsuite-connector</artifactId>
    <version>11.10.1</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

## Authentication: Token-Based Authentication (TBA)

TBA is the required pattern for server-to-server integrations. Username/password is deprecated.

### Prerequisites in NetSuite

1. **Enable TBA Feature:** Setup → Company → Enable Features → SuiteCloud tab → check "Token-Based Authentication"
2. **Create Integration Record:** Setup → Integrations → Manage Integrations → New
   - Name: "MuleSoft Integration"
   - State: Enabled
   - Check "Token-Based Authentication"
   - Save — **Consumer Key and Consumer Secret shown ONCE, copy immediately**
3. **Create Role:** Setup → Users/Roles → Manage Roles → New (or use existing integration role)
   - Permissions required:
     - Transactions: Core Customer, Invoice (read at minimum for BDR)
     - Lists: Customer (full), Employee (read if needed)
     - Setup: "Log in using Access Tokens" (critical)
     - Setup: "Web Services"
     - Reports: "SuiteAnalytics Workbook" (if using SuiteQL)
4. **Assign Role to User:** Setup → Users → edit user → add the integration role
5. **Generate Access Tokens:** Setup → Users/Roles → Access Tokens → New
   - Application: select the Integration Record
   - User: the user with the integration role
   - Role: the integration role
   - Save — **Token ID and Token Secret shown ONCE, copy immediately**

### Five Credentials Needed

| Credential | Source | Notes |
|---|---|---|
| Account ID | Setup → Company → Company Information → Account ID | Add `_SB1` suffix if sandbox (e.g. `12345_SB1`) |
| Consumer Key | From Integration Record creation | Shown once, cannot recover |
| Consumer Secret | From Integration Record creation | Shown once, cannot recover |
| Token ID | From Access Token creation | Shown once, cannot recover |
| Token Secret | From Access Token creation | Shown once, cannot recover |

**If any of these are lost, you must regenerate** — NS does not display them again.

## XML Configuration

```xml
<netsuite:config name="NetSuite_Config">
  <netsuite:token-authentication-connection
    accountId="${netsuite.account_id}"
    consumerKey="${netsuite.consumer_key}"
    consumerSecret="${netsuite.consumer_secret}"
    tokenId="${netsuite.token_id}"
    tokenSecret="${netsuite.token_secret}"
    signatureAlgorithm="HMAC_SHA256" />
</netsuite:config>
```

## WSDL Version

The connector defaults to a specific NetSuite API version. For newer fields or features, set explicitly:

```xml
<netsuite:token-authentication-connection
  ...
  endpoint="2020_2" />
```

Use V2020_2 or later. Older versions lack fields like `lastModifiedDate` on some objects.

## Property File Keys

```yaml
netsuite:
  account_id: ""          # e.g. "1234567" or "1234567_SB1" for sandbox
  consumer_key: ""
  consumer_secret: ""
  token_id: ""
  token_secret: ""
```

## Common Operations

| Operation | Use Case |
|---|---|
| `search` | Advanced search with filters — returns Customer, Invoice, etc. |
| `saved-search` | **Run a pre-built Saved Search by ID** (preferred for production) |
| `get` | Retrieve single record by internalId |
| `add` | Create new record |
| `update` | Update existing record |
| `upsert` | Insert/update based on externalId |
| `delete` | Remove record |
| `attach` / `detach` | Link/unlink records |

## Saved Search Pattern (preferred for BDR)

Saved Searches give the NS admin control over what's returned without Mule code changes.

**In NetSuite:**
- Create Saved Search on Customer record type
- Name it: e.g. "MuleSoft_Customer_Status_Sync"
- Filters: `Last Modified Date is after {param}` — use public/parameterised
- Columns: `internalId`, `companyName`, `entityStatus`, `lastModifiedDate`
- Save — note the internal ID of the saved search

**In Mule:**

```xml
<netsuite:saved-search
  config-ref="NetSuite_Config"
  recordType="CUSTOMER"
  savedSearchId="customsearch_mulesoft_customer_status" />
```

## Watermarking Pattern

NetSuite's `lastModifiedDate` supports filtering. Use Object Store to track watermark between polls:

```xml
<os:retrieve key="ns-watermark" objectStore="Object_Store_Config" target="lastWatermark" />

<netsuite:search config-ref="NetSuite_Config">
  <netsuite:search-record>
    <netsuite:customer-search-basic>
      <netsuite:last-modified-date operator="after">
        <netsuite:search-value>#[vars.lastWatermark]</netsuite:search-value>
      </netsuite:last-modified-date>
    </netsuite:customer-search-basic>
  </netsuite:search-record>
</netsuite:search>

<!-- After successful processing: -->
<os:store key="ns-watermark" objectStore="Object_Store_Config" value="#[now()]" />
```

## Sandbox Considerations

- Sandbox account IDs include the `_SB1` suffix (or `_SB2`, etc. for refresh sandboxes)
- Sandbox tokens are SEPARATE from production tokens — must generate each independently
- Sandbox Saved Searches must be re-created if refreshed from prod
- If no sandbox available → must test against production with extreme care (low-risk test accounts only, read-only where possible)

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "INVALID_CREDENTIAL" | Any of the 5 creds wrong | Verify all 5 against NS, regenerate if needed |
| "INSUFFICIENT_PERMISSION" | Role missing "Log in using Access Tokens" | Update role permissions |
| "SSS_AUTH_FAILURE" | Account ID wrong OR sandbox suffix missing | Check Setup → Company → Company Information |
| "USER_ERROR: Unable to find record" | Wrong internal ID or record type | Verify internal ID in NS UI |
| Connection timeout | Wrong endpoint/data center | NetSuite auto-routes by account — ensure connector is latest version |
| "WSDL_VERSION_MISMATCH" | Using older SOAP endpoint | Set `endpoint="2020_2"` or later |

## BDR-Specific Notes

- Ben is responsible for TBA setup and providing the 5 credentials
- Saved Search must be created by Ben (Adam has no NS access)
- Required columns for BDR suspension flow: `internalId`, `companyName`, `entityStatus`, `lastModifiedDate`
- Sandbox status unconfirmed — Ben to verify. If no sandbox, testing plan needs adjustment
- Production will need separate TBA setup against the production NS account (different 5 credentials)
