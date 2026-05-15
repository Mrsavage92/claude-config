# API Manager Policies — Client ID Enforcement on CloudHub 2.0

> The minimum security setup for any production API. Without this, your CloudHub 2.0 public endpoint is open to any caller on the internet who knows the URL.

## When to apply (no exceptions for "internal" APIs)

Per **OWASP API Security Top 10 — API02 (Broken Authentication)** and MuleSoft's Compliance policy guidance: **every production API needs at minimum Client ID Enforcement**, regardless of whether it has one known consumer or many. Default-deny is the principle. "It's only called by Salesforce" is NOT a valid skip reason — random CloudHub subdomains get scanned by automated bots within days of going live.

Sources:
- [Client ID Enforcement Policy — MuleSoft Docs](https://docs.mulesoft.com/gateway/latest/policies-included-client-id-enforcement)
- [OWASP API Security Top 10](https://owasp.org/API-Security/editions/2023/en/0x11-t10/)
- [MuleSoft API Security Best Practices](https://blogs.mulesoft.com/api-integration/api-security-threats-best-practices-solutions/)

## What CIE does

When a client app is registered against your API in API Manager, Anypoint generates a `client_id` + `client_secret` pair. The CIE policy then enforces: every request must carry valid `client_id` + `client_secret` headers (or as URL query params, configurable). Requests without valid creds get 401. Requests with valid creds pass through to your Mule app.

## Three-step setup

### Step 1 — Register the API instance in API Manager

API Manager → target env → **Add** → choose one:

| Option | When to use |
|---|---|
| **Add new API** | First-time registration (no existing managed API in this env) |
| **Promote API from environment** | Existing managed API in another env (e.g. sandbox → prod) — copies policies + SLAs |
| **Import API from zip file** | API config exported from another org / stored in version control |

For the fields:
- **API name + version** — pull from Exchange (the published RAML/OpenAPI for this API)
- **Endpoint URL** — point at your already-running CloudHub instance's public URL (the one Runtime Manager assigned)
- **Implementation URL** — same as Endpoint for "Endpoint with Proxy" mode

### Step 2 — Apply Client ID Enforcement policy

Once the API instance is registered:

1. Click into the API → **Policies** tab
2. Click **Add policy** → search for "Client ID Enforcement"
3. Configure:
   - **Credentials origin**: Custom expression (advanced) or "Headers" (default — looks for `client_id` + `client_secret` headers)
   - Leave other fields default unless you have specific reasons
4. **Apply**

The policy now enforces auth on every request. Existing in-flight requests complete; new requests need creds.

### Step 3 — Generate credentials for each consumer

For each app/system that calls this API:

1. Anypoint Platform → **Access Management** → **Connected Apps** OR
2. API Manager → API → **Contracts** tab → **Request Access** flow

Create a new Connected App per consumer (e.g. "Salesforce Sandbox", "Salesforce Production", "Internal Ops Dashboard"). Anypoint generates a unique `client_id` + `client_secret` per app.

**The secret is shown ONCE.** Capture immediately into your password manager (or Salesforce External Credential, etc.).

## Common mistake — sandbox vs prod credentials

Sandbox and Production envs in API Manager are isolated. A `client_id` + `client_secret` generated for sandbox **WILL NOT WORK** against prod. You must generate a separate Connected App per env.

If your downstream consumer (e.g. Salesforce) uses an External Credential to call the API, you need TWO External Credentials:
- One pointing at sandbox API URL with sandbox client creds
- One pointing at prod API URL with prod client creds

OR one parameterised External Credential whose URL + creds switch based on the SF org's environment.

## Sequencing for sandbox → prod cutover

EXPERT-PURE path (don't skip steps):

1. **Apply CIE to sandbox API instance first** (if it doesn't have one — many BDR/early-stage projects skipped this)
2. Generate sandbox Connected App → capture creds → update Salesforce sandbox External Credential
3. **Re-run sandbox UAT** to confirm Salesforce → API flow still works with auth
4. Apply CIE to prod API instance (or promote from sandbox)
5. Generate prod Connected App → capture creds → wire into Salesforce prod External Credential
6. End-to-end smoke test in prod

EXPERT-PRAGMATIC path (ship today, harden week 1):

1. Skip CIE for today's prod cutover (matches sandbox state)
2. Document gap in audit doc / cutover record
3. Calendar a "harden CIE on both envs" task within 7 days of go-live
4. Execute steps 1-6 above as a discrete v1.0.3 cycle

NEGLIGENT (don't recommend):

- Ship without CIE and forget. Real OWASP API02 risk; will fail any external security audit.

## CH2-specific gotchas

- API Manager URL doesn't change between envs — env switcher is in top-right of UI
- The API instance must point at the actual running CloudHub URL (not the Exchange-published RAML's nominal URL)
- "Import file from Exchange" in API Manager is different from "Deploy from Exchange" in Runtime Manager — the former registers the API for governance, the latter deploys the runtime app
- After applying a policy, the rolling restart happens at the API Gateway layer (not the Mule app) — usually <30 sec

## Trade-off note

CIE adds latency (~5-10 ms per request for the policy check). For high-volume APIs, consider whether the credential validation is critical-path or whether OAuth Mutual TLS or JWT validation would be more appropriate.

For BDR's broadband Process API (low-volume — sales reps clicking Check Now on demand), CIE is appropriate. The latency is invisible to reps.
