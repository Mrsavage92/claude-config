# Locked Production Stack (verified per-clip economics, updated 2026-07-13)

The owner is a business owner, not an editor. Every recipe below must be executable by AI tools plus at most 30 minutes of human assembly time per video. If a step needs editing skill, redesign the step.

**Vendor-inflation rule (learned the hard way):** every platform's advertised "X videos per month" assumes its cheapest, lowest-res model. Real yield on a good model (Kling Pro/Master, Veo 3.1, Hailuo 02 at 1080p) is consistently 6-10x LOWER than advertised (verified 2026-07-13: Hailuo native marketed 375 videos, real 56; Vidu marketed 1000, real 100; OpenArt $29 tier = ~3.4 videos). Never subscribe on a headline number; verify credits-per-clip on the model you'll actually use.

## The stack

| Layer | Tool | Cost | Real yield | Why this one |
|---|---|---|---|---|
| Keyframe stills (stylized) | Seedream 4 via fal.ai | ~$0.08/still | 6-8 keyframes/video | Better STYLIZED-style-lock than photoreal-biased Nano Banana 2 (verified 2026-07-14); holds the paper-cutout anchor across the set via reference-card trait-locking |
| Video generation (primary) | Hailuo 02 image-to-video via fal.ai | ~$0.22-0.49/clip | ~6 clips/video (~$1.6/video) | Retains a stylized source keyframe without drifting to generic 3D; keyframe-first pipeline |
| Video generation (no lock-in alt) | fal.ai pay-as-you-go, Hailuo 02 | ~$0.225/5s clip (~$1.58/video) | $30 buys ~19 videos, zero unused-credit waste | No subscription; mix models per shot (Kling 2.5 Pro $0.35/clip, Seedance, WAN) |
| Voiceover | OpenAI TTS (gpt-4o-mini-tts) | ~$0.015/min (~$1-2/mo) | - | 10x cheaper than ElevenLabs at near-parity for narration |
| Music | FREE (YouTube Audio Library, Pixabay) | $0 | - | SFX beats music for retention; music must loop perfectly or be absent anyway |
| SFX | Pixabay / YouTube Audio Library | $0 | - | Sound design carries retention; see retention-playbook.md |
| Assembly | DaVinci Resolve (free) | $0 | - | Commercial-safe; CapCut free tier blocks commercial use |
| Upscale to 4K | Krea's bundled upscaler or video2x (free) | $0 extra | - | Generate 1080p, upscale the finished master to 4K |

Avoid (verified 2026-07-13): OpenArt for video at any tier (~$8.50/video real cost); PixVerse (worst failed-generation credit-burn sentiment); Kling/Hailuo NATIVE subscriptions (2-7x worse unit economics than the same models via Krea/fal.ai); Sora (consumer app shut down Apr 2026); Revid/Crayo-class generator SaaS (they sell assembly automation this skill already provides).

Scale option only (10+ videos/week): rented GPU (RunPod 4090 ~$0.69/hr) running WAN/Hunyuan open weights ≈ $0.70-0.75/video, but adds ComfyUI pipeline complexity - wrong trade until volume demands it.

## 4K delivery rule

TVs are a target surface, but native-4K generation (Veo 3.1, Kling 3.0 Ultra) costs 5-15x more per clip. Bootstrap path: generate 1080p (Hailuo 02 Pro tier), assemble, then upscale the FINISHED master once to 4K (Krea's bundled upscaler or free video2x) and export 2160x3840 vertical, H.265, 50+ Mbps. Upscaling one 30s master beats upscaling 7 clips. Native-4K generation unlocks at the revenue tier of the cost ladder, for hero videos first.

## Per-video recipe template

Every VIDEO-PLAN.md ends with this section, filled in concretely:

```text
## Production recipe
1. Visuals: for each shot in the shot list, one generation prompt
   (model: Hailuo 02 via Krea or fal.ai, duration 5s, aspect 9:16,
   style anchor: [channel style phrase], no text in frame)
2. Voiceover: paste script into OpenAI TTS, voice [name], speed [0.95-1.1],
   export WAV
3. Music: free track from YouTube Audio Library [mood] OR none (SFX-only)
4. SFX list: [moment -> sound, source]
5. Assembly (DaVinci Resolve): import order, cut points from shot list,
   captions per packaging.md safe zones, audio ducking music -18dB under VO
6. Upscale finished master to 4K (Krea upscaler / video2x)
7. Export: 2160x3840, H.265, 50Mbps, [24/30]fps
8. Upload package per packaging.md
```

Keep one consistent visual style anchor phrase across all videos so the channel reads as one brand. The style anchor is a channel-level decision made once, not per video.

## Delivery audio spec (measured from the reference, 2026-07-13)

Master loudness **-11 LUFS integrated, LRA ~2-4, true peak <= -1.5 dB** - Shorts are mixed hot and dense. A -16 LUFS master sounds weak next to the feed. Voiceover wall-to-wall at ~3 words/sec with punctuation-placed micro-pauses; SFX and ambience woven continuously under it; music optional and only if it loops seamlessly.

## Cost discipline

The stack is a self-funding ladder, not a shopping list. Bootstrap tier until the channel earns revenue: Krea Pro $35 (or fal.ai pay-as-you-go ~$30) + OpenAI TTS ~$1-2 + free music/SFX + DaVinci Resolve = **~$32-37/mo for 15-20+ videos, roughly $2/video all-in**. Suno ($8/mo), ElevenLabs voice, native-4K generation credits (Kling Pro/Veo tier), and GPU/API pipelines unlock only from channel revenue, in that order.

A video that needs more than ~10 generation attempts per shot is a prompt problem or a concept problem; fix the prompt or simplify the shot rather than burning credits. Failed-generation credit burn is the top complaint against every platform in this category - log regen counts per shot so waste is visible.
