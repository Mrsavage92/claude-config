# $0 TIER MOTION VOCABULARY (read FIRST if the plan is $0 - the default)

**The motion verbs in this file (whip-pan, POV move, reveal, handheld shake, orbit) require real image-to-video (Kling/Veo). The DEFAULT $0 pipeline is ffmpeg zoompan on a still and CANNOT execute any of them.** Writing them into a $0 plan produces a slideshow with ambitious captions - which is exactly what shipped on 2026-07-15 and was rejected ("static images").

**What $0 ffmpeg CAN actually do (use only these verbs in a $0 plan):**
- push-in / pull-out (zoompan), slow or hard-punch
- lateral drift across a still (zoompan x/y)
- a hard cut on the beat
- a white/black flash hit (fade from colour, <=0.15s) - mid-video only, NEVER on frame 0
- speed variation between shots (a 2s shot next to a 4s shot)

**What $0 ffmpeg CANNOT do - do not write these into a $0 plan:** whip-pan, parallax, orbit, POV walk, handheld shake, reveal-by-camera-move, anything where the SUBJECT moves.

**The honest consequence:** at $0 the subject never moves. Motion must come from the CUT and the SCRIPT, not the camera. If the story needs the subject to move (a jolt, a lunge, a collapse), that shot needs real i2v - **say so and ask for approval rather than faking it with a zoom.** A zoom standing in for a lunge is the "fake motion" ban in SKILL.md Step 5.

# Shot Design - the multi-shot edit (the method that was missing)

This file exists because the first videos failed for one structural reason: they were ONE slowly-morphing scene stretched to 30 seconds. Gripping shorts are not one scene - they are a fast EDIT of many distinct shots. This is the load-bearing method. Read it before writing any shot list.

## The rule: a short is an EDIT of 10-15 distinct shots, not one scene

Measured from real gripping shorts: a new visual composition every ~1.5-3 seconds. Not a camera slowly drifting across one tableau - a CUT to a genuinely different shot: different framing, different angle, different distance, a new piece of information. If two adjacent shots could be the same generated clip, they are not two shots.

A 30s short = roughly 10-14 shots. If your shot list has 6 clips of "the same scene evolving", it is wrong - that is the boring failure.

## Shot-type vocabulary (vary these - never two of the same in a row)

- **Establishing / wide** - shows the whole situation and its scale (a tiny figure in a vast dark sea).
- **Close-up** - a face, a hand, a detail - carries emotion and stakes.
- **Insert / macro** - an extreme detail (water breaking over fingers, a rope, an eye).
- **Dynamic push / pull** - the camera physically moves in or out fast (this is what Hailuo could NOT do; Veo 3 / Kling can).
- **POV** - what the character sees (the shore getting further away).
- **Reveal** - a move or cut that exposes new information (pull back to show the rip is one of many).
- **The turn / climax shot** - the single most dramatic frame of the video, held a beat longer.

A gripping edit intercuts wide -> close -> detail -> POV -> reveal, so the eye never settles.

## Cut rhythm (pace is the grip)

- Open on the strongest, most surprising shot (the hook frame) - hold ~2s.
- Then cut every 1.5-3s. Faster (1.5s) during tension, slower (3s+) on the payoff/reveal.
- The final shot (the twist/stat) gets the longest hold, ~3s, so it lands.
- 12 shots over ~30s = an average ~2.4s each. That cadence alone reads as "produced", not "AI slideshow".

## Each shot is generated INDEPENDENTLY

Critical difference from the old keyframe-chain method:
- Old (wrong): 6 clips chained K1->K2->...->K6 = one continuous scene. Boring.
- New (right): each shot has its OWN image (its own composition/angle) and its OWN motion, generated separately, then HARD-CUT together with pace. Consistency comes from a shared style anchor + the same character/palette in every image prompt, NOT from chaining frames.

So a shot = { image prompt (the composition), motion prompt (what moves + camera), duration, caption }. Generate the still, animate it on a model that can actually move (Veo 3 / Kling), cut.

## Motion per shot: give the model something dynamic to do (PAID TIER ONLY - real i2v)

