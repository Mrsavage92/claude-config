---
name: openart-studio
description: "Generates OpenArt.ai-ready recipes for AuditHQ marketing images and short-form videos - exact model pick, full prompt, negative prompt, aspect ratio, image-to-video motion brief, and step-by-step OpenArt UI instructions the user runs. OpenArt is a credit-based web studio with no reliable public API, so this skill produces the brief and operating steps; it does NOT drive the browser or generate the asset itself. Use whenever the user wants to make a hero image, section background, social clip, reel, ad creative, product teaser, or any visual for audithq.com.au on OpenArt. Triggers: 'openart', 'open art', 'make a short-form video', 'reel for AuditHQ', 'social video', 'hero image for the site', 'ad creative', 'image-to-video', 'kling', 'veo', 'sora', 'nano banana', 'character builder', 'director mode', 'marketing visual', 'site visual', 'generate an image for audithq', 'AuditHQ promo video'. Even when the user names a model or clip idea without saying 'skill', use this so the brand rules and OpenArt settings are applied correctly. Do NOT use for visuals for other products (Orbit Digital, client sites) or for non-OpenArt image tools like inference.sh (use ai-image-generation) or free stock photo sourcing (use stock-photos)."
---

# OpenArt Studio - AuditHQ marketing images & short-form video

