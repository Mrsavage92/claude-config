#!/usr/bin/env node
// Deterministic HTTP-level verification for a deployed chatbot site.
// Covers SKILL.md step 5: right build live, correct host, security headers.
// It does NOT exercise the bot's answers — that needs a browser (steps 6-7),
// because server functions expose no stable public POST path. Run it as:
//   node verify-chatbot.mjs <path-to-site.config.json>
// Exit 0 = all hard checks passed. Exit 1 = a hard check failed. Exit 2 = bad usage.
//
// ASCII-only output on purpose: the Windows console is cp1252 and crashes on
// box-drawing / check-mark glyphs.

import { readFileSync } from "node:fs";

const CORE_HEADERS = [
  "strict-transport-security",
  "x-frame-options",
  "x-content-type-options",
  "referrer-policy",
  "permissions-policy",
];

function die(msg, code = 2) {
  console.error(`[usage] ${msg}`);
  process.exit(code);
}

const configPath = process.argv[2];
if (!configPath) die("node verify-chatbot.mjs <path-to-site.config.json>");

let cfg;
try {
  cfg = JSON.parse(readFileSync(configPath, "utf8"));
} catch (e) {
  die(`could not read/parse config at ${configPath}: ${e.message}`);
}

for (const field of ["canonicalUrl", "host", "expectedContent"]) {
  if (!cfg[field]) die(`config is missing required field "${field}"`);
}
const host = String(cfg.host).toLowerCase();
if (host !== "vercel" && host !== "cloudflare") {
  die(`config.host must be "vercel" or "cloudflare", got "${cfg.host}"`);
}

const results = [];
const add = (level, label, detail) => results.push({ level, label, detail });

async function main() {
  const url = `${cfg.canonicalUrl}${cfg.canonicalUrl.includes("?") ? "&" : "?"}_cb=${Date.now()}`;
  let res, body;
  try {
    res = await fetch(url, { redirect: "follow", headers: { "user-agent": "chatbot-deploy-verify" } });
    body = await res.text();
  } catch (e) {
    add("FAIL", "reachable", `request to ${cfg.canonicalUrl} failed: ${e.message}`);
    return report();
  }

  // --- reachable ---
  if (res.status >= 200 && res.status < 400) {
    add("PASS", "reachable", `HTTP ${res.status} (final url: ${res.url})`);
  } else {
    add("FAIL", "reachable", `HTTP ${res.status} from ${res.url}`);
  }

  // --- host signature: prove WHERE it's served from ---
  const vercelId = res.headers.get("x-vercel-id");
  const server = (res.headers.get("server") || "").toLowerCase();
  if (host === "vercel") {
    if (vercelId) add("PASS", "host=vercel", `x-vercel-id: ${vercelId}`);
    else add("FAIL", "host=vercel", `no x-vercel-id header (server: ${server || "?"}). Not served by Vercel — DNS may not be cut over.`);
  } else {
    if (server.includes("cloudflare") && !vercelId) add("PASS", "host=cloudflare", `server: ${server}`);
    else add("FAIL", "host=cloudflare", `expected Cloudflare; got server="${server}" x-vercel-id="${vercelId || "none"}"`);
  }

  // --- right build live: unique content string ---
  if (body.includes(cfg.expectedContent)) {
    add("PASS", "expected-content", `found "${cfg.expectedContent}"`);
  } else {
    add("FAIL", "expected-content", `"${cfg.expectedContent}" NOT in response — wrong/old build, or an unrelated app on this URL`);
  }

  // --- security headers ---
  for (const h of CORE_HEADERS) {
    const v = res.headers.get(h);
    if (v) add("PASS", `header:${h}`, v);
    else add("FAIL", `header:${h}`, "missing");
  }
  const csp = res.headers.get("content-security-policy");
  if (csp) add("PASS", "header:content-security-policy", csp);
  else add("WARN", "header:content-security-policy", "no CSP set (acceptable if a full CSP is intentionally deferred; otherwise add one)");

  report();
}

function report() {
  console.log(`\n=== chatbot-deploy HTTP verification: ${cfg.name || cfg.canonicalUrl} ===`);
  for (const r of results) console.log(`[${r.level}] ${r.label} — ${r.detail}`);
  const fails = results.filter((r) => r.level === "FAIL");
  const warns = results.filter((r) => r.level === "WARN");
  console.log(`\nSummary: ${results.filter((r) => r.level === "PASS").length} pass, ${fails.length} fail, ${warns.length} warn`);
  console.log(
    "NOTE: this only verifies HTTP/headers/content. You MUST still exercise the bot in a browser",
  );
  console.log(
    "      (SKILL.md steps 6-7) to confirm it actually ANSWERS and is not silently serving the offline fallback.",
  );
  if (fails.length > 0) {
    console.log("\nRESULT: FAIL — do not call the deploy done.");
    process.exit(1);
  }
  console.log("\nRESULT: HTTP checks PASS — now run the live bot-answer checks before declaring done.");
  process.exit(0);
}

main();
