#!/usr/bin/env node
// Audits a project for /web-animations tier compliance.
// Reports motion code without tier markers, Tier-3 imports without reduced-motion guard,
// and a summary of detected tier usage. Non-zero exit on unmarked motion files.
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

const report = {
  project: projectRoot,
  scannedAt: new Date().toISOString(),
  totalFiles: 0,
  markers: [],
  unmarkedMotionFiles: [],
  tier3FilesMissingReducedMotion: [],
  tierBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0 },
  summary: {},
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
  const markerMatch = motionMarkerRe.exec(content)

  if (markerMatch) {
    const tier = Number(markerMatch[1])
    report.markers.push({ file: rel, tier, pattern: markerMatch[2] })
    if (tier >= 1 && tier <= 4) report.tierBreakdown[tier]++
  } else if (hasMotion || hasGsap || hasLenis) {
    report.unmarkedMotionFiles.push(rel)
  }

  if ((hasGsap || hasLenis) && !hasReducedMotion) {
    report.tier3FilesMissingReducedMotion.push(rel)
  }
}

report.summary = {
  totalFilesScanned: report.totalFiles,
  filesWithMarkers: report.markers.length,
  filesUsingMotionWithoutMarker: report.unmarkedMotionFiles.length,
  tier3FilesMissingReducedMotionGuard: report.tier3FilesMissingReducedMotion.length,
  tierBreakdown: report.tierBreakdown,
}

console.log(JSON.stringify(report, null, 2))

const failures =
  report.unmarkedMotionFiles.length + report.tier3FilesMissingReducedMotion.length
process.exit(failures > 0 ? 1 : 0)
