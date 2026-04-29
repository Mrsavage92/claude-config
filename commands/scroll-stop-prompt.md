---
name: scroll-stop-prompt
description: Generate three coordinated AI prompts (hero shot, exploded view, video transition) for scroll-stopping product content — delivered as a styled HTML page with copy buttons and confetti.
---

Generate scroll-stopping AI prompts for a product using the scroll-stop-prompter skill at ~/.claude/skills/claude-skills/marketing-skill/scroll-stop-prompter/SKILL.md.

Ask the user 3 questions:
1. What is the product? (name + brief description)
2. What is the brand aesthetic? (e.g. premium dark, clean minimal, warm organic)
3. What aspect ratio? (9:16 social / 16:9 web — default 9:16)

Then generate all three prompts (hero shot, exploded view, video transition) and deliver them in a complete self-contained HTML page with copy buttons, starscape background, and confetti celebration.

## Quick Start

```
/scroll-stop-prompt
```

Then answer the 3 questions and receive your ready-to-use prompt suite.

## Output

A styled HTML page containing:
- Hero product shot prompt (Midjourney/DALL-E/Flux/Ideogram compatible)
- Exploded/antigravity components prompt
- Cinematic video transition prompt (Runway/Kling/Pika compatible)

## Pipeline

This is Step 1 of the content pipeline:
1. **scroll-stop-prompt** ← you are here
2. Create images/video with your preferred AI tools
3. /scroll-stop-build — build a scroll-driven website from your video
4. /seo-strategy — optimise the website content for search

## Related Skills

- /scroll-stop-build
- /seo-strategy
