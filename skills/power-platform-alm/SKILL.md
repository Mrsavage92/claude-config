---
name: power-platform-alm
description: >
  Expert guidance for Power Platform Application Lifecycle Management (ALM) - solutions,
  environment strategy, CI/CD, and governance. Use this skill whenever the user mentions
  Power Platform ALM, solutions, managed vs unmanaged, solution layers, environment variables,
  connection references, solution transport, deployment pipelines, Power Platform Build Tools,
  Azure DevOps for Power Platform, GitHub Actions for Power Platform, or any question about
  promoting changes between environments. Also trigger for questions about solution
  segmentation, publisher strategy, patch solutions, upgrade vs stage-for-upgrade, managed
  properties, or Power Platform tenant governance. Trigger even for "how do I move my app
  from dev to prod", "should this be managed or unmanaged", or "how do I set up CI/CD for
  Power Platform". Always use this over generic DevOps advice when Power Platform is involved.
---

# Power Platform ALM

Expert-level guidance for Application Lifecycle Management across the Power Platform -
covering solutions, environment strategy, CI/CD pipelines, and governance.

---

## Why ALM Matters

Without ALM, Power Platform becomes a mess of unmanaged customisations that can't be
reliably promoted between environments, can't be rolled back, and can't be audited. ALM
isn't overhead - it's what separates production-grade deployments from prototyping.

---

## Solutions 101

### What is a Solution?

A solution is a container that holds Power Platform components (tables, apps, flows,
security roles, web resources, etc.). It's the unit of deployment and the mechanism for
moving changes between environments.

### Managed vs Unmanaged

| Aspect | Unmanaged | Managed |
|---|---|---|
| Where used | Development environment | Test, UAT, Production |
| Editable? | Yes - components can be modified | No - locked down, read-only |
| Removable? | Components stay after solution delete | Clean removal - all components removed |
| Layering | Bottom of the stack | Stacks on top of other layers |
| Purpose | Active development workspace | Deployed artifact |

**Rule**: develop in unmanaged, deploy as managed. Never deploy unmanaged to production.

### Solution Layers

Dataverse uses a layering system to resolve conflicts when multiple solutions touch the
same component. The resolution order (highest priority first):

1. Active customisations (unmanaged changes on top)
2. Most recently imported managed solution
3. Earlier managed solutions
4. System defaults (base layer)

This is why you can get "phantom" behaviour - an unmanaged customisation in a downstream
environment can override your managed solution import. Always check the solution layers
panel on a component if behaviour doesn't match expectations.

---

## Publisher Strategy

Every solution needs a publisher. The publisher defines:
- **Prefix** - prepended to every custom component (e.g., `bdr_`)
- **Option value prefix** - for choice values

Rules:
- Create ONE publisher for your organisation and reuse it across all solutions
- Pick a short, meaningful prefix (3-5 chars): `bdr_`, `elq_`, not `new_` or `cr123_`
- Never use the default publisher - it uses `new_` which signals "nobody planned this"
- The publisher and prefix are permanent on components - you can't change them later

---

## Solution Segmentation Strategy

Don't put everything in one monolith solution. Segment by concern:

```
bdr-core (shared foundation)
  - Publisher definition
  - Global choice fields
  - Common security roles
  - Shared environment variables

bdr-service (service desk module)
  - Case entity customisations
  - Service-specific flows
  - Service dashboards
  - Service security roles

bdr-sales (sales module)
  - Opportunity customisations
  - Sales flows and approvals
  - Sales dashboards

bdr-integration (integration layer)
  - Connection references
  - Integration-specific environment variables
  - Custom connectors
  - Integration flows
```

Why segment?
- Teams can work on different modules without merge conflicts
- Smaller deployments - update just what changed
- Clearer dependency tracking
- Easier rollback of a specific module

Import order matters: core first (has shared dependencies), then modules, then integration.

---

## Environment Variables

Environment variables store configuration that changes between environments. This replaces
hardcoding URLs, email addresses, thresholds, and feature flags.

Types:
- **Text** - URLs, email addresses, names
- **Number** - thresholds, limits
- **Yes/No** - feature flags
- **JSON** - complex config objects
- **Data source** - connection info for specific connectors

Pattern:
- Define the variable in your solution with a default value (or no default)
- Reference it in Power Automate flows, Power Apps, or plugins
- Set the current value per-environment after importing the managed solution
- Current values are NOT stored in the solution - they're environment-specific

Common variables to create:
- `bdr_AdminNotificationEmail` (who gets error alerts)
- `bdr_IntegrationBaseURL` (API endpoint that differs per environment)
- `bdr_FeatureFlag_NewApprovalFlow` (toggle new features)

---

## Connection References

Connection references abstract the connection away from the flow, so the same flow can
use different credentials in different environments.

How it works:
1. Create a connection reference in your solution (e.g., "BDR Dataverse Connection")
2. Reference it in your flows instead of using personal connections
3. When importing to a new environment, map the connection reference to a live connection
   in that environment (e.g., a service account connection)

Best practice:
- Use **service account** connections for production flows, not individual user accounts
- Create one connection reference per connector type per solution (not per flow)
- Name them clearly: "BDR - Dataverse", "BDR - SharePoint", "BDR - Teams"

