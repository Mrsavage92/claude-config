# Retention Playbook: engineering AVD > 100%

AVD greater than video length means the average viewer watches past one full play. That is only achievable through loops and rewatches, so retention work happens at three layers: the first 3 seconds, the middle, and the loop seam.

## Layer 1: the first 3 seconds

- Deliver the complete hook within 2-2.5 seconds. Aggregated creator data puts a hard drop-off cliff at 3s; hooks that land under 2s correlate with materially higher AVD (directional stat from creator-tool blogs, not a YouTube-published study, but consistent across sources).
- **Three-channel rule:** hit all three simultaneously in frame one:
  - Visual: motion, a face, or a striking object already mid-action
  - Audio: the first spoken words ARE the point; no intro music swell, no "so..."
  - Text: a 4-8 word overlay fully visible at frame one (not fading in)
- The opening frame is the de facto thumbnail in the Shorts feed. Make it the single most striking, highest-contrast frame in the video, and verify it reads at phone size.

## Layer 2: the middle (seconds 3 to N-4)

- **3-second rule:** introduce a new visual event (cut, zoom, camera move, text overlay change) at least every 3 seconds. Identical shot rhythm causes measurable mid-video retention collapse.
- **One pattern interrupt** around the 25-35s mark in longer shorts: a music drop, angle change, or SFX spike, placed exactly where viewers have "mapped" the video's rhythm and start to leave.
- **Muted-viewing insurance:** a large share of feed viewing starts muted. Captions/text overlays must carry the story alone. Test: scrub the plan silently; if the story is lost, add or rewrite overlays.
- **Sound design over music:** SFX synced to visual beats (a pop, a whoosh, a heartbeat) does more for retention than any background track. Music sits at -18dB under the voiceover or is absent.
- **Never gate visibility on delayed reveals:** every key visual must be legible the moment it appears; viewers scrubbing back to "see that again" is a rewatch signal, viewers confused is a swipe.

## Layer 3: the loop seam (the AVD multiplier)

The documented best case: animator Jake Fellman took average view percentage from ~100% to ~200% by making Shorts loop seamlessly. Mechanics:

- **Bookend technique:** first and last frames are identical or near-identical, so the autoplay restart is imperceptible. The viewer rewatches before deciding to swipe.
- **Narrative loop:** the final line reconnects to the opening line so the restart feels like a continuation ("...which is exactly why your ears pop." -> loops to -> "Why do your ears pop on planes?").
- **Audio seam:** music must loop perfectly or be faded under SFX at both ends; an audible hitch exposes the loop and breaks the illusion.
- Shorter videos loop more (a 25-30s video that loops beats a 45s video that doesn't, for AVD%). Default to the shortest length that delivers the payoff.

## Reading the data (YouTube Studio)

- Retention graph shape beats every opinion: flat through the first third = hook works; early cliff = fix the first 2 seconds; mid-video sag = pacing/3-second-rule failure; spike past 100% at the end = the loop is working.
- Judge each video after 48-72h of feed exposure, not on day-one views. The Shorts feed tests videos in waves.
- Log per video: AVD seconds, AVD %, swipe-away rate if visible, and WHICH hook pattern and structure were used. After 20 videos the winning pattern for this channel is a data answer, not a taste answer.

## The improvement loop

Ship -> read retention graph -> diagnose the failing layer (hook / middle / loop) -> change ONE variable -> ship next. Never change three things at once; the graph can't tell you which one worked.
