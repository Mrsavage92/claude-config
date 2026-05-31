---
name: chatbot-deploy
description: >-
  Deploy AND verify the grounded AI chatbot (Claude server function + lead
  capture) to a website on Cloudflare Workers or Vercel, then prove it is
  genuinely live and answering — not just that the build succeeded. Use this
  whenever rolling the chat assistant out to a new site, re-deploying chatbot
  changes, or checking whether a deployed chatbot actually works. Trigger on:
  "deploy the chatbot to <site>", "roll out the assistant to <site>", "add the
  chat bot to this site and ship it", "is the chatbot live?", "verify the
  chatbot deploy", "the bot looks deployed but isn't responding". This is the
  DEPLOY + LIVE-VERIFY workflow — not building the chatbot feature from scratch.
  Lean on it even when the user just says "ship the bot" without naming steps,
  because the common failure is a bot that deploys cleanly yet is silently dead.
---

# Chatbot deploy + verify

## Why this skill exists

A chatbot can deploy with a green build and still be **completely dead** to
visitors. The bot is built to *fail open*: with no `ANTHROPIC_API_KEY` it shows
a polite "we're offline, use the form" message instead of crashing. That is
correct for resilience but treacherous for deploys — "build succeeded" and even
"page loads" tell you nothing about whether the bot answers. Every painful
deploy traces back to skipping real verification or to one of the traps below.

The job of this skill is to make verification **enforced and live**, not
self-graded. You are done only when a real message to the deployed bot comes
back as a grounded answer.

## Input: a site config

Work from a small JSON config so the same procedure serves every site. If the
user hasn't given one, build it from the repo + their answers. Template:
`references/site.config.template.json`.

```json
{
  "name": "orbit-digital",
  "canonicalUrl": "https://orbitdigital.com.au",
  "host": "vercel",                       // "vercel" | "cloudflare"
  "repoPath": "C:/Users/Adam/orbit-digital-builder",
  "expectedContent": "Find the friction", // unique string proving the right build is live
  "offlineFallbackMarker": "offline right now", // substring of the no-key fallback reply
  "requiredSecrets": ["ANTHROPIC_API_KEY", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "RESEND_API_KEY"],
  "evalQuestions": [
    { "q": "how much is the audit?", "mustInclude": ["550", "1,950"], "mustNotInclude": ["**", "I don't know"] },
    { "q": "can I just get a GEO audit?", "mustInclude": ["550"], "mustNotInclude": ["not sold separately", "**"] }
  ]
}
```

`mustNotInclude` should always contain `**` (raw markdown leaking through) and
the `offlineFallbackMarker` (proves the model, not the fallback, answered).

## Procedure

Run these in order. Each step exists because skipping it has burned a real
deploy.

### 1. Secrets preflight — do this FIRST

Confirm every secret in `requiredSecrets` (plus `LEAD_NOTIFY_TO`/`FROM` if the
site emails leads) is set on the **host's** project, not just in local
`.dev.vars`. Secrets are gitignored and do **not** travel between hosts or
repos — a fresh project starts with none. A missing key doesn't error; it makes
the bot silently serve the offline message. So a deploy with unset secrets looks
done and is dead.

- Cloudflare: `wrangler secret list` (names only).
- Vercel: Project → Settings → Environment Variables (or `vercel env ls`).

If any are missing, set them before deploying — there is no point verifying a
bot whose key isn't wired.

### 2. Build, THEN deploy

Always `npm run build` and **then** deploy. A bare `wrangler deploy` (and most
host deploy commands) ship whatever is already in `dist/` — so an un-rebuilt
deploy silently ships stale code and your change never goes live. After
deploying, confirm the version/asset hash actually changed; don't trust the
command's exit code alone.

### 3. One deploy per batch — don't thrash

Batch your changes and deploy once. Rapid repeat deploys trip Cloudflare's API
rate-limit (`code 10429`), which then cascades into auth errors (`10000`) and
blocks further deploys for a while. If you see `10429`, stop and wait — retrying
immediately extends the lockout.

