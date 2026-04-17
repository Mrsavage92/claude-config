# Database Connector Reference

**Dependency:**
```xml
<dependency>
    <groupId>org.mule.connectors</groupId>
    <artifactId>mule-db-connector</artifactId>
    <version>1.14.11</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

Supports JDBC-compatible databases: PostgreSQL, MySQL, MSSQL, Oracle, Snowflake, generic JDBC.

## Driver Dependencies

You must add the JDBC driver for your database.

### PostgreSQL

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.7.3</version>
</dependency>
```

### MySQL

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <version>8.3.0</version>
</dependency>
```

### MSSQL

```xml
<dependency>
    <groupId>com.microsoft.sqlserver</groupId>
    <artifactId>mssql-jdbc</artifactId>
    <version>12.6.1.jre11</version>
</dependency>
```

### Oracle

Download from Oracle (license agreement required), add as system-scoped dep or install to local Maven repo.

## Configuration

### PostgreSQL Example

```xml
<db:config name="PostgreSQL_Config">
  <db:generic-connection
    driverClassName="org.postgresql.Driver"
    url="jdbc:postgresql://${db.host}:${db.port}/${db.database}"
    user="${db.username}"
    password="${db.password}" />
</db:config>
```

### MSSQL with Integrated Auth

```xml
<db:config name="MSSQL_Config">
  <db:mssql-connection
    host="${db.host}"
    port="${db.port}"
    databaseName="${db.database}"
    user="${db.username}"
    password="${db.password}" />
</db:config>
```

### Connection Pooling

```xml
<db:config name="Pool_Config">
  <db:generic-connection
    driverClassName="org.postgresql.Driver"
    url="jdbc:postgresql://${db.host}:${db.port}/${db.database}"
    user="${db.username}"
    password="${db.password}">
    <db:pooling-profile
      maxPoolSize="10"
      minPoolSize="1"
      acquireIncrement="1"
      preparedStatementCacheSize="5"
      maxWaitUnit="SECONDS" />
  </db:generic-connection>
</db:config>
```

## Operations

### Select

```xml
<db:select config-ref="PostgreSQL_Config">
  <db:sql>SELECT id, name, email FROM customers WHERE status = :status</db:sql>
  <db:input-parameters>#[{"status": "active"}]</db:input-parameters>
</db:select>
```

### Insert

```xml
<db:insert config-ref="PostgreSQL_Config">
  <db:sql>INSERT INTO customers (name, email) VALUES (:name, :email)</db:sql>
  <db:input-parameters>#[{"name": payload.name, "email": payload.email}]</db:input-parameters>
</db:insert>
```

### Update with Bulk

```xml
<db:bulk-update config-ref="PostgreSQL_Config">
  <db:sql>UPDATE customers SET status = :status WHERE id = :id</db:sql>
  <db:bulk-input-parameters>#[payload map {
    status: $.status,
    id: $.id
  }]</db:bulk-input-parameters>
</db:bulk-update>
```

### Stored Procedure

```xml
<db:stored-procedure config-ref="PostgreSQL_Config">
  <db:sql>{ call sync_customer(:id, :status) }</db:sql>
  <db:input-parameters>#[{"id": payload.id, "status": payload.status}]</db:input-parameters>
</db:stored-procedure>
```

### Transaction

```xml
<try transactionalAction="ALWAYS_BEGIN">
  <db:insert config-ref="Pool_Config"><db:sql>INSERT INTO orders ...</db:sql></db:insert>
  <db:update config-ref="Pool_Config"><db:sql>UPDATE inventory ...</db:sql></db:update>
  <error-handler>
    <on-error-propagate>
      <!-- transaction auto rolls back -->
    </on-error-propagate>
  </error-handler>
</try>
```

## Streaming for Large Result Sets

```xml
<db:select config-ref="PostgreSQL_Config" streaming="true" fetchSize="1000">
  <db:sql>SELECT * FROM huge_table</db:sql>
</db:select>

<foreach collection="#[payload]">
  <!-- processes one row at a time without loading full set into memory -->
</foreach>
```

## Property File Keys

```yaml
db:
  host: "localhost"
  port: "5432"
  database: "bdr"
  username: "${secure::db-username}"
  password: "${secure::db-password}"
```

## Troubleshooting

| Error | Cause | Fix |
|---|---|---|
| "Driver class not found" | JDBC driver missing from pom.xml | Add driver dependency |
| "Connection refused" | Wrong host/port or firewall | Verify network connectivity |
| "Authentication failed" | Wrong user/password | Verify credentials, check if user has access to DB |
| "ORA-01017" (Oracle) | Invalid username/password | Reset credentials in Oracle |
| Slow queries | Missing indexes on filter columns | Review DB indexes |
| Connection leak warnings | Pool exhausted | Increase pool size or fix flow that holds connections |
