# /web-oauth

OAuth social login skill for the web-* suite. Covers Google, GitHub, and Apple OAuth via Supabase Auth, callback handling, and account linking.

**Call this skill when:** any product needs "Sign in with Google/GitHub/Apple" alongside email/password auth.

**Stack:** Supabase Auth OAuth → React auth hooks → callback route handler.

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- Which providers? (Google is near-universal; GitHub for dev tools; Apple required if on iOS)
- Is account linking needed? (user signs up with email, later links Google — requires merging)
- Is PKCE flow required? (yes for SPAs — Supabase Auth uses it by default)

---

## Phase 1 — Supabase Dashboard Configuration

For each provider, configure in Supabase Dashboard → Authentication → Providers:

### Google OAuth
1. Create OAuth app at console.cloud.google.com → APIs & Services → Credentials
2. Authorised redirect URI: `https://[project-ref].supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret into Supabase Dashboard → Auth → Google
4. Add to Authorized JavaScript origins: your Vercel URL and `http://localhost:5173`

### GitHub OAuth
1. Create OAuth app at github.com → Settings → Developer settings → OAuth Apps
2. Authorization callback URL: `https://[project-ref].supabase.co/auth/v1/callback`
3. Copy Client ID and Client Secret into Supabase Dashboard → Auth → GitHub

### Apple OAuth (required for iOS App Store)
1. Apple Developer account → Certificates → Identifiers → Services IDs
2. Configure Sign In with Apple, set return URL to Supabase callback
3. Supabase needs: Service ID, Team ID, Key ID, Private Key (.p8 file)
4. Note: Apple requires `https` — does not work on localhost without a tunnel

---

## Phase 2 — OAuth Sign In

Update `src/pages/AuthPage.tsx` to add social buttons:

```tsx
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

type OAuthProvider = 'google' | 'github' | 'apple'

async function signInWithOAuth(provider: OAuthProvider) {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      scopes: provider === 'google' ? 'email profile' : undefined,
    },
  })
  if (error) console.error(error)
}

// In your auth form:
export function OAuthButtons() {
  return (
    <div className="space-y-2">
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => signInWithOAuth('google')}
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => signInWithOAuth('github')}
      >
        <GithubIcon className="h-4 w-4" />
        Continue with GitHub
      </Button>
    </div>
  )
}

// Simple icon components (replace with your icon library or SVGs)
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  )
}
```

---

## Phase 3 — OAuth Callback Route

Supabase handles the OAuth exchange server-side. The callback URL is `[supabase-url]/auth/v1/callback`. After exchange, Supabase redirects to your `redirectTo` URL with the session in the URL hash.

Create `src/pages/AuthCallbackPage.tsx`:

```tsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase automatically picks up the session from the URL hash
    // onAuthStateChange fires immediately with the new session
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Check if onboarding complete — ProtectedRoute handles this,
        // but we navigate to the app root and let it redirect
        navigate('/', { replace: true })
      } else if (event === 'TOKEN_REFRESHED') {
        navigate('/', { replace: true })
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p className="text-sm">Signing you in...</p>
      </div>
    </div>
  )
}
```

Register route in `App.tsx`:
```tsx
import { AuthCallbackPage } from '@/pages/AuthCallbackPage'

// Public route, no auth required:
<Route path="/auth/callback" element={<AuthCallbackPage />} />
```

---

## Phase 4 — Account Linking (connect OAuth to existing email account)

In Settings → Profile, allow users to link additional OAuth providers:

```tsx
import { supabase } from '@/lib/supabase'

async function linkProvider(provider: 'google' | 'github') {
  const { error } = await supabase.auth.linkIdentity({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

async function unlinkProvider(identityId: string) {
  const { error } = await supabase.auth.unlinkIdentity({ identityId } as any)
  if (error) throw error
}

// Show which providers are connected:
async function getLinkedIdentities() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.identities ?? []
}
```

---

## Phase 5 — User Metadata from OAuth

OAuth providers return profile data in `user.user_metadata`. Extract it in onboarding or profile setup:

```typescript
const { data: { user } } = await supabase.auth.getUser()

const name = user?.user_metadata?.full_name        // Google
           ?? user?.user_metadata?.name             // GitHub
           ?? user?.email?.split('@')[0]             // fallback

const avatar = user?.user_metadata?.avatar_url      // Google / GitHub
```

Pre-fill the onboarding wizard with this data — don't make OAuth users re-enter their name.

---

## Checklist

- [ ] OAuth apps created in Google Cloud Console / GitHub Developer Settings / Apple Developer
- [ ] Redirect URIs point to `[supabase-url]/auth/v1/callback`
- [ ] Supabase Dashboard → Auth → Providers configured with Client ID + Secret
- [ ] `/auth/callback` route registered in `App.tsx` (public, no auth guard)
- [ ] `redirectTo` in `signInWithOAuth` points to `/auth/callback`
- [ ] `AuthCallbackPage` lets `onAuthStateChange` handle the session (no manual hash parsing)
- [ ] OAuth user metadata (name, avatar) pre-fills onboarding wizard
- [ ] Localhost Vercel URL added to Google OAuth authorized origins
- [ ] For Apple: `https` required — test with a tunnel (ngrok, Cloudflare Tunnel) locally

---

## Notes

- Never parse `window.location.hash` manually — Supabase JS SDK handles PKCE and session extraction automatically
- `supabase.auth.linkIdentity()` requires the user to be logged in — it links an OAuth provider to the existing account
- Duplicate email handling: if a user signs up with Google (google@gmail.com) and later tries email/password with the same address, Supabase will error — surface a "use Google to sign in" message
- Apple Sign In: Apple only returns the user's name on the FIRST login ever. Store it immediately in `onAuthStateChange` — subsequent logins return null name
- PKCE is the default flow for Supabase Auth SPAs since v2 — do not use the implicit flow (it's deprecated)
