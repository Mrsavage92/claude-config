# /web-ai

AI integration skill for the web-* suite. Covers Anthropic Claude API via Supabase Edge Functions, streaming responses, cost tracking, chat UI, and prompt template management.

**Call this skill when:** any page needs an AI chat interface, AI-powered analysis, streaming output, or per-user cost tracking.

**Stack:** Anthropic SDK → Supabase Edge Function (proxy, keeps key server-side) → React streaming hooks → shadcn/ui chat primitives.

---

## Phase 0 — Pre-checks

Read SCOPE.md. Answer:
- Which feature requires AI? (chat, analysis, generation, classification)
- Is the output streamed or one-shot?
- Is there a per-user token budget or cost cap?
- What models are in play? (default: claude-haiku-4-5-20251001 for fast/cheap, claude-sonnet-4-6 for quality)
- Are prompt templates parameterised per user context?

---

## Phase 1 — Supabase Edge Function Proxy

**Why proxy:** `ANTHROPIC_API_KEY` must never reach the browser. All AI calls go through an authenticated Edge Function.

### 1a — Edge Function scaffold

Create `supabase/functions/ai-chat/index.ts`:

```typescript
import Anthropic from 'npm:@anthropic-ai/sdk'
import { createClient } from 'npm:@supabase/supabase-js'

const anthropic = new Anthropic({ apiKey: Deno.env.get('ANTHROPIC_API_KEY') })

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return new Response('Unauthorized', { status: 401 })

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return new Response('Unauthorized', { status: 401 })

    const { messages, system, model = 'claude-haiku-4-5-20251001', max_tokens = 1024 } = await req.json()

    // Cost guard — check user's remaining budget
    const { data: usage } = await supabase
      .from('ai_usage')
      .select('tokens_used')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

    const totalTokens = (usage ?? []).reduce((sum, r) => sum + r.tokens_used, 0)
    const MONTHLY_LIMIT = parseInt(Deno.env.get('AI_MONTHLY_TOKEN_LIMIT') ?? '100000')
    if (totalTokens >= MONTHLY_LIMIT) {
      return new Response(JSON.stringify({ error: 'monthly_limit_exceeded' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Streaming response
    const stream = await anthropic.messages.stream({
      model,
      max_tokens,
      system,
      messages,
    })

    const encoder = new TextEncoder()
    let inputTokens = 0
    let outputTokens = 0

    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`))
          }
          if (chunk.type === 'message_delta' && chunk.usage) {
            outputTokens = chunk.usage.output_tokens
          }
          if (chunk.type === 'message_start' && chunk.message.usage) {
            inputTokens = chunk.message.usage.input_tokens
          }
        }

        // Log usage after stream completes
        await supabase.from('ai_usage').insert({
          user_id: user.id,
          model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          tokens_used: inputTokens + outputTokens,
        })

        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'internal_error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

Deploy:
```bash
supabase functions deploy ai-chat
```

Set secrets:
```bash
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase secrets set AI_MONTHLY_TOKEN_LIMIT=100000
```

---

### 1b — ai_usage table migration

Apply via Supabase MCP `apply_migration`:

```sql
create table ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  model text not null,
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  tokens_used integer not null default 0,
  created_at timestamptz default now()
);

create index ai_usage_user_month on ai_usage (user_id, created_at);

alter table ai_usage enable row level security;
create policy "Users see own usage" on ai_usage for select using (auth.uid() = user_id);
create policy "Edge function inserts" on ai_usage for insert with check (true);
```

---

## Phase 2 — React Streaming Hook

Create `src/hooks/use-ai-stream.ts`:

