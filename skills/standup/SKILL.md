---
name: standup
description: Format async standup updates, generate standup summaries from bullet notes, or create a standup template for a team. Use for daily async updates, weekly check-ins, or end-of-sprint summaries.
---

# Standup Formatter

## Purpose

Transforms rough notes into clean async standup updates, or generates standup summaries for teams. Keeps communication concise, scannable, and actionable.

## When to Use

- Writing your own daily async update from rough notes
- Summarising a team's standup for a manager or stakeholder
- Creating a standup template for a new team
- Formatting a weekly check-in or end-of-week summary
- Generating a sprint summary from a list of completed items

## Modes

### Mode 1: Personal Async Update
Input: rough notes about what you did/are doing/are blocked on
Output: clean, formatted standup ready to post in Slack/Notion/Linear

**Format:**
```
## [Your Name] — [Date]

**Yesterday**
- [Completed item 1]
- [Completed item 2]

**Today**
- [In progress item 1]
- [In progress item 2]

**Blockers**
- [Blocker or "None"]

**FYI**
- [Anything the team should know — optional]
```

### Mode 2: Team Summary
Input: multiple team members' updates (pasted in bulk)
Output: synthesised team summary grouped by theme, with blockers surfaced

**Format:**
```
## Team Standup Summary — [Date]

### Shipped / Done
- [Item] — [Owner]

### In Progress
- [Item] — [Owner]

### Blockers (action needed)
- [Blocker] — [Owner] — needs: [who/what]

### Upcoming this week
- [Item] — [Owner]
```

### Mode 3: Weekly Check-in
Input: what you worked on this week + next week plan
Output: structured weekly update for manager/leadership

**Format:**
```
## Weekly Update — [Name] — Week of [Date]

### This Week
**Completed:**
- [Item]

**In Progress:**
- [Item — % complete or next milestone]

**Highlights:**
- [Win, learning, or notable event]

### Next Week
- [Priority 1]
- [Priority 2]
- [Priority 3]

### Help Needed
- [Request or "None"]

### Metrics / Progress
- [Relevant metric if applicable]
```

### Mode 4: Sprint Summary
Input: list of tickets/tasks completed in a sprint
Output: stakeholder-ready sprint summary

**Format:**
```
## Sprint [N] Summary — [Date Range]

### What We Shipped
- [Feature/fix] — [brief description of impact]

### What Didn't Make It (and why)
- [Item] — [reason: scope, blocked, deprioritised]

### Metrics
- Velocity: [X points]
- Bugs fixed: [N]
- Tech debt addressed: [Y/N + brief]

### Next Sprint Focus
- [Top 3 priorities]
```

## Tips

- Keep bullets to one line — if it needs explaining, it's a Slack message not a standup
- Blockers always go at the top of awareness — don't bury them
- "Yesterday I was in meetings" is not a standup — include what the meetings decided
