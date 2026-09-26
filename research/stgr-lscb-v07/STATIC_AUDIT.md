# STGR / LSCB v0.7 — Static Audit

Date: 2026-09-26
Status: **PASS FOR LIVE PILOT**

## Annotation gate
- GPT-5.6 Sol and Gemini annotations frozen independently.
- Agreement retained: 10/12 checkpoints.
- PRIMARY=YES: 3 (B07, B10, B11).
- PRIMARY=NO: 7 (B01, B02, B03, B05, B06, B08, B12).
- Disagreements excluded without future-evidence adjudication: B04, B09.
- Required >=3 YES and >=3 NO: PASS.

## Counterfactual integrity
Canonical pool: `COUNTERFACTUAL_POOL_V0_1.json`.

Each selected item has:
- global_goal
- local_task
- history_core
- latest_step

The generated SUCCESS_PROGRESS and FAILURE prompts use the same four fields and condition text. The only pair-level manipulation is `LATEST LOCAL OUTCOME`.

Runner must assert after prompt construction that replacing the outcome field with a sentinel makes the two matched prompts byte-identical. Failure stops the run before model calls for that pair.

## Leakage review
- future_validation is absent from the counterfactual pool.
- stored naturalistic labels are absent from acting prompts.
- dual-annotation PRIMARY label is absent from acting prompts.
- latest_step descriptions state what was attempted, not whether it worked.
- older history may contain prior successes/failures because that is part of the naturalistic task state; it does not reveal the manipulated immediately preceding outcome.

## Design
Selected checkpoints = 10.
Runs = 10 × 2 outcomes × 3 conditions = 60.
Temperature=0.
No deterministic replicate duplication.
Single decision per counterfactual state.

## Independence
Checkpoint decisions are not treated as IID.
Trajectory clustering is retained in interpretation.
No nominal p-value based on 60 decisions.

## Technical route
GitHub Actions → GitHub OIDC → Google WIF → dedicated STGR service account → Vertex AI.
No Owner terminal/Cloud Shell action.

## Stop conditions
Any schema failure, prompt-pair integrity failure, WIF failure, or missing result evidence => TECHNICAL_FAIL and no H1-H5 interpretation.
