---
name: scroll-stop-build
description: Takes a product video and builds a production-quality Apple-style scroll-driven website where video playback is controlled by scroll position, with lerp smoothing, annotations, starscape, and full mobile responsiveness.
---

Build a scroll-driven product website using the scroll-stop-builder skill at ~/.claude/skills/claude-skills/marketing-skill/scroll-stop-builder/SKILL.md.

Ask the user 3 questions:
1. What is the video file path?
2. What is the product name and hero headline?
3. What background colour dominates the video? (hex or description)

Then generate the FFmpeg frame extraction command and build a complete production-ready scroll-driven website.

## Quick Start

```
/scroll-stop-build
```

Then provide your video path and answer 2 more questions.

## Requirements

- `ffmpeg` must be installed: `brew install ffmpeg`
- Video file accessible locally

## What Gets Built

A complete self-contained `index.html` with:
- Scroll-linked video playback (every scroll pixel advances video)
- Lerp smoothing (no choppy frames)
- Animated starscape background
- Annotation "beats" that appear at key scroll points
- Specs section with count-up animation
- Navbar pill → solid bar transform
- Loader with progress bar
- Full mobile responsive + accessibility (prefers-reduced-motion)

## Pipeline

This is Step 2 of the content pipeline:
1. /scroll-stop-prompt — generate AI image/video prompts
2. Create images/video with AI tools
3. **scroll-stop-build** ← you are here
4. /seo-strategy — optimise the website content for search

## Related Skills

- /scroll-stop-prompt
- /seo-strategy
