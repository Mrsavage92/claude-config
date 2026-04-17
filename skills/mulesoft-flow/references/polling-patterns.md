# Polling Flow Patterns

The most common integration pattern: poll a source system on a schedule, detect changes via watermark, push to target.

## The Canonical Watermark Pattern

```
1. Scheduler triggers every N minutes
2. Read last watermark from Object Store (default: now() on first run)
3. Query source with filter: lastModifiedDate > watermark
4. If no results → exit cleanly, keep watermark
5. If results → transform → write to target → update watermark → log
6. On error → do NOT update watermark (so records are retried next poll)
```

## Why Watermarks Matter

Without watermark:
- Every poll scans ALL records → API quota exhaustion
- Target system gets duplicate writes → data corruption
- First poll processes entire history → mass event storm

With watermark:
- Only new/changed records fetched → minimal API calls
- Safe to retry on error (watermark not advanced)
- First run starts at `now()` → no historical backfill

## Object Store Watermark Implementation

### Read watermark (with default)

```xml
<try>
  <os:retrieve
    objectStore="Integration_Object_Store"
    key="ns-customer-watermark"
    target="lastWatermark" />
  <error-handler>
    <on-error-continue type="OS:KEY_NOT_FOUND">
      <!-- First run: set watermark to now() to skip historical backfill -->
      <ee:transform>
        <ee:variables>
          <ee:set-variable variableName="lastWatermark">#[now()]</ee:set-variable>
        </ee:variables>
      </ee:transform>
    </on-error-continue>
  </error-handler>
</try>
```

### Capture current poll time BEFORE querying

Prevents race condition where records modified during the poll are missed.

```xml
<ee:transform>
  <ee:variables>
    <ee:set-variable variableName="pollStartTime">#[now()]</ee:set-variable>
  </ee:variables>
</ee:transform>
```

### Update watermark AFTER successful write

```xml
<os:store
  objectStore="Integration_Object_Store"
  key="ns-customer-watermark"
  value="#[vars.pollStartTime]" />
```

## Common Schedule Frequencies

| Use case | Frequency |
|---|---|
| Near real-time (user-facing) | Every 5-15 minutes |
| Standard sync (backoffice) | Every 1 hour |
| Low priority reconciliation | Every 24 hours |
| BDR On Stop sync | Every 15 minutes |

## Complete Polling Flow Example

```xml
<flow name="netsuite-to-sf-onstop-sync">

  <!-- Trigger: Every 15 minutes -->
  <scheduler>
    <scheduling-strategy>
      <fixed-frequency frequency="15" timeUnit="MINUTES" />
    </scheduling-strategy>
  </scheduler>

  <!-- Capture poll start time -->
  <ee:transform doc:name="Capture Poll Time">
    <ee:variables>
      <ee:set-variable variableName="pollStartTime">#[now()]</ee:set-variable>
      <ee:set-variable variableName="correlationId">#[correlationId]</ee:set-variable>
    </ee:variables>
  </ee:transform>

  <!-- Read watermark (fallback to now() on first run) -->
  <try>
    <os:retrieve objectStore="Integration_Object_Store"
      key="ns-customer-watermark" target="lastWatermark" />
    <error-handler>
      <on-error-continue type="OS:KEY_NOT_FOUND">
        <ee:transform>
          <ee:variables>
            <ee:set-variable variableName="lastWatermark">#[now()]</ee:set-variable>
          </ee:variables>
        </ee:transform>
      </on-error-continue>
    </error-handler>
  </try>

  <!-- Query NetSuite via Saved Search -->
  <netsuite:saved-search
    config-ref="NetSuite_Config"
    recordType="CUSTOMER"
    savedSearchId="${netsuite.saved_search_id}" />

  <!-- Filter down and transform for Salesforce -->
  <ee:transform doc:name="Map to SF Account">
    <ee:message>
      <ee:set-payload><![CDATA[%dw 2.0
output application/json
var onStopTriggers = ["CUSTOMER-ACCOUNT ON STOP", "CUSTOMER-SUSPENDED"]
---
payload map (customer) -> {
  NetSuite_Internal_ID__c: customer.internalId,
  On_Stop__c: customer.entityStatus.name in onStopTriggers,
  On_Stop_Status__c: customer.entityStatus.name default ""
}]]></ee:set-payload>
    </ee:message>
  </ee:transform>

  <!-- Write to Salesforce with retry -->
  <until-successful maxRetries="3" millisBetweenRetries="2000">
    <salesforce:upsert
      config-ref="Salesforce_Config"
      objectType="Account"
      externalIdFieldName="NetSuite_Internal_ID__c">
      <salesforce:records>#[payload]</salesforce:records>
    </salesforce:upsert>
  </until-successful>

  <!-- Checkpoint: update watermark -->
  <os:store
    objectStore="Integration_Object_Store"
    key="ns-customer-watermark"
    value="#[vars.pollStartTime]" />

  <!-- Log success metrics -->
  <logger level="INFO"
    message='#["NS->SF On-Stop sync completed: " ++ sizeOf(payload) ++ " records, correlationId=" ++ vars.correlationId]' />

  <!-- Error handler -->
  <error-handler>
    <on-error-propagate type="ANY">
      <logger level="ERROR"
        message='#["NS->SF sync FAILED: " ++ error.description ++ " correlationId=" ++ vars.correlationId]' />
      <!-- Watermark NOT updated → retry on next poll -->
    </on-error-propagate>
  </error-handler>

</flow>
```

## Handling Large Result Sets

If a single poll could return thousands of records:

### Option 1: Batch within the flow

```xml
<foreach batchSize="200">
  <salesforce:upsert ... />
</foreach>
```

### Option 2: Separate batch job

Move to `<batch:job>` for anything > 1000 records. See `batch-jobs.md`.

### Option 3: Pagination

Some systems require explicit pagination (offset/cursor). Wrap the query in `<until-successful>` loop with state tracking.

## First Run Strategy

Three options when deploying a new polling flow:

| Strategy | Pros | Cons |
|---|---|---|
| Watermark = `now()` on first run | No history processed, safe go-live | Existing records not synced |
| Watermark = fixed date (e.g. 30 days ago) | Controlled recent backfill | Requires manual intervention |
| Full backfill flow (separate) | Clean separation | Risk of duplicates if not idempotent |

**Recommendation:** Always default to `now()` + separate backfill flow if historical data sync is needed.

## BDR Watermark Configuration

```yaml
netsuite:
  saved_search_id: "customsearch_mulesoft_customer_status"  # Ben to provide

# Object Store key: "ns-customer-watermark"
# Poll frequency: 15 minutes
# First-run behaviour: watermark = now() — skip historical records
```
