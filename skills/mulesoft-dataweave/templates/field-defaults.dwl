%dw 2.0
output application/json skipNullOn="everywhere"

// Defensive field mapping template
// Handles: null payload, missing nested objects, null fields, type coercion

---
(payload default []) map (record) -> {
  // Primitive with default
  id: record.id default "",
  name: record.name default "Unknown",

  // Explicit type coercion with default
  amount: (record.amount default "0") as Number,
  createdDate: record.createdDate default now(),

  // Safe navigation for nested
  city: record.address?.city default null,
  country: record.address?.country default "UK",

  // Conditional inclusion (only if present)
  (email: record.email) if record.email != null,
  (phone: record.phone) if record.phone != null,

  // Derived field with null-safety
  fullName: (record.firstName default "") ++ " " ++ (record.lastName default ""),

  // Boolean with explicit check
  isActive: record.status == "ACTIVE",

  // Audit
  syncedAt: now() as String
}
