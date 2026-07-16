---
name: youtube-shorts-story
description: Plan YouTube Shorts end-to-end in the curiosity-animation style (Zack D. Films tier) - story structure, retention engineering, and an AI production recipe the owner can execute without editing skill. Produces a complete VIDEO-PLAN.md with 3 hook variants, a closed-loop script timed to TTS pace, a shot-by-shot list, tool-exact production steps (Seedream 4 keyframes + Kling 1.6 Elements via fal.ai (character shots only, approval-gated), ElevenLabs expressive voice, free music/SFX, word-by-word animated captions, 1080p-to-4K upscale), and hard compliance gates (originality layer, zero sexual content, general-audience safety). Use this whenever the user mentions the YouTube channel, Shorts, video ideas, hooks, scripts, retention, AVD, storyboards, faceless or AI video content, or asks to plan, write, script, or improve any short-form video - even if they never say the words "skill" or "YouTube Shorts". Also use for reviewing an existing video plan or diagnosing a video's retention graph.
---

# YouTube Shorts Story Planner

Plan curiosity-driven animated Shorts for a faceless, AI-produced channel. The owner is a business owner, not an editor: every output must be executable by AI tools plus at most ~30 minutes of assembly. The single KPI is **AVD > video length** (average view duration above 100%, achieved via loops and rewatches).

Channel context (locked): **NOT Made for Kids** - general audience targeting teens 13-17 + 18-34 (compliance-gates.md Gate 6; Made-for-Kids = a 50-80% revenue cut). Kid-SAFE, never kid-DIRECTED. Zero sexual content, short-form first, 1080p default (NO 4K on a 576px free source), $0 production default (paid tools only on explicit per-video approval). Long-term: passive income, sponsorships, hired editors once revenue supports them.

## References (read before the relevant step)

- `references/current-playbook.md` - LIVE "what wins TODAY" snapshot (format, style, structure, voice, captions, policy) from dated research. Read FIRST alongside reference-corpus.md; on format/style/voice/policy it wins over older files. RE-VERIFY if its date is >60 days old.
- `references/reference-corpus.md` - MEASURED retention PHYSICS from a top performer's top-10 (language grammar, cut counts, loudness, ending taxonomy, title rules). Read FIRST for every video; wins on the retention physics. Adopt the physics, not the creator's skin.
- `references/content-direction.md` - WHICH videos to make: the stakes/you/twist rule, the proven high-arousal lanes, the KILL LIST of saturated boring formats, and the arousal score. Read FIRST at ideation - it decides what is even worth planning.
- `references/differentiation.md` - the universal-vs-signature split and the channel's own locked identity (visual medium / voice register / topic lane). Read before ideation and before writing any generation prompt - it is what keeps the channel from reading as a clone.
- `references/story-frameworks.md` - structures (premise-drop spine, closed/open loops, start-at-end, anti-hook, A/B storytelling), hook taxonomy, word budgets. Read for steps 2-4.
- `references/retention-playbook.md` - first-3-seconds rules, 3-second rule, loop-seam engineering, reading retention graphs. Read for steps 4-5 and any diagnosis task.
- `references/shot-design.md` - THE method: a short is a fast EDIT of 10-15 DISTINCT shots, not one morphing scene. Shot-type vocabulary, cut rhythm, independent-shot generation, hard cuts. Read for step 5 - this is the fix for "boring one-scene" videos.
- `references/production-stack.md` - the PAID-TIER tool stack, costs, 4K delivery, recipe template. Read for step 6. **Precedence (corrected 2026-07-15): current-playbook.md's $0 lock OVERRIDES this file on cost tier and default model/voice. production-stack.md is the source of truth only for the paid upgrade tier, once spend is approved.**
- `references/packaging.md` - titles, burned-in caption styling, Shorts UI safe zones, upload metadata. Read for steps 5-6.
- `references/compliance-gates.md` - originality layer, content safety, COPPA designation, metadata honesty. Read for step 7, every time.

## Workflow

### Step 1: Intake or ideation

**THE ANTAGONIST TEST (hard kill, run FIRST).** # source: https://becomeviral.com/blog/real-engineering-case-study
Name the ANTAGONIST and the CONFLICT in one line before anything else. Not "the topic is interesting" - who or what is the adversary, and what is at stake?
> "People don't watch engineering videos to learn engineering. They watch to understand why the world works the way it does. Most engineering channels explain the WHAT... Real Engineering explains the WHY IT MATTERS - and that distinction is the entire secret."
A script that explains *what happens* with no adversary is the definition of correct-but-boring and is a **KILL**, however true. Reframe as conflict or drop it.
**Worked failure (2026-07-15):** "a hiccup is a leftover gill reflex" - true, tidy, no antagonist, no stakes. Founder verdict on the finished video: "boring content I would wipe." The fix was never a better script of the same idea; the idea had no conflict in it.
Good: *your own brain is the adversary and it is trying to kill the thing keeping you alive.* Bad: *here is how hiccups work.*

