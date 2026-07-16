# Current Playbook - what wins on curiosity/story Shorts TODAY (live-researched 2026-07-14)

Snapshot of what is actually winning right now, from 3 parallel live-research passes. RE-VERIFY if the date is >60 days old - this field moves fast. Where this conflicts with older files, this wins on format/style/voice/policy; reference-corpus.md still wins on the measured retention physics.

## Format (what to make) - ranked

1. **Recurring-character curiosity / "what would happen if..." explainer.** THE #1 winning faceless format (e.g. @dr_data_dr "talking skeleton", 44M views, cited 500% growth 2026). A DISTINCTIVE RECURRING CHARACTER/mascot delivering curiosity facts + hypotheticals. The recurring character is the identity AND the anti-AI-slop-policy shield. This is the evolution of the Zack D model.
2. **Closed-loop story-time with a twist ending** - retention/rewatch driven, no face needed.
3. **Ranked / "shocking facts" compilation** - cheap daily cadence, needs an original visual hook to dodge the slop penalty.
Breakout of the last 60 days: **AI time-traveller / historical POV** (modern person dropped into a hyperreal historical scene; one hit 4M views + a Cannes award).

## Style (how it looks)

- **Stylized 3D CGI (Zack D register) OR claymation/Ghibli-style.** Both read high-production and dodge uncanny valley.
- **NOT photoreal AI human faces** - now HIGHER risk (artifacts became a mockery genre).
- **NOT paper-cutout** - it was not a named winner in any 2026 source; the earlier paper-cutout bet is retired.
- **A recurring character / recurring world** is the identity lever (and a monetization-policy shield) - more than the medium itself.

## Structure + pace

- Length **25-45s** (narrative can stretch to 50-60s). **Sub-15s is dead** - can't clear the watch-time bar.
- **First 1-3 seconds decide it** - front-load the strongest hook (the algorithm seeds to a small test audience first; weak early engagement caps reach).
- **Completion % is the dominant signal**, not raw views. Build the whole thing to reward finishing + a loop/twist that drives rewatch.
- **Cut every 2-3 seconds** for curiosity/story (a pattern interrupt every 5-8s minimum). This is the multi-shot EDIT (see shot-design.md).

## Voice

- AI voice is fully mainstream/accepted now. The divide is **expressive vs flat**, not AI vs human - expressive gets ~15% higher retention.
- Use **ElevenLabs v3 Expressive** tier (named leader), genre-matched tone (calm/authoritative for survival/science/history). OpenAI TTS only for plain instructional delivery.
- Toggle YouTube's "altered or synthetic content" disclosure (recommended, defensive given enforcement).

## Captions

- **Word-by-word ANIMATED burned-in captions are table stakes** (~20-30% more distribution, ~15-25% more retention; ~40% watch muted). Large, high-contrast, word-level pop/scale highlight (Submagic-style) - NOT static phrase bars. Upgrade the assembler from phrase-captions to word-level.

## Model + cost

Kling 3.0 via fal.ai (best value dynamic model, ~$2-4/video) - see production-stack.md + [[reference_ai_video_gen_real_costs]].

## PROVEN template + hard-won lessons (video 06 "quicksand", founder-approved 2026-07-14 - "funny, informative, high quality, smooth")

The first fully successful video. Repeat this recipe; it works.

**The validated formula:** claymation recurring everyman ("Pip", red-beanie brand mark) + second-person survival hypothetical + dark tide-style twist (the danger you fear isn't the killer; the one you didn't see is) + ElevenLabs "George" expressive voice + word-by-word animated captions + terse tempo-matched SFX. Ended on dread, ~26s.

