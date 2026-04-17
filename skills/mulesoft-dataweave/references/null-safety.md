# Null Safety

Nulls crash integrations. Always plan for them.

## The `default` Operator

Returns the default if the left side is null.

```dwl
payload.firstName default "Unknown"
payload.age default 0
payload.tags default []
```

Chain-able:

```dwl
payload.preferred default payload.fallback default "no-value"
```

## The `?` Safe Navigation

Returns `null` if any part of the path is null, instead of throwing.

```dwl
payload.address?.city             // null if address is null
payload.customer?.billing?.email  // null if anywhere in chain is null
```

Combine with `default`:

```dwl
payload.address?.city default "Unknown"
```

## Removing Null Values from Objects

```dwl
// Input: { id: 1, name: "Bob", email: null, phone: null }
// Desired: { id: 1, name: "Bob" }

%dw 2.0
output application/json skipNullOn="everywhere"
---
payload
```

Or manually:

```dwl
payload -- [null, ""]   // removes all null and empty string values
```

## Checking Types Before Access

```dwl
if (payload.data is Array) payload.data map ($.id) else []

if (payload.config is Object) payload.config.url default "" else ""
```

## Filter Out Null Values

```dwl
payload filter ($.email != null)
```

## Null-Safe Array Access

```dwl
payload.items[0] default {}         // first item or empty object
payload.items[-1] default {}        // last item or empty
sizeOf(payload.items default [])    // 0 if null
```

## `isEmpty` vs null check

| Check | What |
|---|---|
| `value is Null` | true only for exact null |
| `isEmpty(value)` | true for null, empty string, empty collection |
| `value == null` | true only for exact null |

For defensive programming:
```dwl
if (!isEmpty(payload.email)) {
  email: payload.email
} else {
  email: "noreply@example.com"
}
```

## Null Coalescing with Multiple Fallbacks

```dwl
// Prefer primary email, fall back to secondary, then empty
payload.primaryEmail default payload.secondaryEmail default ""
```

## Type Coercion with Null Safety

```dwl
// If field might be string or null, default before coercing
(payload.age default "0") as Number

// Or use orElse:
try(() -> payload.age as Number) orElse 0
```

## Handling Missing Nested Objects

```dwl
// If payload might not have address at all
{
  street: payload.address?.street default "",
  city: payload.address?.city default "",
  country: payload.address?.country default "UK"
}
```

## Null in Collections

```dwl
// Input: [1, null, 2, null, 3]
// Remove nulls:
payload filter ($ != null)
```

## SkipNullOn Output Directive

```dwl
%dw 2.0
output application/json skipNullOn="everywhere"
---
{
  id: 1,
  name: "Bob",
  email: null,      // will be omitted from output
  phone: null       // will be omitted from output
}

// Output: { "id": 1, "name": "Bob" }
```

Options:
- `skipNullOn="arrays"` — skip null array elements only
- `skipNullOn="objects"` — skip null object fields only
- `skipNullOn="everywhere"` — both

## Defensive Mapping Pattern

```dwl
%dw 2.0
output application/json skipNullOn="everywhere"
---
payload default [] map (customer) -> {
  id: customer.internalId default "",
  name: customer.companyName default "Unknown Customer",
  email: customer.email default null,
  status: customer.entityStatus?.name default "Unknown",
  lastModified: customer.lastModifiedDate default now() as String
}
```

This pattern:
- Handles null `payload` (defaults to empty array)
- Provides defaults for all primitive fields
- Uses safe navigation for nested fields
- Lets `skipNullOn` clean up remaining nulls from output