Read content-direction.md FIRST - it decides what is even worth planning. Every idea must have STAKES/wonder + (ideally) second-person "you" immersion + a TWIST payoff. Generate candidates from the proven high-arousal lanes (second-person survival/wonder hypothetical, survival/hidden-dark-rule, animal survival drama, safe-morbid body, real mystery) - NOT from the detached "here's how X works" reflex. Score each on the arousal test (stakes, second-person potential, twist strength, shareability, channel-style fit), not the old comprehension/loopability score which selects for safe-but-boring. Recommend the highest total; let the user pick.

Kill topics at intake if: they are on content-direction.md's KILL LIST (detached explainer with no stakes/no you/no twist, listicle, fact-dump, "neat" not "wait WHAT"); they cannot be answered honestly in 60 seconds; they need imagery AI generation does poorly (precise text, real faces, brand logos); or they brush any content-safety gate. A merely-interesting fact with no stakes and no twist is a KILL, however true.

Verify the core factual claim against a credible source before Step 4 (scripting); an unverifiable claim is a kill or a reframe, never a guess. This is the fact-check the ship checklist depends on.

### Step 2: Hook engineering (always 3 variants)

Write three hooks for the chosen topic, each a different pattern (e.g. one question hook, one result-first/anti-hook, one what-happens-if). Each hook = first line of narration + first-frame visual description + 4-8 word text overlay. Apply the hook quality bar from story-frameworks.md. Mark your recommended variant and say why; the other two are the A/B backlog.

### Step 3: Structure selection

Default to a **closed loop** on the Zack D. spine (shocking premise -> reveal -> fast explanation -> twist). Deviate only with a reason: open loop when withholding the answer is the tension; start-at-the-end when the payoff visual beats the setup; dual-thread A/B narrative only at 45s+. One framework per video, never blended.

### Step 4: Script

Write narration to the word budget. **CANONICAL PACE (one number, 2026-07-15):** every measured winning channel narrates FAST - 2.78-3.65 w/s across three channels, Zack D at 2.96. Fast pace is UNIVERSAL. Our TTS at default reads ~2.4-2.5 w/s, which is SLOWER THAN EVERY MEASURED WINNER - that is a defect to correct, not a target to write to. **Raise the TTS rate (edge-tts `--rate=+30%`, ElevenLabs speed ~1.15) to land ~2.9 w/s**, then write to **82-90 words per 30s**. NEVER slow the voice down for 'gravitas' - that is how a short reads as sluggish. Then ALWAYS measure the rendered VO and set video duration from the measured length (never the estimate). Rules: first line is the hook verbatim, no windups, sensory verbs, narration never describes what the visual already shows, end on the twist with the final line reconnecting to the opening (the narrative loop). Include the text-overlay track alongside narration; the story must survive muted viewing.

### Step 5: The EDIT - a shot list of 10-15 DISTINCT shots (read shot-design.md)

