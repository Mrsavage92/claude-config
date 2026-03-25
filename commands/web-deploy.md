# /web-deploy

Build and deploy a web project to Vercel or Railway with environment configuration and domain setup.

## When to Use
- Deploying a project for the first time
- Pushing updates to production
- Configuring a custom domain
- Setting up environment variables on the hosting platform

## Process

### Step 1 — Assess Project State
Read `package.json` to confirm build script exists. Check for `.env.example` to identify required env vars.

Run build check first:
```bash
npm run build
```
If build fails, run `/web-fix` on the errors before proceeding.

### Step 2 — Choose Platform

**Vercel** — best for:
- Static sites and SPAs (React + Vite)
- Projects with no custom server
- Fast global CDN, automatic HTTPS
- Free tier generous for personal projects

**Railway** — best for:
- Full-stack apps with a Node.js backend
- Projects needing persistent processes
- Already using Railway for other services (GrowLocal, AuditHQ)

### Step 3A — Vercel Deploy

```bash
# First time
npx vercel --prod

# Subsequent deploys
npx vercel --prod
```

Or via GitHub integration (preferred):
1. Push code to GitHub
2. Import project at vercel.com/new
3. Framework: Vite (auto-detected)
4. Build command: `npm run build`
5. Output directory: `dist`

**Set env vars in Vercel:**
Vercel does NOT need VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY — these are hardcoded in `src/lib/supabase.ts` (anon key is public by design).

If the project uses other env vars (Stripe keys, API keys), add them via:
```bash
npx vercel env add STRIPE_SECRET_KEY production
```

**Custom domain:**
```bash
npx vercel domains add yourdomain.com
```
Then add CNAME record at DNS provider pointing to `cname.vercel-dns.com`

### Step 3B — Railway Deploy

Use Railway MCP or CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link
railway login
railway link

# Deploy
railway up
```

Or via GitHub:
1. Create new Railway project
2. Connect GitHub repo
3. Railway auto-detects Vite and runs `npm run build` + serves `dist/`

**Set env vars on Railway:**
Use Railway MCP `mcp__plugin_railway__set_env_var` or:
```bash
railway variables set VARIABLE_NAME=value
```

**Custom domain on Railway:**
Railway dashboard > Settings > Domains > Add Custom Domain
Add CNAME in DNS provider pointing to Railway's provided hostname.

### Step 4 — Post-Deploy Checklist

- [ ] Site loads at production URL
- [ ] Supabase connection works (test auth flow if applicable)
- [ ] All routes work (check React Router is not returning 404 on refresh)
- [ ] Images and assets load correctly
- [ ] HTTPS is active
- [ ] Custom domain resolves (if applicable)

**Fixing React Router 404 on refresh (Vercel):**
Create `vercel.json` at the **project root** (not `public/`):
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**Fixing React Router 404 on refresh (Railway):**
Vite does not support `historyApiFallback` (that is a Webpack option). For Railway, use the `serve` package which handles SPA routing with the `-s` flag.

Confirm `package.json` has the serve script:
```json
"scripts": {
  "serve": "serve -s dist -l 3000"
}
```

And `serve` is in devDependencies: `"serve": "^14.2.3"`

On Railway, set the start command to `npm run serve` and set the `PORT` environment variable to `3000`.

### Step 5 — Output
```
Deployed: [project-name]
URL: https://[project].vercel.app (or railway.app)
Custom domain: [if configured]
Platform: Vercel / Railway
Build: Success
Status: Live
```

## Rules
- Always run `npm run build` locally first — never deploy a broken build
- Never commit `.env` files — use platform env var UI or CLI
- Supabase anon key is safe to hardcode in source code (it is a public key by design)
- For Vite SPAs on any platform: configure URL rewrites to fix React Router 404s
