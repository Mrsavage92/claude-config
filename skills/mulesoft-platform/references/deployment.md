# Deploying to Anypoint Platform

## Deploy Methods

| Method | When |
|---|---|
| Anypoint Code Builder / Studio | Dev iteration — deploy Design environment |
| Anypoint Platform UI | Manual prod deploys |
| Maven `mule-maven-plugin` | CI/CD pipelines |
| Runtime Manager CLI (`anypoint-cli-v4`) | Scripted deploys |

## Method 1: Anypoint Code Builder / Studio

### From VS Code Anypoint Code Builder

1. Right-click project → **Deploy to CloudHub**
2. Select environment (Design / Sandbox / Production)
3. Configure properties (env name, vCores, region)
4. Click Deploy
5. Wait for status → Runtime Manager opens with the app

### From Anypoint Studio

1. Right-click project → **Anypoint Platform → Deploy to CloudHub**
2. Same options

## Method 2: Platform UI Manual Deploy

For uploading a pre-built `.jar` artifact.

1. Runtime Manager → select environment → **Deploy Application**
2. Upload the `.jar` (from `target/` folder after `mvn package`)
3. Configure:
   - Application name (becomes part of URL)
   - Runtime version (match pom.xml `app.runtime`)
   - Worker size (0.1 / 0.2 / 1 / 2 vCores)
   - Number of workers (1 for most apps, 2+ for HA)
   - Region (EU1 for BDR)
   - Environment properties (e.g. `env=sandbox`)
4. Click Deploy → monitor progress

## Method 3: Maven Deploy

### pom.xml config

```xml
<plugin>
  <groupId>org.mule.tools.maven</groupId>
  <artifactId>mule-maven-plugin</artifactId>
  <version>${mule.maven.plugin.version}</version>
  <extensions>true</extensions>
  <configuration>
    <cloudHubDeployment>
      <uri>https://eu1.anypoint.mulesoft.com</uri>
      <muleVersion>${app.runtime}</muleVersion>
      <username>${anypoint.username}</username>
      <password>${anypoint.password}</password>
      <environment>${anypoint.env}</environment>
      <applicationName>${project.artifactId}</applicationName>
      <region>eu-west-1</region>
      <workers>1</workers>
      <workerType>MICRO</workerType>  <!-- 0.1 vCore -->
      <properties>
        <env>${anypoint.env}</env>
      </properties>
    </cloudHubDeployment>
  </configuration>
</plugin>
```

### Deploy command

```bash
mvn clean deploy -DmuleDeploy \
  -Danypoint.username=$AP_USER \
  -Danypoint.password=$AP_PASS \
  -Danypoint.env=Sandbox
```

### With Connected App credentials (preferred over user/pass)

```xml
<cloudHubDeployment>
  ...
  <connectedAppClientId>${connected.app.client_id}</connectedAppClientId>
  <connectedAppClientSecret>${connected.app.client_secret}</connectedAppClientSecret>
  <connectedAppGrantType>client_credentials</connectedAppGrantType>
</cloudHubDeployment>
```

Create a Connected App in Access Management → Connected Apps for CI/CD use.

## Method 4: Anypoint CLI

```bash
# Install
npm install -g anypoint-cli-v4

# Login
anypoint-cli-v4 conf username $AP_USER
anypoint-cli-v4 conf password $AP_PASS

# Deploy
anypoint-cli-v4 runtime-mgr cloudhub-application deploy \
  --runtime 4.11.2 \
  --workers 1 \
  --workerSize 0.1 \
  --region eu-west-1 \
  --environment Sandbox \
  bdr-integrations \
  target/bdr-integrations-1.0.0-SNAPSHOT-mule-application.jar
```

## Worker Sizing Guide

| Size | vCore | Memory | Use |
|---|---|---|---|
| MICRO | 0.1 | 500MB | Dev, very light workloads |
| SMALL | 0.2 | 1GB | Standard integrations |
| MEDIUM | 1 | 1.5GB | Production default |
| LARGE | 2 | 3.5GB | High throughput |
| XLARGE | 4 | 7.5GB | Batch-heavy, large datasets |

**BDR Phase 1 (Account Suspension):** 0.2 vCore SMALL is sufficient — 15 min polling, low record volume.

## Deploy Flow Checklist

Before deploying to any environment:

- [ ] `mvn clean package` builds successfully
- [ ] All tests pass (`mvn test`)
- [ ] Credentials exist in Secrets Manager for that environment
- [ ] Target environment is correct (not deploying Sandbox app to Prod)
- [ ] Previous version tagged in Git for rollback
- [ ] Runtime Manager alerts configured (production)
- [ ] Stakeholders notified (production)

## Deploy Sequence (BDR Phase 1)

1. **Design env (Dev):**
   - Deploy from VS Code Anypoint Code Builder
   - Manual testing against NS sandbox
   - Iterate until working

2. **Sandbox env (UAT):**
   - `mvn clean deploy -DmuleDeploy -Danypoint.env=Sandbox`
   - Ben / Anil / Julie run UAT test cases
   - Fix any issues → redeploy to Sandbox
   - Get written sign-off

3. **Production env:**
   - Pre-deploy: upgrade auth to JWT (SF)
   - Confirm production Secrets Manager populated
   - Tag git: `git tag v1.0.0 && git push origin v1.0.0`
   - `mvn clean deploy -DmuleDeploy -Danypoint.env=Production`
   - Smoke test with low-risk account
   - Configure Runtime Manager alerts
   - Notify stakeholders

## Rollback Procedure

If production deploy goes wrong:

1. Runtime Manager → select app → **History** tab
2. Find previous working version
3. Click **Promote** or **Redeploy**
4. Verify app status = Running
5. Smoke test
6. Investigate failure offline, fix in Design env, re-promote

## Zero-Downtime Deploys

For production apps that can't tolerate downtime:

- Deploy with **2+ workers** — rolling update replaces one at a time
- Use **Promote** instead of Redeploy for config-only changes (no code)
- For major changes: blue/green — deploy v2 alongside v1, switch traffic, retire v1

## Deploy Failure Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "Artifact not found" | `.jar` not in target | Run `mvn package` first |
| "Environment not found" | Wrong env name | Check exact spelling (case-sensitive) |
| "Worker not available" | vCore quota exceeded | Reduce worker size or request more vCores |
| "Configuration property not found" | Missing `${env}` | Pass `-Denv=<envname>` at deploy time |
| App stuck "Starting" | Config error or dep issue | Check Runtime Manager logs immediately |
