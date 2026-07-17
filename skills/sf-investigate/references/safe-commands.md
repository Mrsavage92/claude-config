# Safe command palette (read-only only)

Every command here is describe/query/retrieve. None of them write. This is the entire allowed
surface for this skill - if a step needs something not on this list, stop and ask rather than
improvise a write-capable command.

Org aliases already authenticated on this machine: `bdr-prod`, `bdr-uat`, `bdr-sandbox`.

## Record + object lookup

```powershell
# Single record by Id, any object
sf data get record --sobject <Object> --record-id <Id> --target-org <alias>

# SOQL query
sf data query --target-org <alias> --query "SELECT Id, Name, ... FROM <Object> WHERE ..."

# Full object describe (fields, types, picklists, relationships)
sf sobject describe --sobject <Object> --target-org <alias> --json
```

## Permissions bearing on the user who hit the issue

```powershell
sf data query --target-org <alias> --query "SELECT PermissionSet.Name, SObjectType, PermissionsRead, PermissionsEdit, PermissionsCreate, PermissionsDelete FROM ObjectPermissions WHERE Parent.Id IN (SELECT PermissionSetId FROM PermissionSetAssignment WHERE AssigneeId = '<UserId>')"

sf data query --target-org <alias> --query "SELECT Field, PermissionsRead, PermissionsEdit FROM FieldPermissions WHERE Parent.Id IN (SELECT PermissionSetId FROM PermissionSetAssignment WHERE AssigneeId = '<UserId>') AND SobjectType = '<Object>'"
```

## Setup Audit Trail - "what changed and when" (NOT in the snapshot repo yet)

```powershell
sf data query --target-org <alias> --use-tooling-api --query "SELECT Action, Section, CreatedDate, CreatedBy.Name, Display FROM SetupAuditTrail ORDER BY CreatedDate DESC LIMIT 50"
```

Narrow by date once you know the incident window:
```powershell
--query "SELECT Action, Section, CreatedDate, CreatedBy.Name, Display FROM SetupAuditTrail WHERE CreatedDate >= 2026-07-10T00:00:00Z ORDER BY CreatedDate DESC"
```

## Recent deployments

```powershell
sf data query --target-org <alias> --use-tooling-api --query "SELECT Id, Status, StartDate, CompletedDate, CreatedBy.Name FROM DeployRequest ORDER BY CreatedDate DESC LIMIT 20"
```

## Field history (only where History tracking is enabled - check first, don't assume)

```powershell
sf data query --target-org <alias> --query "SELECT Field, OldValue, NewValue, CreatedDate, CreatedBy.Name FROM <Object>History WHERE <Object>Id = '<Id>' ORDER BY CreatedDate DESC"
```

## Approval history (only where an Approval Process exists on the object)

```powershell
sf data query --target-org <alias> --query "SELECT TargetObjectId, Status, StepStatus, CreatedDate, ActorId FROM ProcessInstance, ProcessInstanceStep WHERE TargetObjectId = '<Id>'"
```

## Live Apex/Flow/component source (to diff logic, since the snapshot repo only has name+status)

```powershell
# Pull into a scratch dir, never the live project source
sf project retrieve start --metadata ApexClass:<ClassName> --target-org <alias> --output-dir <scratch-path>
sf project retrieve start --metadata Flow:<FlowApiName> --target-org <alias> --output-dir <scratch-path>
```

Retrieve is read-only from the org's perspective (it copies out, nothing is written back). Never
follow a retrieve with a deploy in the same investigation.

## Flows / validation rules / named credentials inventory

```powershell
sf data query --target-org <alias> --query "SELECT ApiName, Label, ProcessType, TriggerType, TriggerObjectOrEventLabel, IsActive FROM FlowDefinitionView WHERE TriggerObjectOrEventLabel = '<Object>'"

sf data query --target-org <alias> --use-tooling-api --query "SELECT EntityDefinition.QualifiedApiName, ValidationName, Active, ErrorMessage FROM ValidationRule WHERE EntityDefinition.QualifiedApiName = '<Object>'"
```

## Explicitly forbidden - never run these from this skill

- `sf project deploy start` / `sf project deploy validate` (this skill retrieves, never deploys)
- `sf data create record` / `sf data update record` / `sf data delete record`
- Anything against `SetupAuditTrail` or `DeployRequest` with a write verb (there isn't one - these
  objects are read-only in Salesforce too, but the reminder stands)
- Any command touching Named Credential / External Credential secret values (endpoint + auth type
  only, per the extraction script's existing redaction policy)
