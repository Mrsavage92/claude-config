# Date and Time

DataWeave has rich date/time support. Always be explicit about timezone.

## Types

| Type | Example | Purpose |
|---|---|---|
| `Date` | `|2026-04-17|` | Calendar date only |
| `Time` | `|14:30:00|` | Time of day only |
| `LocalDateTime` | `|2026-04-17T14:30:00|` | Date + time, no TZ |
| `DateTime` | `|2026-04-17T14:30:00Z|` | Date + time + TZ |
| `TimeZone` | `|Z|` or `|+01:00|` | Timezone offset |
| `Period` | `|PT1H|` | Duration (1 hour) |

## Current Time

```dwl
now()              // current DateTime in UTC
today()            // current Date (no time)
```

## Literals

```dwl
|2026-04-17|                          // Date
|14:30:00|                            // Time
|2026-04-17T14:30:00|                 // LocalDateTime
|2026-04-17T14:30:00Z|                // DateTime UTC
|2026-04-17T14:30:00+01:00|           // DateTime with offset
|P1Y2M3D|                             // Period (1 year, 2 months, 3 days)
|PT1H30M|                             // Duration (1h 30m)
```

## Parsing Strings

```dwl
"2026-04-17" as Date
"2026-04-17T14:30:00Z" as DateTime
"17/04/2026" as Date {format: "dd/MM/yyyy"}
"April 17, 2026" as Date {format: "MMMM d, yyyy"}
```

## Formatting

```dwl
now() as String {format: "yyyy-MM-dd'T'HH:mm:ss.SSSZ"}
now() as String {format: "dd/MM/yyyy"}
now() as String {format: "yyyy-MM-dd HH:mm:ss", timezone: "Europe/London"}
```

## Arithmetic

```dwl
now() + |P1D|                         // tomorrow
now() - |P7D|                         // 7 days ago
now() + |PT2H|                        // 2 hours from now
|2026-04-17| + |P1M|                  // 17 May 2026
```

## Comparison

```dwl
now() > |2026-01-01T00:00:00Z|        // true
|2026-04-17| < |2026-05-01|           // true
```

## Extracting Components

```dwl
{
  year: now().year,
  month: now().month,
  day: now().day,
  hour: now().hour,
  minute: now().minute,
  dayOfWeek: now().dayOfWeek,          // MONDAY..SUNDAY
  dayOfYear: now().dayOfYear           // 1..365
}
```

## Timezone Conversion

```dwl
// From UTC to London
(|2026-04-17T14:30:00Z|) >> "Europe/London"

// Strip timezone (keep local time value)
|2026-04-17T14:30:00+01:00| as LocalDateTime
```

## Epoch Conversion

```dwl
// DateTime to epoch seconds
(now() as Number) / 1000

// Epoch seconds to DateTime
(1745678400 * 1000) as DateTime
```

## Watermark Patterns

### Format NS-compatible timestamp

```dwl
%dw 2.0
output application/json
---
{
  searchFilter: {
    fieldName: "lastModifiedDate",
    operator: "after",
    searchValue: vars.lastWatermark as String {format: "yyyy-MM-dd'T'HH:mm:ss'Z'"}
  }
}
```

### Format SF SOQL timestamp

```dwl
// SOQL needs: 2026-04-17T14:30:00Z (ISO 8601)
vars.lastWatermark as String {format: "yyyy-MM-dd'T'HH:mm:ss'Z'"}
```

## Common Pitfalls

### Timezone drift between systems

Always store watermarks in UTC. Convert to local time only at the display layer.

```dwl
// CORRECT: store in UTC
<os:store key="watermark" value="#[now() as DateTime]" />

// WRONG: stores in local time, breaks if runtime TZ changes
<os:store key="watermark" value="#[now() as String {format: 'yyyy-MM-dd HH:mm:ss'}]" />
```

### Date-only vs DateTime comparison

```dwl
// This fails — comparing Date with DateTime
|2026-04-17| > now()     // ERROR

// Correct — coerce both to same type
|2026-04-17T00:00:00Z| > now()
// OR
|2026-04-17| > today()
```

### NetSuite date format

NS typically returns dates in `yyyy-MM-dd'T'HH:mm:ss.SSS'Z'` format. When writing back to NS, format matching.

### Salesforce date format

SF SOQL needs `yyyy-MM-dd'T'HH:mm:ss'Z'` format (no milliseconds).

## Period/Duration Calculations

```dwl
// Difference between two dates
var daysBetween = (
  now().year * 365 + now().dayOfYear
) - (
  |2026-01-01T00:00:00Z|.year * 365 + |2026-01-01T00:00:00Z|.dayOfYear
)

// Or use built-in for cleaner approach:
dw::core::Dates::daysBetween(|2026-01-01|, today())
```
