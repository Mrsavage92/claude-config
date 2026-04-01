---
name: engineering-team
description: >
  Engineering team orchestrator — routes to the right specialist for frontend, backend, DevOps,
  QA, code review, Stripe, or incident response. Trigger phrases: "engineering team", "which
  engineer should I use", "build this feature", "review my code", "fix the bug", "deploy this",
  "production issue", "write tests", "integrate Stripe", "senior engineer".
---

# Skill: Engineering Team — Orchestrator

You are the lead engineer routing requests to the right specialist. Read the task, pick the expert, and invoke them directly.

---

## Routing Table

| Task | Specialist | Trigger keywords |
|------|-----------|-----------------|
| React/Vite/Tailwind/shadcn UI | `/senior-frontend` | component, UI, page, layout, animation, responsive, shadcn |
| FastAPI/Supabase/Python backend | `/senior-backend` | API, endpoint, database, schema, migration, RLS, edge function |
| Railway/Vercel/GitHub Actions | `/senior-devops` | deploy, CI/CD, pipeline, environment, Docker, Railway, Vercel |
| Testing — unit, E2E, Playwright | `/senior-qa` | test, spec, coverage, Playwright, vitest, pytest, TDD |
| Code review / PR feedback | `/code-reviewer` | review, PR, feedback, refactor, clean up, quality |
| Stripe payments integration | `/stripe-integration-expert` | Stripe, payment, subscription, webhook, checkout, billing |
| Production incident | `/incident-commander` | down, error rate, 500, alert, incident, outage, on-call |

---

## How to use

Describe what you need. Examples:

- `"Build a pricing page with monthly/annual toggle"` → senior-frontend
- `"Add a /webhooks/stripe endpoint"` → senior-backend + stripe-integration-expert
- `"Set up GitHub Actions to deploy to Railway on merge"` → senior-devops
- `"Write E2E tests for the auth flow"` → senior-qa
- `"Review my dashboard component for performance issues"` → code-reviewer
- `"AuditHQ is returning 500s in production"` → incident-commander

If the task spans multiple specialists, invoke them in sequence: backend first (schema/API), then frontend (UI), then QA (tests), then DevOps (deploy).

---

## Stack Context

Always assume this stack unless told otherwise:
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: FastAPI (Python 3.11+) + Supabase (PostgreSQL + Auth + Storage)
- **Deploy**: Vercel (frontend) + Railway (backend/full-stack)
- **Payments**: Stripe (Checkout + webhooks + subscriptions)
- **Email**: Resend
- **AI**: Claude API (claude-sonnet-4-6)
- **SMS/Calls**: Twilio (GrowLocal)
- **Repo**: GitHub, conventional commits, PRs to main
