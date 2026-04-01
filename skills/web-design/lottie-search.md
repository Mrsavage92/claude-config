# Skill: Lottie Animation Search

## Purpose
Search LottieFiles for free animations by use case. Adam has account via GitHub login.
Always recommend Optimized dotLottie format.

## Search Pattern
site:lottiefiles.com free animation [use case keywords]

## Return Format
**[Name]** | URL | Description | Best for

Return 3-5 options. Always append download instructions:
1. Open URL (logged in via GitHub)
2. Download & Handoff panel
3. Select Optimized dotLottie (89% smaller than JSON)
4. Save to /public
5. Tell me filename — I implement it

## Implementation
.lottie: npm install @lottiefiles/dotlottie-react
  <DotLottieReact src="/file.lottie" loop autoplay style={{ width: 400 }} />

.json fallback: npm install lottie-react
  <Lottie animationData={data} loop={true} style={{ width: 400 }} />

## Search Terms by Use Case
- Hero AI/tech: "AI robot technology hero animated"
- Hero SaaS: "productivity dashboard workflow animated"
- Loading: "loading spinner minimal clean"
- Success: "success checkmark celebration"
- Empty state: "empty state no data illustration"
- Feature icons: "icons pack animated UI"
- Analytics: "analytics chart data graph"
