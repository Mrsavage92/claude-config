# Outbound Pipeline — Supabase Schema

All pipeline state lives in Supabase. Agents are stateless — they read from and write to these tables on every run.

## Migration SQL

Execute this as a single migration via `mcp__claude_ai_Supabase__apply_migration`.

```sql
-- ============================================================
-- OUTBOUND PROSPECTING PIPELINE SCHEMA
-- ============================================================

-- Project configurations
CREATE TABLE outbound_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT,
  
  -- ICP definition
  icp JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "company_size": {"min": 10, "max": 500},
  --   "industries": ["SaaS", "fintech"],
  --   "geographies": ["AU", "US", "UK"],
  --   "technologies": ["React", "Node.js"],
  --   "job_titles": ["CTO", "VP Engineering"],
  --   "revenue_range": {"min": 1000000, "max": 50000000},
  --   "signals": ["hiring", "funding", "tech_change"],
  --   "exclusions": ["competitors", "existing_customers"]
  -- }
  
  -- Messaging config
  value_props JSONB NOT NULL DEFAULT '[]'::jsonb,
  tone TEXT NOT NULL DEFAULT 'professional',  -- professional, casual, technical, executive
  sender_name TEXT NOT NULL,
  sender_title TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_company TEXT NOT NULL,
  calendar_link TEXT,
  
  -- Scheduling
  timezone TEXT NOT NULL DEFAULT 'Australia/Sydney',
  daily_send_limit INTEGER NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  paused_at TIMESTAMPTZ,
  
  -- Notification config
  notification_channel TEXT DEFAULT 'email',  -- email, slack
  notification_target TEXT,  -- email address or slack webhook
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Intent signals that trigger lead capture
CREATE TABLE outbound_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES outbound_projects(id) ON DELETE CASCADE,
  
  signal_type TEXT NOT NULL,
  -- Types: hiring, funding, tech_change, expansion, new_role, 
  --        content_engagement, competitor_switch, event_attendance,
  --        job_posting, product_launch, partnership
  
  signal_source TEXT NOT NULL,  -- linkedin, crunchbase, github, google_alerts, custom
  signal_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  -- Source-specific config: keywords, filters, URLs to monitor
  
  weight NUMERIC(3,2) NOT NULL DEFAULT 1.0,  -- Multiplier for ICP scoring
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  last_checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- All captured leads
CREATE TABLE outbound_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES outbound_projects(id) ON DELETE CASCADE,
  
  -- Contact info
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  linkedin_url TEXT,
  phone TEXT,
  
  -- Company info
  company_name TEXT NOT NULL,
  company_url TEXT,
  company_size TEXT,  -- 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+
  industry TEXT,
  geography TEXT,
  revenue_estimate TEXT,
  technologies JSONB DEFAULT '[]'::jsonb,
  
  -- Enrichment data
  enrichment_data JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "company_description": "...",
  --   "recent_news": [...],
  --   "tech_stack": [...],
  --   "competitors_used": [...],
  --   "social_presence": {...},
  --   "growth_indicators": [...]
  -- }
  
  -- Signal that triggered capture
  trigger_signal_id UUID REFERENCES outbound_signals(id),
  trigger_signal_detail TEXT,  -- Specific signal instance: "Hiring 3 React devs"
  
  -- Scoring
  icp_score INTEGER,  -- 0-100
  score_breakdown JSONB DEFAULT '{}'::jsonb,
  -- Structure: {
  --   "company_size_fit": 20,
  --   "industry_fit": 15,
  --   "technology_fit": 20,
  --   "signal_strength": 25,
  --   "geography_fit": 10,
  --   "seniority_fit": 10
  -- }
  
  -- Pipeline stage
  stage TEXT NOT NULL DEFAULT 'captured',
  -- Stages: captured → researched → qualified → sequenced → 
  --         replied → meeting_booked → converted
  -- Terminal: disqualified, opted_out, bounced, no_response
  
  -- Opt-out tracking
  opted_out BOOLEAN NOT NULL DEFAULT false,
  opted_out_at TIMESTAMPTZ,
  
  -- Metadata
  notes TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Prevent duplicate leads per project
  UNIQUE(project_id, email),
  UNIQUE(project_id, linkedin_url)
);

-- Message sequence templates
CREATE TABLE outbound_sequences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES outbound_projects(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,  -- e.g., "Funding Signal Sequence"
  trigger_signal_type TEXT,  -- Which signal type this sequence targets
  
  -- Sequence steps (ordered array)
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Structure: [
  --   {
  --     "step": 1,
  --     "channel": "email",
  --     "delay_days": 0,
  --     "subject_template": "{{first_name}}, saw {{company_name}} raised...",
  --     "body_template": "Hi {{first_name}},\n\nI noticed {{signal_detail}}...",
  --     "variant": "A"  -- For A/B testing
  --   },
  --   {
  --     "step": 2,
  --     "channel": "linkedin",
  --     "delay_days": 3,
  --     "body_template": "Hi {{first_name}}, I sent you a note about..."
  --   }
  -- ]
  
  -- Performance
  total_sent INTEGER NOT NULL DEFAULT 0,
  total_opened INTEGER NOT NULL DEFAULT 0,
  total_replied INTEGER NOT NULL DEFAULT 0,
  total_booked INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual sent messages
CREATE TABLE outbound_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES outbound_projects(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES outbound_leads(id) ON DELETE CASCADE,
  sequence_id UUID REFERENCES outbound_sequences(id),
  
  step_number INTEGER NOT NULL,
  channel TEXT NOT NULL,  -- email, linkedin, twitter
  
  -- Content (rendered from template)
  subject TEXT,
  body TEXT NOT NULL,
  variant TEXT,  -- A/B test variant
  
  -- Tracking
  status TEXT NOT NULL DEFAULT 'drafted',
  -- drafted → queued → sent → opened → replied → bounced
  
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  bounced_at TIMESTAMPTZ,
  
  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Incoming replies
CREATE TABLE outbound_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES outbound_projects(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES outbound_leads(id) ON DELETE CASCADE,
  message_id UUID REFERENCES outbound_messages(id),
  
  -- Reply content
  channel TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Classification
  sentiment TEXT NOT NULL DEFAULT 'unclassified',
  -- positive, neutral, negative, opt_out, auto_reply, objection, question
  
  classification TEXT,
  -- interested, not_now, not_interested, wrong_person, 
  -- pricing_question, feature_question, competitor_mention,
  -- meeting_request, referral, opt_out
  
  -- Objection details (if applicable)
  objection_type TEXT,
  -- budget, timing, authority, need, competitor, status_quo
  
  -- Response
  auto_response TEXT,  -- Generated response (if applicable)
  response_sent BOOLEAN NOT NULL DEFAULT false,
  escalated_to_human BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Booked meetings
CREATE TABLE outbound_meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES outbound_projects(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES outbound_leads(id) ON DELETE CASCADE,
  
  -- Meeting details
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  meeting_type TEXT NOT NULL DEFAULT 'discovery',  -- discovery, demo, follow_up
  meeting_link TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'scheduled',
  -- scheduled → confirmed → completed → no_show → cancelled → rescheduled
  
  -- Outcome
  outcome TEXT,  -- qualified, not_qualified, follow_up_needed, closed_won, closed_lost
  outcome_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Aggregated analytics (written by Analytics agent)
CREATE TABLE outbound_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES outbound_projects(id) ON DELETE CASCADE,
  
  period_type TEXT NOT NULL,  -- daily, weekly
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  -- Funnel metrics
  leads_captured INTEGER NOT NULL DEFAULT 0,
  leads_researched INTEGER NOT NULL DEFAULT 0,
  leads_qualified INTEGER NOT NULL DEFAULT 0,
  leads_sequenced INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  messages_opened INTEGER NOT NULL DEFAULT 0,
  replies_received INTEGER NOT NULL DEFAULT 0,
  positive_replies INTEGER NOT NULL DEFAULT 0,
  meetings_booked INTEGER NOT NULL DEFAULT 0,
  meetings_completed INTEGER NOT NULL DEFAULT 0,
  
  -- Rates
  open_rate NUMERIC(5,2),
  reply_rate NUMERIC(5,2),
  positive_reply_rate NUMERIC(5,2),
  book_rate NUMERIC(5,2),
  show_rate NUMERIC(5,2),
  
  -- Breakdown
  top_signals JSONB DEFAULT '[]'::jsonb,
  top_sequences JSONB DEFAULT '[]'::jsonb,
  reply_sentiment_breakdown JSONB DEFAULT '{}'::jsonb,
  
  -- Optimization notes from Outreach Director
  optimization_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  UNIQUE(project_id, period_type, period_start)
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_leads_project_stage ON outbound_leads(project_id, stage);
CREATE INDEX idx_leads_project_score ON outbound_leads(project_id, icp_score DESC);
CREATE INDEX idx_leads_created ON outbound_leads(created_at DESC);
CREATE INDEX idx_messages_project_status ON outbound_messages(project_id, status);
CREATE INDEX idx_messages_scheduled ON outbound_messages(scheduled_for) WHERE status = 'queued';
CREATE INDEX idx_replies_project ON outbound_replies(project_id, created_at DESC);
CREATE INDEX idx_replies_unclassified ON outbound_replies(project_id) WHERE sentiment = 'unclassified';
CREATE INDEX idx_meetings_project_status ON outbound_meetings(project_id, status);
CREATE INDEX idx_analytics_project_period ON outbound_analytics(project_id, period_type, period_start DESC);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE outbound_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE outbound_analytics ENABLE ROW LEVEL SECURITY;

-- Service role has full access (agents use service role key)
CREATE POLICY "Service role full access" ON outbound_projects FOR ALL USING (true);
CREATE POLICY "Service role full access" ON outbound_signals FOR ALL USING (true);
CREATE POLICY "Service role full access" ON outbound_leads FOR ALL USING (true);
CREATE POLICY "Service role full access" ON outbound_sequences FOR ALL USING (true);
CREATE POLICY "Service role full access" ON outbound_messages FOR ALL USING (true);
CREATE POLICY "Service role full access" ON outbound_replies FOR ALL USING (true);
CREATE POLICY "Service role full access" ON outbound_meetings FOR ALL USING (true);
CREATE POLICY "Service role full access" ON outbound_analytics FOR ALL USING (true);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outbound_projects_updated_at
  BEFORE UPDATE ON outbound_projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_outbound_leads_updated_at
  BEFORE UPDATE ON outbound_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_outbound_sequences_updated_at
  BEFORE UPDATE ON outbound_sequences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_outbound_meetings_updated_at
  BEFORE UPDATE ON outbound_meetings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

## Key Design Decisions

1. **JSONB for flexible fields** — ICP criteria, enrichment data, sequence steps, and score breakdowns use JSONB so agents can evolve the schema without migrations.

2. **Stage-based pipeline** — Leads move through stages (`captured → researched → qualified → sequenced → replied → meeting_booked → converted`). Each agent only processes leads at its relevant stage.

3. **A/B testing built in** — Sequences support variants. Messages track which variant was sent. Analytics can compare performance by variant.

4. **Opt-out as hard constraint** — `opted_out` is a boolean flag checked by every agent before any action. Once set, the lead is permanently excluded.

5. **Unique constraints on email + LinkedIn per project** — prevents duplicate outreach to the same person across signal sources.

6. **Service role access** — Agents authenticate with the Supabase service role key (stored in project env). No user-level auth needed for the pipeline.

## Querying Patterns

### Get pipeline funnel for a project
```sql
SELECT stage, COUNT(*) as count
FROM outbound_leads
WHERE project_id = $1 AND NOT opted_out
GROUP BY stage
ORDER BY CASE stage
  WHEN 'captured' THEN 1
  WHEN 'researched' THEN 2
  WHEN 'qualified' THEN 3
  WHEN 'sequenced' THEN 4
  WHEN 'replied' THEN 5
  WHEN 'meeting_booked' THEN 6
  WHEN 'converted' THEN 7
  ELSE 8
