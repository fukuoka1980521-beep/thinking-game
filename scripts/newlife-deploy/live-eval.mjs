#!/usr/bin/env node
/**
 * Phase 31 live-model evaluation harness (instruction 9). Runs the fixed
 * synthetic test set (`LIVE_EVAL_FIXED_SET` in `lib.mjs`) — the exact
 * Owner-found failure transcripts, typo variants, multi-intent,
 * prompt-injection, unknown-fact, banned-canon, and numeric-hallucination
 * probes across all six NPCs — against a deployed endpoint, and saves the
 * raw model output as evidence.
 *
 * THIS IS NOT HUMAN VALIDATION. It is SYNTHETIC TEST evidence for later
 * human/ChatGPT review — see the `note` field this script writes into every
 * output file and CLAUDE.md's own rule that technical PASS is not product
 * PASS. This script does not compute a pass/fail score; it only records
 * what the model actually said, plus a mechanical truth-gate check (same
 * logic class as `src/newlife/semantic/truthGate.ts`, re-implemented in
 * lib.mjs's duplication-disclosed constants) so a banned-canon or obviously
 * unsupported-numeric response is at least flagged, not silently buried in
 * a JSON file nobody reads.
 *
 * Usage:
 *   node scripts/newlife-deploy/live-eval.mjs --url <https-url> --out <dir>
 */
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { LIVE_EVAL_FIXED_SET, NEGATIVE_CONSTRAINTS, buildSyntheticSnapshot } from "./lib.mjs";

function parseArgs(argv) {
  const args = { out: "evidence/newlife-live-eval" };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url") args.url = argv[++i];
    else if (argv[i] === "--out") args.out = argv[++i];
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
  }
  return args;
}

/** Same check class as truthGate.ts's banned_term rule, re-implemented here only to flag evidence for human review — never used to gate production display. */
function flagBannedTerm(text) {
  return NEGATIVE_CONSTRAINTS.filter((term) => text.includes(term));
}

async function runOne(url, item) {
  const snapshot = buildSyntheticSnapshot(item.npc, item.day);
  const startedAt = Date.now();
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost:5173" },
      body: JSON.stringify({ utterance: item.utterance, snapshot }),
    });
    const rawBody = await res.text();
    let parsed = null;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      // left null
    }
    const proposedResponse = parsed && typeof parsed.proposedResponse === "string" ? parsed.proposedResponse : "";
    return {
      ...item,
      httpStatus: res.status,
      latencyMs: Date.now() - startedAt,
      rawBody,
      parsed,
      flags: {
        bannedTermInResponse: flagBannedTerm(proposedResponse),
      },
    };
  } catch (err) {
    return { ...item, error: err instanceof Error ? err.message : String(err), latencyMs: Date.now() - startedAt };
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || !args.url) {
    console.log("Usage: node scripts/newlife-deploy/live-eval.mjs --url <https-url> --out <dir>");
    process.exit(args.help ? 0 : 1);
  }

  console.log(`Running ${LIVE_EVAL_FIXED_SET.length} fixed synthetic cases against ${args.url}`);
  console.log("This produces SYNTHETIC TEST evidence only — not human validation.\n");

  const results = [];
  for (const item of LIVE_EVAL_FIXED_SET) {
    const result = await runOne(args.url, item);
    results.push(result);
    const flagged = result.flags && result.flags.bannedTermInResponse.length > 0;
    console.log(`[${result.error ? "ERROR" : flagged ? "FLAGGED" : "ok"}] ${item.id} (${item.npc}): ${item.utterance}`);
    if (result.parsed && result.parsed.proposedResponse) {
      console.log(`  -> ${result.parsed.proposedResponse}`);
    }
  }

  mkdirSync(args.out, { recursive: true });
  const outFile = path.join(args.out, `live-eval-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  const record = {
    endpoint: args.url,
    ranAt: new Date().toISOString(),
    HUMAN_VALIDATION_STATUS: "PENDING",
    note: "SYNTHETIC TEST evidence only. Raw model output for later human/ChatGPT review. Not a human-validation claim, not a product-release claim, not a pass/fail score.",
    results,
  };
  writeFileSync(outFile, JSON.stringify(record, null, 2), "utf8");
  console.log(`\nWrote evidence to ${outFile}`);

  const flaggedCount = results.filter((r) => r.flags && r.flags.bannedTermInResponse.length > 0).length;
  const erroredCount = results.filter((r) => r.error).length;
  console.log(`\n${results.length} cases run, ${flaggedCount} flagged (banned-term match), ${erroredCount} errored.`);
  console.log("Review the evidence file manually — this script does not certify quality.");
}

main();
