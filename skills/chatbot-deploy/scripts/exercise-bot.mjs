#!/usr/bin/env node
// Live bot-answer verification — SKILL.md steps 6-7, the part that actually
// proves the chatbot is alive. Drives the REAL widget in a headless browser,
// sends each config evalQuestion, and asserts the reply is a grounded answer
// (not the fail-open "offline" fallback) and satisfies include/exclude rules.
//
//   node exercise-bot.mjs <path-to-site.config.json>
//
// Exit 0 = bot answered and every question passed. Exit 1 = a question failed
// OR the bot served the offline fallback (key not wired). Exit 2 = setup error
// (bad config, Playwright missing, page/widget not found).
//
// Needs Playwright once:  npm i -D playwright && npx playwright install chromium
// ASCII-only output (Windows console is cp1252 and crashes on fancy glyphs).

import { readFileSync } from "node:fs";

const DEFAULTS = {
  // The chatbot widget is the SAME component on every site, so these hold
  // across deployments. Brand name varies, so the launcher matches a prefix.
  launcher: 'button[aria-label^="Chat with"]',
  input: "#orbit-chat-input",
  send: 'button[aria-label="Send message"]',
  // Assistant reply bubbles. The "Thinking" indicator shares the class, so we
  // filter it out by text when reading the latest reply.
  replyBubble: '[role="dialog"] .bg-card',
};

function die(msg, code = 2) {
  console.error(`[setup] ${msg}`);
  process.exit(code);
}

const configPath = process.argv[2];
if (!configPath) die("node exercise-bot.mjs <path-to-site.config.json>");

let cfg;
try {
  cfg = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  die(`could not read/parse config: ${e.message}`);
}
if (!cfg.canonicalUrl) die('config missing "canonicalUrl"');

const sel = { ...DEFAULTS, ...(cfg.selectors || {}) };
const offline = (cfg.offlineFallbackMarker || "offline right now").toLowerCase();
// Always exercise at least one question so a bare config still proves liveness.
const questions =
  Array.isArray(cfg.evalQuestions) && cfg.evalQuestions.length
    ? cfg.evalQuestions
    : [{ q: "what do you do?", mustInclude: [], mustNotInclude: [] }];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  die("Playwright not installed. Run: npm i -D playwright && npx playwright install chromium", 2);
}

const results = [];

function checkReply(entry, reply) {
  const low = reply.toLowerCase();
  const fails = [];
  if (!reply.trim()) fails.push("empty reply");
  if (low.includes(offline)) fails.push(`served the offline fallback ("${cfg.offlineFallbackMarker}") — API key not wired`);
  for (const inc of entry.mustInclude || []) {
    if (!low.includes(String(inc).toLowerCase())) fails.push(`missing required: "${inc}"`);
  }
  for (const exc of entry.mustNotInclude || []) {
    if (low.includes(String(exc).toLowerCase())) fails.push(`contains banned: "${exc}"`);
  }
  return fails;
}

async function latestReplyText(page) {
  // Read all assistant bubbles, drop the transient "Thinking" indicator,
  // return the last real one.
  const texts = await page.$$eval(sel.replyBubble, (els) =>
    els.map((e) => e.textContent.trim()).filter(Boolean),
  );
  const real = texts.filter((t) => !/^thinking/i.test(t));
  return real.length ? real[real.length - 1] : "";
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(cfg.canonicalUrl, { waitUntil: "domcontentloaded", timeout: 30000 });

    // Open the widget.
    try {
      await page.click(sel.launcher, { timeout: 15000 });
      await page.waitForSelector(sel.input, { state: "visible", timeout: 10000 });
    } catch {
      await browser.close();
      die(`could not open the chat widget (launcher "${sel.launcher}" / input "${sel.input}"). Wrong selectors or the widget isn't on ${cfg.canonicalUrl}.`, 2);
    }

    for (const entry of questions) {
      const before = (await page.$$eval(sel.replyBubble, (els) => els.length).catch(() => 0));
      await page.fill(sel.input, entry.q);
      await page.click(sel.send);

      // Wait for a NEW reply bubble (model takes a few seconds), then let it settle.
      let reply = "";
      try {
        await page.waitForFunction(
          ([selector, prev]) => {
            const n = document.querySelectorAll(selector).length;
            if (n <= prev) return false;
            const last = document.querySelectorAll(selector)[n - 1];
            return last && !/^thinking/i.test(last.textContent.trim()) && last.textContent.trim().length > 0;
          },
          [sel.replyBubble, before],
          { timeout: 40000 },
        );
        // Wait for the reply to STOP growing rather than a fixed delay — a
        // streaming/slow model can have only a partial sentence rendered after
        // a flat 400ms, which would false-pass/fail the assertions. Poll until
        // two consecutive reads (300ms apart) match, or give up after ~6s.
        let prevText = await latestReplyText(page);
        for (let i = 0; i < 20; i++) {
          await page.waitForTimeout(300);
          const now = await latestReplyText(page);
          if (now && now === prevText) break;
          prevText = now;
        }
        reply = prevText;
      } catch {
        reply = await latestReplyText(page); // capture whatever's there for evidence
      }

      const fails = checkReply(entry, reply);
      results.push({ q: entry.q, pass: fails.length === 0, fails, reply: reply.slice(0, 280) });
    }
  } finally {
    await browser.close();
  }

  // Receipt.
  console.log(`\n=== chatbot-deploy bot-answer verification: ${cfg.name || cfg.canonicalUrl} ===`);
  for (const r of results) {
    console.log(`\n[${r.pass ? "PASS" : "FAIL"}] Q: ${r.q}`);
    console.log(`   reply: ${r.reply || "(none)"}`);
    if (!r.pass) for (const f of r.fails) console.log(`   - ${f}`);
  }
  const failed = results.filter((r) => !r.pass).length;
  console.log(`\nSummary: ${results.length - failed}/${results.length} questions passed`);
  if (failed > 0) {
    console.log("RESULT: FAIL — the bot is not answering correctly. Do NOT call the deploy done.");
    process.exit(1);
  }
  console.log("RESULT: PASS — the live bot answered every question correctly (and is not the offline fallback).");
  process.exit(0);
}

main().catch((e) => die(`unexpected error: ${e.message}`, 2));
