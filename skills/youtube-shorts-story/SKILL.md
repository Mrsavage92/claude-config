---
name: youtube-shorts-story
description: Plan YouTube Shorts end-to-end in the curiosity-animation style (Zack D. Films tier) - story structure, retention engineering, and an AI production recipe the owner can execute without editing skill. Produces a complete VIDEO-PLAN.md with 3 hook variants, a closed-loop script timed to TTS pace, a shot-by-shot list, tool-exact production steps (Seedream 4 keyframes + Hailuo 02 via fal.ai/Krea, OpenAI TTS, free music/SFX, DaVinci Resolve, 1080p->4K upscale), and hard compliance gates (originality layer, zero sexual content, general-audience safety). Use this whenever the user mentions the YouTube channel, Shorts, video ideas, hooks, scripts, retention, AVD, storyboards, faceless or AI video content, or asks to plan, write, script, or improve any short-form video - even if they never say the words "skill" or "YouTube Shorts". Also use for reviewing an existing video plan or diagnosing a video's retention graph.
---

# YouTube Shorts Story Planner

Plan curiosity-driven animated Shorts for a faceless, AI-produced channel. The owner is a business owner, not an editor: every output must be executable by AI tools plus at most ~30 minutes of assembly. The single KPI is **AVD > video length** (average view duration above 100%, achieved via loops and rewatches).

Channel context (locked): children-to-adult general audience, zero sexual content, short-form first, 4K export, production budget $25-80/mo. Long-term: passive income, sponsorships, hired editors once revenue supports them.

## References (read before the relevant step)

- `references/reference-corpus.md` - MEASURED retention PHYSICS from a top performer's top-10 (language grammar, cut counts, loudness, ending taxonomy, title rules). Read FIRST for every video; wins on conflict. Adopt the physics, not the creator's skin.
- `references/differentiation.md` - the universal-vs-signature split and the channel's own locked identity (visual medium / voice register / topic lane). Read before ideation and before writing any generation prompt - it is what keeps the channel from reading as a clone.
- `references/story-frameworks.md` - structures (premise-drop spine, closed/open loops, start-at-end, anti-hook, A/B storytelling), hook taxonomy, word budgets. Read for steps 2-4.
- `references/retention-playbook.md` - first-3-seconds rules, 3-second rule, loop-seam engineering, reading retention graphs. Read for steps 4-5 and any diagnosis task.
- `references/production-stack.md` - locked tool stack (the tool source of truth - overrides any stack named elsewhere in this skill), costs, 4K delivery, recipe template. Read for step 6.
- `references/packaging.md` - titles, burned-in caption styling, Shorts UI safe zones, upload metadata. Read for steps 5-6.
- `references/compliance-gates.md` - originality layer, content safety, COPPA designation, metadata honesty. Read for step 7, every time.

## Workflow

### Step 1: Intake or ideation

If given a topic, restate it as a single-sentence question a 10-year-old would understand. If asked for ideas, generate 5-10 candidates from the hook taxonomy (question, what-happens-if, hidden mechanism, expert secret, scale shift, forbidden/impossible) and score each 1-5 on: instant comprehension, surprise-for-adults, visual potential in AI generation, loopability. Recommend the highest total; let the user pick.

Kill topics at intake if they cannot be answered honestly in 60 seconds, need imagery AI generation does poorly (precise text, real faces, brand logos), or brush any content-safety gate.

Verify the core factual claim against a credible source before Step 4 (scripting); an unverifiable claim is a kill or a reframe, never a guess. This is the fact-check the ship checklist depends on.

### Step 2: Hook engineering (always 3 variants)

Write three hooks for the chosen topic, each a different pattern (e.g. one question hook, one result-first/anti-hook, one what-happens-if). Each hook = first line of narration + first-frame visual description + 4-8 word text overlay. Apply the hook quality bar from story-frameworks.md. Mark your recommended variant and say why; the other two are the A/B backlog.

### Step 3: Structure selection

