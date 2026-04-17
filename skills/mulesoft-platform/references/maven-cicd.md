# Maven Build & CI/CD

## Standard pom.xml Structure

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <groupId>uk.co.bdrgroup.integrations</groupId>
  <artifactId>bdr-integrations</artifactId>
  <version>1.0.0-SNAPSHOT</version>
  <packaging>mule-application</packaging>

  <properties>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <app.runtime>4.11.2</app.runtime>
    <mule.maven.plugin.version>4.7.0</mule.maven.plugin.version>
    <munit.version>3.4.0</munit.version>
  </properties>

  <build>
    <plugins>
      <!-- Mule Maven Plugin: package + deploy -->
      <plugin>
        <groupId>org.mule.tools.maven</groupId>
        <artifactId>mule-maven-plugin</artifactId>
        <version>${mule.maven.plugin.version}</version>
        <extensions>true</extensions>
        <configuration>
          <cloudHubDeployment>
            <uri>https://eu1.anypoint.mulesoft.com</uri>
            <muleVersion>${app.runtime}</muleVersion>
            <environment>${anypoint.env}</environment>
            <applicationName>${project.artifactId}-${anypoint.env}</applicationName>
            <region>eu-west-1</region>
            <workers>1</workers>
            <workerType>SMALL</workerType>
            <properties>
              <env>${anypoint.env}</env>
            </properties>
            <connectedAppClientId>${connected.app.client_id}</connectedAppClientId>
            <connectedAppClientSecret>${connected.app.client_secret}</connectedAppClientSecret>
            <connectedAppGrantType>client_credentials</connectedAppGrantType>
          </cloudHubDeployment>
        </configuration>
      </plugin>

      <!-- MUnit: testing framework -->
      <plugin>
        <groupId>com.mulesoft.munit.tools</groupId>
        <artifactId>munit-maven-plugin</artifactId>
        <version>${munit.version}</version>
        <executions>
          <execution>
            <id>test</id>
            <phase>test</phase>
            <goals>
              <goal>test</goal>
            </goals>
          </execution>
        </executions>
      </plugin>
    </plugins>
  </build>

  <repositories>
    <repository>
      <id>anypoint-exchange-v3</id>
      <url>https://maven.eu1.anypoint.mulesoft.com/api/v3/maven</url>
    </repository>
    <repository>
      <id>mulesoft-releases</id>
      <url>https://repository.mulesoft.org/releases/</url>
    </repository>
  </repositories>

  <dependencies>
    <!-- connectors, MUnit, etc. -->
  </dependencies>
</project>
```

## Maven Settings (~/.m2/settings.xml)

For Anypoint Exchange authentication:

```xml
<settings>
  <servers>
    <server>
      <id>anypoint-exchange-v3</id>
      <username>${env.ANYPOINT_USERNAME}</username>
      <password>${env.ANYPOINT_PASSWORD}</password>
    </server>
  </servers>
</settings>
```

Or use Connected App credentials:

```xml
<server>
  <id>anypoint-exchange-v3</id>
  <username>~~~Client~~~</username>
  <password>${env.ANYPOINT_CLIENT_ID}~?~${env.ANYPOINT_CLIENT_SECRET}</password>
</server>
```

## Common Maven Commands

```bash
# Build
mvn clean package

# Run tests
mvn test

# Deploy to Anypoint
mvn clean deploy -DmuleDeploy -Danypoint.env=Sandbox

# Skip tests (don't do this in CI)
mvn clean deploy -DmuleDeploy -DskipTests=true

