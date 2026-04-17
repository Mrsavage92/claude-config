# Collection Operations

## map — Transform each element

```dwl
[1, 2, 3] map ($ * 2)
// Result: [2, 4, 6]

["a", "b", "c"] map ((item, index) -> index ++ ":" ++ item)
// Result: ["0:a", "1:b", "2:c"]
```

## filter — Keep matching elements

```dwl
[1, 2, 3, 4, 5] filter ($ > 2)
// Result: [3, 4, 5]

payload filter ($.status == "active" and $.country == "UK")
```

## reduce — Aggregate to single value

```dwl
[1, 2, 3, 4] reduce ($$ + $)
// Result: 10 (sum)

// With explicit accumulator:
payload reduce ((item, acc = 0) -> acc + item.amount)

// Build an object:
[{k: "a", v: 1}, {k: "b", v: 2}] reduce ((item, acc = {}) -> acc ++ {(item.k): item.v})
// Result: {a: 1, b: 2}
```

`$` = current item, `$$` = accumulator.

## flatten — Unnest one level

```dwl
flatten([[1, 2], [3, 4], [5]])
// Result: [1, 2, 3, 4, 5]
```

## distinctBy — Remove duplicates by key

```dwl
[{id: 1}, {id: 2}, {id: 1}] distinctBy $.id
// Result: [{id: 1}, {id: 2}]
```

## groupBy — Group by key

```dwl
[{region: "UK"}, {region: "EU"}, {region: "UK"}] groupBy $.region
// Result: {UK: [...], EU: [...]}
```

## partition — Split by condition

```dwl
[1, 2, 3, 4] partition ($ > 2)
// Result: {success: [3, 4], failure: [1, 2]}
```

## orderBy — Sort

```dwl
payload orderBy $.created                   // ascending
payload orderBy -($.created as Number)      // descending
payload orderBy [$.priority, $.date]        // multiple keys
```

## take / drop — Slice

```dwl
[1, 2, 3, 4, 5] take 3
// Result: [1, 2, 3]

[1, 2, 3, 4, 5] drop 2
// Result: [3, 4, 5]

// First 3, then skip
(payload take 3) drop 1
```

## sizeOf — Length

```dwl
sizeOf([1, 2, 3])         // 3
sizeOf("hello")           // 5
sizeOf({a: 1, b: 2})      // 2
sizeOf(null)              // 0
```

## contains / in

```dwl
[1, 2, 3] contains 2                   // true
"UK" in ["UK", "EU", "US"]             // true
```

## some / every

```dwl
[1, 2, 3] some ($ > 2)                 // true (at least one)
[1, 2, 3] every ($ > 0)                // true (all of them)
```

## indexOf

```dwl
indexOf(["a", "b", "c"], "b")          // 1
indexOf(payload, payload firstWith ($.id == 42))
```

## firstWith / lastWith

```dwl
payload firstWith ($.status == "active")
payload lastWith ($.created < |2026-01-01|)
```

## zip — Combine two collections

```dwl
[1, 2, 3] zip ["a", "b", "c"]
// Result: [[1, "a"], [2, "b"], [3, "c"]]
```

## mapObject — Transform object keys/values

```dwl
{a: 1, b: 2, c: 3} mapObject ((value, key) -> { (key ++ "_x"): value * 10 })
// Result: {a_x: 10, b_x: 20, c_x: 30}
```

## pluck — Extract as array

```dwl
{a: 1, b: 2, c: 3} pluck $
// Result: [1, 2, 3]

{a: 1, b: 2} pluck {key: $$, value: $}
// Result: [{key: "a", value: 1}, {key: "b", value: 2}]
```

## Common Compound Patterns

### Filter + Map + Limit

```dwl
payload
  filter ($.status == "active")
  map ((customer) -> {id: customer.id, name: customer.name})
  take 100
```

### Group + Aggregate

```dwl
var grouped = payload groupBy $.region
---
grouped mapObject ((records, region) -> {
  (region): {
    count: sizeOf(records),
    total: records reduce ((item, acc = 0) -> acc + item.amount)
  }
})
```

### Split Collection into Chunks

```dwl
var chunkSize = 100
---
(0 to ((sizeOf(payload) - 1) div chunkSize)) map (i) -> (
  payload[(i * chunkSize) to ((i * chunkSize) + chunkSize - 1)]
)
```

### Deduplication + Count

```dwl
{
  uniqueEmails: (payload pluck $.email) distinctBy $,
  duplicateCount: sizeOf(payload) - sizeOf((payload pluck $.email) distinctBy $)
}
```

### Join Two Datasets

```dwl
%dw 2.0
output application/json
var customersById = vars.sfCustomers groupBy $.Id
---
payload map (nsOrder) -> {
  orderId: nsOrder.id,
  customerName: customersById[nsOrder.customerId]?[0].Name default "Unknown"
}
```
