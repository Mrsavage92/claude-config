# Outbound Pipeline — Scheduled Triggers

This document defines the Claude Code scheduled triggers that make the outbound pipeline run autonomously. Triggers are created during `/outbound init` and managed via `/schedule`.

## Trigger Architecture

Each agent runs as an independent scheduled trigger. Triggers fire in sequence with time gaps to ensure upstream data is ready before downstream agents process it.

```
07:00  ──▶  Signal Capture     (captures new leads)
08:00  ──▶  Lead Research      (enriches captured leads)
09:00  ──▶  ICP Scorer         (scores researched leads)
10:00  ──▶  Message Writer     (sequences qualified leads)
12:00  ──▶  Reply Handler AM   (classifies morning replies)
17:00  ──▶  Reply Handler PM   (classifies afternoon replies)
17:30  ──▶  Meeting Booker     (books meetings from positive replies)

Monday:
08:00  ──▶  Analytics          (weekly performance report)
09:00  ──▶  Outreach Director  (weekly optimization)
```

## Trigger Definitions

### 1. Signal Capture (Daily)

```
Name: outbound-{project_slug}-signals
Schedule: 0 7 * * 1-5  (weekdays at 7 AM)
Prompt: |
  You are the Signal Capture agent for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-signal-capture.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  
  Execute your daily signal capture cycle:
  1. Read signal config from outbound_signals where project_id = '{project_id}'
  2. Scan for new signals matching each active signal type
  3. Deduplicate against existing leads
  4. Insert new leads with stage = 'captured'
  5. Update signal last_checked_at timestamps
  
  Output a summary of leads captured.
Model: sonnet
```

### 2. Lead Research (Daily)

```
Name: outbound-{project_slug}-research
Schedule: 0 8 * * 1-5  (weekdays at 8 AM)
Prompt: |
  You are the Lead Research agent for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-lead-research.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  
  Execute your daily research cycle:
  1. Query leads where project_id = '{project_id}' AND stage = 'captured'
  2. Enrich each lead with company, tech, contact, and pain point data
  3. Update enrichment_data and move to stage = 'researched'
  
  Output a summary of leads enriched.
Model: sonnet
```

### 3. ICP Scorer (Daily)

```
Name: outbound-{project_slug}-scorer
Schedule: 0 9 * * 1-5  (weekdays at 9 AM)
Prompt: |
  You are the ICP Scorer agent for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-icp-scorer.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  
  Execute your daily scoring cycle:
  1. Read ICP config from outbound_projects where id = '{project_id}'
  2. Query leads where project_id = '{project_id}' AND stage = 'researched'
  3. Score each lead 0-100 across 6 dimensions
  4. Qualify (70+) or disqualify (<50) leads
  
  Output a summary with qualification counts and average scores.
Model: sonnet
```

### 4. Message Writer (Daily)

```
Name: outbound-{project_slug}-writer
Schedule: 0 10 * * 1-5  (weekdays at 10 AM)
Prompt: |
  You are the Message Writer agent for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-message-writer.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  
  Execute your daily writing cycle:
  1. Read project config (value props, tone, sender info)
  2. Query qualified leads without active sequences
  3. Craft personalized 3-touch sequences with A/B variants
  4. Queue Touch 1 messages for immediate send
  
  Output a summary of leads sequenced and messages queued.
Model: sonnet
```

### 5. Reply Handler — AM (Daily)

```
Name: outbound-{project_slug}-replies-am
Schedule: 0 12 * * 1-5  (weekdays at noon)
Prompt: |
  You are the Reply Handler agent for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-reply-handler.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  
  Execute your reply handling cycle:
  1. Query unclassified replies for this project
  2. Classify sentiment and type
  3. Process opt-outs immediately
  4. Auto-respond where appropriate
  5. Escalate hot leads
  
  Output a summary of replies processed.
Model: sonnet
```

### 6. Reply Handler — PM (Daily)

```
Name: outbound-{project_slug}-replies-pm
Schedule: 0 17 * * 1-5  (weekdays at 5 PM)
Prompt: [Same as AM trigger]
Model: sonnet
```

### 7. Meeting Booker (Daily)

```
Name: outbound-{project_slug}-booker
Schedule: 30 17 * * 1-5  (weekdays at 5:30 PM)
Prompt: |
  You are the Meeting Booker agent for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-meeting-booker.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  
  Execute your booking cycle:
  1. Query leads with positive replies needing booking
  2. Send calendar links or suggest time slots
  3. Process no-shows with reschedule logic
  
  Output a summary of meetings initiated.
Model: sonnet
```

### 8. Analytics (Weekly)

```
Name: outbound-{project_slug}-analytics
Schedule: 0 8 * * 1  (Mondays at 8 AM)
Prompt: |
  You are the Analytics agent for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-analytics.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  Output directory: ~/Documents/Claude/outputs/outbound/
  
  Execute your weekly analytics cycle:
  1. Query all pipeline data for the past 7 days
  2. Calculate funnel metrics, rates, and trends
  3. Generate A/B test comparison results
  4. Write analytics row to outbound_analytics table
  5. Save OUTBOUND-ANALYTICS.md to output directory
  
  Output the full analytics report.
Model: sonnet
```

### 9. Outreach Director (Weekly)

```
Name: outbound-{project_slug}-director
Schedule: 0 9 * * 1  (Mondays at 9 AM)
Prompt: |
  You are the Outreach Director for the "{project_name}" outbound pipeline.
  Read ~/.claude/skills/outbound/references/agent-outreach-director.md for your full instructions.
  
  Project ID: {project_id}
  Supabase Project: {supabase_project_ref}
  Output directory: ~/Documents/Claude/outputs/outbound/
  
  Execute your weekly optimization cycle:
  1. Read latest analytics data
  2. Calibrate ICP scoring weights based on conversion data
  3. Decide A/B test winners and create new tests
  4. Adjust signal priority weights
  5. Identify pipeline bottlenecks
  6. Save OPTIMIZATION-REPORT.md to output directory
  
  Output the full optimization report with all changes made.
Model: sonnet
```

## Trigger Management Commands

### Create all triggers for a project
```bash
# During /outbound init, create all 9 triggers programmatically
# using the /schedule skill for each trigger definition above
```

### Pause all triggers
```bash
# /outbound pause {project} — sets is_active = false on project
# and pauses all triggers matching outbound-{project_slug}-*
```

### Resume all triggers
```bash
# /outbound resume {project} — sets is_active = true
# and resumes all matching triggers
```

### Check trigger status
```bash
# /outbound status {project} — lists all triggers with:
# - Next scheduled run
# - Last run status
# - Last run summary
```

## Model Routing

All scheduled agents use `model: sonnet` by default. This is intentional:
- Agents perform operational tasks (search, score, write) — not strategic analysis
- Sonnet is cost-effective for execution work
- The Outreach Director could be upgraded to Opus if optimization quality needs to improve
- Signal Capture could potentially use Haiku since it's mostly search + filter

## Error Handling

If a scheduled trigger fails:
1. The error is logged in the trigger's output
2. The next trigger in sequence still fires (agents are independent)
3. Unprocessed leads remain in their current stage for the next day's cycle
4. The weekly Analytics report flags any anomalies (e.g., 0 leads captured)

## Timezone Handling

All cron schedules are in the project's configured timezone. When creating triggers via `/schedule`, convert to the appropriate timezone offset.

Default: `Australia/Sydney` (AEST/AEDT)
