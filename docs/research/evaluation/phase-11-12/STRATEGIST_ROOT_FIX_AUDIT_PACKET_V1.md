# Strategist Root-Fix Audit Packet V1 — PHASE 11.12

Evidence-packaging document for independent Strategist review of the root-cause containment work,
per directive Section 29 ("Do NOT return to PHASE 11.11 product repair until Strategist confirms:
ROOT CONTAMINATION PATH UNDERSTOOD / SYSTEMIC BOUNDARY IMPLEMENTED / ADVERSARIAL REINTRODUCTION
BLOCKED"). No self-judgment language ("this fully solves it") is a substitute for the Strategist's
own read of the linked documents below.

## Root-cause verdict (directive Section 28)

**PRIMARY CONTAMINATION PATH:** `ActionContractV2` (the shared action type used by both tests and
the product UI) has no field expressing WHO an action is for. A UI component that composes "every
action a module exports" into a button list therefore cannot mechanically distinguish a
QA-authored regression fixture from a player-facing product action — both are the same shape. This
produced item 1 (`ASK_WEATHER_SCENE`) directly and item 4 (the 7-button flat composition) as its
scene-wide expression.

**SECONDARY PATHS:**
- No build/mode boundary (`import.meta.env.DEV`) existed anywhere in this repository before this
  phase, so the one leaked debug disclosure sentence (item 2) had no compile-time removal mechanism
  available, only a manual per-instance React-state-toggle convention that was correctly applied to
  the debug panel but not to this one inline sentence.
- Test O's own state-boolean eligibility check (`tests/newlifePlayableScene11.test.ts` lines
  193-211) was mistaken, in practice, for a complete definition of "genuinely new possibility" —
  nothing ever checked whether the newly-eligible action's CONTENT was actually new to the player
  (item 3).

**WHY A LOCAL FIX WOULD RECUR:** editing `NewlifePlayable11App.tsx` to remove the weather button and
reword the leftover-stock follow-up would fix these two specific instances but leave the structural
gap (no ownership concept, no build boundary, no content-novelty check) fully intact — the next
scene authored under time pressure to satisfy a regression test would reproduce the identical
pattern, just with different Japanese text. This is why this phase built reusable, evidence-tested
infrastructure (`productSurface.ts`, `testProbes.ts`, `causalUnlockInvariant.ts`,
`dependencyDirection.ts`, `devOnlyDisclosure.ts`) rather than editing the scene.

**WHICH EXTERNAL PATTERNS WERE USEFUL:** Cockburn's driving-adapter symmetry (test and UI both drive
the same underlying operations without the core knowing which); Vite's compile-time
`import.meta.env.DEV` replacement (exact fit, already available, zero new dependency); Meszaros/
Fowler's Test Double vocabulary (useful as a naming lens — it revealed that `ASK_WEATHER_SCENE` was
not a Test Double for anything, it WAS the production surface, which is precisely the defect).

**WHICH WERE REJECTED:** Unreal's Shipping-build-configuration system (native multi-target
compilation pipeline with no equivalent surface area in this Vite/React app — only the underlying
principle, already available via Vite, was kept); full literal Hexagonal Architecture with explicit
Port interfaces and DI (disproportionate ceremony for one research-prototype scene). Full detail
with sources: `EXTERNAL_ARCHITECTURE_RESEARCH_V1.md`.

**SYSTEMIC FIX:** 4 independent, narrowly-scoped gates, each proven against real evidence (not
synthetic-only): (1) `composeProductSurface` ownership gate — correctly rejects the real
`ASK_WEATHER_SCENE`; (2) `dependencyDirection` scanner — correctly detects a synthetic UI import of
`testProbes`, currently clean on the real tree; (3) `import.meta.env.DEV` build/mode boundary —
verified absent from a real `npm run build` output and present in a real dev-mode build; (4)
`validateCausalUnlockClaim` counterfactual invariant — correctly fails the REAL historical
leftover-stock unlock claim, correctly passes a legitimate synthetic one. Full account:
`SYSTEMIC_GATES_IMPLEMENTATION_V1.md`.

