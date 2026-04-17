# Idempotency Patterns

**Idempotent** = running the same operation multiple times has the same effect as running it once. Critical for reliable integrations because retries, replays, and duplicate events happen in production.

## Why It Matters

Without idempotency:
- JMS redelivery creates duplicate orders
- Webhook retries create duplicate customers
- Flow retry after partial failure double-writes
- Batch replay after bug fix creates duplicate records

With idempotency:
- Safe to retry anything
- Safe to replay from any checkpoint
- Safe to re-process events
- Easier debugging, cleaner data

## Pattern 1: External ID Upsert (Preferred)

Use an external ID field in the target system. Writes are idempotent because the target looks up by external ID and updates instead of creating.

### Salesforce Example

```xml
<salesforce:upsert
  config-ref="Salesforce_Config"
  objectType="Account"
  externalIdFieldName="NetSuite_Internal_ID__c">
  <salesforce:records>#[payload]</salesforce:records>
</salesforce:upsert>
```

The `externalIdFieldName` must be marked as External ID in SF field settings. SF finds-or-creates based on this field.

### NetSuite Example

```xml
<netsuite:upsert
  config-ref="NetSuite_Config"
  recordType="customer">
  <netsuite:records>#[payload]</netsuite:records>
</netsuite:upsert>
```

Requires `externalId` field on the NS record.

### Database Example

```sql
-- Postgres: INSERT ... ON CONFLICT
INSERT INTO customers (external_id, name, status)
VALUES (:ext_id, :name, :status)
ON CONFLICT (external_id) DO UPDATE
SET name = EXCLUDED.name, status = EXCLUDED.status;

-- MySQL: INSERT ... ON DUPLICATE KEY UPDATE
INSERT INTO customers (external_id, name, status)
VALUES (:ext_id, :name, :status)
ON DUPLICATE KEY UPDATE name = VALUES(name), status = VALUES(status);

-- MSSQL: MERGE
MERGE customers AS target
USING (VALUES (:ext_id, :name, :status)) AS source (external_id, name, status)
ON target.external_id = source.external_id
WHEN MATCHED THEN UPDATE SET name = source.name, status = source.status
WHEN NOT MATCHED THEN INSERT (external_id, name, status) VALUES (source.external_id, source.name, source.status);
```

## Pattern 2: Object Store Dedup Key

When upsert isn't available (sending emails, publishing events, calling external APIs with no external-ID support).

```xml
<flow name="notify-customer">
  <os:contains
    objectStore="notifications-sent"
    key="#[vars.notificationId]"
    target="alreadySent" />

  <choice>
    <when expression="#[vars.alreadySent]">
      <logger level="INFO" message='#["Notification " ++ vars.notificationId ++ " already sent, skipping"]' />
    </when>
    <otherwise>
      <email:send config-ref="Email_Config">
        <email:to-addresses>
          <email:to-address value="#[payload.email]" />
        </email:to-addresses>
        <email:subject>Your order is confirmed</email:subject>
        <email:body>Order #[payload.orderId] received</email:body>
      </email:send>

      <os:store objectStore="notifications-sent"
        key="#[vars.notificationId]"
        value="#[now()]" />
    </otherwise>
  </choice>
</flow>
```

### Object Store TTL

To prevent unbounded growth, use TTL:

```xml
<os:object-store name="notifications-sent"
  entryTtl="30"
  entryTtlUnit="DAYS"
  maxEntries="1000000"
  persistent="true" />
```

## Pattern 3: Idempotency Key Header (HTTP APIs)

For outbound HTTP calls where the remote API supports idempotency keys (Stripe, Twilio, etc.).

```xml
<http:request method="POST" path="/v1/charges">
  <http:headers>#[{"Idempotency-Key": vars.requestId, "Authorization": "Bearer " ++ p('stripe.api_key')}]</http:headers>
  <http:body><![CDATA[%dw 2.0 output application/x-www-form-urlencoded ---
  {
    amount: payload.amount,
    currency: "gbp"
  }]]></http:body>
</http:request>
```

The remote API stores the key and returns the original response on retry with same key — preventing duplicate charges.

## Pattern 4: Source State Comparison

Only write if target state is different from source state. Prevents unnecessary writes and avoids triggering update timestamps.

```xml
<!-- Query target first -->
<salesforce:query config-ref="Salesforce_Config">
  <salesforce:salesforce-query>SELECT Id, On_Stop__c FROM Account WHERE NetSuite_Internal_ID__c = ':nsId'</salesforce:salesforce-query>
  <salesforce:parameters>#[{"nsId": payload.internalId}]</salesforce:parameters>
</salesforce:query>

<choice>
  <when expression="#[payload[0].On_Stop__c != vars.desiredOnStop]">
    <!-- state differs, write needed -->
    <salesforce:update config-ref="Salesforce_Config" objectType="Account">
      <salesforce:records>#[...]</salesforce:records>
    </salesforce:update>
  </when>
  <otherwise>
    <logger level="DEBUG" message="State already correct, skipping write" />
  </otherwise>
</choice>
```

**Tradeoff:** adds an extra API call per record. Use when the target API cost of unnecessary writes > query cost.

## Pattern 5: Immutable Event Log

For event sourcing — never update, only append. Dedup by event ID at query time.

```sql
CREATE TABLE events (
  id UUID PRIMARY KEY,
  event_type VARCHAR NOT NULL,
  payload JSONB NOT NULL,
  received_at TIMESTAMP DEFAULT NOW()
);
```

Inserting with a conflict-on-id ignored:

```sql
INSERT INTO events (id, event_type, payload)
VALUES (:id, :type, :payload)
ON CONFLICT (id) DO NOTHING;
```

## Choosing the Right Pattern

| Pattern | Best For |
|---|---|
| External ID Upsert | Master data sync (SF ↔ NS, CRM ↔ ERP) |
| Object Store Dedup | Notifications, async actions, stateless calls |
| Idempotency-Key Header | 3rd-party APIs that support it (Stripe, etc.) |
| Source State Comparison | Expensive writes, audit trail sensitivity |
| Immutable Event Log | Event sourcing, audit requirements |

## BDR Pattern

For NS→SF On Stop sync: **External ID Upsert**.
- SF Account has `NetSuite_Internal_ID__c` as External ID
- Upsert finds-or-creates based on this
- Safe to re-run on any poll — idempotent by design
- No separate dedup store needed

For liquidations (when built): **External ID Upsert** to both NS and SF, keyed by a liquidation reference ID from Ryan's source.
