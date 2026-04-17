# Batch Jobs

Use Mule's Batch Job component for high-volume record processing (thousands+ of records).

## When to Use Batch

- > 1000 records per poll
- Records can be processed in parallel
- Need resilience — failure on one record shouldn't kill the whole job
- Need batch-level metrics (successes, failures, total)

## Batch Job Structure

```
<batch:job>
  <batch:process-records>
    <batch:step>
      <!-- Phase 1: load + validate -->
    </batch:step>
    <batch:step>
      <!-- Phase 2: transform -->
    </batch:step>
    <batch:step>
      <!-- Phase 3: write to target -->
    </batch:step>
  </batch:process-records>
  <batch:on-complete>
    <!-- Summary, notifications -->
  </batch:on-complete>
</batch:job>
```

## Basic Batch Job

```xml
<flow name="bulk-customer-sync">
  <scheduler>
    <scheduling-strategy>
      <fixed-frequency frequency="1" timeUnit="HOURS" />
    </scheduling-strategy>
  </scheduler>

  <!-- Get records -->
  <netsuite:search config-ref="NetSuite_Config">
    <!-- search criteria -->
  </netsuite:search>

  <!-- Hand off to batch job -->
  <batch:job jobName="customerSyncJob" maxFailedRecords="50">
    <batch:process-records>
      <batch:step name="transform-step">
        <ee:transform>
          <ee:message>
            <ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{
  NetSuite_Internal_ID__c: payload.internalId,
  Name: payload.companyName
}]]></ee:set-payload>
          </ee:message>
        </ee:transform>
      </batch:step>

      <batch:step name="write-to-sf" acceptExpression="#[vars.processable == true]">
        <salesforce:upsert
          config-ref="Salesforce_Config"
          objectType="Account"
          externalIdFieldName="NetSuite_Internal_ID__c">
          <salesforce:records>#[payload]</salesforce:records>
        </salesforce:upsert>
      </batch:step>
    </batch:process-records>

    <batch:on-complete>
      <logger level="INFO"
        message='#["Batch complete: " ++ payload.successfulRecords ++ " success, " ++ payload.failedRecords ++ " failed"]' />
    </batch:on-complete>
  </batch:job>
</flow>
```

## Batch Aggregator (for bulk writes)

Group records before writing to target — more efficient for APIs that support bulk.

```xml
<batch:step name="write-step">
  <batch:aggregator size="200">
    <salesforce:create-bulk
      config-ref="Salesforce_Config"
      type="Account"
      records="#[payload]" />
  </batch:aggregator>
</batch:step>
```

## Batch Filtering (Accept Expression)

Skip records that shouldn't go through a step.

```xml
<batch:step name="only-active"
  acceptExpression="#[payload.status == 'active']">
  <!-- only processes active records -->
</batch:step>
```

## Batch Error Handling

Per-step error handler for resilience — failure on one record continues the batch.

```xml
<batch:step name="write-step">
  <try>
    <salesforce:upsert ... />
    <error-handler>
      <on-error-continue type="SALESFORCE:VALIDATION_ERROR">
        <logger level="WARN" message='#["Record failed validation: " ++ error.description]' />
        <!-- Record marked failed in batch state, but batch continues -->
      </on-error-continue>
    </error-handler>
  </try>
</batch:step>
```

## Configuration Attributes

| Attribute | Purpose | Default |
|---|---|---|
| `maxFailedRecords` | Stop batch if more than N fail | 0 (stop on first) |
| `batchBlockSize` | Records per block processed in memory | 100 |
| `schedulingStrategy` | `ORDERED_SEQUENTIAL` or `ROUND_ROBIN` | ORDERED |

## Batch Job Results (in `on-complete`)

```dwl
{
  batchJobInstanceId: payload.batchJobInstanceId,
  totalRecords: payload.totalRecords,
  successfulRecords: payload.successfulRecords,
  failedRecords: payload.failedRecords,
  elapsedTimeInMillis: payload.elapsedTimeInMillis
}
```

## When NOT to Use Batch

- Small record volumes (< 100) — overhead not worth it, just use `<foreach>`
- Strict ordering required across records — batch processes in parallel blocks
- Real-time processing — batch is designed for throughput, not latency

## BDR Use Case

Suspension flow uses a regular polling flow (likely < 100 changes per poll). Batch is NOT needed.

Batch WOULD be appropriate for:
- Initial backfill — syncing ALL existing on-stop accounts at go-live
- Liquidations flow if Ryan's source produces bulk CSV with thousands of rows
- Month-end reconciliation sweeps
