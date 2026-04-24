# /web-realtime

Supabase Realtime skill for the web-* suite. Covers live database subscriptions, presence tracking, broadcast channels, and optimistic UI patterns.

**Call this skill when:** any feature needs live updates without polling — dashboards, collaborative editing, notifications, activity feeds, online presence.

**Stack:** Supabase Realtime → React subscription hooks → TanStack Query cache updates.

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- Which tables need live sync? (e.g. messages, documents, audit_runs, notifications)
- Is presence required? (who's online — collaborative features)
- Is broadcast needed? (non-database events: cursor positions, typing indicators)
- What's the fanout? (few channels per org → Realtime is fine; millions of users → need custom infra)

Enable Realtime on required tables in Supabase Dashboard → Database → Replication (or via migration).

---

## Phase 1 — Realtime Hook (table subscriptions)

Create `src/hooks/use-realtime.ts`:

```typescript
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeOptions {
  table: string
  schema?: string
  filter?: string          // e.g. 'org_id=eq.some-uuid'
  queryKey: unknown[]      // TanStack Query key to invalidate on change
  onInsert?: (payload: Record<string, unknown>) => void
  onUpdate?: (payload: Record<string, unknown>) => void
  onDelete?: (payload: Record<string, unknown>) => void
}

export function useRealtime({
  table,
  schema = 'public',
  filter,
  queryKey,
  onInsert,
  onUpdate,
  onDelete,
}: UseRealtimeOptions) {
  const queryClient = useQueryClient()
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channelName = `${schema}:${table}${filter ? `:${filter}` : ''}`

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        { event: '*', schema, table, ...(filter ? { filter } : {}) },
        (payload) => {
          // Always invalidate the query to get fresh data
          queryClient.invalidateQueries({ queryKey })

          // Also call event-specific handlers if provided
          if (payload.eventType === 'INSERT') onInsert?.(payload.new as Record<string, unknown>)
          if (payload.eventType === 'UPDATE') onUpdate?.(payload.new as Record<string, unknown>)
          if (payload.eventType === 'DELETE') onDelete?.(payload.old as Record<string, unknown>)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [table, schema, filter, queryKey.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps
}
```

Usage:
```tsx
// Automatically invalidates ['audit-runs', orgId] whenever the audit_runs table changes
useRealtime({
  table: 'audit_runs',
  filter: `org_id=eq.${orgId}`,
  queryKey: ['audit-runs', orgId],
})
```

---

## Phase 2 — Presence (who's online)

Create `src/hooks/use-presence.ts`:

```typescript
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface PresenceUser {
  userId: string
  name: string
  avatar?: string
  joinedAt: number
}

export function usePresence(roomId: string, currentUser: PresenceUser | null) {
  const [online, setOnline] = useState<PresenceUser[]>([])
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!currentUser) return

    const channel = supabase.channel(`presence:${roomId}`, {
      config: { presence: { key: currentUser.userId } },
    })

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceUser>()
        const users = Object.values(state).flat()
        setOnline(users)
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track(currentUser)
        }
      })

    channelRef.current = channel

    return () => {
      channel.untrack()
      supabase.removeChannel(channel)
    }
  }, [roomId, currentUser?.userId])

  return online
}
```

Usage:
```tsx
const online = usePresence(`doc:${documentId}`, {
  userId: user.id,
  name: user.user_metadata.full_name,
  joinedAt: Date.now(),
})

// Show avatars of online users
{online.map(u => <Avatar key={u.userId} src={u.avatar} />)}
```

---

## Phase 3 — Broadcast (non-database events)

Create `src/hooks/use-broadcast.ts`:

```typescript
import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface BroadcastMessage<T = unknown> {
  event: string
  payload: T
}

export function useBroadcast<T = unknown>(
  channelName: string,
  event: string,
  onMessage: (payload: T) => void
) {
  const channelRef = useRef<RealtimeChannel | null>(null)

  useEffect(() => {
    const channel = supabase
      .channel(channelName)
      .on('broadcast', { event }, ({ payload }) => {
        onMessage(payload as T)
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channelName, event])

  const send = useCallback(async (payload: T) => {
    if (!channelRef.current) return
    await channelRef.current.send({ type: 'broadcast', event, payload })
  }, [event])

  return { send }
}
```

Usage (typing indicator):
```tsx
const { send } = useBroadcast(
  `doc:${documentId}`,
  'typing',
  ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
    setTypingUsers(prev =>
      isTyping ? [...new Set([...prev, userId])] : prev.filter(id => id !== userId)
    )
  }
)

// In input onChange:
send({ userId: currentUser.id, isTyping: true })
```

---

## Phase 4 — Optimistic Updates with Realtime

Pattern: update TanStack Query cache optimistically, let Realtime confirm and sync across clients.

```tsx
const queryClient = useQueryClient()

const mutation = useMutation({
  mutationFn: (newItem: Item) => supabase.from('items').insert(newItem).select().single(),

  // Optimistically add to local cache
  onMutate: async (newItem) => {
    await queryClient.cancelQueries({ queryKey: ['items', orgId] })
    const previous = queryClient.getQueryData(['items', orgId])
    queryClient.setQueryData(['items', orgId], (old: Item[]) => [...(old ?? []), { ...newItem, id: 'temp' }])
    return { previous }
  },

  // Rollback on error
  onError: (_, __, context) => {
    queryClient.setQueryData(['items', orgId], context?.previous)
  },

  // Realtime subscription (from useRealtime) will invalidate and confirm actual data
})
```

---

## Phase 5 — Notification Toast on Realtime Event

```tsx
import { toast } from 'sonner'

useRealtime({
  table: 'audit_runs',
  filter: `org_id=eq.${orgId}`,
  queryKey: ['audit-runs', orgId],
  onUpdate: (payload) => {
    if (payload.status === 'completed') {
      toast.success(`Audit complete: ${payload.name}`, {
        action: { label: 'View', onClick: () => navigate(`/audits/${payload.id}`) },
      })
    }
  },
})
```

---

## Phase 6 — Enable Realtime on Tables

Via Supabase MCP `apply_migration`:

```sql
-- Enable realtime for specific tables (run once per table)
alter publication supabase_realtime add table audit_runs;
alter publication supabase_realtime add table notifications;
alter publication supabase_realtime add table messages;
```

Or toggle in Supabase Dashboard → Database → Replication → Realtime.

---

## Checklist

- [ ] Realtime enabled on required tables (supabase_realtime publication)
- [ ] `useRealtime` hook invalidates TanStack Query on change
- [ ] Channel names are unique per resource (include org_id or doc_id)
- [ ] Channels cleaned up in `useEffect` return (memory leak prevention)
- [ ] Presence used only for collaborative features — not for "who's in the app" globally
- [ ] Broadcast used for ephemeral events (typing, cursor) — not for durable state
- [ ] RLS policies cover the tables being subscribed to — Realtime respects RLS
- [ ] Optimistic updates paired with Realtime confirmation for snappy UX

---

## Notes

- Supabase Realtime uses websockets — ensure Vercel Edge doesn't intercept WS connections
- Channel limit per client: 100 (Supabase Free plan: 200 concurrent connections total per project)
- For high-volume events (>100/sec), use Broadcast not postgres_changes
- Realtime does NOT fire for mutations made via the service role key — only for anon/authenticated clients
- Filter syntax: `column=eq.value`, `column=in.(v1,v2)`, `column=neq.value` — see Supabase docs
- For row-level filtering, Supabase Realtime applies RLS automatically — users only receive events for rows they can SELECT
