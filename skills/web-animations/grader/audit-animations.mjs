#!/usr/bin/env node
// Grader for /web-animations tier compliance.
// Reads source files + optional .evolution/site-profile.json (or .audit/site-profile.json).
// Checks: tier markers, reduce-motion guards on Tier 3 imports, vestibular-trigger usage
// without guards, dual-branch GSAP matchMedia for Tier 3 GSAP files, site-type vs MAX_TIER.
//
// Usage:  node ~/.claude/skills/web-animations/grader/audit-animations.mjs ./path/to/project
// Hook:   wire into /web-evolve Phase A after grading visible-delta.

import { readdir, readFile } from 'node:fs/promises'
import { extname, join, resolve, relative } from 'node:path'

const projectRoot = resolve(process.argv[2] || '.')
const srcRoot = join(projectRoot, 'src')

const SCAN_EXTS = new Set(['.tsx', '.jsx', '.ts'])
const SKIP_DIRS = new Set(['node_modules', 'dist', 'build', '.next', '.vercel', 'coverage'])

const motionMarkerRe = /\/\/\s*web-animations:\s*Tier\s*([1-4])\s*\(([^)]+)\)/
const motionUsageRe = /\b(motion\.|useMotionValue|useSpring|useTransform|useInView|useScroll|useReducedMotion|AnimatePresence|animate\()/
const gsapUsageRe = /\b(gsap\.|ScrollTrigger\.|gsap\(|new\s+ScrollTrigger)/
const lenisUsageRe = /\b(new\s+Lenis|lenis\.)/
const reducedMotionRe = /(useReducedMotion|prefers-reduced-motion|matchMedia\(['"`].*?reduce)/

const dualBranchRe = /gsap\.matchMedia\(\)/
const cssScrollTimelineRe = /animation-timeline\s*:\s*(view|scroll)\s*\(/

// Vestibular trigger heuristics
const triggerSignatures = [
  { name: 'parallax', re: /useScroll|scrollYProgress|Lenis|gsap\.scrollTo|ScrollTrigger\.create.*pin/, category: 3 },
  { name: 'spin', re: /rotate:\s*[0-9].*?[0-9]{2,}|rotation:\s*[0-9]{3,}/, category: 2 },
  { name: 'large-scale', re: /scale:\s*\[?\s*[01]\.?\d*\s*,\s*([2-9]|1\.[5-9])/, category: 1 },
  { name: 'animated-blur', re: /filter:\s*['"`]?blur\(.*animate|animate.*filter:\s*['"`]?blur/, category: 6 },
  { name: 'peripheral-marquee', re: /Marquee[^a-zA-Z]/, category: 5 },
  { name: 'dimensional-tilt', re: /rotateX|rotateY|transformStyle:\s*['"`]preserve-3d/, category: 4 },
]

const SITE_TYPE_MAX_TIER = {
  'local-service': 1,
  'pro-services': 2,
  'agency': 2,
  'saas-marketing': 3,
  'saas-app': 2,
  'ecommerce': 2,
  'marketplace': 2,
  'portfolio': 4,
  'content': 1,
  'publication': 1,
  'nonprofit': 1,
  'event': 3,
  'documentation': 1,
  'dashboard': 2,
  'app-dashboard': 2,
  'hybrid': null, // per-route from .routes
}

async function* walk(dir) {
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue
      yield* walk(join(dir, entry.name))
    } else if (SCAN_EXTS.has(extname(entry.name))) {
      yield join(dir, entry.name)
    }
  }
}

async function loadSiteProfile() {
  for (const candidate of ['.evolution/site-profile.json', '.audit/site-profile.json']) {
    try {
      const raw = await readFile(join(projectRoot, candidate), 'utf8')
      return { path: candidate, profile: JSON.parse(raw) }
    } catch {
      // continue
    }
  }
  return null
}

const siteProfileResult = await loadSiteProfile()
const siteProfile = siteProfileResult?.profile ?? null
const siteMaxTier = siteProfile ? SITE_TYPE_MAX_TIER[siteProfile.type] ?? null : null

const report = {
  project: projectRoot,
  scannedAt: new Date().toISOString(),
  siteProfile: siteProfileResult ? { path: siteProfileResult.path, type: siteProfile?.type, maxTier: siteMaxTier } : null,
  totalFiles: 0,
  markers: [],
  unmarkedMotionFiles: [],
  tier3FilesMissingReducedMotionGuard: [],
  tier3GsapFilesMissingDualBranch: [],
  vestibularTriggersWithoutGuards: [],
  tierExceedingSiteMax: [],
  tierBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0 },
}

for await (const file of walk(srcRoot)) {
  let content
  try {
    content = await readFile(file, 'utf8')
  } catch {
    continue
  }
  report.totalFiles++
  const rel = relative(projectRoot, file).replace(/\\/g, '/')

  const hasMotion = motionUsageRe.test(content)
  const hasGsap = gsapUsageRe.test(content)
  const hasLenis = lenisUsageRe.test(content)
  const hasReducedMotion = reducedMotionRe.test(content)
  const hasDualBranch = dualBranchRe.test(content)
  const usesCSSScrollTimeline = cssScrollTimelineRe.test(content)
  const markerMatch = motionMarkerRe.exec(content)

  if (markerMatch) {
    const tier = Number(markerMatch[1])
    report.markers.push({ file: rel, tier, pattern: markerMatch[2] })
    if (tier >= 1 && tier <= 4) report.tierBreakdown[tier]++

    if (siteMaxTier !== null && tier > siteMaxTier) {
      report.tierExceedingSiteMax.push({
        file: rel,
        tier,
        pattern: markerMatch[2],
        siteMaxTier,
        siteType: siteProfile?.type,
      })
    }
  } else if (hasMotion || hasGsap || hasLenis) {
    report.unmarkedMotionFiles.push(rel)
  }

  if ((hasGsap || hasLenis) && !hasReducedMotion && !usesCSSScrollTimeline) {
    report.tier3FilesMissingReducedMotionGuard.push(rel)
  }

  if (hasGsap && !hasDualBranch && hasReducedMotion === false) {
    report.tier3GsapFilesMissingDualBranch.push(rel)
  }

  // Only check vestibular triggers in files that actually animate (motion/gsap/lenis usage)
  // — re-export index files match the regex but have no animation logic.
  if (hasMotion || hasGsap || hasLenis) {
    for (const sig of triggerSignatures) {
      if (sig.re.test(content) && !hasReducedMotion && !usesCSSScrollTimeline) {
        report.vestibularTriggersWithoutGuards.push({
          file: rel,
          trigger: sig.name,
          category: sig.category,
        })
      }
    }
  }
}

report.summary = {
  totalFilesScanned: report.totalFiles,
  filesWithMarkers: report.markers.length,
  filesUsingMotionWithoutMarker: report.unmarkedMotionFiles.length,
  tier3FilesMissingReducedMotionGuard: report.tier3FilesMissingReducedMotionGuard.length,
  tier3GsapFilesMissingDualBranch: report.tier3GsapFilesMissingDualBranch.length,
  vestibularTriggersWithoutGuards: report.vestibularTriggersWithoutGuards.length,
  tierExceedingSiteMax: report.tierExceedingSiteMax.length,
  tierBreakdown: report.tierBreakdown,
  siteProfileLoaded: report.siteProfile !== null,
}

console.log(JSON.stringify(report, null, 2))

const failures =
  report.unmarkedMotionFiles.length +
  report.tier3FilesMissingReducedMotionGuard.length +
  report.vestibularTriggersWithoutGuards.length +
  report.tierExceedingSiteMax.length

process.exit(failures > 0 ? 1 : 0)
