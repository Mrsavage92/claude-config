# Field Mapping Patterns

## Basic 1:1 Mapping

```dwl
%dw 2.0
output application/json
---
{
  firstName: payload.FirstName,
  lastName: payload.LastName,
  email: payload.Email
}
```

## Collection Mapping (map)

```dwl
%dw 2.0
output application/json
---
payload map (customer, index) -> {
  id: customer.internalId,
  name: customer.companyName,
  position: index
}
```

`map` gives you `(element, index)` — use index only when you need positional tracking.

## Conditional Field Assignment

```dwl
%dw 2.0
output application/json
var onStopTriggers = ["CUSTOMER-ACCOUNT ON STOP", "CUSTOMER-SUSPENDED"]
---
payload map (customer) -> {
  NetSuite_Internal_ID__c: customer.internalId,
  On_Stop__c: customer.entityStatus.name in onStopTriggers,
  On_Stop_Status__c: customer.entityStatus.name default ""
}
```

## Conditional Field Inclusion (only include if truthy)

```dwl
{
  id: payload.id,
  (email: payload.email) if payload.email != null,
  (phone: payload.phone) if payload.phone != null
}
```

The field only appears in output if the condition is true.

## Flatten Nested Structure

```dwl
// Source: { customer: { id, name, address: { street, city } } }
// Target: flat fields

%dw 2.0
output application/json
---
{
  customerId: payload.customer.id,
  customerName: payload.customer.name,
  street: payload.customer.address.street,
  city: payload.customer.address.city
}
```

## Nest Flat Structure

```dwl
%dw 2.0
output application/json
---
{
  customer: {
    id: payload.customerId,
    name: payload.customerName,
    address: {
      street: payload.street,
      city: payload.city
    }
  }
}
```

## Rename Fields

```dwl
%dw 2.0
output application/json
---
payload mapObject ((value, key) -> {
  (
    if (key as String == "id") "customerId"
    else if (key as String == "name") "customerName"
    else key
  ): value
})
```

## Filter + Map

```dwl
%dw 2.0
output application/json
var activeOnly = payload filter ($.status == "ACTIVE")
---
activeOnly map (customer) -> {
  id: customer.id,
  name: customer.name
}
```

## GroupBy

```dwl
%dw 2.0
output application/json
---
payload groupBy ($.region)

// Produces:
// {
//   "UK": [...customers in UK],
//   "EU": [...customers in EU],
//   "US": [...customers in US]
// }
```

## Aggregation (reduce)

```dwl
%dw 2.0
output application/json
---
{
  totalRevenue: payload reduce ((item, acc = 0) -> acc + item.amount),
  customerCount: sizeOf(payload)
}
```

## Joining Data from Two Sources

Use flow variables to hold the second dataset, then lookup in the map.

```dwl
%dw 2.0
output application/json
var customersByEmail = vars.sfCustomers groupBy ($.Email)
---
payload map (nsOrder) -> {
  orderId: nsOrder.id,
  customerId: customersByEmail[nsOrder.customerEmail]?[0].Id default null
}
```

## Pluck

Extract specific fields from an object as an array.

```dwl
%dw 2.0
output application/json
---
{
  tagValues: payload.metadata.tags pluck $
}
```

## Derived Fields

```dwl
%dw 2.0
output application/json
---
payload map (order) -> {
  orderId: order.id,
  fullName: order.customer.firstName ++ " " ++ order.customer.lastName,
  isPriority: order.total > 10000,
  region: upper(order.country)
}
```

## Lookups via Inline Map

```dwl
%dw 2.0
output application/json
var statusMap = {
  "1": "Active",
  "2": "On Stop",
  "3": "Closed"
}
---
payload map (customer) -> {
  id: customer.id,
  statusLabel: statusMap[customer.statusCode] default "Unknown"
}
```

## Sorting

```dwl
%dw 2.0
output application/json
---
payload orderBy $.createdDate
```

Reverse order:
```dwl
payload orderBy -($.createdDate as Number)
```

## Distinct

```dwl
%dw 2.0
output application/json
---
payload distinctBy $.email
```

## BDR-Specific: NS Customer → SF Account

```dwl
%dw 2.0
output application/json
var onStopTriggers = ["CUSTOMER-ACCOUNT ON STOP", "CUSTOMER-SUSPENDED", "CUSTOMER-DEBT COLLECTION"]

fun isOnStop(status) = status in onStopTriggers
---
payload map (customer) -> {
  NetSuite_Internal_ID__c: customer.internalId,
  On_Stop__c: isOnStop(customer.entityStatus.name default ""),
  On_Stop_Status__c: customer.entityStatus.name default "",
  Name: customer.companyName default "Unknown"
}
```
