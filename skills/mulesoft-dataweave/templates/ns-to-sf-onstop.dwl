%dw 2.0
output application/json

// BDR Phase 1A: NetSuite Customer → Salesforce Account On Stop mapping
// Source: NetSuite Saved Search result (list of Customer records)
// Target: Salesforce Account upsert payload (external ID = NetSuite_Internal_ID__c)

// Trigger values — TO BE CONFIRMED BY JULIE before go-live
var onStopTriggers = [
  "CUSTOMER-ACCOUNT ON STOP",
  "CUSTOMER-SUSPENDED",
  "CUSTOMER-DEBT COLLECTION"
]

fun isOnStop(status) = status in onStopTriggers

---
payload map (customer) -> {
  NetSuite_Internal_ID__c: customer.internalId,
  On_Stop__c: isOnStop(customer.entityStatus.name default ""),
  On_Stop_Status__c: customer.entityStatus.name default ""
}
