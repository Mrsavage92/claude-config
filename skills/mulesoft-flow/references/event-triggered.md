# Event-Triggered Flow Patterns

When flows are triggered by external events rather than schedules.

## Trigger Types

| Trigger | Source | Use Case |
|---|---|---|
| HTTP Listener | Webhooks, API calls | External system pushes data |
| JMS Listener | Message queue | Decoupled async processing |
| Kafka Listener | Kafka topic | High-volume event streams |
| SF Streaming API | Salesforce Platform Events | Near real-time SF changes |
| NS User Event Script | NetSuite webhook | NS record change → Mule |
| SFTP/FTP Listener | File drop | Partner file-based integration |

## HTTP Listener Pattern

### Basic Webhook

```xml
<flow name="webhook-handler">
  <http:listener
    config-ref="HTTP_Listener_config"
    path="/webhooks/customer-update"
    allowedMethods="POST" />

  <ee:transform doc:name="Validate Payload">
    <ee:variables>
      <ee:set-variable variableName="correlationId">#[correlationId]</ee:set-variable>
    </ee:variables>
  </ee:transform>

  <choice>
    <when expression="#[payload.event_type == 'customer.updated']">
      <flow-ref name="handle-customer-update" />
    </when>
    <otherwise>
      <logger level="WARN" message='#["Unknown event: " ++ payload.event_type]' />
    </otherwise>
  </choice>

  <ee:transform doc:name="Build 200 Response">
    <ee:message>
      <ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{
  status: "received",
  correlationId: vars.correlationId
}]]></ee:set-payload>
    </ee:message>
  </ee:transform>

  <error-handler>
    <on-error-continue type="ANY">
      <ee:transform>
        <ee:message>
          <ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{
  status: "error",
  message: error.description
}]]></ee:set-payload>
        </ee:message>
        <ee:variables>
          <ee:set-variable variableName="httpStatus">500</ee:set-variable>
        </ee:variables>
      </ee:transform>
    </on-error-continue>
  </error-handler>
</flow>
```

### Signed Webhook Verification

For security — verify HMAC signature from sender.

```xml
<ee:transform doc:name="Verify Signature">
  <ee:variables>
    <ee:set-variable variableName="expected">#[
      dw::Crypto::HMACWith(vars.body, p('webhook.secret'), "HmacSHA256")
    ]</ee:set-variable>
    <ee:set-variable variableName="received">#[attributes.headers['x-signature']]</ee:set-variable>
  </ee:variables>
</ee:transform>

<choice>
  <when expression="#[vars.expected != vars.received]">
    <raise-error type="APP:INVALID_SIGNATURE" description="Webhook signature invalid" />
  </when>
</choice>
```

## JMS/AMQP Listener Pattern

### Consumer Flow

```xml
<flow name="order-consumer">
  <jms:listener config-ref="JMS_Config" destination="orders.queue" />

  <try>
    <!-- processing -->
    <flow-ref name="process-order" />

    <error-handler>
      <on-error-continue type="APP:VALIDATION_ERROR">
        <!-- Don't retry validation errors — push to DLQ -->
        <jms:publish config-ref="JMS_Config" destination="orders.dlq">
          <jms:message><jms:body>#[payload]</jms:body></jms:message>
        </jms:publish>
      </on-error-continue>

      <on-error-propagate type="ANY">
        <!-- Other errors → requeue via redelivery -->
        <logger level="ERROR" message='#["Requeue: " ++ error.description]' />
      </on-error-propagate>
    </error-handler>
  </try>
</flow>
```

## Salesforce Streaming Pattern

Listen to SF Platform Events or PushTopics for near-real-time change notifications.

### PushTopic Listener

```xml
<flow name="sf-account-changes">
  <salesforce:replay-topic-listener
    config-ref="Salesforce_Config"
    topic="/topic/AccountUpdates" />

  <logger level="INFO" message='#["SF Account event: " ++ payload.sobject.Id]' />

  <!-- Sync to NS -->
  <flow-ref name="sync-sf-account-to-ns" />
</flow>
```

### Platform Events

```xml
<flow name="sf-platform-event-listener">
  <salesforce:replay-topic-listener
    config-ref="Salesforce_Config"
    topic="/event/Customer_Change__e" />

  <!-- processing -->
</flow>
```

## File Listener Pattern

See `/mulesoft-connector` → `file-connectors.md` for full details.

```xml
<flow name="liquidations-file-poller">
  <sftp:listener
    config-ref="SFTP_Config"
    directory="liquidations/incoming"
    autoDelete="false"
    moveToDirectory="liquidations/processed">
    <scheduling-strategy>
      <fixed-frequency frequency="3600000" />
    </scheduling-strategy>
    <sftp:matcher filenamePattern="liquidations-*.csv" />
  </sftp:listener>

  <!-- parse CSV -->
  <ee:transform>
    <ee:message>
      <ee:set-payload><![CDATA[%dw 2.0
output application/java
---
payload]]></ee:set-payload>
    </ee:message>
  </ee:transform>

  <flow-ref name="process-liquidation-records" />
</flow>
```

## Idempotency for Event Flows

Events can be re-delivered. Deduplicate using Object Store:

```xml
<flow name="webhook-handler">
  <http:listener ... />

  <os:contains objectStore="processed-events"
    key="#[attributes.headers['x-event-id']]"
    target="alreadyProcessed" />

  <choice>
    <when expression="#[vars.alreadyProcessed]">
      <logger level="INFO" message='#["Duplicate event, skipping: " ++ attributes.headers["x-event-id"]]' />
    </when>
    <otherwise>
      <!-- process -->
      <os:store objectStore="processed-events"
        key="#[attributes.headers['x-event-id']]"
        value="#[now()]" />
    </otherwise>
  </choice>
</flow>
```

See `idempotency.md` for more patterns.

## Synchronous vs Asynchronous

### Synchronous (caller waits)
- HTTP Listener with response body
- Use when caller needs result
- Keep processing time < 30s

### Asynchronous (fire and forget)
- HTTP Listener → immediate 202 response → `<async>` block
- Use when caller doesn't need result
- Can process longer, retry, DLQ

```xml
<flow name="async-webhook">
  <http:listener ... />

  <ee:transform>
    <ee:message>
      <ee:set-payload><![CDATA[{
  status: "accepted",
  correlationId: correlationId
}]]></ee:set-payload>
    </ee:message>
  </ee:transform>

  <!-- Return 202 immediately, process in background -->
  <async>
    <flow-ref name="long-running-process" />
  </async>
</flow>
```
