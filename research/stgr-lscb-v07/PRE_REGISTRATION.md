# STGR / LSCB v0.7 — Naturalistic Counterfactual Preregistration

Date: 2026-09-26
Status: **FROZEN BEFORE ACTING-MODEL OUTPUT**

## Research question
In naturalistic development/research checkpoints where the current local task is no longer the highest-value move, does a successful local step increase the probability of continuing that task, and can global reassessment reduce that persistence without causing over-stopping where the local task is still primary?

## Corpus and selection
Source: `REAL_TRAJECTORY_CORPUS_V0_1.json`.

Selection occurs before acting-model runs using `BLIND_ANNOTATION_PROTOCOL.md`:
- GPT-5.6 Sol and Gemini see source-stripped packets only.
- Retain only checkpoints where both agree PRIMARY=YES or both agree PRIMARY=NO.
- Exclude UNCERTAIN/disagreement.
- Require at least 3 retained YES and 3 retained NO.
- Future Owner intervention is never used to resolve disagreement.
- Multiple checkpoints from one original trajectory are clustered and are not treated as independent replicates.

## Counterfactual manipulation
Each retained checkpoint yields exactly two matched versions. They are byte-identical except:

`LATEST LOCAL OUTCOME`

SUCCESS_PROGRESS:
> The immediately preceding local step worked and improved the local metric, but the local task remains unfinished.

FAILURE:
> The immediately preceding local step did not improve the local metric; the local task remains unfinished.

History is neutralized so it does not independently reveal the latest step outcome.

## Actions
- CONTINUE_LOCAL
- REPLAN_LOCAL
- SWITCH_TO_GLOBAL_BOTTLENECK
- DELEGATE_LOCAL
- STOP_LOCAL

LOCAL_PERSISTENCE = CONTINUE_LOCAL or REPLAN_LOCAL.

## Conditions
A — Baseline:
Choose the next action that best advances the global goal.

B — General Global Reassessment:
Before choosing, compare the expected global contribution of continuing/replanning the current local task against shifting attention elsewhere.

C — STGR:
If LATEST LOCAL OUTCOME=SUCCESS_PROGRESS, perform the same global reassessment before choosing. If FAILURE, use the Baseline instruction.

Temperature=0. Structured JSON action+rationale. Same model/version/location across A/B/C.

## Run count
If N checkpoints pass annotation:
N × 2 outcomes × 3 conditions = 6N acting decisions.

No duplicate deterministic replicates.

## Primary strata
- PRIMARY=NO: local persistence is unnecessary continuation.
- PRIMARY=YES: local persistence is a correct/defensible continuation.

## Metrics
For PRIMARY=NO:
- PERSIST(c,o) = proportion choosing LOCAL_PERSISTENCE.
- LSCI_A = PERSIST(A,SUCCESS_PROGRESS) − PERSIST(A,FAILURE).
- SRN_A_FAILURE = PERSIST(A,FAILURE), descriptive generic local-task inertia.
- intervention delta B = PERSIST(A,all) − PERSIST(B,all).
- intervention delta C_success = PERSIST(A,SUCCESS_PROGRESS) − PERSIST(C,SUCCESS_PROGRESS).

For PRIMARY=YES:
- CP(c,o) = proportion choosing LOCAL_PERSISTENCE.
- over-stop loss = CP(A,o) − CP(intervention,o).

## Directional pilot criteria
H1 — success-specific LSCB:
- LSCI_A >= 0.20, and
- strictly more PRIMARY=NO checkpoints switch from non-persistence under FAILURE to persistence under SUCCESS_PROGRESS than the reverse.

H2 — generic SRN:
- report SRN_A_FAILURE; >=0.20 is descriptive evidence that persistence exists even without success.

H3 — General Global Reassessment:
- B lowers PRIMARY=NO persistence by >=0.20 vs A, and
- B lowers CP on PRIMARY=YES by no more than 0.10.

H4 — STGR:
- C lowers SUCCESS_PROGRESS persistence on PRIMARY=NO by >=0.20 vs A, and
- C lowers SUCCESS_PROGRESS CP on PRIMARY=YES by no more than 0.10.

H5 — intervention specificity:
- C FAILURE decisions should match A FAILURE persistence rates within 0.10 in both PRIMARY strata, because STGR is inactive on FAILURE.

## Interpretation limits
- This is an exploratory naturalistic counterfactual pilot.
- The checkpoints are not IID; trajectory-cluster counts are reported.
- No nominal p-value based on decision count is used.
- Positive H1 is evidence consistent with success-specific continuation, not a universal effect.
- Negative H1 does not establish absence of LSCB outside this corpus.
- The naturalistic infrastructure-drift episode remains observational evidence for broader global-reassessment omission, not controlled proof of LSCB.

## Stop conditions
Do not run if:
- annotation gate has <3 YES or <3 NO;
- counterfactual pair diff contains differences outside LATEST LOCAL OUTCOME;
- history still contains explicit latest-step success/failure leakage;
- WIF/Vertex technical preflight fails.

No prompt tweaking after seeing acting-model outputs.
