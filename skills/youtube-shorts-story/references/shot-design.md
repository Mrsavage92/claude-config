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

## Motion per shot: give the model something dynamic to do

Hailuo's gentle drift is why it looked like "crap little animation". On Veo 3 / Kling, each shot's motion prompt should specify a real move: "fast push in on the hand", "camera whips sideways following the current", "slow pull back revealing the coastline", "handheld shake as the wave hits". Dynamic camera + subject motion = the shot feels alive. One shot, one clear movement.

## The assembly is HARD CUTS, not long crossfades

The old assembler crossfaded everything (to hide seams of one scene). A real edit uses HARD CUTS on the beat (optionally a 2-4 frame dip for impact). Cuts ARE the energy. Match cuts to the voiceover's stressed words where possible.

## Worked structure (rip current, as a 12-shot edit)

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

12 distinct compositions, cut ~2.4s each = not boring. THIS is the deliverable shape, in whatever style (comic / cinematic / paper).
