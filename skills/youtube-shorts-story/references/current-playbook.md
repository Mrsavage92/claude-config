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
2. **Set video duration from the MEASURED VO length, never the word-count estimate.** Expressive TTS (George/eleven-v3) reads ~2.5-2.7 w/s, slower than the 2.9 estimate - 64 words ran 24.7s, not 22s. The assembler trims audio to video length and will SILENTLY guillotine the ending. Measure the VO, then set total = VO + ~1.5-2s tail.
3. **Character consistency is the wall.** Independently-generated stills/clips drift into a "new guy" - even good keyframes spawn a second character when animated. Mitigations that worked: generate 12, keep the ~7 where the character holds, TRIM each clip to ~2-5s (drift appears later), cut around the breaks. Real fix next time: lock the character (Kling Elements / one reference image). See [[feedback_ai_video_character_consistency]].
4. **Salvage beats forcing it.** When shots break, cut to the clean ones and tighten the story. Dropping the broken "escape" beats made quicksand darker and better (pure dread, no survival-instruction = also policy-safer).
5. **The loop, not length, is the AVD lever.** ~26s is fine (25-45s sweet spot); don't pad to hit a number - padding/repeating lowers completion. Engineer a seamless end-to-start loop for rewatches instead.
6. **Pipeline specifics (now handled in code):** fal intermittently 403s "exhausted balance / user locked" on real credit - RETRY, don't top up (see [[reference_fal_exhausted_balance_glitch]]); eleven-v3 returns CHARACTER-level timestamps (fold to words for captions); ElevenLabs sound-effects needs TERSE prompts ("wet sand suction", not a full sentence).

## Sources note

Two HARD verified data points: the July 13 2026 policy update (Tubefilter) and the Jan-June 2026 AI-slop enforcement wave (IBTimes: 16 channels / 35M subs / 4.7B views removed). Most granular stats (exact retention %, "30-45s sweet spot") are vendor-blog consensus - directional, not YouTube-primary. Re-verify before treating as fact.
