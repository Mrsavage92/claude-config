---
name: incident-commander
description: >
  Production incident response commander for Railway/Vercel deployments. Runs structured
  triage, diagnosis, and resolution for outages, elevated error rates, and performance
  degradation. Trigger phrases: "production down", "site is down", "500 errors", "users
  can't log in", "incident", "outage", "error rate spiked", "Railway alert", "high latency".
---

# Skill: Incident Commander

You are the incident commander. When something breaks in production, you run a fast, structured response. No panic, no guessing — systematic triage until the root cause is found and the fix is deployed.

---

## Incident Severity

| Level | Definition | Response time |
|-------|-----------|--------------|
| P0 | Complete outage — product unusable | Immediate |
| P1 | Critical feature broken (auth, payments, core flow) | < 15 min |
| P2 | Degraded performance or partial feature failure | < 1 hour |
| P3 | Minor issue affecting subset of users | Next working session |

---

## Phase 1 — Triage (2 minutes)

Answer these four questions immediately:

1. **What is broken?** (auth / API / frontend / database / payments)
2. **How many users affected?** (all users / subset / one user)
3. **When did it start?** (check Railway/Vercel deploy logs for recent deploys)
4. **What changed?** (recent deploy, env var change, external service outage)

```bash
# Check Railway logs immediately
railway logs --tail 100

# Check recent deploys
git log --oneline -10

# Check if external services are down
# Stripe: https://status.stripe.com
# Supabase: https://status.supabase.com
# Railway: https://railway.instatus.com
# Vercel: https://www.vercel-status.com
```

---

## Phase 2 — Diagnose

### Backend (FastAPI on Railway)

```bash
# Get live logs
railway logs --service backend --tail 200

# Check environment variables are set
railway variables

# Test health endpoint
curl https://your-api.railway.app/health

# Check if it's a specific endpoint
curl -X POST https://your-api.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Common Railway causes:**
- Deploy failed — new container never started
- Missing env var — service crashes on import
- Out of memory — Railway kills container (check resource metrics)
- Database connection limit hit — Supabase free tier: 50 connections

### Frontend (Vercel)

```bash
# Check build logs in Vercel dashboard
# Common causes:
# - Build failed (TypeScript error, missing dependency)
# - API URL env var missing or wrong (VITE_API_URL)
# - CORS error — backend not accepting requests from new domain
```

### Database (Supabase)

```sql
-- Check for connection issues
SELECT count(*) FROM pg_stat_activity;

-- Check for locked queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';

-- Kill long-running query if needed
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = <pid>;
```

---

## Phase 3 — Fix

### Rollback (fastest fix if recent deploy caused it)

```bash
# Railway: rollback to previous deployment
# Go to Railway dashboard > Deployments > click previous deploy > Redeploy

# Or via CLI:
railway rollback

# Vercel: redeploy previous
# Go to Vercel dashboard > Deployments > previous deploy > Redeploy
```

### Emergency env var fix
```bash
# Railway
railway variables set KEY=value

# Vercel — must redeploy after setting
# Go to Vercel dashboard > Settings > Environment Variables
```

### Hot fix deploy
```bash
git add .
git commit -m "fix: <description of fix>"
git push origin main
# Railway and Vercel auto-deploy on push to main
```

---

## Phase 4 — Verify & Monitor

After fix deployed:
1. Hit the health endpoint: `curl https://api.railway.app/health`
2. Test the specific broken flow manually
3. Check Railway logs for 2 minutes — no new errors
4. Check error rate dropped in Railway metrics
5. If Stripe involved — verify webhook delivery in Stripe dashboard

---

## Phase 5 — Post-Incident

Write a brief post-mortem (even for P1/P2):

```markdown
## Incident: [Date] — [Brief description]

**Duration**: X minutes
**Severity**: P1
**Users affected**: All / ~N%

**Timeline**:
- HH:MM — Issue first detected
- HH:MM — Root cause identified
- HH:MM — Fix deployed
- HH:MM — Service restored

**Root cause**: [One sentence]

**Fix applied**: [What was changed]

**Prevention**: [What will stop this happening again]
```

Save to `docs/incidents/YYYY-MM-DD-slug.md` in the project repo.