END;
```

### Get today's qualified leads ready for sequencing
```sql
SELECT * FROM outbound_leads
WHERE project_id = $1
  AND stage = 'qualified'
  AND icp_score >= 70
  AND NOT opted_out
ORDER BY icp_score DESC;
```

### Get unclassified replies needing processing
```sql
SELECT r.*, l.first_name, l.last_name, l.company_name, m.body as original_message
FROM outbound_replies r
JOIN outbound_leads l ON r.lead_id = l.id
LEFT JOIN outbound_messages m ON r.message_id = m.id
WHERE r.project_id = $1
  AND r.sentiment = 'unclassified'
ORDER BY r.created_at ASC;
```

### Get sequence performance for A/B comparison
```sql
SELECT 
  s.name,
  m.variant,
  COUNT(*) as sent,
  COUNT(m.opened_at) as opened,
  COUNT(m.replied_at) as replied,
  ROUND(COUNT(m.opened_at)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as open_rate,
  ROUND(COUNT(m.replied_at)::numeric / NULLIF(COUNT(*), 0) * 100, 1) as reply_rate
FROM outbound_messages m
JOIN outbound_sequences s ON m.sequence_id = s.id
WHERE m.project_id = $1
  AND m.status != 'drafted'
GROUP BY s.name, m.variant
ORDER BY s.name, m.variant;
```
