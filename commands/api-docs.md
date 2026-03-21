---
name: api-docs
description: Generate API documentation, OpenAPI specs, README files, and developer guides from code or a description. Use when documenting a new API, improving existing developer docs, or generating an OpenAPI 3.0 spec.
---

# API Documentation Generator

## Purpose

Produces developer documentation from code, endpoint descriptions, or an existing API. Covers OpenAPI specs, endpoint reference docs, quickstart guides, authentication docs, and SDK usage examples.

## When to Use

- Documenting a new REST or GraphQL API
- Generating an OpenAPI 3.0 / Swagger spec
- Writing a developer quickstart or integration guide
- Improving existing API docs that are incomplete or outdated
- Creating code examples in multiple languages
- Writing a README for a library or SDK
- Documenting webhook events and payloads

## Input Required

Provide any of:
- Code files (routes, controllers, models)
- Existing partial documentation
- A plain English description of the API's purpose and endpoints
- Example requests and responses

## Modes

### Mode 1: OpenAPI 3.0 Spec
Generates a valid YAML OpenAPI spec covering:
- Info (title, version, description)
- Servers
- Security schemes (API key, Bearer, OAuth2)
- Paths with operations (GET/POST/PUT/DELETE)
- Request bodies and parameters
- Response schemas with examples
- Reusable components (schemas, responses, parameters)

### Mode 2: Endpoint Reference Docs
For each endpoint:
```
## GET /users/{id}

Returns a single user by ID.

**Authentication:** Bearer token required

**Path Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | string | Yes | User UUID |

**Query Parameters**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| include | string | No | Comma-separated relations to include (e.g. `include=orders,profile`) |

**Response 200**
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "Jane Smith",
  "created_at": "2026-01-15T10:30:00Z"
}
```

**Response 404**
```json
{ "error": "User not found", "code": "USER_NOT_FOUND" }
```

**Code Examples**
```bash
curl -X GET https://api.example.com/users/usr_abc123 \
  -H "Authorization: Bearer {token}"
```
```python
import requests
response = requests.get(
    "https://api.example.com/users/usr_abc123",
    headers={"Authorization": f"Bearer {token}"}
)
```
```

### Mode 3: Developer Quickstart
Structure:
1. What this API does (2 sentences)
2. Authentication setup
3. First API call (working example, copy-paste ready)
4. Common next steps
5. Error handling basics
6. Links to full reference

### Mode 4: README for SDK/Library
Structure:
```markdown
# [Library Name]

[One-sentence description]

## Installation
[Package manager commands]

## Quick Start
[Minimal working example]

## Usage
[Key features with examples]

## Configuration
[Config options table]

## Error Handling
[Error types and how to handle them]

## Contributing
[Brief contribution guide]

## License
```

### Mode 5: Webhook Documentation
For each event:
- Event name and when it fires
- Payload schema
- Example payload
- Retry behaviour and failure handling
- How to verify webhook signatures

## Output Standards

- All code examples are copy-paste ready and tested against the described API
- Error responses documented alongside success responses
- Authentication documented first — it's always the first blocker
- Consistent naming: snake_case for JSON, consistent verb choice for operations
