# NetSuite ↔ Salesforce Field Mapping (BDR)

## Source of Truth Rules

| Data Type | Winner | Reasoning |
|---|---|---|
| Customer name, address, contact details | Salesforce | Sales team maintains |
| Financial status, credit terms, entitystatus | NetSuite | Finance team maintains |
| Internal IDs | Each system owns its own | Never overwrite |

## Cross-Reference Fields

| Purpose | SF Field | NS Field |
|---|---|---|
| NS→SF linkage | `NetSuite_Internal_ID__c` (Text(18), External ID) | `internalId` (system) |
| SF→NS linkage | `Id` (system) | TBC — Ben to confirm if exists |

## BDR Phase 1A: NS Customer → SF Account Mapping

```dwl
%dw 2.0
output application/json

var onStopTriggers = ["CUSTOMER-ACCOUNT ON STOP", "CUSTOMER-SUSPENDED", "CUSTOMER-DEBT COLLECTION"]
// NOTE: Exact string values to be confirmed by Julie

fun isOnStop(status) = status in onStopTriggers
---
payload map (customer) -> {
  NetSuite_Internal_ID__c: customer.internalId,
  On_Stop__c: isOnStop(customer.entityStatus.name default ""),
  On_Stop_Status__c: customer.entityStatus.name default ""

  // NOTE: Field API names to be confirmed by Anil:
  // - On_Stop__c (Boolean, default: On_Stop__c)
  // - On_Stop_Status__c (Text, default: On_Stop_Status__c)
}
```

## Full NS Customer → SF Account Reference

For future expansion beyond On Stop flag:

```dwl
%dw 2.0
output application/json skipNullOn="everywhere"
---
payload map (customer) -> {
  // Cross-reference
  NetSuite_Internal_ID__c: customer.internalId,

  // Identity
  Name: customer.companyName default customer.entityId,

  // Status fields (NS is source of truth)
  On_Stop__c: customer.entityStatus?.name in onStopTriggers,
  On_Stop_Status__c: customer.entityStatus?.name default "",

  // Billing address (only if SF blank — don't overwrite)
  BillingStreet: customer.defaultAddress?.addr1 default null,
  BillingCity: customer.defaultAddress?.city default null,
  BillingState: customer.defaultAddress?.state default null,
  BillingPostalCode: customer.defaultAddress?.zip default null,
  BillingCountry: customer.defaultAddress?.country default null,

  // Financial (NS owns)
  AnnualRevenue: customer.revenue as Number default null,
  CreditLimit__c: customer.creditLimit as Number default null,
  Payment_Terms__c: customer.terms?.name default null,

  // Last sync audit
  Last_NS_Sync__c: now() as String
}
```

## BDR Phase 2+: SF Account → NS Customer (Reverse Direction)

```dwl
%dw 2.0
output application/json skipNullOn="everywhere"
---
payload map (account) -> {
  // Cross-reference (if NS has SF ID field — confirm with Ben)
  externalId: account.Id,

  // Identity (SF is source of truth for these)
  companyName: account.Name,
  entityId: account.Account_Number__c default account.Id,

  // Contact details
  email: account.Primary_Contact_Email__c default null,
  phone: account.Phone default null,

  // Billing address (SF owns)
  defaultAddress: {
    addr1: account.BillingStreet default null,
    city: account.BillingCity default null,
    state: account.BillingState default null,
    zip: account.BillingPostalCode default null,
    country: account.BillingCountry default "United Kingdom"
  }

  // NOTE: Do NOT overwrite NS financial fields (entityStatus, terms, creditLimit)
  // These are owned by NS finance team
}
```

## Liquidations Mapping (Phase 1.5, when Ryan confirms source)

Placeholder — exact shape depends on Ryan's data source.

### If CSV source

```dwl
%dw 2.0
input payload application/csv header=true
output application/json
---
payload map (row) -> {
  // Target: both NS and SF
  liquidationRef: row."Reference Number",
  companyName: row."Company Name",
  date: row.Date as Date {format: "dd/MM/yyyy"},
  amount: row.Amount as Number,

  // Status mapping
  entityStatus: "CUSTOMER-LIQUIDATED",
  On_Stop__c: true,
  On_Stop_Status__c: "LIQUIDATED"
}
```

### If API source (JSON)

```dwl
%dw 2.0
output application/json
---
payload.data map (liquidation) -> {
  liquidationRef: liquidation.reference,
  companyName: liquidation.companyName,
  date: liquidation.dateOfLiquidation as Date,
  entityStatus: "CUSTOMER-LIQUIDATED",
  On_Stop__c: true,
  On_Stop_Status__c: "LIQUIDATED"
}
```

## Gotchas

### NS Date Format

NetSuite returns dates in `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` format. Parse explicitly:

```dwl
customer.lastModifiedDate as DateTime
```

### SF SOQL Requires ISO 8601

```dwl
// For filtering SF queries by date:
vars.watermark as String {format: "yyyy-MM-dd'T'HH:mm:ss'Z'"}
```

### Boolean Fields

NS returns strings `"T"`/`"F"` for some boolean fields, not actual booleans. Coerce:

```dwl
customer.isInactive == "T"   // true if inactive
```

SF Boolean fields come through as actual booleans from the connector.

### Picklist Values

Picklist/dropdown values can differ between envs. Don't hardcode — extract to `var`:

```dwl
var statusMap = p('ns.status.map') as Object   // from property file
---
customer.entityStatus.name in statusMap.onStopValues
```

Or use Object Store for runtime-configurable trigger lists.

## Field Names to Confirm (BDR)

**With Anil (Salesforce):**
- `On_Stop__c` — is this the exact API name? Or something else?
- `On_Stop_Status__c` — text field for NS status string, API name?
- `NetSuite_Internal_ID__c` — does this exist? External ID enabled?
- Any other SF fields that should sync from NS?

**With Ben (NetSuite):**
- Does NS have a field storing the SF Account ID? What's its name?
- For Saved Search: return `internalId`, `companyName`, `entityStatus`, `lastModifiedDate`
- Any custom fields on Customer to include?
