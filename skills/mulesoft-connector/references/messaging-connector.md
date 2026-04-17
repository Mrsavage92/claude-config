# Messaging Connectors (JMS, AMQP, Kafka)

For event-driven architectures and async processing.

## JMS Connector

Works with ActiveMQ, IBM MQ, WebLogic JMS, and generic JMS providers.

**Dependency:**
```xml
<dependency>
    <groupId>org.mule.connectors</groupId>
    <artifactId>mule-jms-connector</artifactId>
    <version>1.9.1</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

### ActiveMQ Example

```xml
<jms:config name="JMS_Config">
  <jms:active-mq-connection username="${jms.username}" password="${jms.password}">
    <jms:factory-configuration brokerUrl="${jms.broker_url}" />
  </jms:active-mq-connection>
</jms:config>
```

### JMS Listener (Consume)

```xml
<flow name="jmsConsumer">
  <jms:listener config-ref="JMS_Config" destination="orders.queue" />
  <!-- process payload -->
</flow>
```

### JMS Publish

```xml
<jms:publish config-ref="JMS_Config" destination="events.queue">
  <jms:message>
    <jms:body>#[payload]</jms:body>
  </jms:message>
</jms:publish>
```

### Queue vs Topic

- **Queue:** point-to-point, one consumer reads each message
- **Topic:** pub-sub, multiple subscribers receive each message

```xml
<jms:publish config-ref="JMS_Config" destination="events.topic">
  <jms:message>
    <jms:body>#[payload]</jms:body>
  </jms:message>
  <jms:destination-type>TOPIC</jms:destination-type>
</jms:publish>
```

## AMQP Connector (RabbitMQ)

**Dependency:**
```xml
<dependency>
    <groupId>org.mule.connectors</groupId>
    <artifactId>mule-amqp-connector</artifactId>
    <version>1.7.0</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

### RabbitMQ Config

```xml
<amqp:config name="AMQP_Config">
  <amqp:connection
    host="${rabbitmq.host}"
    port="${rabbitmq.port}"
    virtualHost="${rabbitmq.vhost}"
    username="${rabbitmq.username}"
    password="${rabbitmq.password}" />
</amqp:config>
```

### Consumer

```xml
<flow name="amqpConsumer">
  <amqp:listener config-ref="AMQP_Config" queueName="orders.queue" />
  <!-- process -->
</flow>
```

### Publisher

```xml
<amqp:publish
  config-ref="AMQP_Config"
  exchangeName="events.exchange"
  routingKey="order.created">
  <amqp:properties>
    <amqp:builder contentType="application/json" />
  </amqp:properties>
</amqp:publish>
```

## Kafka Connector

**Dependency:**
```xml
<dependency>
    <groupId>com.mulesoft.connectors</groupId>
    <artifactId>mule-kafka-connector</artifactId>
    <version>4.9.0</version>
    <classifier>mule-plugin</classifier>
</dependency>
```

### Config (SASL_SSL for managed Kafka)

```xml
<kafka:consumer-config name="Kafka_Consumer_Config">
  <kafka:consumer-plain-text-connection>
    <kafka:bootstrap-servers>
      <kafka:bootstrap-server value="${kafka.broker}" />
    </kafka:bootstrap-servers>
    <kafka:additional-properties>
      <kafka:additional-property key="security.protocol" value="SASL_SSL" />
      <kafka:additional-property key="sasl.mechanism" value="PLAIN" />
      <kafka:additional-property key="sasl.jaas.config"
        value='org.apache.kafka.common.security.plain.PlainLoginModule required username="${kafka.username}" password="${kafka.password}";' />
    </kafka:additional-properties>
  </kafka:consumer-plain-text-connection>
</kafka:consumer-config>
```

### Consumer Flow

```xml
<flow name="kafkaConsumer">
  <kafka:message-listener config-ref="Kafka_Consumer_Config">
    <kafka:topics>
      <kafka:topic value="customer.events" />
    </kafka:topics>
  </kafka:message-listener>
  <!-- process -->
</flow>
```

## Error Handling for Messaging

### Dead Letter Queue Pattern

```xml
<flow name="orderProcessor">
  <jms:listener config-ref="JMS_Config" destination="orders.queue" />
  <try>
    <!-- processing -->
    <error-handler>
      <on-error-propagate type="ANY">
        <jms:publish config-ref="JMS_Config" destination="orders.dlq">
          <jms:message>
            <jms:body>#[payload]</jms:body>
            <jms:properties>
              <jms:user-property key="error" value="#[error.description]" />
              <jms:user-property key="failedAt" value="#[now()]" />
            </jms:properties>
          </jms:message>
        </jms:publish>
      </on-error-propagate>
    </error-handler>
  </try>
</flow>
```

### Acknowledgement Modes

| Mode | Behaviour |
|---|---|
| `AUTO` | Mule acks after successful processing (default) |
| `MANUAL` | Explicit ack in flow |
| `DUPS_OK` | Relaxed ack — faster but allows duplicates on failure |

```xml
<jms:listener config-ref="JMS_Config" destination="critical.queue" ackMode="MANUAL">
  <!-- process -->
  <jms:ack ackToken="#[message.attributes.ackToken]" />
</jms:listener>
```

## Property File Keys

```yaml
jms:
  broker_url: "tcp://broker:61616"
  username: ""
  password: "${secure::jms-password}"

rabbitmq:
  host: "rabbit.internal"
  port: "5672"
  vhost: "/"
  username: ""
  password: "${secure::rabbitmq-password}"

kafka:
  broker: "broker.kafka.internal:9092"
  username: ""
  password: "${secure::kafka-password}"
```
