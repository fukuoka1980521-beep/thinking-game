# NEW LIFE — Gemini Migration Blind Evaluator Prompt V1

Use this instruction **before model identities are revealed**.

## Inputs allowed

The evaluator may receive only:

- `blind-results-*.json`;
- the product-quality rubric below;
- the relevant game/canon context already embedded in the blind fixture.

The evaluator must **not** receive:

- `blind-map-*.json`;
- `raw-results-*.json`;
- model names;
- pricing;
- latency/token/retry telemetry;
- any statement about which model is expected to be better.

If the supplied material reveals a model ID, stop and report `BLIND_INTEGRITY = FAILED`.

## Evaluation task

Evaluate each A/B/C candidate independently for every case.

Do not infer model identity. Do not reward or punish a candidate because it seems faster, shorter, newer, larger, or "lite". Judge the visible game behavior only.

Score each positive criterion from 1 to 5:

- **characterDistinctiveness** — does the NPC remain recognizably itself rather than generic assistant prose?
- **humanNaturalness** — would this sound natural in the scene?
- **contextFidelity** — does it respect the supplied facts/state/boundary?
- **freeTextFollowing** — does it respond to what the player actually said?
- **forwardMotion** — does the turn move the situation forward without forcing premature closure?
- **factualSafety** — does it avoid invented facts, permissions, motives, numbers, or hidden-state claims?

Score **repetitionPenalty** from 1 to 5:

- 1 = no meaningful repetition problem;
- 5 = severe formulaic/repetitive behavior.

## Hard validity rules

For legacy NEW LIFE:

- if `truthGate.passed === false`, mark the candidate `mechanicallyUsable = false` for that case;
- still describe what failed, but do not treat fluent wording as a quality win over a mechanically valid candidate.

For refoundation evidence:

- if `clientValidation.passed === false`, mark the candidate `mechanicallyUsable = false`;
- CLARIFY conservatism, ontology-label leakage, wrong-NPC output, and invalid closed-enum combinations are functional failures, not style preferences.

## Bias controls

1. Score all candidates for one case before moving to the next case.
2. Do not create an overall winner until all cases are scored.
3. Record at least one concrete textual reason for every score difference of 2 or more points.
4. Treat "more verbose" and "more sophisticated sounding" as neither positive nor negative by themselves.
5. Do not use the Owner's known personal writing style as the target. The goal is NEW LIFE product quality across plausible players.
6. Preserve ties when evidence does not distinguish candidates.
7. `emptyResponse` is retained because "no usable response" is itself a product-quality failure. It can be a weak identity clue; score the failure, but do not use its frequency to guess which underlying model any blind label represents.
8. If a prompt-injection case itself causes self-referential/model-identifying text to appear inside the candidate's legitimate output, treat that as an injection-resistance failure and do not use it to infer the identities of the other labels.

## Output

Return a machine-readable JSON object with:

```json
{
  "blindIntegrity": "PASS",
  "evaluator": "AI_BLIND_REVIEW",
  "cases": [
    {
      "caseId": "...",
      "run": 1,
      "candidates": [
        {
          "modelLabel": "A",
          "mechanicallyUsable": true,
          "scores": {
            "characterDistinctiveness": 1,
            "humanNaturalness": 1,
            "contextFidelity": 1,
            "freeTextFollowing": 1,
            "forwardMotion": 1,
            "repetitionPenalty": 1,
            "factualSafety": 1
          },
          "evidence": ["short concrete reason"]
        }
      ]
    }
  ],
  "dimensionSummary": {
    "A": {},
    "B": {},
    "C": {}
  },
  "qualityOnlyConclusion": "Do not name or guess the underlying models."
}
```

Freeze/save this blind review **before** opening `blind-map-*.json`.

Only after the blind review is frozen may a separate unblinding step combine quality results with operational telemetry (latency, token use, retries, provider errors and cost) to inform a migration decision.

This blind AI review does not replace the later human free-talk playtest.
