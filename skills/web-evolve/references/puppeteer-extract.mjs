#!/usr/bin/env node
// Render a URL via puppeteer-core (uses local Chrome) and extract H1, primary CTA text, visible pricing.
// Used by verify-live-html.sh as the SPA fallback when curl-fetched HTML is too sparse.
// Usage: node puppeteer-extract.mjs <url>
// Outputs JSON on stdout; exit 0 on success, exit 1 on render failure.

import path from 'node:path';
import { existsSync } from 'node:fs';

// puppeteer-core lives in user-level cache to keep the skill repo small
const CACHE_DIR = process.env.WEB_EVOLVE_PUPPETEER_CACHE
  || path.join(process.env.HOME || process.env.USERPROFILE, '.cache', 'web-evolve-puppeteer');
const moduleUrl = new URL(`file:///${path.join(CACHE_DIR, 'node_modules', 'puppeteer-core', 'lib', 'esm', 'puppeteer', 'puppeteer-core.js').replace(/\\/g, '/')}`);

let puppeteer;
try {
  const mod = await import(moduleUrl.href);
  puppeteer = mod.default || mod;
} catch (e) {
  console.error(`PUPPETEER_CORE_MISSING: install with: cd ${CACHE_DIR} && npm install puppeteer-core`);
  process.exit(1);
}

const url = process.argv[2];
if (!url) {
  console.error('USAGE: node puppeteer-extract.mjs <url>');
  process.exit(2);
}

// Locate local Chrome
const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find(p => existsSync(p));
if (!chromePath) {
  console.error('CHROME_NOT_FOUND: set $CHROME_PATH or install Chrome');
  process.exit(1);
}

let browser;
try {
  browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

  const extracted = await page.evaluate(() => {
    const h1El = document.querySelector('h1');
    const h1 = h1El ? h1El.textContent.trim() : null;

    // Primary CTA: prefer prominent buttons/CTAs first, fall back to first link
    const ctaSelectors = [
      'a[role="button"]', 'button.primary', 'a.cta', 'a.btn-primary',
      'a[class*="cta"]', 'a[class*="primary"]', 'button', 'a',
    ];
    let primary_cta = null;
    for (const sel of ctaSelectors) {
      const els = document.querySelectorAll(sel);
      for (const el of els) {
        const text = (el.textContent || '').trim();
        if (text && text.length > 0 && text.length < 60) {
          primary_cta = text;
          break;
        }
      }
      if (primary_cta) break;
    }

    const bodyText = document.body ? document.body.innerText : '';
    const pricingRe = /[\$£€¥][0-9][0-9,]*(\.[0-9]+)?(\s?\/\s?(mo|month|yr|year|user|seat))?/g;
    const pricingMatches = bodyText.match(pricingRe) || [];
    const visible_pricing = Array.from(new Set(pricingMatches));

    return { h1, primary_cta, visible_pricing };
  });

  console.log(JSON.stringify(extracted));
  await browser.close();
  process.exit(0);
} catch (err) {
  if (browser) await browser.close().catch(() => {});
  console.error(`PUPPETEER_EXTRACT_FAIL: ${err.message}`);
  process.exit(1);
}
