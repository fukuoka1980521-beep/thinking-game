#!/usr/bin/env node
/**
 * Phase 31 endpoint smoke-test harness (instruction 5). Validates a
 * deployed `functions/newlife-dialogue/` endpoint's transport/validation
 * behavior using only synthetic, non-sensitive utterances — never real
 * player free text. This checks the function responds correctly at the
 * HTTP/CORS/validation layer; it does NOT and cannot claim anything about
 * conversation quality from one pass (Phase 31 instruction 5's own
 * constraint) — raw responses are printed/saved for later human review,
 * not graded here.
 *
 * Usage:
 *   node scripts/newlife-deploy/smoke-test.mjs --url <https-url> [--origin <origin>] [--out <file.json>]
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { SMOKE_TEST_CASES, ALLOWED_ORIGINS, buildSyntheticSnapshot } from "./lib.mjs";

function parseArgs(argv) {
  const args = { origin: ALLOWED_ORIGINS[0], out: undefined, url: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url") args.url = argv[++i];
    else if (argv[i] === "--origin") args.origin = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
  }
  return args;
}

async function runCase(url, origin, testCase) {
  const headers = { Origin: origin };
  try {
    if (testCase.kind === "options") {
      const res = await fetch(url, { method: "OPTIONS", headers });
      return { name: testCase.name, httpStatus: res.status, corsAllowOrigin: res.headers.get("access-control-allow-origin"), passExpectation: res.status === 204 || res.status === 200 };
    }
    if (testCase.kind === "get") {
      const res = await fetch(url, { method: "GET", headers });
      return { name: testCase.name, httpStatus: res.status, passExpectation: res.status === 405 };
    }
    if (testCase.kind === "post_raw") {
      const res = await fetch(url, { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: testCase.body });
      const body = await res.text();
      return { name: testCase.name, httpStatus: res.status, body, passExpectation: res.status === 400 };
    }
    if (testCase.kind === "post") {
      const snapshot = buildSyntheticSnapshot(testCase.npc);
      const res = await fetch(url, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ utterance: testCase.utterance, snapshot }),
      });
      const body = await res.text();
      let parsed = null;
      try {
        parsed = JSON.parse(body);
      } catch {
        // left null — recorded as-is below
      }
      return { name: testCase.name, httpStatus: res.status, utterance: testCase.utterance, npc: testCase.npc, rawBody: body, parsed, passExpectation: res.status === 200 && parsed !== null };
    }
    return { name: testCase.name, error: "unknown_case_kind" };
  } catch (err) {
    return { name: testCase.name, error: err instanceof Error ? err.message : String(err) };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.url) {
    console.log("Usage: node scripts/newlife-deploy/smoke-test.mjs --url <https-url> [--origin <origin>] [--out <file.json>]");
    process.exit(args.help ? 0 : 1);
  }

  console.log(`Smoke-testing ${args.url} as origin ${args.origin}`);
  console.log("Synthetic-only utterances. Structural validation only — not a conversation-quality claim.\n");

  const results = [];
  for (const testCase of SMOKE_TEST_CASES) {
    const result = await runCase(args.url, args.origin, testCase);
    results.push(result);
    const status = result.error ? "ERROR" : result.passExpectation ? "OK" : "UNEXPECTED";
    console.log(`[${status}] ${result.name}${result.httpStatus !== undefined ? ` (http ${result.httpStatus})` : ""}${result.error ? `: ${result.error}` : ""}`);
  }

  const summary = {
    endpoint: args.url,
    origin: args.origin,
    ranAt: new Date().toISOString(),
    note: "SYNTHETIC transport/validation smoke test only. Not a semantic-quality or human-validation claim.",
    results,
  };

  if (args.out) {
    const outDir = path.dirname(args.out);
    if (outDir && outDir !== ".") mkdirSync(outDir, { recursive: true });
    writeFileSync(args.out, JSON.stringify(summary, null, 2), "utf8");
    console.log(`\nWrote full results to ${args.out}`);
  }

  const failed = results.filter((r) => r.error || r.passExpectation === false);
  console.log(`\n${results.length - failed.length}/${results.length} cases matched their structural expectation.`);
  if (failed.length > 0) {
    console.log("Cases needing review:", failed.map((r) => r.name).join(", "));
    process.exitCode = 1;
  }
}

main();