Hailuo's gentle drift is why it looked like "crap little animation". On Kling 1.6 Elements (the paid workhorse) or Veo 3.1 (hero shot only), each shot's motion prompt should specify a real move: "fast push in on the hand", "camera whips sideways following the current", "slow pull back revealing the coastline", "handheld shake as the wave hits". Dynamic camera + subject motion = the shot feels alive. One shot, one clear movement.

**None of this vocabulary exists at $0** - see the banner at the top of this file. The $0 motion vocabulary is push-in / pull-out / drift / hard-cut / flash on a still. Do not write "whips", "shake", "reveal-by-camera-move", or any subject-motion verb into a $0 shot's motion prompt.

## The assembly is HARD CUTS, not long crossfades

The old assembler crossfaded everything (to hide seams of one scene). A real edit uses HARD CUTS on the beat (optionally a 2-4 frame dip for impact). Cuts ARE the energy. Match cuts to the voiceover's stressed words where possible.

## Worked example A - $0 TIER (ffmpeg zoompan only: push-in / pull-out / drift / hard-cut / flash on STILL compositions)

Every "shot" below is ONE still image. The only animation applied is push-in, pull-out, lateral drift, a hard cut, or a flash hit (the $0 vocabulary in the banner at the top of this file). The subject never moves inside a clip - drama comes from the STILL's own frozen composition and from the CUT to the next composition, never from a camera or subject move that $0 ffmpeg cannot make. If a subject-motion verb (thrash, kick, whip, turn, break free, orbit) creeps into a shot description, that shot needs paid i2v, not $0 zoompan - flag it and ask before assuming budget.

Rip current, told at $0 (12 shots):

1. Insert, push-in, hold 2s - still: a hand frozen clawing at the surface, fingers spread, shore a tiny blur behind. HOOK frame.
2. Wide, slow lateral drift - still: a tiny swimmer suspended in a vast dark sea, a darker current channel visible beside them.
3. Close, push-in - still: the swimmer's face frozen mid-turn, eyes fixed on the shrinking shore.
4. Insert, hard cut, static hold - still: the beach, small and distant, framed past a wave crest.
5. Wide, pull-out - still: the swimmer's silhouette frozen mid-reach, current lines rendered in the composition dragging outward.
6. Underwater insert, push-in - still: legs frozen mid-stride, bubbles suspended, exhaustion visible in the pose.
7. Close, hard cut, static hold - still: the face, eyes wide, water at the lips.
8. Detail, slow drift - still: the current rendered as a visible dark ribbon pulling away from shore.
9. Wide, static hold + a white-flash hit on the cut in - still: the swimmer floating, a calm beat.
10. Insert, push-in - still: the swimmer's body posed parallel to shore, current lines sliding past in the composition.
11. Wide, pull-out - still: calmer water, the dark channel visible behind them now.
12. Climax, hard cut in, static hold 3s - still: the shore reached, feet on sand, OR a stark number overlay.

12 distinct STILL compositions, cut ~2.4s apart, zero animated subject motion. "Produced" comes from composition variety + cut rhythm + captions + SFX - not from a camera move $0 ffmpeg cannot make.

## Worked example B - PAID TIER (real i2v: Kling 1.6 Elements / Veo 3.1 - approval required before spend)

Same story, now with real camera and subject motion because a paid model can execute it - this is what the $0 example above is deliberately NOT allowed to write:

1. Insert, hold 2s - a hand clawing the surface, gasping, shore tiny behind. HOOK.
2. Wide - a tiny swimmer in a vast dark sea, the darker rip channel.
3. Close - the swimmer twisting to look back at the shrinking shore.
4. POV - the beach getting further, arms thrashing toward it.
5. Underwater - legs kicking hard, exhausted, going nowhere.
6. Close - the face, tiring, water at the mouth.
7. Detail - the current visualized, a dark flow dragging out.
8. Beat - the swimmer stops, floats, breathes (calm shot, held).
9. Move - turns sideways, swims parallel, the current sliding past.
10. Reveal - breaks free of the dark channel into calmer water.
11. Wide - the coastline with several rip channels, tiny figures.
12. Climax/stat, held 3s - the shore reached, or a stark number.

12 distinct compositions, cut ~2.4s each, real subject and camera motion throughout (whip, thrash, kick, turn, break-free). This ONLY works on real i2v - never write this verb set into a $0 plan.
