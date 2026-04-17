# HTTP Connector Reference

**Dependency:**
```xml
<dependency>
    <groupId>org.mule.connectors</groupId>
    <artifactId>mule-http-connector</artifactId>
    <version>1.11.0</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

Two components in one connector: **Listener** (receives requests) and **Requester** (sends requests).

## Listener — Flow Trigger

Use when a flow is triggered by an incoming HTTP call (webhook, API endpoint, external system push).

### Basic Listener Config

```xml
<http:listener-config name="HTTP_Listener_config">
  <http:listener-connection host="0.0.0.0" port="${http.port}" />
</http:listener-config>
```

### Listener Flow

```xml
<flow name="webhookFlow">
  <http:listener config-ref="HTTP_Listener_config" path="/webhook" allowedMethods="POST" />
  <!-- processing -->
</flow>
```

### HTTPS Listener

```xml
<http:listener-config name="HTTPS_Listener_config">
  <http:listener-connection
    host="0.0.0.0"
    port="${https.port}"
    protocol="HTTPS">
    <tls:context>
      <tls:key-store
        type="jks"
        path="${tls.keystore.path}"
        password="${tls.keystore.password}"
        keyPassword="${tls.keystore.key_password}" />
    </tls:context>
  </http:listener-connection>
</http:listener-config>
```

## Requester — Outbound API Calls

Use when Mule needs to call an external REST API.

### Basic Requester Config

```xml
<http:request-config name="External_API_Config">
  <http:request-connection host="${external.host}" port="${external.port}" protocol="HTTPS" />
</http:request-config>
```

### Making a Request

```xml
<http:request
  config-ref="External_API_Config"
  method="GET"
  path="/v1/customers/{id}">
  <http:uri-params>#[{"id": vars.customerId}]</http:uri-params>
  <http:headers>#[{"Authorization": "Bearer " ++ vars.accessToken}]</http:headers>
</http:request>
```

## Authentication Patterns

### Basic Auth

```xml
<http:request-config name="BasicAuth_Config">
  <http:request-connection host="api.example.com" protocol="HTTPS">
    <http:authentication>
      <http:basic-authentication
        username="${api.username}"
        password="${api.password}" />
    </http:authentication>
  </http:request-connection>
</http:request-config>
```

### OAuth 2.0 Client Credentials

```xml
<http:request-config name="OAuth2_Config">
  <http:request-connection host="api.example.com" protocol="HTTPS">
    <http:authentication>
      <oauth:client-credentials-grant-type
        clientId="${api.client_id}"
        clientSecret="${api.client_secret}"
        tokenUrl="${api.token_url}" />
    </http:authentication>
  </http:request-connection>
</http:request-config>
```

### Bearer Token (set per-request)

```xml
<http:request method="GET" path="/data">
  <http:headers>#[{"Authorization": "Bearer " ++ vars.token}]</http:headers>
</http:request>
```

### mTLS (Mutual TLS)

For B2B integrations where both sides present certificates.

```xml
<http:request-config name="MTLS_Config">
  <http:request-connection host="secure-api.partner.com" protocol="HTTPS">
    <tls:context>
      <tls:key-store
        type="jks"
        path="${tls.client_keystore}"
        password="${tls.client_keystore_password}" />
      <tls:trust-store
        type="jks"
        path="${tls.truststore}"
        password="${tls.truststore_password}" />
    </tls:context>
  </http:request-connection>
</http:request-config>
```

## Request/Response Handling

### Response Validation

```xml
<http:request method="GET" path="/users/{id}">
  <http:response-validator>
    <http:success-status-code-validator values="200..299" />
  </http:response-validator>
</http:request>
```

Throws an error for 4xx/5xx — handle in error handler.

### Setting Request Body

```xml
<ee:transform>
  <ee:message>
    <ee:set-payload><![CDATA[%dw 2.0
output application/json
---
{
  name: payload.name,
  email: payload.email
}]]></ee:set-payload>
  </ee:message>
</ee:transform>

<http:request method="POST" path="/users">
  <http:headers>#[{"Content-Type": "application/json"}]</http:headers>
</http:request>
```

## Common Patterns

### Pagination (cursor-based)

```xml
<ee:variables>
  <ee:set-variable variableName="cursor">null</ee:set-variable>
</ee:variables>

<until-successful maxRetries="100">
  <http:request method="GET" path="/items">
    <http:query-params>#[{"cursor": vars.cursor, "limit": 100}]</http:query-params>
  </http:request>
  <ee:transform>
    <ee:variables>
      <ee:set-variable variableName="cursor">#[payload.next_cursor]</ee:set-variable>
    </ee:variables>
  </ee:transform>
  <!-- process payload.data -->
</until-successful>
```

### Retry with Exponential Backoff

```xml
<until-successful maxRetries="3" millisBetweenRetries="2000">
  <http:request method="GET" path="/flaky-endpoint" />
</until-successful>
```

## Property File Keys

```yaml
http:
  port: "8081"

https:
  port: "8443"

external_api:
  host: "api.partner.com"
  port: "443"
  client_id: ""
  client_secret: ""
  token_url: "https://api.partner.com/oauth/token"

tls:
  keystore:
    path: "keystore.jks"
    password: "${secure::tls-keystore-password}"
    key_password: "${secure::tls-key-password}"
```

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "Connection refused" | Wrong port/host or service down | Verify host and port; ping/curl the target |
| "SSL handshake failed" | Cert mismatch or truststore missing | Import server cert to truststore |
| "403 Forbidden" on OAuth call | Token expired or scope wrong | Refresh token, check scopes |
| "Address already in use" | Port conflict with another process | Change `http.port` or kill conflicting process |
| Response timeout | Slow target or network | Increase `responseTimeout` attribute |
