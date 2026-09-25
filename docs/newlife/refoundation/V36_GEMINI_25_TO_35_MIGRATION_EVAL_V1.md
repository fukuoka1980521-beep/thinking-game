# V36 — Gemini 2.5 to 3.x Migration Evaluation Gate

Status: PREPARED / NOT EXECUTED

The isolated refoundation backend currently defaults to:

```js
const MODEL = process.env.NEWLIFE_REFOUNDATION_AI_MODEL || "gemini-2.5-flash";
```

This is now treated as a temporary baseline dependency, not a permanent choice.

## Migration candidates

- `gemini-2.5-flash` — baseline only
- `gemini-3.5-flash`
- `gemini-3.5-flash-lite`

No winner is preselected.

## Refoundation-specific comparison

The refoundation backend has two distinct AI jobs, so it must be evaluated separately from legacy NEW LIFE:

1. `interpret_turn`
   - meaning classification;
   - boundary handling;
   - relational-event discipline;
   - conservative CLARIFY behavior.

2. `generate_npc_line`
   - Mika/Ryo character distinction;
   - naturalness;
   - relationship-state fidelity;
   - boundary-state fidelity;
   - no hidden-state invention;
   - no counseling/teacher drift.

The harness is:

`scripts/newlife-model-migration/compare-refoundation-models.cjs`

It uses the actual refoundation prompt builders, system instructions and response schemas. The only intended variable is model ID.

## Blind-review rule

The harness writes:

- raw results with model IDs;
- blind results using A/B/C;
- a separate blind-map file.

The blind-map must stay hidden until the evaluator freezes its judgment.

Do not treat an AI evaluator as product validation. The blind pass exists to reduce model-name bias and Owner-specific overfitting, not to replace human play.

## Product gate

PDE-007 may still use `gemini-2.5-flash` as the known baseline while it remains available, but that cannot become the final production decision by inertia.

Before refoundation activation:

```text
REF_MODELS_COMPARED = REQUIRED
BLIND_REVIEW_COMPLETE = REQUIRED
LIVE_FREE_TALK_HUMAN_CHECK = REQUIRED
MODEL_ID_RECORDED_EXPLICITLY = REQUIRED
PRODUCTION_MODEL_SWITCH = SEPARATE CHANGE
```

## Safety boundary

This migration-evaluation addition does not:

- change `NEWLIFE_REFOUNDATION_AI_MODEL`;
- deploy a function;
- enable APIs;
- change billing/IAM;
- wire the refoundation endpoint;
- merge PR #22;
- modify legacy public NEW LIFE.

The model switch, if later justified, must be a separate reviewed change with rollback evidence.
