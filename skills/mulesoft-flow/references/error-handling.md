# Error Handling Patterns

## Error Handler Types

| Type | Behaviour | When to Use |
|---|---|---|
| `<on-error-propagate>` | Log error, re-throw to caller (flow fails) | Most cases — errors should surface |
| `<on-error-continue>` | Log error, continue flow execution | Rare — only when error is non-critical |
| Global error handler | Shared across multiple flows | Standardised error response |

## Flow-Level Error Handler

```xml
<flow name="myFlow">
  <!-- processors -->
  <error-handler>
    <on-error-propagate type="ANY">
      <logger level="ERROR"
        message='#["Flow failed: " ++ error.description ++ " at " ++ error.failingComponent]' />
    </on-error-propagate>
  </error-handler>
</flow>
```

## Catch Specific Error Types

```xml
<error-handler>
  <on-error-continue type="HTTP:CONNECTIVITY">
    <logger message="HTTP connectivity issue — will retry on next poll" />
  </on-error-continue>

  <on-error-propagate type="SALESFORCE:MUTUAL_AUTHENTICATION_FAILED">
    <logger level="ERROR" message="SF auth expired — credential rotation needed" />
  </on-error-propagate>

  <on-error-propagate type="ANY">
    <!-- Catch-all -->
    <logger level="ERROR" message='#["Unhandled: " ++ error.description]' />
  </on-error-propagate>
</error-handler>
```

## Retry with Until-Successful

Wrap transient-error-prone operations (HTTP calls, SF writes) in retry logic.

```xml
<until-successful maxRetries="3" millisBetweenRetries="2000">
  <salesforce:upsert config-ref="Salesforce_Config" objectType="Account">
    <salesforce:records>#[payload]</salesforce:records>
  </salesforce:upsert>
</until-successful>
```

**Exponential backoff alternative** — custom via `<try>`:

```xml
<try>
  <!-- operation -->
  <error-handler>
    <on-error-propagate>
      <flow-ref name="retry-with-backoff" />
    </on-error-propagate>
  </error-handler>
</try>
```

## Try Block for Local Error Handling

```xml
<try>
  <salesforce:upsert config-ref="Salesforce_Config" objectType="Account">
    <salesforce:records>#[payload]</salesforce:records>
  </salesforce:upsert>

  <error-handler>
    <on-error-continue type="SALESFORCE:INVALID_FIELD">
      <logger level="WARN" message="Invalid field — skipping record" />
      <!-- flow continues -->
    </on-error-continue>
  </error-handler>
</try>
```

## Dead Letter Queue Pattern

When a record fails repeatedly, push to a DLQ for manual review.

```xml
<flow name="orderProcessor">
  <jms:listener config-ref="JMS_Config" destination="orders.queue" />

  <try>
    <!-- processing -->

    <error-handler>
      <on-error-continue type="ANY">
        <jms:publish config-ref="JMS_Config" destination="orders.dlq">
          <jms:message>
            <jms:body>#[payload]</jms:body>
            <jms:properties>
              <jms:user-property key="error" value="#[error.description]" />
              <jms:user-property key="failedAt" value="#[now()]" />
              <jms:user-property key="correlationId" value="#[correlationId]" />
            </jms:properties>
          </jms:message>
        </jms:publish>
      </on-error-continue>
    </error-handler>
  </try>
</flow>
```

## Global Error Handler (Shared)

```xml
<!-- In global-config.xml -->
<error-handler name="Global_Error_Handler">
  <on-error-propagate type="ANY">
    <logger level="ERROR"
      message='#["GLOBAL ERROR: " ++ error.description ++ " | flow=" ++ flow.name ++ " | correlationId=" ++ correlationId]' />
  </on-error-propagate>
</error-handler>

<!-- In a flow -->
<flow name="myFlow">
  <!-- processors -->
  <error-handler ref="Global_Error_Handler" />
</flow>
```

## Error Object Contents

Inside an error handler, `error` is available:

| Field | Content |
|---|---|
| `error.description` | Short error description |
| `error.detailedDescription` | Full stack trace |
| `error.errorType.identifier` | e.g. `CONNECTIVITY` |
| `error.errorType.namespace` | e.g. `HTTP` |
| `error.failingComponent` | Component that threw |
| `error.muleMessage` | Original message at time of error |

Access via DataWeave: `#[error.description]`

## Best Practices

1. **Always log before re-throwing** — even `<on-error-propagate>` should log
2. **Include correlation ID in error logs** — essential for tracing in Runtime Manager
3. **Don't use `<on-error-continue>` to hide bugs** — if you swallow errors, they WILL bite later
4. **Fail fast on auth errors** — no retry for INVALID_LOGIN, INVALID_CREDENTIAL
5. **Retry on transient errors only** — HTTP:CONNECTIVITY, HTTP:TIMEOUT, 429 rate limits
6. **Set max retry limits** — infinite retries can take down upstream systems
7. **DLQ for unrecoverable errors** — human needs to look at them
8. **Alert on DLQ growth** — Runtime Manager alerts on queue size

## BDR-Specific Error Handling

```xml
<error-handler>
  <on-error-propagate type="SALESFORCE:MUTUAL_AUTHENTICATION_FAILED">
    <logger level="ERROR" message="SF JWT cert may be expired — check Connected App" />
  </on-error-propagate>

  <on-error-propagate type="NETSUITE:INSUFFICIENT_PERMISSION">
    <logger level="ERROR" message="NS role missing permission — check TBA role config" />
  </on-error-propagate>

  <on-error-propagate type="HTTP:CONNECTIVITY">
    <logger level="WARN" message="Transient connectivity — will retry next poll" />
  </on-error-propagate>

  <on-error-propagate type="ANY">
    <logger level="ERROR"
      message='#["BDR On-Stop sync FAILED: " ++ error.description ++ " correlationId=" ++ correlationId]' />
  </on-error-propagate>
</error-handler>
```
