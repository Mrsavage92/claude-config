# File, FTP, SFTP Connectors

## File Connector

Local filesystem operations. Rarely used in CloudHub deployments (no persistent local FS) — common in on-prem Mule runtimes.

**Dependency:**
```xml
<dependency>
    <groupId>org.mule.connectors</groupId>
    <artifactId>mule-file-connector</artifactId>
    <version>1.5.3</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

### Config

```xml
<file:config name="File_Config">
  <file:connection workingDir="${file.working_dir}" />
</file:config>
```

### List Directory

```xml
<file:list config-ref="File_Config" directoryPath="inbox">
  <file:matcher filenamePattern="*.csv" />
</file:list>
```

### Read File

```xml
<file:read config-ref="File_Config" path="inbox/orders.csv" />
```

### Write File

```xml
<file:write config-ref="File_Config" path="outbox/processed-{timestamp}.csv" mode="OVERWRITE">
  <file:content>#[payload]</file:content>
</file:write>
```

### Listener (Watch Directory)

```xml
<flow name="fileWatcher">
  <file:listener
    config-ref="File_Config"
    directory="inbox"
    autoDelete="false"
    moveToDirectory="processed"
    recursive="false">
    <scheduling-strategy>
      <fixed-frequency frequency="60000" />
    </scheduling-strategy>
    <file:matcher filenamePattern="*.csv" />
  </file:listener>
  <!-- process -->
</flow>
```

## FTP Connector

**Dependency:**
```xml
<dependency>
    <groupId>org.mule.connectors</groupId>
    <artifactId>mule-ftp-connector</artifactId>
    <version>2.2.1</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

### Config

```xml
<ftp:config name="FTP_Config">
  <ftp:connection
    host="${ftp.host}"
    port="${ftp.port}"
    username="${ftp.username}"
    password="${ftp.password}"
    workingDir="${ftp.working_dir}" />
</ftp:config>
```

### Listener

```xml
<flow name="ftpPoller">
  <ftp:listener
    config-ref="FTP_Config"
    directory="incoming"
    autoDelete="false"
    moveToDirectory="archive">
    <scheduling-strategy>
      <fixed-frequency frequency="300000" /> <!-- 5 min -->
    </scheduling-strategy>
    <ftp:matcher filenamePattern="*.csv" />
  </ftp:listener>
  <!-- process -->
</flow>
```

## SFTP Connector (preferred for B2B)

**Dependency:**
```xml
<dependency>
    <groupId>org.mule.connectors</groupId>
    <artifactId>mule-sftp-connector</artifactId>
    <version>3.1.0</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

### Password Auth

```xml
<sftp:config name="SFTP_Config">
  <sftp:connection
    host="${sftp.host}"
    port="${sftp.port}"
    username="${sftp.username}"
    password="${sftp.password}"
    workingDir="${sftp.working_dir}" />
</sftp:config>
```

### SSH Key Auth (Recommended)

```xml
<sftp:config name="SFTP_Key_Config">
  <sftp:connection
    host="${sftp.host}"
    port="${sftp.port}"
    username="${sftp.username}"
    identityFile="${sftp.private_key_path}"
    passphrase="${sftp.key_passphrase}" />
</sftp:config>
```

### Common Operations

```xml
<!-- List -->
<sftp:list config-ref="SFTP_Config" directoryPath="inbox" />

<!-- Read -->
<sftp:read config-ref="SFTP_Config" path="inbox/file.csv" />

<!-- Write -->
<sftp:write config-ref="SFTP_Config" path="outbox/output-{timestamp}.csv">
  <sftp:content>#[payload]</sftp:content>
</sftp:write>

<!-- Move -->
<sftp:move config-ref="SFTP_Config" sourcePath="inbox/file.csv" targetPath="archive/file.csv" />

<!-- Delete -->
<sftp:delete config-ref="SFTP_Config" path="inbox/file.csv" />
```

### SFTP Listener Pattern (used for Liquidations in BDR)

```xml
<flow name="liquidations-file-poller">
  <sftp:listener
    config-ref="SFTP_Config"
    directory="liquidations/incoming"
    autoDelete="false"
    moveToDirectory="liquidations/processed">
    <scheduling-strategy>
      <fixed-frequency frequency="3600000" /> <!-- 1 hour -->
    </scheduling-strategy>
    <sftp:matcher filenamePattern="liquidations-*.csv" />
  </sftp:listener>
  <!-- parse CSV → transform → upsert to NS + SF -->
</flow>
```

## Property File Keys

```yaml
file:
  working_dir: "/app/data"

ftp:
  host: "ftp.partner.com"
  port: "21"
  username: ""
  password: "${secure::ftp-password}"
  working_dir: "/"

sftp:
  host: "sftp.partner.com"
  port: "22"
  username: ""
  password: "${secure::sftp-password}"
  private_key_path: "sftp_private_key"
  key_passphrase: "${secure::sftp-key-passphrase}"
  working_dir: "/"
```

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "Host key verification failed" | New server, unknown fingerprint | Add `knownHostsFile` to config or disable strict host checking (dev only) |
| "Permission denied (publickey)" | Wrong key or unauthorized | Verify key matches SSH config on server side |
| "File not found" on listener | Wrong directory path | Check working_dir + directory combination |
| Files processed twice | `autoDelete=false` and no `moveToDirectory` | Always set one or the other |
| File locked during write | Partner still writing file | Use `.tmp` suffix convention; partner renames on completion |

## File Locking / Idempotency

For production reliability, never process a file mid-write. Common pattern:

- Partner writes `file.csv.tmp`
- Partner renames to `file.csv` when complete
- Mule matcher only picks up `*.csv` (not `*.tmp`)

Or use Object Store to track processed filenames:

```xml
<os:contains objectStore="processed-files" key="#[vars.filename]" target="alreadyProcessed" />
<choice>
  <when expression="#[vars.alreadyProcessed == false]">
    <!-- process -->
    <os:store objectStore="processed-files" key="#[vars.filename]" value="#[now()]" />
  </when>
</choice>
```
