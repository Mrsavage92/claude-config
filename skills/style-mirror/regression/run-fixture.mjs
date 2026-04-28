#!/usr/bin/env node
// Regression fixture for /style-mirror → scaffold → diff.
//
// Goal: prove that the lock written by style-mirror is honored by the
// scaffolded output. If a build skill regresses and stops reading the lock,
// this fixture catches it before client work does.
//
// What it does (does NOT call Claude — it's a verification harness):
//   1. Reads a previously-captured tokens.lock.json fixture
//   2. Reads the corresponding scaffolded project's index.css and tailwind.config.ts
//   3. Asserts the locked values appear in the generated files
//   4. Asserts no signature elements were injected that the lock forbids
//   5. Exits 0 (PASS) or 1 (FAIL) with a per-check report
//
// Usage:
//   node run-fixture.mjs <fixture-dir>
// where <fixture-dir> contains:
//   - tokens.lock.json            (the lock as written by /style-mirror)
//   - expected/index.css          (the index.css the build SHOULD produce)
//   - expected/tailwind.config.ts (the tailwind config the build SHOULD produce)
//   - actual/index.css            (the index.css the build DID produce — copied here after a real /web-scaffold run)
//   - actual/tailwind.config.ts   (same)
//
// To create a new fixture:
//   1. mkdir fixtures/<name>
//   2. Run /style-mirror <reference-url> against a clean scaffold dir
//   3. Copy tokens.lock.json + the project's index.css & tailwind.config.ts to fixtures/<name>/expected/
//   4. Whenever you change a build skill, re-run /web-scaffold with the same lock,
//      copy the new outputs into fixtures/<name>/actual/, then run this fixture

import fs from 'node:fs';
import path from 'node:path';

const fixtureDir = process.argv[2];
if (!fixtureDir) {
  console.error('Usage: node run-fixture.mjs <fixture-dir>');
  process.exit(2);
}

const lockPath = path.join(fixtureDir, 'tokens.lock.json');
const actualCssPath = path.join(fixtureDir, 'actual', 'index.css');
const actualTwPath = path.join(fixtureDir, 'actual', 'tailwind.config.ts');

if (!fs.existsSync(lockPath)) die(`Missing ${lockPath}`);
if (!fs.existsSync(actualCssPath)) die(`Missing ${actualCssPath} — run /web-scaffold and copy its index.css here`);
if (!fs.existsSync(actualTwPath)) die(`Missing ${actualTwPath} — run /web-scaffold and copy its tailwind.config.ts here`);

const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
const css = fs.readFileSync(actualCssPath, 'utf8');
const tw = fs.readFileSync(actualTwPath, 'utf8');
const all = css + '\n' + tw;

const checks = [];
const check = (name, pass, detail = '') => checks.push({ name, pass, detail });

// --- Color assertions ---
if (lock.colors?.body_bg) {
  const wanted = normalizeColor(lock.colors.body_bg);
  const found = colorsIn(all).map(normalizeColor);
  check(
    `body_bg ${lock.colors.body_bg} present in tokens`,
    found.includes(wanted),
    `looked for ${wanted} in ${found.length} colors`,
  );
}
if (lock.colors?.cta_bg) {
  const wanted = normalizeColor(lock.colors.cta_bg);
  const found = colorsIn(all).map(normalizeColor);
  check(
    `cta_bg ${lock.colors.cta_bg} present in tokens`,
    found.includes(wanted),
    `looked for ${wanted} in ${found.length} colors`,
  );
}

// --- Typography assertions ---
if (lock.typography?.heading_family) {
  const familyToken = lock.typography.heading_family.split(',')[0].replace(/['"]/g, '').trim();
  check(
    `heading_family "${familyToken}" present`,
    all.includes(familyToken),
    `searched for "${familyToken}"`,
  );
}

// --- Radius assertion ---
if (lock.spacing?.cta_border_radius) {
  check(
    `cta_border_radius ${lock.spacing.cta_border_radius} present`,
    all.includes(lock.spacing.cta_border_radius),
    `searched for "${lock.spacing.cta_border_radius}"`,
  );
}

// --- Signature element forbiddances (lock says false → must NOT appear) ---
const sig = lock.signature_elements || {};
if (sig.gradient_mesh === false) {
  check(
    'NO gradient mesh injected',
    !/radial-gradient\s*\(\s*at\s+\d/.test(all),
    'lock.signature_elements.gradient_mesh = false',
  );
}
if (sig.glassmorphism === false) {
  check(
    'NO glassmorphism injected',
    !/backdrop-filter\s*:\s*blur/.test(all) && !/backdrop-blur(-(?:sm|md|lg|xl|2xl|3xl|none))?\b/.test(all),
    'lock.signature_elements.glassmorphism = false',
  );
}
if (sig.grid_lines === false) {
  check(
    'NO grid-line background injected',
    !/background-image\s*:\s*linear-gradient\([^)]*1px[^)]*transparent\s*1px/.test(all),
    'lock.signature_elements.grid_lines = false',
  );
}
if (sig.gradient_text === false) {
  check(
    'NO gradient text (background-clip: text) injected',
    !/-webkit-background-clip\s*:\s*text/.test(all) && !/bg-clip-text\b/.test(all),
    'lock.signature_elements.gradient_text = false',
  );
}
if (sig.grain === false) {
  check(
    'NO grain texture injected',
    !/feTurbulence/.test(all) && !/\.grain\s*::?after/.test(all),
    'lock.signature_elements.grain = false',
  );
}

// --- Report ---
const passes = checks.filter((c) => c.pass).length;
const fails = checks.filter((c) => !c.pass);
console.log(`\nLOCK CONFORMANCE — fixture ${path.basename(fixtureDir)}`);
console.log(`────────────────────────────────────────────────────────`);
for (const c of checks) {
  console.log(`${c.pass ? 'PASS' : 'FAIL'}  ${c.name}${c.pass ? '' : `  (${c.detail})`}`);
}
console.log(`────────────────────────────────────────────────────────`);
console.log(`${passes}/${checks.length} checks passed`);
if (fails.length === 0) {
  console.log('REGRESSION: NONE — the build skills are honoring the lock.');
  process.exit(0);
} else {
  console.log(`REGRESSION DETECTED — ${fails.length} check(s) failed.`);
  console.log('A build skill has stopped reading tokens.lock.json or is injecting Design DNA defaults.');
  process.exit(1);
}

// --- Helpers ---
function colorsIn(text) {
  const re = /#[0-9a-fA-F]{3,8}\b|rgba?\([^)]+\)|hsla?\([^)]+\)|oklch\([^)]+\)/g;
  return text.match(re) || [];
}
function normalizeColor(c) {
  return c.replace(/\s+/g, '').toLowerCase();
}
function die(msg) {
  console.error(msg);
  process.exit(2);
}