NOT one scene stretched to 30s (that is the boring failure). Design the video as an EDIT of 10-15 distinct shots.
**Cut frequency is NOT the entertainment lever - do not confuse cutting with pacing.** # source: https://www.tubefilter.com/2024/03/04/mrbeast-editing-style-number-of-cuts-per-video/
MrBeast MEASURED the reverse: cuts 38/60s -> 23/60s, slower pacing, longer unbroken shots, **more personality**, more breathing room -> views ~60M -> ~150M. His verdict: "get rid of the ultra fast paced/overstim era of content. It doesn't even work." (Caveat: that is LONG-FORM data - do not import the numbers. The transferable half is *personality and letting beats breathe*.) And: "Cutting faster than your story can carry will hurt retention, not help it" (https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8).
So: multi-shot because one morphing scene is boring AND because our pipeline only makes ~5s clips - not because faster = better. Let the payoff beat BREATHE. New composition every ~1.5-3s as a default rhythm, varied deliberately, not mechanically.
**Shot scale (measured, n=400 labelled TikToks):** default to **CLOSE-UP and MEDIUM** - both "play an essential role" in virality; wide/establishing is the weaker configuration, and on-screen text + POV framing measurably help (https://arxiv.org/pdf/2111.02452). Our rejected videos were full of wide shots of objects in empty space.
**Pattern interrupt:** name ONE deliberate reset (camera/music/SFX change) at the script's natural drift point (~25-35s in a 40s+ cut). Vary the shot type every cut (wide -> close -> insert -> POV -> reveal -> climax); never two similar shots in a row. Generate each shot with its own composition and motion prompt, but design adjacent boundary frames deliberately. Use a hard cut only when the visual change is motivated and both sides contain compatible motion; otherwise use a short continuity-aware blend. Never hard-cut a moving character clip into a still-image reaction or use a zoom on one frame as fake motion. Open on the strongest shot (hold ~2s); the final twist/stat shot gets the longest hold (~3s). For each shot: duration, shot-type, image prompt, motion prompt, incoming/outgoing continuity state, and caption. Captions obey packaging.md safe zones.

### Step 6: Production recipe

Fill in the recipe template from production-stack.md concretely: per-shot image prompt + DYNAMIC motion prompt (9:16, channel style anchor, no baked text), TTS settings, music/SFX, hard-cut assembly order, 1080p->4K. Build the upload package (3 titles, description, hashtags, audience flag) per packaging.md. Style anchor reused verbatim in every prompt.

Video model: **DEFAULT = $0 (founder constraint, current-playbook.md): free ffmpeg kinetic still-motion on keyframes, NO paid video model, unless the founder explicitly approves spend.** Known tradeoff: still-motion reads flatter than real i2v - if the plan needs real motion, say so and ASK before assuming budget. Paid tier (on approval only): use production-stack.md's locked source of truth - **Kling 1.6 Elements via fal.ai (character shots only, approval-gated)** is the workhorse (dynamic, native multi-shot, ~$2-4/video); Veo 3.1 for the one hero shot only. NOT Hailuo image-to-video for anything that needs drama - its gentle drift is why videos read as "crap little animation". Voice (DEFAULT = $0 while pre-traction, per current-playbook.md's locked production model): **edge-tts neural** via `pipeline/gen-vo-edge.py` (en-GB-RyanNeural), rate raised to land ~2.9 w/s. ElevenLabs George is the UPGRADE once the founder explicitly approves spend - do not default to it. Whichever is used: select the regional accent explicitly, audition the exact script, reject generic American social-media cadence, and never slow the rate for 'gravitas'. Prefer the provider's timestamped endpoint for the final take. Captions: exact-script white semibold/bold subtitles with dark outline, no more than two balanced lines, horizontally centered with the text block around 75% of frame height unless the plan explicitly calls for another safe zone. Do not substitute conceptual overlay copy for subtitles.

**Production discipline (hard rules - these exist because ignoring them burned real money on 2 rejected videos):**
1. **I cannot see motion or hear audio.** NEVER claim a generated video is "smooth/gripping/good" from extracted still frames - stills cannot show jumpy motion, morphing, pacing, or a bad voice. State only what stills CAN show (composition, style, captions). The USER is the sole judge of the played video.
2. **Test ONE shot before generating the rest - scoped to NEW pipeline elements** (a new tool, a new model, a new budget tier, a new character/style). The claymation-Pip + George + Kling formula is PROVEN (video 06, founder-approved) - repeat it without re-testing. This rule is not a blanket per-video tax; it exists to stop unproven methods burning money at scale. Generate a single hero shot, put it in front of the user, get their verdict on the MOTION, and only then generate the other 10+. Spend ~$2 to de-risk before ~$12. Never produce a full multi-clip video in an unproven method/model.
3. **Grip/watchability beats differentiation.** "Is it actually gripping" is the first-order test; "is it strategically distinct" is second-order. Do not let a clever anti-slop style choice ship a boring video.
4. **Generate narration at native pacing.** If fitting the edit requires more than 1.05x or less than 0.95x playback speed, reject the take and regenerate at a better provider speed. Preserve rejected takes for comparison.
5. **Voice replacement must be explicit.** A force-regeneration control may bypass asset reuse, but it must still update the manifest, preserve the previous approved take, and regenerate timestamps from the selected final audio.
6. **Use timestamps from the final TTS take.** Verify normalized timestamp text against the locked narration and map approved caption phrases to those timestamps. Never estimate subtitle timing from clip boundaries.
7. **QA the encoded delivery, not only the mix graph.** Measure integrated loudness and true peak after AAC encoding; target roughly -14 to -16 LUFS for spoken social video and keep true peak at or below -1.5 dBTP.
8. **Inspect every join and the reported defect times frame-by-frame.** Contact sheets can verify composition, expressions, captions, and transition continuity, but the full video still requires a played-with-sound review before posting.

Provenance (traceability): any measured or cost figure the plan states (cut counts, LUFS, per-clip price, monthly budget) names its source reference inline, e.g. "10-15 shots, hard cut every 1.5-3s (shot-design.md)" or "~$32-37/mo (production-stack.md)". The all-in cost total must equal the sum of its own line items - add them up and check, never state a rounded total that does not reconcile.