**REMAINING UNCONTROLLED PATHS**, stated plainly, not hidden:
1. `composeProductSurface` is not yet wired into `NewlifePlayable11App.tsx`'s actual render path —
   the live scene remains contaminated (all 5 items) until a future, Strategist-gated repair phase
   does that wiring. This packet proves the gate WOULD catch the defect, not that the defect is
   currently fixed in the running scene.
2. No route-lifecycle tagging exists across this repository's ~28 isolated `?newlife*=1` routes —
   "isolated route exists" still does not mechanically distinguish research-harness routes from
   product-candidate routes anywhere except this one scene's new ownership registry. Proposed, not
   implemented (scope discipline — directive Section 25).
3. The causal-unlock invariant depends on human-authored fact tags; it does not scale automatically
   to a larger number of captured lines or free-generated dialogue without either more manual
   tagging effort or a new (unbuilt) extraction mechanism.
4. The dependency-direction scanner encodes exactly one rule (product UI must not import
   `testProbes`); it is not a general cross-repository research/product import-direction enforcement.

## Adversarial reintroduction — blocked/confined per class

See `ADVERSARIAL_REINTRODUCTION_TEST_V1.md` for full detail. Summary: all 5 required reintroduction
attempts (test probe as button, debug text on primary scene, test-only action imported into product
UI, mislabeled fixture fact, fake postcondition-only unlock) were executed as real, passing Vitest
tests against real or realistically-synthetic inputs — none were merely asserted from description.

## Test / build totals

`npx tsc --noEmit`: clean. `npx vitest run`: **97/97 files, 1452/1452 tests** (25 pre-existing PHASE
11.11 tests unmodified and green; 17 new tests, all green). `npm run build`: clean; production
bundle mechanically confirmed free of the dev-only disclosure marker; a real development-mode build
mechanically confirmed to contain it. No temporary artifacts left in the working tree. Full detail:
`SYSTEMIC_GATES_IMPLEMENTATION_V1.md`, `CODE_SELF_AUDIT_V1.md`.

## Whether product repair may safely resume

**Not yet, per directive Section 29's own gate — this packet exists to let the Strategist make that
call, not to make it.** What this phase demonstrates: the four gates exist, are wired to real repo
evidence (not hypothetical placeholders), and mechanically catch every one of the 5 demonstrated
contamination items when pointed at them. What it does NOT yet demonstrate: the live PHASE 11.11
scene rendering through those gates — that wiring is exactly what a future, Strategist-confirmed
product-repair phase should do (remove/relocate `ASK_WEATHER_SCENE` per its QA classification, gate
the disclosure sentence behind `import.meta.env.DEV`, and either replace or additionally justify the
leftover-stock follow-up per the causal-unlock invariant's finding).

## Full document index — this phase

- `EXTERNAL_ARCHITECTURE_RESEARCH_V1.md` — 5 sources, verified this Run, adopt/adapt/reject per source.
- `RESEARCH_PRODUCT_CONTAMINATION_TRACE_V1.md` — 6-item provenance trace, repository evidence only.
- `CONTAMINATION_TAXONOMY_V1.md` — categories with evidence; 2 candidate categories explicitly rejected as unevidenced.
- `PRODUCT_TEST_BOUNDARY_ARCHITECTURE_V1.md` — architecture design, principle validated against repo reality.
- `PRODUCT_SURFACE_POLICY_V1.md` — the going-forward rule for any future scene composition.
- `CAUSALITY_COUNTERFACTUAL_INVARIANT_V1.md` — the falsification-question invariant, applied to real and synthetic data.
- `SYSTEMIC_GATES_IMPLEMENTATION_V1.md` — what was built, what was deliberately not built, and why; full build-verification evidence including one corrected mistake.
- `ADVERSARIAL_REINTRODUCTION_TEST_V1.md` — 5/5 required reintroduction attempts, exact results.
- `CODE_SELF_AUDIT_V1.md` — scope discipline, verification totals, stated limitations.
- `STRATEGIST_ROOT_FIX_AUDIT_PACKET_V1.md` — this document.
