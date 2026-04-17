# Format Handling

## JSON

### Parse JSON (automatic from HTTP/connector payload)

Most connectors return JSON-parseable payloads automatically. Just declare output type.

```dwl
%dw 2.0
output application/json
---
payload
```

### Explicit JSON reader config

For encoding/BOM issues:

```dwl
%dw 2.0
input payload application/json reader="JSON" streaming=true
output application/json
---
payload
```

## XML

### Reading XML

```dwl
%dw 2.0
output application/json
---
{
  orders: payload.OrderList.*Order map (order) -> {
    id: order.@id,     // @ for attribute
    total: order.Total,
    items: order.*Item map (item) -> {
      sku: item.@sku,
      quantity: item.Quantity as Number
    }
  }
}
```

`*Element` = all children with that name (returns array).
`@attr` = attribute access.

### Writing XML

```dwl
%dw 2.0
output application/xml
---
{
  OrderConfirmation @(xmlns: "http://example.com/orders"): {
    OrderId: payload.orderId,
    Customer @(id: payload.customerId): {
      Name: payload.customerName
    }
  }
}
```

`@(key: value)` = attribute in XML output.

### XML Namespaces

```dwl
%dw 2.0
ns soap http://schemas.xmlsoap.org/soap/envelope/
ns ns1 http://example.com/schema
output application/xml
---
soap#Envelope: {
  soap#Body: {
    ns1#GetCustomer: {
      ns1#id: payload.customerId
    }
  }
}
```

## CSV

### Reading CSV (with headers)

```dwl
%dw 2.0
input payload application/csv header=true
output application/json
---
payload
```

Produces array of objects keyed by header row.

### Reading CSV (no headers)

```dwl
%dw 2.0
input payload application/csv header=false
output application/json
---
payload map (row, index) -> {
  column1: row.column_0,
  column2: row.column_1
}
```

### Writing CSV

```dwl
%dw 2.0
output application/csv
---
payload map (item) -> {
  "Order ID": item.orderId,
  "Customer": item.customerName,
  "Total": item.total
}
```

### CSV with custom separator

```dwl
%dw 2.0
output application/csv separator=";" quoteValues=true
---
payload
```

## Java

Used for database writes (primitive Java types).

```dwl
%dw 2.0
output application/java
---
{
  id: payload.id as Number,
  name: payload.name as String,
  created: payload.created as DateTime
}
```

## Form URL Encoded

For POST bodies to form endpoints:

```dwl
%dw 2.0
output application/x-www-form-urlencoded
---
{
  grant_type: "client_credentials",
  client_id: p('api.client_id'),
  client_secret: p('api.client_secret')
}
```

## Fixed-Width (for legacy systems)

```dwl
%dw 2.0
input payload application/flatfile
output application/json
---
payload
```

Requires a flat file schema definition (outside the script, in a separate `.ffd` file).

## Multipart Form Data (for file uploads)

```dwl
%dw 2.0
output multipart/form-data
---
{
  parts: {
    file: {
      headers: {
        "Content-Disposition": {
          name: "file",
          filename: "report.csv"
        },
        "Content-Type": "text/csv"
      },
      content: payload
    }
  }
}
```

## Format Conversion Examples

### JSON → CSV

```dwl
%dw 2.0
output application/csv
---
payload.orders map (order) -> {
  OrderID: order.id,
  Customer: order.customer.name,
  Total: order.total
}
```

### CSV → XML

```dwl
%dw 2.0
input payload application/csv header=true
output application/xml
---
{
  Orders: {
    (payload map (row) -> {
      Order: {
        id: row."Order ID",
        total: row.Total as Number
      }
    })
  }
}
```

### XML → JSON

```dwl
%dw 2.0
output application/json
---
{
  orders: payload.Orders.*Order map (o) -> {
    id: o.@id,
    total: o.Total as Number
  }
}
```
