---
name: youtube-shorts-story
description: Plan YouTube Shorts end-to-end in the curiosity-animation style (Zack D. Films tier) - story structure, retention engineering, and an AI production recipe the owner can execute without editing skill. Produces a complete VIDEO-PLAN.md with 3 hook variants, a closed-loop script timed to TTS pace, a shot-by-shot list, tool-exact production steps (Seedream 4 keyframes + Hailuo 02 via fal.ai/Krea, OpenAI TTS, free music/SFX, DaVinci Resolve, 1080p->4K upscale), and hard compliance gates (originality layer, zero sexual content, general-audience safety). Use this whenever the user mentions the YouTube channel, Shorts, video ideas, hooks, scripts, retention, AVD, storyboards, faceless or AI video content, or asks to plan, write, script, or improve any short-form video - even if they never say the words "skill" or "YouTube Shorts". Also use for reviewing an existing video plan or diagnosing a video's retention graph.
---

# YouTube Shorts Story Planner

Plan curiosity-driven animated Shorts for a faceless, AI-produced channel. The owner is a business owner, not an editor: every output must be executable by AI tools plus at most ~30 minutes of assembly. The single KPI is **AVD > video length** (average view duration above 100%, achieved via loops and rewatches).

Channel context (locked): children-to-adult general audience, zero sexual content, short-form first, 4K export, production budget $25-80/mo. Long-term: passive income, sponsorships, hired editors once revenue supports them.

## References (read before the relevant step)

- `references/reference-corpus.md` - MEASURED retention PHYSICS from a top performer's top-10 (language grammar, cut counts, loudness, ending taxonomy, title rules). Read FIRST for every video; wins on conflict. Adopt the physics, not the creator's skin.
- `references/content-direction.md` - WHICH videos to make: the stakes/you/twist rule, the proven high-arousal lanes, the KILL LIST of saturated boring formats, and the arousal score. Read FIRST at ideation - it decides what is even worth planning.
- `references/differentiation.md` - the universal-vs-signature split and the channel's own locked identity (visual medium / voice register / topic lane). Read before ideation and before writing any generation prompt - it is what keeps the channel from reading as a clone.
- `references/story-frameworks.md` - structures (premise-drop spine, closed/open loops, start-at-end, anti-hook, A/B storytelling), hook taxonomy, word budgets. Read for steps 2-4.
- `references/retention-playbook.md` - first-3-seconds rules, 3-second rule, loop-seam engineering, reading retention graphs. Read for steps 4-5 and any diagnosis task.
- `references/shot-design.md` - THE method: a short is a fast EDIT of 10-15 DISTINCT shots, not one morphing scene. Shot-type vocabulary, cut rhythm, independent-shot generation, hard cuts. Read for step 5 - this is the fix for "boring one-scene" videos.
- `references/production-stack.md` - locked tool stack (the tool source of truth - overrides any stack named elsewhere in this skill), costs, 4K delivery, recipe template. Read for step 6.
- `references/packaging.md` - titles, burned-in caption styling, Shorts UI safe zones, upload metadata. Read for steps 5-6.
- `references/compliance-gates.md` - originality layer, content safety, COPPA designation, metadata honesty. Read for step 7, every time.

## Workflow

### Step 1: Intake or ideation

Read content-direction.md FIRST - it decides what is even worth planning. Every idea must have STAKES/wonder + (ideally) second-person "you" immersion + a TWIST payoff. Generate candidates from the proven high-arousal lanes (second-person survival/wonder hypothetical, survival/hidden-dark-rule, animal survival drama, safe-morbid body, real mystery) - NOT from the detached "here's how X works" reflex. Score each on the arousal test (stakes, second-person potential, twist strength, shareability, paper-cutout fit), not the old comprehension/loopability score which selects for safe-but-boring. Recommend the highest total; let the user pick.

Kill topics at intake if: they are on content-direction.md's KILL LIST (detached explainer with no stakes/no you/no twist, listicle, fact-dump, "neat" not "wait WHAT"); they cannot be answered honestly in 60 seconds; they need imagery AI generation does poorly (precise text, real faces, brand logos); or they brush any content-safety gate. A merely-interesting fact with no stakes and no twist is a KILL, however true.

Verify the core factual claim against a credible source before Step 4 (scripting); an unverifiable claim is a kill or a reframe, never a guess. This is the fact-check the ship checklist depends on.

### Step 2: Hook engineering (always 3 variants)

Write three hooks for the chosen topic, each a different pattern (e.g. one question hook, one result-first/anti-hook, one what-happens-if). Each hook = first line of narration + first-frame visual description + 4-8 word text overlay. Apply the hook quality bar from story-frameworks.md. Mark your recommended variant and say why; the other two are the A/B backlog.

