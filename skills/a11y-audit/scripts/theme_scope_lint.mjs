#!/usr/bin/env node
// theme_scope_lint.mjs — Catches the CSS architecture failure that produced
// Orbit Digital's invisible nav on 2026-05-18.
//
// The failure pattern: a global `:root { ... }` block that redefines brand
// tokens (e.g. --gl-charcoal-mid) to dark-mode values WITHOUT being scoped to
// .dark, [data-theme], or a similar opt-in selector. Once the brand migrates
// to a light surface, every page that doesn't wrap itself in a re-scoping
// class renders illegible text.
//
// Detection rule: a `:root` block is suspicious if it
//   (a) is not the first :root block in the file (so it's an override), AND
//   (b) sets brand-prefixed custom properties (any --<word>-<word>* token).
//
// Also flags globally-scoped `body { background-color: ...; color: ...; }`
// blocks that hardcode colors (these belong in :root tokens, not body rules,
// so they can be re-scoped by theme).
//
// Usage:
//   node theme_scope_lint.mjs <css-file-or-glob> [<more files...>]
//
// Exit codes:
//   0 — no findings
//   1 — warnings (informational)
//   2 — blocking findings

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('usage: theme_scope_lint.mjs <css-file> [<more files...>]');
  process.exit(2);
}

const files = args.filter(f => {
  if (!existsSync(f)) {
    console.error(`[skip] not found: ${f}`);
    return false;
  }
  return true;
});

const findings = [];

function parseRootBlocks(src) {
  const blocks = [];
  const rootRe = /(^|\n)\s*:root\s*\{([\s\S]*?)\n\s*\}/g;
  let m;
  while ((m = rootRe.exec(src)) !== null) {
    const block = m[2];
    const startLine = src.slice(0, m.index).split('\n').length + 1;
    const tokens = {};
    const tokenRe = /(--[a-z][a-z0-9]+(?:-[a-z0-9-]+)*)\s*:\s*([^;]+?)\s*;/gi;
    let tm;
    while ((tm = tokenRe.exec(block)) !== null) {
      tokens[tm[1]] = tm[2].trim();
    }
    blocks.push({ startLine, tokens, raw: block });
  }
  return blocks;
}

for (const file of files) {
  const src = readFileSync(file, 'utf8');

  const blocks = parseRootBlocks(src);

  // Build a "first seen" map. Any later :root block that redefines a token
  // already defined earlier — and is not class-scoped — is a finding.
  const firstSeen = {};
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (i === 0) {
      Object.assign(firstSeen, b.tokens);
      continue;
    }
    const shadowed = [];
    for (const [tok, val] of Object.entries(b.tokens)) {
      if (firstSeen[tok] !== undefined && firstSeen[tok] !== val) {
        shadowed.push({ tok, was: firstSeen[tok], now: val });
      }
    }
    if (shadowed.length > 0) {
      findings.push({
        severity: 'BLOCKING',
        file,
        line: b.startLine,
        rule: 'unscoped-brand-token-shadow',
        message: `:root block at line ${b.startLine} redefines ${shadowed.length} token(s) already set by an earlier :root: ${shadowed.slice(0,5).map(s => `${s.tok} (${s.was} -> ${s.now})`).join('; ')}${shadowed.length>5?'; ...':''}.`,
        hint: 'Move to .dark :root { ... } or [data-theme="dark"] { ... } so the override is opt-in. Unscoped :root shadowing makes the override fire on every page — pages without a re-scoping wrapper inherit the override and may render illegible text.',
      });
    }
    // Track first appearance only — don't overwrite
    for (const [tok, val] of Object.entries(b.tokens)) {
      if (firstSeen[tok] === undefined) firstSeen[tok] = val;
    }
  }

  // Look for `body { background-color: <hex/rgb/oklch> ...; color: <hex/...>; }`
  // that hardcodes colors. These should reference tokens via var(...).
  const bodyRe = /(^|\n)\s*body\s*\{([\s\S]*?)\n\s*\}/g;
  let m;
  while ((m = bodyRe.exec(src)) !== null) {
    const block = m[2];
    const hasHardcodedBg = /\bbackground(-color)?\s*:\s*(#[\da-f]+|rgba?\(|hsla?\(|oklab\(|oklch\()/i.test(block);
    const hasHardcodedColor = /(?<![-\w])color\s*:\s*(#[\da-f]+|rgba?\(|hsla?\(|oklab\(|oklch\()/i.test(block);
    if (hasHardcodedBg || hasHardcodedColor) {
      const startLine = src.slice(0, m.index).split('\n').length + 1;
      findings.push({
        severity: 'WARNING',
        file,
        line: startLine,
        rule: 'body-hardcoded-color',
        message: 'body block hardcodes color/background instead of using var(--token).',
        hint: 'Use the Tailwind utility on <body className="bg-X text-Y"> or reference a CSS variable. Hardcoded body colors cannot be re-themed.',
      });
    }
  }

  // Flag `.dark` class on <html> when there's no `.dark`-scoped CSS in the file
  // (mismatch — Tailwind dark: variants will fire but no theme rules will apply).
  // Skip — that's a different file (layout.tsx); the lint scope is CSS files.
}

if (findings.length === 0) {
  console.log('[theme_scope_lint] clean');
  process.exit(0);
}

let hasBlocking = false;
for (const f of findings) {
  if (f.severity === 'BLOCKING') hasBlocking = true;
  console.log(`[${f.severity}] ${f.file}:${f.line} — ${f.rule}`);
  console.log(`    ${f.message}`);
  console.log(`    hint: ${f.hint}`);
  console.log('');
}

process.exit(hasBlocking ? 2 : 1);
