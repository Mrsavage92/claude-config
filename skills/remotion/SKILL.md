---
name: remotion
description: >
  Generate professional walkthrough videos from Stitch project screens using Remotion.
  Retrieves screens from Stitch, creates React-based Remotion compositions with smooth
  transitions, zoom effects, and text overlays, then renders to MP4. Use after
  completing Stitch canvas work to produce demo or marketing videos.
allowed-tools:
  - "stitch*:*"
  - "remotion*:*"
  - "Bash"
  - "Read"
  - "Write"
  - "WebFetch"
---

# Skill: /remotion

Generate professional walkthrough videos from Stitch screens using Remotion.

**References:**
- Stitch docs: https://stitch.withgoogle.com/docs/
- Remotion docs: https://www.remotion.dev/docs/
- Remotion transitions: https://www.remotion.dev/docs/transitions
- Remotion MCP: https://www.remotion.dev/docs/ai/mcp

---

## Overview

Workflow:
1. Retrieve screens from Stitch project
2. Set up Remotion project
3. Generate React video components
4. Preview and refine in Remotion Studio
5. Render to MP4

---

## Step 1: Gather Screen Assets

1. Run `list_tools` to find Stitch MCP prefix
2. Call `[stitch_prefix]:list_projects` → identify target project
3. Call `[stitch_prefix]:list_screens` → list all screens
4. For each screen, call `[stitch_prefix]:get_screen` and retrieve:
   - `screenshot.downloadUrl` — append `=w{width}` for full resolution
   - `width`, `height` — for composition scaling
   - Screen title and description for text overlays
5. Download screenshots → `assets/screens/{name}.png`
6. Create `screens.json` manifest:

```json
{
  "projectName": "My App",
  "screens": [
    {
      "id": "1",
      "title": "Home Screen",
      "description": "Main interface",
      "imagePath": "assets/screens/home.png",
      "width": 1440,
      "height": 900,
      "duration": 4
    }
  ]
}
```

---

## Step 2: Set Up Remotion Project

Check for existing `remotion.config.ts` or Remotion in `package.json`. If none:

```bash
npm create video@latest -- --blank
cd video
npm install @remotion/transitions @remotion/animated-emoji
```

---

## Step 3: Generate Components

### `ScreenSlide.tsx`

```tsx
import {useCurrentFrame, spring, interpolate} from 'remotion';

interface Props {
  imageSrc: string;
  title: string;
  description: string;
  width: number;
  height: number;
}

export const ScreenSlide: React.FC<Props> = ({imageSrc, title, description, width, height}) => {
  const frame = useCurrentFrame();
  const scale = spring({frame, fps: 30, config: {damping: 20, stiffness: 80}});
  const opacity = interpolate(frame, [0, 15], [0, 1], {extrapolateRight: 'clamp'});

  return (
    <div style={{width, height, overflow: 'hidden', position: 'relative'}}>
      <img src={imageSrc} style={{width: '100%', transform: `scale(${1 + (scale - 1) * 0.05})`}} />
      <div style={{position: 'absolute', bottom: 40, left: 40, opacity}}>
        <h2 style={{color: 'white', fontSize: 32, margin: 0}}>{title}</h2>
        <p style={{color: 'rgba(255,255,255,0.8)', fontSize: 18}}>{description}</p>
      </div>
    </div>
  );
};
```

### `WalkthroughComposition.tsx`

```tsx
import {Sequence, useVideoConfig} from 'remotion';
import {TransitionSeries, linearTiming} from '@remotion/transitions';
import {fade} from '@remotion/transitions/fade';
import screens from '../screens.json';

export const WalkthroughComposition: React.FC = () => {
  const {fps} = useVideoConfig();

  return (
    <TransitionSeries>
      {screens.screens.map((screen, i) => (
        <>
          <TransitionSeries.Sequence durationInFrames={screen.duration * fps}>
            <ScreenSlide
              imageSrc={screen.imagePath}
              title={screen.title}
              description={screen.description}
              width={screen.width}
              height={screen.height}
            />
          </TransitionSeries.Sequence>
          {i < screens.screens.length - 1 && (
            <TransitionSeries.Transition
              presentation={fade()}
              timing={linearTiming({durationInFrames: 15})}
            />
          )}
        </>
      ))}
    </TransitionSeries>
  );
};
```

---

## Step 4: Preview

```bash
npm run dev
```

Opens Remotion Studio at `localhost:3000`. Adjust timing, transitions, and text before rendering.

---

## Step 5: Render

```bash
npx remotion render WalkthroughComposition output.mp4 --codec h264
```

Or via Remotion MCP if available: call `[remotion_prefix]:render`.

---

## File Structure

```
project/
├── screens.json
├── assets/screens/
│   └── {name}.png
└── video/
    ├── src/
    │   ├── Root.tsx
    │   ├── WalkthroughComposition.tsx
    │   └── ScreenSlide.tsx
    ├── remotion.config.ts
    └── package.json
```

---

## Common Patterns

| Pattern | Use case |
|---|---|
| **Simple slideshow** | Fade transitions, 3-5s per screen, title overlay |
| **Feature highlight** | Zoom into regions, animated arrows, slow-motion emphasis |
| **User flow** | Sequential slide transitions, numbered steps, action highlights |

---

## Troubleshooting

| Issue | Solution |
|---|---|
| Blurry screenshots | Append `=w{width}` to download URL for full resolution |
| Choppy animations | Increase fps to 60; adjust spring damping |
| Remotion build fails | Check Node version; run `npm install` |
| Timing feels off | Adjust `duration` per screen in `screens.json`; preview in Studio |

---

## Related Skills

- `/stitch-design` — produces the screens this skill turns into video
- `/stitch-loop` — multi-page build loop that generates the source screens
