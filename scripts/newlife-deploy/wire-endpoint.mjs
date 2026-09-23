#!/usr/bin/env node
/**
 * Phase 31 production-wiring helper (instruction 6). Given a deployed
 * `functions/newlife-dialogue/` URL, safely updates
 * `src/newlife/semantic/config.ts`'s `NEWLIFE_DIALOGUE_ENDPOINT_URL`,
 * shows the exact diff, and (only with --apply) runs root
 * typecheck/tests/build before leaving the change staged in the working
 * tree. Never commits or pushes unless the separate --commit flag is also
 * given, and never pushes at all (this repo's own CLAUDE.md rule: no direct
 * push to `master`, use a Claude branch / PR).
 *
 * Usage:
 *   node scripts/newlife-deploy/wire-endpoint.mjs --url <https-url>          # dry-run: print diff only
 *   node scripts/newlife-deploy/wire-endpoint.mjs --url <https-url> --apply  # write + verify
 *   node scripts/newlife-deploy/wire-endpoint.mjs --url "" --apply           # rollback to empty (see rollback.ps1)
 *   node scripts/newlife-deploy/wire-endpoint.mjs --url <https-url> --apply --commit  # + local git commit (no push)
 */
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { CONFIG_FILE_RELATIVE_PATH, extractCurrentEndpointUrl, buildUpdatedConfigContent, diffLines } from "./lib.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");

function parseArgs(argv) {
  const args = { apply: false, commit: false, url: undefined };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === "--url") args.url = argv[++i];
    else if (argv[i] === "--apply") args.apply = true;
    else if (argv[i] === "--commit") args.commit = true;
    else if (argv[i] === "--help" || argv[i] === "-h") args.help = true;
  }
  return args;
}

function run(cmd, cmdArgs) {
  console.log(`\n$ ${cmd} ${cmdArgs.join(" ")}`);
  // shell: true only for "npm" on win32 -- there it's npm.cmd, a batch file, and Node's own
  // safety fix (CVE-2024-27980) makes execFileSync reject spawning .cmd/.bat directly (EINVAL)
  // unless shell: true is set; plain ENOENT before that fix, same root cause either way. Scoped to
  // just "npm" (not "git", a real .exe that never needed this) since shell: true concatenates args
  // rather than escaping them -- every npm call site here passes only fixed, safe literals
  // ("run"/"typecheck"/"test"/"build"), never interpolated/untrusted input.
  const useShell = cmd === "npm" && process.platform === "win32";
  execFileSync(cmd, cmdArgs, { cwd: REPO_ROOT, stdio: "inherit", shell: useShell });
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args.url === undefined) {
    console.log([
      "Phase 31 production-wiring helper.",
      "",
      "  --url <https-url>   required. Use \"\" (empty string) to roll back to deterministic-only.",
      "  --apply             write the file (default: dry-run diff only, no write).",
      "  --commit            after a successful --apply + verify, `git add` + `git commit` locally. Never pushes.",
      "",
      "Never deploys anything, never touches GCP, never stores a secret. See docs/newlife/evaluation/",
      "PHASE_31_DEPLOYMENT_READINESS_AND_OWNER_MINIMAL_ACTION_V1.md for the full sequence this fits into.",
    ].join("\n"));
    process.exit(args.help ? 0 : 1);
  }

  const configPath = path.join(REPO_ROOT, CONFIG_FILE_RELATIVE_PATH);
  const currentContent = readFileSync(configPath, "utf8");
  const currentUrl = extractCurrentEndpointUrl(currentContent);
  const newContent = buildUpdatedConfigContent(currentContent, args.url);

  console.log(`Current NEWLIFE_DIALOGUE_ENDPOINT_URL: ${currentUrl || "(empty — deterministic-only)"}`);
  console.log(`Requested NEWLIFE_DIALOGUE_ENDPOINT_URL: ${args.url || "(empty — deterministic-only)"}`);

  if (currentUrl === args.url) {
    console.log("\nNo change needed — requested URL already matches the current value. Nothing to do.");
    return;
  }

  const diff = diffLines(currentContent, newContent);
  console.log(`\n${CONFIG_FILE_RELATIVE_PATH} diff:`);
  for (const line of diff) console.log(line);

  if (!args.apply) {
    console.log("\nDry-run only (no --apply given). Nothing was written.");
    return;
  }

  writeFileSync(configPath, newContent, "utf8");
  console.log(`\nWrote ${CONFIG_FILE_RELATIVE_PATH}.`);

  console.log("\nRunning verification (typecheck, tests, build)...");
  run("npm", ["run", "typecheck"]);
  run("npm", ["test"]);
  run("npm", ["run", "build"]);
  console.log("\nVerification passed.");

  if (args.commit) {
    const label = args.url ? "wire NEW LIFE dialogue endpoint" : "roll back NEW LIFE dialogue endpoint to empty";
    run("git", ["add", CONFIG_FILE_RELATIVE_PATH]);
    run("git", ["commit", "-m", `chore(newlife): ${label}\n\nNot pushed by this script. Review and push/PR manually.`]);
    console.log("\nCommitted locally. This script never pushes — push or open a PR manually when ready.");
  } else {
    console.log(`\n${CONFIG_FILE_RELATIVE_PATH} is modified in the working tree but not committed. Re-run with --commit to commit locally (still no push), or commit/PR manually.`);
  }
}

main();