Default to a **closed loop** on the Zack D. spine (shocking premise -> reveal -> fast explanation -> twist). Deviate only with a reason: open loop when withholding the answer is the tension; start-at-the-end when the payoff visual beats the setup; dual-thread A/B narrative only at 45s+. One framework per video, never blended.

### Step 4: Script

Write narration to the word budget (82-90 words for 30s; measured TTS pace ~2.9-3.0 words/sec, table in story-frameworks.md). Rules: first line is the hook verbatim, no windups, sensory verbs, narration never describes what the visual already shows, end on the twist with the final line reconnecting to the opening (the narrative loop). Include the text-overlay track alongside narration; the story must survive muted viewing.

### Step 5: Shot list

Break the script into shots of 1.5-3 seconds. For each shot: duration, visual description (concrete enough to be a generation prompt), overlay text, SFX cue. Verify: new visual event at least every 3s; first and last frames bookend (identical or near-identical for the loop seam); total duration matches script length at TTS pace. Overlay text obeys the safe zones and styling rules in packaging.md - text under the Shorts engagement rail is the most common postability failure.

### Step 6: Production recipe

Fill in the recipe template from production-stack.md concretely: per-shot generation prompts (9:16, 5s clips, channel style anchor phrase, no text baked into frames), TTS settings, music/SFX selections (free library by default; Suno only at the revenue tier), SFX list, DaVinci assembly order with audio ducking, 1080p generation then upscale-master-to-4K export settings. Build the upload package (3 title candidates, description, hashtags, audience flag) per packaging.md. The channel style anchor is set once at channel level; reuse it verbatim in every prompt.

Provenance (traceability): any measured or cost figure the plan states (cut counts, LUFS, per-clip price, monthly budget) names its source reference inline, e.g. "0-3 hard cuts (reference-corpus.md)" or "~$32-37/mo (production-stack.md)". The all-in cost total must equal the sum of its own line items - add them up and check, never state a rounded total that does not reconcile.

### Step 7: Differentiation + compliance gates (hard stop)

First run the differentiation test from differentiation.md: the video must use the channel's OWN locked visual medium, voice register, and topic angle - never the reference creator's signature look/voice/topics (swap test: could a viewer tell this from the reference by visuals alone?). Then run the ship checklist from compliance-gates.md and include it filled-in. The unique-angle line must name the video's own creative decision - "AI-generated" is not an answer. Any unchecked box or failed differentiation test blocks the plan from shipping.

## Output format

ALWAYS deliver one file per video using this exact template:

```markdown
# VIDEO-PLAN: [title, <=60 chars, states the question]

## Concept
[1 sentence question] | Length: [N]s | Framework: [closed loop / open loop / start-at-end / dual-thread]
Originality layer: [the unique creative decision, named]

## Hooks (produce A, hold B/C for testing)
A (recommended): VO "[line]" | Frame: [visual] | Overlay: "[4-8 words]" | Why: [reason]
B: ...
C: ...

## Script ([N] words / [N]s)
[narration with (overlay: ...) markers]

## Shot list
| # | Dur | Visual (generation-ready) | Overlay | SFX |

## Production recipe
[filled template from production-stack.md]

## Ship checklist
[filled checklist from compliance-gates.md]

## Measurement
Hook pattern logged: [pattern] | Structure: [framework]
After 48-72h check: retention graph shape target = flat first third, end spike past 100% (loop working)
```

## Diagnosis mode

When asked why a published video underperformed, read retention-playbook.md and map the retention graph to the failing layer: early cliff = hook (first 2s), mid sag = 3-second rule/pacing, no end spike = loop seam. Recommend ONE variable to change in the next video, never three.

## Scope limits

This skill plans stories and production recipes; it does not generate the actual video/audio assets (execute the recipe in the named tools), does not schedule uploads, and does not decide channel strategy (niche, cadence, monetization roadmap are owner decisions logged elsewhere). For AuditHQ/Orbit marketing videos, use openart-studio instead - different brand rules apply.