### 4. Host-aware deploy auth

**Cloudflare:** prefer a scoped `CLOUDFLARE_API_TOKEN` (Workers-Scripts:Edit,
plus KV if the spend cap uses it) over interactive OAuth. OAuth access tokens
expire mid-session and can't be refreshed headlessly (`wrangler login` needs a
browser), which strands an agent-driven deploy. If the env token lacks scope,
the documented fallback is `env -u CLOUDFLARE_API_TOKEN npx wrangler deploy` to
use OAuth — but know its expiry risk.

**Vercel:** use git-push auto-deploy (push to the production branch) or
`vercel --prod` with a token. **Turn OFF Deployment Protection on production** —
it returns `401` to anonymous requests, which blocks your own verification and
any cross-origin call. (Keep it on for previews if you like.)

### 5. Verify the right thing is live — on the CANONICAL domain

Run the bundled HTTP checker against `canonicalUrl`:

```
node <skill>/scripts/verify-chatbot.mjs <path-to-config.json>
```

It checks (deterministic PASS/FAIL, no judgement):
- The final response after redirects is served by the expected host
  (`x-vercel-id` for Vercel; for Cloudflare the absence of `x-vercel-id` +
  `server: cloudflare`).
- `expectedContent` is present (proves the *right build* is live, not an old or
  unrelated app).
- Security headers are present (HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy) and reports whether a CSP is set.

**Never verify against the `*.vercel.app` project subdomain as the source of
truth.** Those global subdomains are first-come — `orbit-digital.vercel.app`
was literally a different company's site. Use the customer's real domain (or the
exact deployment URL Vercel prints), and remember the apex may 301 to the
canonical host (e.g. `.au` → `.com.au`).

### 6-7. Exercise the bot for real + answer-quality eval (the step that matters)

The HTTP checks can all pass on a dead bot — they prove the page loads, not that
the bot *answers*. This is the gate that proves liveness, so it's bundled as a
script rather than left to manual clicking:

```
node <skill>/scripts/exercise-bot.mjs <path-to-config.json>
```

It drives the **real widget** headlessly (server functions have no stable public
POST path, so we go through the UI), sends each `evalQuestions[].q`, and for each
asserts: the reply is non-empty, does **not** contain `offlineFallbackMarker`
(that string means the API key isn't wired — silently dead), and satisfies every
`mustInclude` / `mustNotInclude`. That last part catches a wrong price, a
hallucinated claim, or markdown leaking through (`**`) after a content edit or
model bump — drift that code tests never see. Exit 0 only if every question
passes; the receipt quotes each reply as evidence.

Needs Playwright once — run from the **site's `repoPath`** (so node resolves
`playwright` from that project's `node_modules`), not from the skill directory:
`cd <repoPath> && npm i -D playwright && npx playwright install chromium`. Then
invoke the script by its absolute skill path against your config.
The widget selectors default to the shared ChatWidget component; override them
in `config.selectors` if a site customised them. If Playwright isn't available,
fall back to driving the puppeteer / chrome-devtools MCP by hand with the same
assertions — but the script is the real gate.

### 8. Lead path

Submit one test enquiry through the bot (give it a name + email so it fires
`capture_lead`), then confirm a row landed and the notification email sent.
This proves the Supabase + Resend secrets are wired, not just the Claude key.

## Output: a PASS/FAIL receipt

Summarise as a checklist with a verdict per step and the evidence (status codes,
header values, quoted bot replies). Do not declare the deploy done unless the
HTTP check (5), the bot-answer + eval gate (6-7) AND the lead path (8) all pass —
a deploy whose Supabase/Resend secrets are missing will answer fine but silently
drop every enquiry, so step 8 is part of the gate, not optional. "It deployed"
is not "it works" — say which, with proof.

## After a clean run

If anything is still pending (DNS not cut over, Deployment Protection still on,
a secret you couldn't set), say so explicitly in the receipt rather than
implying success. Verify outcome, not surface.