### Step 3: Structure selection

Default to a **closed loop** on the Zack D. spine (shocking premise -> reveal -> fast explanation -> twist). Deviate only with a reason: open loop when withholding the answer is the tension; start-at-the-end when the payoff visual beats the setup; dual-thread A/B narrative only at 45s+. One framework per video, never blended.

### Step 4: Script

Write narration to the word budget (82-90 words for 30s; measured TTS pace ~2.9-3.0 words/sec, table in story-frameworks.md). Rules: first line is the hook verbatim, no windups, sensory verbs, narration never describes what the visual already shows, end on the twist with the final line reconnecting to the opening (the narrative loop). Include the text-overlay track alongside narration; the story must survive muted viewing.

### Step 5: The EDIT - a shot list of 10-15 DISTINCT shots (read shot-design.md)

NOT one scene stretched to 30s (that is the boring failure). Design the video as a fast EDIT: 10-15 distinct shots, a new composition every ~1.5-3s, cut with rhythm. Vary the shot type every cut (wide -> close -> insert -> POV -> reveal -> climax); never two similar shots in a row. Each shot is generated INDEPENDENTLY (its own image prompt = its own composition/angle, its own dynamic motion prompt) and HARD-CUT together - consistency comes from the shared style anchor + same character/palette in every prompt, NOT from chaining keyframes. Open on the strongest shot (hold ~2s); the final twist/stat shot gets the longest hold (~3s). For each shot: duration, shot-type, image prompt (composition), motion prompt (one clear camera/subject move), caption. Captions obey packaging.md safe zones.

### Step 6: Production recipe

Fill in the recipe template from production-stack.md concretely: per-shot image prompt + DYNAMIC motion prompt (9:16, channel style anchor, no baked text), TTS settings, music/SFX, hard-cut assembly order, 1080p->4K. Build the upload package (3 titles, description, hashtags, audience flag) per packaging.md. Style anchor reused verbatim in every prompt.

Video model: use a model that can MOVE - Veo 3 (cinematic + native motion) or Kling 2.5 (cheaper, dynamic) for hero content. NOT Hailuo image-to-video for anything that needs drama - its gentle drift is why videos read as "crap little animation". Voice: ElevenLabs (premade voices work on the free API tier; community/library voices need paid Starter).

**Production discipline (hard rules - these exist because ignoring them burned real money on 2 rejected videos):**
1. **I cannot see motion or hear audio.** NEVER claim a generated video is "smooth/gripping/good" from extracted still frames - stills cannot show jumpy motion, morphing, pacing, or a bad voice. State only what stills CAN show (composition, style, captions). The USER is the sole judge of the played video.
2. **Test ONE shot before generating the rest.** Generate a single hero shot, put it in front of the user, get their verdict on the MOTION, and only then generate the other 10+. Spend ~$2 to de-risk before ~$12. Never produce a full multi-clip video in an unproven method/model.
3. **Grip/watchability beats differentiation.** "Is it actually gripping" is the first-order test; "is it strategically distinct" is second-order. Do not let a clever anti-slop style choice ship a boring video.

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

## Anti-patterns (do NOT do these)

- **Opening with a question to camera** ("Why do your ears pop?"). The corpus rule is a premise-drop; the narrator never asks the question, the premise creates it in the viewer's head. See reference-corpus.md.
- **Wearing the reference creator's skin** - soft-3D look, default American TTS voice, or his topic rotation. The channel's locked identity (paper-cutout collage + calm non-American narrator) is non-negotiable; a swap-test fail is a rework before any generation spend. See differentiation.md.
- **Naming an avoided tool** - OpenArt-for-video, Suno-as-default, or native Kling/Hailuo subscriptions. production-stack.md is the tool source of truth and lists what to avoid and why.
- **Asserting a measured number without provenance** - cut counts, LUFS, per-clip price, or monthly budget stated with no source reference, or an all-in cost total that does not equal the sum of its line items.
- **Underfilling the word budget** - a 30s script at ~75 words reads as dead air next to the feed. Measured pace is 2.9-3.0 words/sec = 82-90 words for 30s. Cut explanation before payoff, never pad.
- **Overlay text under the Shorts engagement rail** - the most common postability failure; keep text out of the bottom ~300px and right ~140px. See packaging.md.

## Scope limits

This skill plans stories and production recipes; it does not generate the actual video/audio assets (execute the recipe in the named tools), does not schedule uploads, and does not decide channel strategy (niche, cadence, monetization roadmap are owner decisions logged elsewhere). For AuditHQ/Orbit marketing videos, use openart-studio instead - different brand rules apply.