### Step 7: Differentiation + compliance gates (hard stop)

**FIRST - the independent entertainment review (hard stop, no exceptions).** Before finalizing, spawn TWO SEPARATE fresh `general-purpose` Agents (or two `Skill('rate')` calls). Neither may see the planning conversation, your intent, the other reviewer's score, or any prior score (see [[feedback_never_prime_reviewers]]). Give EACH reviewer, independently:
1. ONLY the finished VIDEO-PLAN.md.
2. The Gate 8b rubric table verbatim (compliance-gates.md, the 7 dimensions + anchors) - ask them to score each dimension 1-5 with one line of evidence, same as the planning agent does. **A weak dimension must not be able to hide behind a passing holistic vibe** - this is why the rubric goes to the reviewer, not just the planner.
3. The holistic question: *"Would this hold a 15-year-old on YouTube Shorts? Score 0-100. Be harsh."*

**Take the MIN of the two holistic scores, not the average, not the higher one.** MIN < 70 = REWORK the plan. Do not proceed to the production recipe. Do not spend.

**Anti score-shopping (do not reroll indefinitely).** If the plan reworks, fix it once and send it to a NEW pair of fresh, unprimed reviewers. If that second pair's MIN is STILL under 70, **HALT** - present the plan and both sets of scores to the founder for a decision. Do not spawn a third pair hoping for a pass; rerolling until a lucky reviewer clears 70 defeats the entire gate.

This exists because self-grading measurably fails: on 2026-07-15 self-assessment of this skill returned 67/100 against an independent cold score of 38/100 - a 29-point inflation - and two videos that passed every self-graded box were rejected outright by the founder. Gate 8 in compliance-gates.md is NOT satisfied by writing plausible prose in its boxes, and a single unprimed reviewer holistic-scoring with no rubric is still gameable by a reroll - hence two reviewers, the rubric, and the MIN.

Then run the differentiation test from differentiation.md: the video must use the channel's OWN locked visual medium, voice register, and topic angle - never the reference creator's signature look/voice/topics (swap test: could a viewer tell this from the reference by visuals alone?). Then run the ship checklist from compliance-gates.md and include it filled-in. The unique-angle line must name the video's own creative decision - "AI-generated" is not an answer. Any unchecked box or failed differentiation test blocks the plan from shipping.

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

## Character (REQUIRED - the #1 ranked format)
[Name the distinctive recurring character and confirm they appear in every non-anatomy shot. A plan of disembodied objects is a REWORK, not a plan - current-playbook.md ranks the recurring character the #1 winning faceless format AND the anti-slop shield.]

## Entertainment gate (REQUIRED - paste the filled Gate 8 AND Gate 8b boxes from compliance-gates.md)
Most charged line (verbatim): "..." | Why it is not fact-recitation: ...
Stakes: ... | Payoff resolves into: ... | Final-beat persona line: "..."
Independent review (2 fresh unprimed reviewers, each given the Gate 8b rubric + holistic question, MIN taken): A=[0-100], B=[0-100] -> MIN=[N] -> [PASS >=70 / REWORK]

## Script ([N] words / [N]s at the TARGET ~2.9 w/s - raise the TTS rate to hit it; then set duration from the MEASURED render)
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
- **Wearing the reference creator's skin** - soft-3D look, default American TTS voice, or his topic rotation. The channel's locked identity (claymation recurring character 'Pip' + calm non-American narrator; paper-cutout is RETIRED - see current-playbook.md) is non-negotiable; a swap-test fail is a rework before any generation spend. See differentiation.md.
- **Naming an avoided tool** - OpenArt-for-video, Suno-as-default, or native Kling/Hailuo subscriptions. production-stack.md is the tool source of truth and lists what to avoid and why.
- **Asserting a measured number without provenance** - cut counts, LUFS, per-clip price, or monthly budget stated with no source reference, or an all-in cost total that does not equal the sum of its line items.
- **Underfilling the word budget OR slowing the voice** - a 30s script at ~75 words reads as dead air next to the feed, and lowering the TTS rate for "gravitas" is the same failure. Winning channels run 2.78-3.65 w/s. Target ~2.9 w/s = 82-90 words for 30s (raise the TTS rate to hit it). Cut explanation before payoff, never pad. See Step 4 for the canonical pace.
- **Overlay text under the Shorts engagement rail** - the most common postability failure; keep text out of the bottom ~300px and right ~140px. See packaging.md.

## Scope limits

This skill plans stories and production recipes; it does not generate the actual video/audio assets (execute the recipe in the named tools), does not schedule uploads, and does not decide channel strategy (niche, cadence, monetization roadmap are owner decisions logged elsewhere). For AuditHQ/Orbit marketing videos, use openart-studio instead - different brand rules apply.
