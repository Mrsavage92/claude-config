---
name: agent-brief
description: Generate a portable context brief for spawned subagents. Since Claude Code subagents don't inherit conversation history, this command creates a self-contained briefing document that can be pasted into any agent spawn. Use when orchestrating multi-agent workflows, sharing context with a new Claude Code session, or handing off a project mid-flight.
---

# Agent Brief Generator

Subagents and new Claude Code sessions start with no context from your current conversation. This command captures everything they need to work effectively.

## Generate a Brief

Ask Claude to create a brief with this structure:

---

**CONTEXT BRIEF — [Project Name] — [Date]**

**Who:** [Company/client name, industry, size]

**What we're building/solving:** [1-2 sentence problem statement]

**Current state:** [What exists today — product, codebase, metrics, situation]

**Your task:** [Specific deliverable this agent must produce]

**Constraints:**
- Budget/timeline: [if relevant]
- Tech stack: [if relevant]
- Tone/brand voice: [if relevant]
- Do NOT: [things to avoid]

**Key files/URLs:** [List any relevant paths or links the agent needs]

**Output format:** [Markdown doc / JSON / inline code / etc.]

**Definition of done:** [What a complete, correct output looks like]

---

## Usage Patterns

### 1. Orchestrated parallel spawn
Paste the full brief into each `Agent` tool call so every subagent has identical context:
```
Use the Agent tool with this prompt: "[CONTEXT BRIEF above] + [specific task]"
```

### 2. Handoff to new session
Start a new Claude Code session and paste the brief as your first message to instantly prime context.

### 3. Specialist delegation
When routing to a domain agent, prepend the brief so the agent doesn't ask clarifying questions:
```
/agent-brief → copy output → spawn cs-financial-analyst with brief prepended
```

## Tips

- Include actual numbers, not vague descriptors ("£2M ARR" not "mid-stage startup")
- If the agent needs to read files, list the exact paths — subagents won't know where to look
- For creative tasks, paste 2-3 examples of the tone/style you want
- Brief length: aim for 150-300 words — enough context, not enough to drown in