```typescript
import { useState, useRef, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UseAIStreamOptions {
  system?: string
  model?: string
  maxTokens?: number
  onComplete?: (fullText: string) => void
  onError?: (error: string) => void
}

export function useAIStream(options: UseAIStreamOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const abortRef = useRef<(() => void) | null>(null)

  const send = useCallback(async (userMessage: string) => {
    const newMessages: Message[] = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setStreaming(true)
    setStreamingText('')

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          messages: newMessages,
          system: options.system,
          model: options.model,
          max_tokens: options.maxTokens,
        }),
      })

      if (response.status === 429) {
        options.onError?.('monthly_limit_exceeded')
        setStreaming(false)
        return
      }

      if (!response.ok) throw new Error(`HTTP ${response.status}`)

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      abortRef.current = () => reader.cancel()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break

          try {
            const parsed = JSON.parse(data)
            if (parsed.text) {
              fullText += parsed.text
              setStreamingText(fullText)
            }
          } catch {
            // partial chunk — ignore
          }
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText }])
      setStreamingText('')
      options.onComplete?.(fullText)
    } catch (err) {
      options.onError?.(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }, [messages, options])

  const abort = useCallback(() => {
    abortRef.current?.()
    setStreaming(false)
    setStreamingText('')
  }, [])

  const reset = useCallback(() => {
    setMessages([])
    setStreamingText('')
    setStreaming(false)
  }, [])

  return { messages, streaming, streamingText, send, abort, reset }
}
```

---

## Phase 3 — Chat UI Component

Create `src/components/ai/AIChat.tsx`:

```tsx
import { useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { useAIStream } from '@/hooks/use-ai-stream'
import { cn } from '@/lib/utils'
import { Send, Square, RotateCcw, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface AIChatProps {
  system?: string
  placeholder?: string
  model?: string
  className?: string
}

export function AIChat({ system, placeholder = 'Ask anything...', model, className }: AIChatProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const { messages, streaming, streamingText, send, abort, reset } = useAIStream({
    system,
    model,
    onError: (err) => {
      if (err === 'monthly_limit_exceeded') {
        alert('Monthly AI limit reached. Upgrade to continue.')
      }
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  const handleSend = async () => {
    if (!input.trim() || streaming) return
    const text = input.trim()
    setInput('')
    await send(text)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const allMessages = [
    ...messages,
    ...(streaming && streamingText ? [{ role: 'assistant' as const, content: streamingText, streaming: true }] : []),
  ]

  return (
    <div className={cn('flex flex-col h-full border rounded-xl overflow-hidden bg-background', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">AI Assistant</span>
          {model && <Badge variant="secondary" className="text-xs">{model}</Badge>}
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="h-7 gap-1 text-xs">
            <RotateCcw className="h-3 w-3" /> New chat
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {allMessages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-muted-foreground py-12">
            <Sparkles className="h-8 w-8 opacity-30" />
            <p className="text-sm">{placeholder}</p>
          </div>
        )}
        <div className="space-y-4">
          {allMessages.map((msg, i) => (
            <div key={i} className={cn('flex gap-3', msg.role === 'user' && 'flex-row-reverse')}>
              <Avatar className="h-7 w-7 shrink-0">
                <div className={cn(
                  'h-full w-full rounded-full flex items-center justify-center text-xs font-medium',
                  msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                )}>
                  {msg.role === 'user' ? 'U' : <Sparkles className="h-3 w-3" />}
                </div>
              </Avatar>
              <div className={cn(
                'max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed',
                msg.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted',
                'streaming' in msg && msg.streaming && 'after:content-["▋"] after:ml-0.5 after:animate-pulse'
              )}>
                {msg.content}
              </div>
            </div>
          ))}
        </div>
        <div ref={bottomRef} />
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-muted/20">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="resize-none min-h-[40px] max-h-[120px] text-sm"
            disabled={streaming}
          />
          {streaming ? (
            <Button size="icon" variant="destructive" onClick={abort} className="shrink-0">
              <Square className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" onClick={handleSend} disabled={!input.trim()} className="shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
```

---

## Phase 4 — Prompt Template System

Create `src/lib/ai-prompts.ts`:

```typescript
type PromptVars = Record<string, string | number>

function fill(template: string, vars: PromptVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => String(vars[key] ?? `{{${key}}}`))
}

// Define all system prompts here — never inline them in components
export const prompts = {
  analyst: (context: { productName: string; userRole: string }) => fill(
    `You are an expert analyst for {{productName}}. The user is a {{userRole}}.
