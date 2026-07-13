# Locked Production Stack (researched 2026-07-13, ~$25-80/mo total)

The owner is a business owner, not an editor. Every recipe below must be executable by AI tools plus at most 30 minutes of human assembly time per video. If a step needs editing skill, redesign the step.

## The stack

| Layer | Tool | Plan | Cost | Why this one |
|---|---|---|---|---|
| Video generation | OpenArt (Advanced) or Krea (Pro) | $12-21/mo | ~150 videos/mo of credits | Aggregators beat stacking native subs; access to Veo 3.1 / Kling 3.0 class models through one credit pool |
| Voiceover | OpenAI TTS (gpt-4o-mini-tts) | pay-as-you-go | ~$0.015/min (~$1-3/mo) | 10x cheaper than ElevenLabs at near-parity for narration; upgrade to ElevenLabs ($6-22/mo) only if a signature cloned voice becomes the brand |
| Music | Suno Pro | $8/mo | 500 songs, commercial rights | Owned library beats Epidemic's $300-600/yr rental |
| SFX | Pixabay / YouTube Audio Library | free | - | Sound design carries retention; see retention-playbook.md |
| Assembly | DaVinci Resolve (free) | $0 | commercial-safe | CapCut free tier now blocks commercial use; Resolve has no such trap |
| Programmatic captions | Remotion | $0 (individual license) | - | Only when caption templating gets repetitive across many videos |
| Upscale | none needed by default | $0 | - | Veo 3.1 and Kling 3.0 output native 4K; Topaz Video AI ($299/yr) only if a chosen model caps at 1080p |

Avoid: Sora (consumer app shut down Apr 2026, API sunsetting), CapCut free tier for monetized content (ToS), stacking multiple native model subscriptions before the channel earns.

## 4K delivery rule

TVs are a stated target surface. Export 3840x2160 (4K UHD) vertical 9:16 master at 2160x3840, H.264 or H.265, 50+ Mbps, 24 or 30 fps. If the generation model outputs 1080p, generate at the highest native resolution and note the upscale need in the plan rather than silently shipping soft footage.

## Per-video recipe template

Every VIDEO-PLAN.md ends with this section, filled in concretely:

```
## Production recipe
1. Visuals: for each shot in the shot list, one generation prompt
   (model: [Veo 3.1 / Kling 3.0 via OpenArt or Krea], duration 5s,
   aspect 9:16, style anchor: [channel style phrase], no text in frame)
2. Voiceover: paste script into OpenAI TTS, voice [name], speed [0.95-1.1],
   export WAV
3. Music: Suno prompt: [mood, BPM, no vocals, 45s]
4. SFX list: [moment -> sound, source]
5. Assembly (DaVinci Resolve): import order, cut points from shot list,
   captions [style], audio ducking music -18dB under VO
6. Export: 2160x3840, H.265, 50Mbps, [24/30]fps
7. Upload: title [<=60 chars, curiosity phrasing], no misleading metadata
```

Keep one consistent visual style anchor phrase across all videos (e.g. "soft-lit 3D render, slightly exaggerated proportions, warm palette") so the channel reads as one brand. The style anchor is a channel-level decision made once, not per video.

## Cost discipline

Track spend against the $25-80/mo envelope. A video that needs more than ~10 generation attempts per shot is a prompt problem or a concept problem; fix the prompt or simplify the shot rather than burning credits.