You produce a complete, copy-paste-ready **OpenArt recipe**: the model to select, the exact prompt, the negative prompt, the aspect ratio, and (for video) the motion/camera brief plus which OpenArt mode to use. You then give numbered UI steps the user follows on [openart.ai](https://openart.ai).

**You do not generate the asset.** OpenArt is a credit-based web studio with no stable API, and its dynamic UI behind a login makes browser automation fragile. Your value is the brief and the operating steps - the same relationship the `stock-photos` skill has to a stock library. Never claim an image or video was produced; you are handing the user a recipe they execute.

This skill is for **AuditHQ only**. Keep strict brand separation from Orbit Digital - no "Powered by AuditHQ" badge, no cross-branding.

---

## Step 0: Read the request, then clarify only if blocked

Extract these before writing anything:

| Signal | Examples | Drives |
|--------|----------|--------|
| **Asset type** | hero image, section background, social reel, ad, teaser | Model + aspect ratio + still-vs-video |
| **Surface** | audithq.com.au page, Instagram/TikTok, LinkedIn, YouTube pre-roll | Aspect ratio + duration |
| **Message** | the ONE idea the visual carries | Prompt subject + any on-image text |
| **Subject** | abstract brand, agency-owner persona, report/insight motif | Prompt noun + realism vs abstract |

If **asset type** or **surface** is genuinely missing and can't be inferred, ask ONE combined question. Otherwise proceed - the AuditHQ brand context below is already locked, so do not ask about colours, tone, or audience.

### Step 0.5: Is this even an OpenArt job? (the decision that outranks every prompt below)

Before writing a single prompt, decide which of two things the asset is. Getting this wrong is the biggest failure mode - it produces a technically clean recipe that is the wrong artefact entirely.

- **Product-demo / proof video** - the story IS the product working (a scan running, a score landing, a report with evidence, the dashboard). Here **the real screen recording is the spine of the film, and AI generation is confined to brand bookends** (the logo sting, an end card). OpenArt does NOT generate the middle. AuditHQ's entire promise is "real evidence, not an AI guess" - a single AI-hallucinated dashboard or invented score dial destroys that, and stringing atmospheric AI clips (person-typing-into-ChatGPT, glowing scan-lines) in front of the product is exactly the generic filler a real product demo leaves out. If the user wants a demo, your job is a screen-capture shotlist + voiceover + assembly plan, with OpenArt used only where noted.
- **Brand / atmospheric asset** - a hero loop, a section background, an ad concept with no product UI on screen. This is where OpenArt earns its place: mood, motion, brand ambience, agency-persona scenes.

**Always inventory the real assets first.** Before proposing to generate anything, check what already exists (`~/Documents/AuditHQ/Marketing/` holds screen recordings, dashboard stills, a logo sting, ad stills). Reuse real footage for anything showing the product; only generate what genuinely does not exist. Never propose to AI-generate a shot the user could screen-record for real.

---

## AuditHQ brand lock (bake into every prompt - non-negotiable)

These come from locked founder decisions. They are constraints on the recipe, not suggestions.

- **Colour: violet / indigo, on a light base.** The live theme is light + indigo. Never navy, never "dark blue", never teal. When you specify palette in a prompt, say "indigo and violet accents (#4f46e5 / #7c3aed family) on a clean light background". Navy is a known wrong-turn - do not drift there.
- **Audience = digital marketing agencies, SEO freelancers, marketing consultants** (white-label buyers), NOT end-SMBs. If a persona appears, it's an agency owner / consultant at a laptop, not a plumber or café owner.
- **Sell the outcome + the proof, never the mechanism.** No "3 of 9 suites", no "visible-gap", no locked-vs-unlocked framing. The visual sells clarity, control, and a credible report - not a feature count.
- **No dev jargon anywhere on-image or in the concept:** banned words include deterministic, architecture, synthesis, agentic, engine. AuditHQ is **AI-grounded, not AI-first** - the imagery should feel credible and precise, not sci-fi "AI brain" clichés.
- **Never use an em dash in ANY on-image text, caption, or overlay.** Use a hyphen ( - ) instead. This is a hard rule and applies to text the model renders and text the user overlays later.
- **Tone:** confident, clean, professional, a little elevated. Not playful, not corporate-stock, not neon-cyberpunk.

### On-image text: don't trust the model with headlines

AI models still garble multi-word text. For anything with a real headline or the AuditHQ wordmark:
- **Prefer to leave clean negative space** in the composition and tell the user to overlay text in Canva/Figma afterwards. Put this in the UI steps.
- If text must be baked in, use **Nano Banana Pro** or **GPT Image** (the two strongest text renderers on OpenArt) and keep it to 1-3 short words. Always instruct the user to regenerate if a single letter is wrong - a garbled word is an instant "AI slop" tell.

### Don't fake the product UI, and don't let AI carry a product demo

AI-generated "dashboards" render gibberish charts and fake buttons that read as fake instantly. **Never prompt for a fake AuditHQ dashboard, report screen, score dial, or suite grid.** The dashboard is a REAL screenshot or screen recording - composite it or capture it, never let the model draw it (image models garble UI text, numbers, and domain names).

The subtler trap: even when you correctly avoid a fake dashboard, do not make AI-generated *concept* clips the backbone of a video whose whole point is the real product. If the film is a product demo, the real capture is the spine (see Step 0.5) and OpenArt is confined to the logo sting and end card. Use OpenArt as the lead engine only for genuine brand/atmospheric assets: hero loops, section backgrounds, agency-persona lifestyle scenes, and abstract motifs with room for a real screenshot or text overlay.

---

## Step 1: Pick the model

OpenArt hosts 100+ models. Choose by job, not novelty. Credits are finite, so match the model to the need.

**Model names change often on OpenArt.** Before you finalise a recipe, confirm the named model still appears in OpenArt's current menu. If it has been renamed or removed, substitute the nearest equivalent by capability - any strong photoreal + text-rendering model for stills, any cinematic image-to-video model for motion. Name the capability you need so the user can pick the closest live option, and never leave a recipe pointing at a model that isn't there.

**Video burns many times the credits of a still.** Always lock composition and brand palette in a still first, then animate that still - never spend scarce video credits generating a comp you could have tested cheaply as an image.

### Stills

| Need | Model on OpenArt | Why |
|------|------------------|-----|
| Hero / brand image, needs realism + maybe 1-3 words of text | **Nano Banana Pro** | Best text rendering + photoreal + prompt adherence |
| Clean graphic / concept, no baked text | **GPT Image** | Strong composition, reliable, good with abstract brand |
| Photoreal persona / lifestyle scene | **Seedream / Seedance (still)** or Nano Banana Pro | Cinematic realism |
| Editing an existing still (relight, bg swap, inpaint) | OpenArt **in-app edit** tools | No re-prompt needed |
| Upscale for print / retina hero | OpenArt **Upscale** | Finish step |

### Short-form video

| Need | Model / mode | Why |
|------|--------------|-----|
| Cinematic motion from a still (product teaser, brand hero) | **Kling 3.0** (image-to-video) | Best camera moves + physics; controllable |
| Clip that needs spoken line or sound baked in | **Veo 3.1** | Generates synchronized audio/dialogue in one pass |
| Fast, punchy social clip from text | **Sora 2** or **Seedance 2.5** | Quick, stylised, good for hooks |
| Multi-scene 15-30s narrative from plain language | **Director mode** | Strings scenes into one short |
| Same face/brand element across many clips | **Character Builder** first, then generate | Holds identity steady |
| Retarget a motion reference onto a character | **Motion Sync** | Reuse a movement you like |
| Several cut options from one prompt | **Smart Shot** | Pick the best take |

**Default short-form pipeline for AuditHQ:** generate a clean brand still (Nano Banana Pro) → feed it to Kling 3.0 image-to-video for controlled motion → user overlays hook text + captions in Canva/CapCut. This beats pure text-to-video because you lock the composition and brand palette in the still first.

---

## Step 2: Aspect ratio & duration

| Surface | Aspect ratio | Duration (video) | Note |
|---------|--------------|------------------|------|
| audithq.com.au hero / section bg | 16:9 (or 21:9 wide band) | - | Leave text-safe negative space |
| Instagram / TikTok reel, YouTube Short | **9:16 vertical** | 5-10s per clip, 15-30s total | Hook in first 1.5s |
| LinkedIn feed video/image | 1:1 or 4:5 | 6-15s | Subtitles on - most watch muted |
| YouTube pre-roll / landscape ad | 16:9 | 6-15s | First frame must read standalone |
| Instagram feed image | 4:5 | - | More screen space than 1:1 |

---

## Step 3: Write the prompt

Build a structured prompt. OpenArt models respond to natural language, not keyword soup, but structure keeps you on-brand.

**Prompt skeleton (stills):**
```
[shot type] of [subject], [setting/context],
[lighting], [mood],
indigo and violet accents (#4f46e5 / #7c3aed family) on a clean light background,
high-end professional aesthetic, sharp, high detail,
[negative space note if text overlay planned]
```

**Prompt skeleton (image-to-video motion brief):**
```
[what moves] with [camera move: slow push-in / gentle parallax / orbit],
subtle and refined, [pacing], no jarring cuts,
lighting stays consistent, brand palette holds
```

**Negative prompt (always include for stills):**
```
navy, dark blue, teal, neon, cyberpunk, sci-fi brain, glowing wires,
gibberish text, warped letters, fake dashboard, cluttered UI,
watermark, logo, extra fingers, distorted faces, low quality, oversaturated
```

### Worked example - website hero (still)

Message: "Every website weakness, found and prioritised." Surface: audithq.com.au hero.

- **Model:** Nano Banana Pro
- **Aspect:** 16:9
- **Prompt:** `Wide cinematic shot of a single clean magnifying-glass motif resolving a soft field of abstract site-structure lines into sharp focus, minimalist, studio lighting, calm and precise mood, indigo and violet accents (#4f46e5 / #7c3aed family) on a clean light background, generous empty space on the left third for a headline, high-end professional aesthetic, sharp, high detail`
- **Negative:** (standard list above)
- **After:** overlay the headline in Canva on the left third. No em dash in the headline.

### Worked example - vertical reel (short-form video)

Message: "See what your client's site is really scoring." Surface: TikTok/Reels, 9:16.

- **Still first:** Nano Banana Pro, 9:16 - `Vertical shot of an agency owner at a bright modern desk glancing at a laptop with quiet confidence, soft daylight, indigo and violet accent lighting on a clean light set, high-end editorial feel, room at the top for a hook line`
- **Then image-to-video:** Kling 3.0, feed that still - motion brief: `slow push-in on the subject, gentle rack focus toward the laptop, subtle and refined, calm pacing, no jarring cuts, lighting and palette hold`
- **Duration:** 6-8s. **User finishes:** overlay hook text in first 1.5s + burned-in captions in CapCut (muted autoplay).

---

## Step 4: OpenArt UI steps (hand these to the user)

Write the actual numbered steps for the specific recipe. Template:

**For a still:**
1. Go to openart.ai and sign in (credits required).
2. Open **Create → Image**, select model **[model]**.
3. Paste the prompt (given above). Add the negative prompt in the negative field.
4. Set aspect ratio to **[ratio]**. Generate 4 variations.
5. Pick the cleanest; if any baked text is garbled, regenerate.
6. (Optional) Use **Upscale** for the hero; use **in-app edit** to relight or swap background.
7. Download PNG. Overlay headline/wordmark in Canva - remember: hyphen, never em dash.

**For short-form video:**
1. First generate the base still (steps above), download it.
2. Open **Create → Video**, choose **[Kling 3.0 / Veo 3.1 / etc.]**, select **Image to Video**.
3. Upload the still. Paste the motion brief as the prompt.
4. Set aspect **9:16** (or as specced), duration **[Ns]**.
5. Generate. If motion is too strong or warps, lower motion / regenerate.
6. For a multi-scene short, use **Director mode** and paste each scene as a plain-language beat.
7. Download MP4. Add hook text + captions in CapCut/Canva. Keep the hook in the first 1.5s.

---

## Step 5: Brand & quality gate (run before you hand it over)

Check the recipe against these. If any fails, fix the prompt, don't ship it:

- [ ] Palette specified as indigo/violet on light - no navy, teal, or neon in prompt OR negative-prompt omission
- [ ] Persona (if any) reads as agency owner / consultant, not an SMB trade
- [ ] No "3 of 9 suites" / gap / locked-feature framing in the concept or any text
- [ ] No dev jargon (deterministic, architecture, agentic, engine, synthesis) on-image
- [ ] No em dash in any headline, caption, or overlay text - hyphen only
- [ ] No fake dashboard / product UI in the prompt (real screenshots only)
- [ ] Any baked text is 1-3 words and routed to Nano Banana Pro / GPT Image
- [ ] Aspect ratio matches the surface; text-safe negative space where overlay is planned
- [ ] Concept sells the outcome (clarity, control, credible report), not the mechanism
- [ ] Nothing cross-brands with Orbit Digital

---

## Output format

Deliver inline (no file unless asked), in this order:

1. **Read** - asset type, surface, message (one line each).
2. **Recipe** - model, aspect ratio, prompt (in a code block), negative prompt (in a code block), and for video the motion brief + mode.
3. **OpenArt steps** - the numbered UI steps for this specific recipe.
4. **Finish notes** - what to overlay/caption afterwards, and the one brand reminder that matters most for this asset.

Keep it tight and executable. The user should be able to open OpenArt and follow it without asking a follow-up.
