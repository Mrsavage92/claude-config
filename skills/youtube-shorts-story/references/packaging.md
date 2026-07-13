# Packaging: titles, captions, upload metadata

Everything upstream can be done right and the video still fails at the packaging layer. This file governs everything between "final export" and "postable".

## Titles

- The title states the QUESTION, never the answer ("Why Do Your Ears Pop on Planes?" not "Air Pressure Explains Ear Popping"). Spoiling the payoff in the title deletes the reason to watch.
- Budget 60 characters max, but front-load the first ~40: the Shorts feed and search truncate. The question's key nouns go first.
- Title, first frame, and hook must make the SAME promise. Mismatch is both a policy risk (misleading metadata) and an audience-trust leak.
- Plain sentence case or standard title case. No ALL-CAPS words, no emoji stuffing, no "(GONE WRONG)" grammar - that register contradicts the calm-confident brand and ages badly.
- Write 3 title candidates alongside the 3 hooks; the title usually IS the winning hook's question, lightly compressed.

## Burned-in captions (overlay text)

Two text layers exist; do not conflate them:

1. **Story overlays** (from the shot list): 4-8 word beats that carry the narrative for muted viewers.
2. **Caption cards** (optional VO transcription): only if the pacing benefits; Zack D-style videos usually rely on overlays + auto-captions instead of full burned-in transcription.

Styling rules for anything burned in:
- Bold geometric sans (Archivo Black, Montserrat ExtraBold class), 3-6 words per card, never 2 lines when 1 fits.
- High contrast with a stroke or shadow, or a solid pill behind the text. Verify legibility on the actual frame, not in the editor on a grey background.
- Timed to VO beats: a card appears WITH its spoken words, not before.

## Safe zones (Shorts UI overlays your pixels)

On a 1080x1920 basis (double every number for 4K 2160x3840):
- **Bottom ~300px:** title, channel handle, music ticker render here. No text, no key visual detail.
- **Right ~140px:** like/comment/share/subscribe rail. Keep text and faces out.
- **Top ~150px:** search/camera icons on some surfaces.
- Working area: center the text block horizontally, place it between roughly 55-70% of frame height. The shot list's overlay column assumes this placement.

Verify before export: view one frame with a Shorts UI overlay template (or eyeball against a real Short on the phone). Text under the engagement rail is the most common postability failure in AI-assembled videos.

## Auto-captions + accessibility

Enable YouTube auto-captions and skim-correct them in the caption editor after upload (2 minutes; fixes the proper nouns). Captions feed search indexing as well as accessibility.

## Upload package (every video)

```
Title: [question form, <=60 chars, key nouns in first 40]
Description line 1: [restate the question + one keyword phrase]
Description line 2: [one-line answer tease, no spoiler]
Hashtags: 1-3 relevant (#shorts optional - placement signal is weak; never tag-stuff)
Audience flag: NOT made for kids
Language: set explicitly; check auto-captions after processing
```