**Lessons that change how to build the NEXT one:**
1. **Keep the recurring character IN every shot.** Pure object/hand inserts (a lone boot, a disembodied hand) read as "out of place" and break immersion (founder flagged both). If you need a detail shot, keep it clearly the character's hand/body in context.
2. **Set video duration from the MEASURED VO length, never the word-count estimate.** (NOTE: our TTS reading slower than 2.9 is a DEFECT to fix by raising the rate, not a target - see SKILL.md Step 4 canonical pace.) Expressive TTS (George/eleven-v3) reads ~2.5-2.7 w/s, slower than the 2.9 estimate - 64 words ran 24.7s, not 22s. The assembler trims audio to video length and will SILENTLY guillotine the ending. Measure the VO, then set total = VO + ~1.5-2s tail.
3. **Character consistency is the wall.** Independently-generated stills/clips drift into a "new guy" - even good keyframes spawn a second character when animated. Mitigations that worked: generate 12, keep the ~7 where the character holds, TRIM each clip to ~2-5s (drift appears later), cut around the breaks. Real fix next time: lock the character (Kling Elements / one reference image). See [[feedback_ai_video_character_consistency]].
4. **Salvage beats forcing it.** When shots break, cut to the clean ones and tighten the story. Dropping the broken "escape" beats made quicksand darker and better (pure dread, no survival-instruction = also policy-safer).
5. **The loop, not length, is the AVD lever.** ~26s is fine (25-45s sweet spot); don't pad to hit a number - padding/repeating lowers completion. Engineer a seamless end-to-start loop for rewatches instead.
6. **Pipeline specifics (now handled in code):** fal intermittently 403s "exhausted balance / user locked" on real credit - RETRY, don't top up (see [[reference_fal_exhausted_balance_glitch]]); eleven-v3 returns CHARACTER-level timestamps (fold to words for captions); ElevenLabs sound-effects needs TERSE prompts ("wet sand suction", not a full sentence); word-by-word captions on a long script (100+ words = 100+ drawtext filters) make a filtergraph too long for the Windows command line (~32KB) and ffmpeg fails to spawn (pid 0) - pass it via `-filter_complex_script <file>`, not inline (fixed in assemble-simple.mjs). And always set video duration from the MEASURED VO: George read a 131-word script at ~2.4 w/s = 53.7s, not the 45s the word-count implied.
7. **Description SEO:** front-load the main topic keyword(s) AND the character name into the FIRST 200 characters - YouTube description-score tools penalize a keyword-less opening and a missing character/brand mention (scored 50/100 until fixed). Repeat keywords naturally in the body, end with an engagement question, and promote the topic keyword into the top hashtags (e.g. #quicksand alongside #shorts). Channel = "Poor Pip", character = Pip.
8. **Captions: burned-in ONLY - never also upload a separate .srt.** The video already has burned-in animated word captions; uploading an .srt caption track on top shows DOUBLE text for any viewer with CC on. Keep the burned-in (better: styled, always visible), skip the uploaded track. Transcript indexing comes from title/description/tags, not a caption file - and retention (clean single caption) beats transcript SEO. Set the video language to English regardless. Ignore SEO-tool title/description SUGGESTIONS entirely (they're generic clickbait templates - "Ultimate Guide to YouTube Success" - that walk straight into the generic-content trap); use the tool only for mechanical hints (keyword-in-first-200, on-topic tags).

9. **fal cost discipline (founder-flagged 2026-07-15 - ~30 credits burned in a few days, "reluctant to add more").** Kling i2v is the expensive line item (~$0.35-0.5/clip x 11 = a full render). Reserve PAID Kling motion for the money shots (hero character beats, the reveal); animate simpler shots (slow holds, the closing loop, static anatomy) LOCALLY with FREE ffmpeg zoompan/flash on the keyframe still. A mixed cut (real i2v on key beats + ffmpeg still-motion elsewhere) reads fine under fast 3-4s cuts + captions + SFX. This is also the no-spend SALVAGE when credits run out mid-render (Ep3 realistic: 6 Kling clips landed, balance exhausted, finished C7-C11 as free ffmpeg still-motion - zoompan push/punch + white-flash for the jolt/adrenaline). Recipe: `ffmpeg -loop 1 -i K.jpg -t 5 -filter_complex "scale=2160:3840:...,crop,zoompan=z='...':d=150:s=1080x1920:fps=30,format=yuv420p"`.
10. **fal "exhausted balance" 403 is USUALLY the transient glitch (retry) BUT genuine exhaustion is real** - if it persists across a full 10-retry cycle AND real spend happened this session, it is probably actually out. Surface honestly (don't command "top up", don't insist it's a glitch); offer the free ffmpeg salvage. See [[reference_fal_exhausted_balance_glitch]].
11. **Two pipeline bugs fixed in code 2026-07-15:** (a) fal's default `fal-ai/elevenlabs/sound-effects` passes a DEPRECATED model id (`eleven_text_to_sound_v0`) that now 400s - use `/v2` (now the gen-sfx.mjs default). (b) assemble-simple.mjs used `plan.totalDur` (summed word-count estimates) as video length and TRIMMED the VO to it, silently guillotining the final line when the measured VO ran longer (98-word script: plan 40.5s vs George 43.0s). Now it probes the VO and sets total = max(plan, VO+tail), holding the final shot to absorb the overflow so earlier shots stay synced. The "duration from measured VO" rule is now ENFORCED in code.
12. **George VO with no direct ElevenLabs key:** route through fal with `TTS_MODEL=fal-ai/elevenlabs/tts/eleven-v3` + `TTS_PARAMS_JSON='{"voice":"George",...,"timestamps":true}'` on `generate.mjs --stage=audio` (uses FAL_KEY). Char-level timestamps fold to words in the assembler. The direct api.elevenlabs.io path (gen-vo-elevenlabs.mjs) needs ELEVENLABS_KEY, which is NOT persisted in .env.

## THE $0 PRODUCTION MODEL (locked 2026-07-15 - default while pre-traction)

Founder constraint: "until we have followers and views hitting better numbers I need almost free output." Agent time is free; fal spend is not. **Build every video at $0 unless Adam explicitly approves spend.**

- **VO = FREE neural TTS via edge-tts**, not ElevenLabs. `pipeline/gen-vo-edge.py` (built 2026-07-15): `pip install edge-tts`, then pipe the plan narration in. Voices: `en-GB-RyanNeural` (default, closest to George's warm British storyteller), `en-GB-ThomasNeural`, `en-AU-WilliamMultilingualNeural`. Pace matches ElevenLabs almost exactly (87 words = 37.2s vs George 43s/98 words), so scripts transfer with no re-timing. **Gotcha:** `edge_tts.Communicate(..., boundary="WordBoundary")` is REQUIRED - it defaults to `SentenceBoundary` and you get no per-word cues (silently empty captions). Emits `{timestamps:[{word,start,end}]}`, which assemble-simple.mjs already accepts natively.
- **Motion = FREE ffmpeg kinetic still-motion** on keyframes. Go ALL-IN, never mix with Kling: the earlier cut was rejected because 6 fluid Kling shots next to 5 static ones reads as broken. **Consistency is what sells it** - a fully-kinetic still-motion cut (hard punch-ins on impacts, slow pushes on calm beats, white-flash hits on zaps) reads as a deliberate style.
- **SFX = reuse the library.** heartbeat/whoosh/drone/zap/gasp/hush recur every episode. assemble-simple.mjs re-times SFX from the shot table via cue `n`, so reusing files across plans costs nothing.
- **Keyframes = reuse** the existing character/anatomy library; only generate when genuinely new.

**FRAME 0 IS THE PREVIEW.** Never start the opening clip with a `fade=t=in:...:color=white` - platforms grab frame 0 as the thumbnail and you ship a white rectangle. Verify with `signalstats` YAVG (white ~235+; real image ~90-150). Keep flash hits for MID-video beats only.

**n<10 videos is NOISE.** Do not A/B style/character/topic on <1000 views - at 100 views everything is indistinguishable from noise. This was a real mistake on 2026-07-15 (a whole session spent debating claymation-vs-realistic on n=3). Cold start needs 20-50+ uploads before anything is readable. The three free levers that actually move views: **hook-first opens** (premise-drop in second 1, arresting frame 0 - mood opens = swipe), **volume** (daily, which only $0 production allows), and **3 surfaces per asset** (YouTube Shorts + TikTok + Reels).

## The success recipe + scorecard (deep research 2026-07-15)

**What drives views (ranked):** (1) HOOK - first 1s, the swipe-away gate; (2) COMPLETION rate; (3) RELATABILITY; (4) shareability. Shorts are FEED-driven, not search - so description/tags/category are MINOR levers (fill sensibly, ignore the vanity "SEO score"; YouTube itself says tags play a minimal role).

**Relatability > novelty.** Topics people have personally FELT (ears pop, brain freeze) lower swipe-away, raise completion, and COMPOUND; exotic/spectacle (deepest ocean, quicksand) is high-variance one-off. Own data confirmed it: ears-pop (relatable) out-performed the exotic ones. LEAD with relatable-body/everyday topics; use wonder/survival as variety swings.

**Winning emotional register:** NOT funny-alone or wholesome-alone (weak - a 2025 study n=387k found joy IMPEDES sharing; awe/anxiety/surprise accelerate it; Berger 2012: arousal drives shares, not mood). WINNER = the cute character carrying HIGH-AROUSAL tension (awe + a thread of dread) + real science, resolved, with humour as PUNCTUATION not the engine (the Kurzgesagt / Zack D. Films pattern). "Dread" = setup tension resolved into relief/awe, NOT the character dying. The cuteness is also what keeps it advertiser-safe; the tension+science is what keeps it general-audience (not kids). The edge is the moat.

**The scorecard - score every idea 1-5 before making it:** Relatability · Curiosity · Hook · Tension · Payoff · Shareability · Loop. **Kill anything under 3 on Relatability OR Hook** (the two gates).

## Sources note

Two HARD verified data points: the July 13 2026 policy update (Tubefilter) and the Jan-June 2026 AI-slop enforcement wave (IBTimes: 16 channels / 35M subs / 4.7B views removed). Most granular stats (exact retention %, "30-45s sweet spot") are vendor-blog consensus - directional, not YouTube-primary. Re-verify before treating as fact.