# Package only, with specific runtime
mvn clean package -Dapp.runtime=4.11.2
```

## GitHub Actions CI/CD Pipeline

`.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy MuleSoft App

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'Sandbox'
        type: choice
        options:
          - Design
          - Sandbox
          - Production

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Cache Maven
        uses: actions/cache@v4
        with:
          path: ~/.m2/repository
          key: ${{ runner.os }}-maven-${{ hashFiles('**/pom.xml') }}

      - name: Build and test
        run: mvn clean test
        env:
          ANYPOINT_USERNAME: ${{ secrets.ANYPOINT_USERNAME }}
          ANYPOINT_PASSWORD: ${{ secrets.ANYPOINT_PASSWORD }}

  deploy-sandbox:
    needs: build-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: Sandbox
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Deploy to Sandbox
        run: |
          mvn clean deploy -DmuleDeploy \
            -Danypoint.env=Sandbox \
            -Dconnected.app.client_id=$AP_CLIENT_ID \
            -Dconnected.app.client_secret=$AP_CLIENT_SECRET
        env:
          AP_CLIENT_ID: ${{ secrets.ANYPOINT_CLIENT_ID }}
          AP_CLIENT_SECRET: ${{ secrets.ANYPOINT_CLIENT_SECRET }}

  deploy-production:
    needs: deploy-sandbox
    if: startsWith(github.ref, 'refs/tags/v')
    runs-on: ubuntu-latest
    environment: Production     # GitHub env with manual approval gate
    steps:
      - uses: actions/checkout@v4

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Deploy to Production
        run: |
          mvn clean deploy -DmuleDeploy \
            -Danypoint.env=Production \
            -Dconnected.app.client_id=$AP_CLIENT_ID \
            -Dconnected.app.client_secret=$AP_CLIENT_SECRET
        env:
          AP_CLIENT_ID: ${{ secrets.ANYPOINT_CLIENT_ID }}
          AP_CLIENT_SECRET: ${{ secrets.ANYPOINT_CLIENT_SECRET }}
```

## Connected App for CI/CD

Create in Anypoint Platform for machine-to-machine auth:

1. Access Management → **Connected Apps** → **Create App**
2. Type: **App acts on its own behalf (client credentials)**
3. Name: `BDR-CICD-Deploy`
4. Scopes needed:
   - `Runtime Manager: Manage Applications` (for each env)
   - `Secrets Manager: Read` (for each env)
5. Save → Copy Client ID + Client Secret
6. Store in GitHub Secrets: `ANYPOINT_CLIENT_ID`, `ANYPOINT_CLIENT_SECRET`

## GitHub Environment Protection

For `Production` environment in GitHub:
- Require manual approval before deploy
- Restrict to protected branches (main only)
- Require specific reviewers

Settings → Environments → Production → Protection rules.

## MUnit Testing

Example test for a flow:

```xml
<munit:config name="netsuite-to-sf-onstop-test.xml" />

<munit:test name="test-upsert-with-onstop-status">
  <munit:behavior>
    <munit:mock-when processor="salesforce:upsert">
      <munit:then-return>
        <munit:payload value="#[[{Id: 'a0A1234567ABCDEF', Success: true}]]" />
      </munit:then-return>
    </munit:mock-when>
  </munit:behavior>

  <munit:execution>
    <flow-ref name="netsuite-to-sf-onstop-sync" />
  </munit:execution>

  <munit:validation>
    <munit-tools:assert-that
      expression="#[payload[0].Success]"
      is="#[MunitTools::equalTo(true)]" />
  </munit:validation>
</munit:test>
```

Run: `mvn test` (runs all MUnit tests).

## Artifact Repository

For cross-team reuse:

1. Package as library: `<packaging>mule-plugin</packaging>` or `mule-domain`
2. Deploy to Exchange: `mvn deploy -DaltDeploymentRepository=anypoint-exchange-v3`
3. Other projects depend on it via normal Maven dep

## Build Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "Cannot resolve dependency" | Anypoint repo auth wrong | Check settings.xml credentials |
| "Plugin not found" | Version mismatch | Check `mule.maven.plugin.version` matches Runtime |
| Tests fail locally but pass in CI | Environment differences | Check for hardcoded local paths |
| Deploy times out | Large artifact or slow network | Increase timeout in plugin config |