Be concise, data-driven, and actionable. Format responses in markdown.`,
    context
  ),

  reviewer: (context: { documentType: string }) => fill(
    `You are reviewing a {{documentType}}. Identify issues, suggest improvements, and score quality 1-10.
Use bullet points. Be specific, not vague.`,
    context
  ),

  classifier: () =>
    `Classify the input into exactly one category. Respond with JSON only: { "category": "...", "confidence": 0.0-1.0 }. No other text.`,
}
```

Usage in components:
```tsx
import { prompts } from '@/lib/ai-prompts'

const { send } = useAIStream({
  system: prompts.analyst({ productName: 'AuditHQ', userRole: 'auditor' }),
})
```

---

## Phase 5 — Cost Dashboard Widget

Create `src/components/ai/AICostWidget.tsx`:

```tsx
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Progress } from '@/components/ui/progress'

const MODEL_COSTS = {
  'claude-haiku-4-5-20251001': { input: 0.00025, output: 0.00125 },  // per 1K tokens
  'claude-sonnet-4-6': { input: 0.003, output: 0.015 },
  'claude-opus-4-7': { input: 0.015, output: 0.075 },
}

export function AICostWidget() {
  const { data } = useQuery({
    queryKey: ['ai-usage'],
    queryFn: async () => {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('ai_usage')
        .select('model, input_tokens, output_tokens, tokens_used')
        .gte('created_at', startOfMonth.toISOString())

      const cost = (data ?? []).reduce((sum, row) => {
        const rates = MODEL_COSTS[row.model as keyof typeof MODEL_COSTS]
        if (!rates) return sum
        return sum + (row.input_tokens / 1000) * rates.input + (row.output_tokens / 1000) * rates.output
      }, 0)

      const totalTokens = (data ?? []).reduce((sum, r) => sum + r.tokens_used, 0)

      return { cost, totalTokens, rows: data?.length ?? 0 }
    },
  })

  const MONTHLY_TOKEN_LIMIT = 100_000
  const pct = Math.min(((data?.totalTokens ?? 0) / MONTHLY_TOKEN_LIMIT) * 100, 100)

  return (
    <div className="rounded-lg border p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">AI usage this month</span>
        <span className="font-medium">${(data?.cost ?? 0).toFixed(4)}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
      <p className="text-xs text-muted-foreground">
        {(data?.totalTokens ?? 0).toLocaleString()} / {MONTHLY_TOKEN_LIMIT.toLocaleString()} tokens
      </p>
    </div>
  )
}
```

---

## Phase 6 — .env.example additions

```
# AI (Anthropic — server-side only, set in Supabase secrets)
# supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
# supabase secrets set AI_MONTHLY_TOKEN_LIMIT=100000
```

No `VITE_` prefix — these live in Supabase Edge Function secrets, never the browser.

---

## Checklist

- [ ] Edge Function deployed: `supabase functions deploy ai-chat`
- [ ] `ANTHROPIC_API_KEY` set via `supabase secrets set`
- [ ] `ai_usage` table exists with RLS
- [ ] Monthly token limit enforced (returns 429)
- [ ] `useAIStream` hook handles streaming, abort, and 429
- [ ] `AIChat` component renders streaming cursor animation
- [ ] Prompt templates in `ai-prompts.ts` — no inline system prompts in components
- [ ] `AICostWidget` in settings page or admin dashboard
- [ ] Auth header sent on every Edge Function call

---

## Notes

- Never call Anthropic directly from the browser — always proxy through Edge Function
- For one-shot (non-streaming) responses: change `stream()` to `messages.create()` and return JSON
- For file analysis (PDFs, images): pass base64 content in the message array using the vision message format
- Token limits are approximate — Anthropic billing is the source of truth, not this table
- For multi-tenant products: add `org_id` to `ai_usage` and cap per org, not per user