---

## CI/CD Pipelines

### Option 1: Power Platform Pipelines (Low-Code)

Built into the Power Platform admin center. Good for teams that don't want full DevOps:

- Define pipeline stages (Dev -> Test -> Prod)
- Deploy solutions via a UI in the maker portal
- Pre/post-deployment validation included
- No YAML or scripting required

Limitations: less flexible, no custom build steps, limited branching support.

### Option 2: Azure DevOps + Power Platform Build Tools

For teams with existing Azure DevOps:

```yaml
# azure-pipelines.yml
trigger:
  branches:
    include:
      - main

pool:
  vmImage: 'windows-latest'

steps:
  - task: PowerPlatformToolInstaller@2
    displayName: 'Install Power Platform Tools'

  - task: PowerPlatformExportSolution@2
    displayName: 'Export Solution from Dev'
    inputs:
      authenticationType: 'PowerPlatformSPN'
      PowerPlatformSPN: 'Dev-ServiceConnection'
      SolutionName: 'BDRService'
      SolutionOutputFile: '$(Build.ArtifactStagingDirectory)/BDRService.zip'
      Managed: true

  - task: PowerPlatformImportSolution@2
    displayName: 'Import to Test'
    inputs:
      authenticationType: 'PowerPlatformSPN'
      PowerPlatformSPN: 'Test-ServiceConnection'
      SolutionInputFile: '$(Build.ArtifactStagingDirectory)/BDRService.zip'
      ConvertToManaged: false  # already managed
```

### Option 3: GitHub Actions + Power Platform CLI

Similar to Azure DevOps but using GitHub:

```yaml
# .github/workflows/deploy.yml
name: Deploy Power Platform Solution
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install PAC CLI
        uses: microsoft/powerplatform-actions/install-pac@v1
      - name: Export from Dev
        uses: microsoft/powerplatform-actions/export-solution@v1
        with:
          environment-url: ${{ secrets.DEV_URL }}
          solution-name: BDRService
          managed: true
          solution-output-file: BDRService_managed.zip
      - name: Import to Test
        uses: microsoft/powerplatform-actions/import-solution@v1
        with:
          environment-url: ${{ secrets.TEST_URL }}
          solution-file: BDRService_managed.zip
```

### Source Control for Solutions

Unpack solutions into source control for version history and diff capability:

```bash
pac solution unpack --zipfile BDRService.zip --folder ./src/BDRService --processCanvasApps
```

This creates a folder structure with individual XML files per component. Commit to Git.
To rebuild:

```bash
pac solution pack --zipfile BDRService.zip --folder ./src/BDRService
```

---

## Deployment Checklist

Before deploying a managed solution to a downstream environment:

1. **Pre-flight**
   - All changes tested in dev by the maker
   - Solution checker run with no critical issues
   - All dependencies included or already present in target
   - Environment variables documented with expected values per environment

2. **Import**
   - Import managed solution (upgrade, not update - see below)
   - Map connection references to target environment connections
   - Set environment variable current values
   - Activate any flows that are off by default

3. **Post-deployment**
   - Verify flows are running (check run history)
   - Test critical paths with real users
   - Confirm security roles are assigned to the right teams
   - Monitor for errors in the first 24-48 hours

### Upgrade vs Update (Stage for Upgrade)

- **Upgrade** (recommended): imports the new version, removes components that were deleted
  from the solution since last version. Clean state.
- **Update/Stage for upgrade**: imports on top without removing old components. Use only
  when you're importing in stages and will apply the upgrade later.

Always prefer upgrade unless you have a specific reason not to.

---

## Governance

### Tenant-Level Controls

- **DLP policies** - control which connectors can be used together
- **Environment creation** - restrict who can create environments (admin only)
- **Managed Environments** - Microsoft's governance feature: usage insights, sharing limits,
  solution checker enforcement
- **Tenant isolation** - control cross-tenant connections

### Environment Types

| Type | Purpose | Who Uses It |
|---|---|---|
| Default | Legacy, avoid for new work | Auto-created, limited governance |
| Developer | Individual maker sandboxes | Makers experimenting |
| Sandbox | Shared dev, test, UAT | Teams building and validating |
| Production | Live business operations | End users |
| Dataverse for Teams | Team-specific, tied to a Teams team | Citizen developers |

### Recommended Minimum Setup

- 1 Production environment (managed solutions only)
- 1 UAT/Test environment (managed solutions for validation)
- 1 Dev environment (unmanaged solutions, active development)
- Optional: per-maker developer environments for experimentation

---

## Common Pitfalls

1. **Unmanaged in production** - the #1 sin. Makes rollback impossible and conflicts inevitable
2. **No connection references** - flows break on import because they're tied to a personal connection
3. **Skipping environment variables** - leads to hardcoded values that are wrong in non-dev environments
4. **One giant solution** - becomes unmergeable and slow to deploy
5. **Not checking solution layers** - "I imported the fix but nothing changed" usually means an
   unmanaged layer is sitting on top overriding the managed change
6. **Default publisher** - `new_` prefix forever stamps your components as unplanned
7. **No source control** - solutions are binary zips without unpacking, so you lose all version history
