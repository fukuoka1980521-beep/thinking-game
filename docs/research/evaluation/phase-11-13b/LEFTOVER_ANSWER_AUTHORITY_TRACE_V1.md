# Leftover Answer Authority Trace V1 — PHASE 11.13B

Traced against real code and real test output (directive Section 4), not inferred from names.

## Exact current event order

`askQuestion(contract, playerUtterance)` in `NewlifePlayable11App.tsx`:

```ts
function askQuestion(contract, playerUtterance) {
  const { state: next, trace } = resolveAction(state, contract);   // (1)
  const packet = buildYoheiPacket(next, playerUtterance, contract.playerIntent); // (2)
  const line = languageAdapter(packet);                             // (3)
  setState(next);
  setTraces((prev) => [...prev, trace]);
  pushLog([], line);
}
```

1. **`resolveAction`** (unmodified `engine.ts`) runs FIRST, entirely before the language adapter
   is ever invoked. Inside it, in order: eligibility check → `contract.stateDelta(state)` →
   `admitMaterials` (State Admission) → `contract.actorExperienceWrite(state)` → experienceLog
   append. For `ASK_ABOUT_LEFTOVER_STOCK`, this now produces BOTH: the ask-only experience entry
   AND (PHASE 11.13B's fix) the `leftover_question_answered` material.
2. `buildYoheiPacket` builds a packet from the ALREADY-FINALIZED `next` state — it cannot affect
   what was just admitted.
3. `languageAdapter(packet)` produces a display string. **This function is never given write
   access to any state** (confirmed by its type signature, `LanguageAdapter = (packet) =>
   string`, unchanged since PHASE 11.11) and its return value is discarded except for
   `pushLog`'s display purposes.

**When is the ExperienceWrite created?** Before language output, unconditionally, inside step (1)
— confirmed by reading `engine.ts`'s `resolveAction`: `experienceDelta = contract.
actorExperienceWrite(state); experienceLog = [...experienceLog, ...experienceDelta];` runs in the
`else` branch that also runs `stateDelta`/`admitMaterials`, all before the function returns — i.e.
strictly before `askQuestion`'s step (2)/(3) even begin.

**What authoritative evidence currently proves Yohei confirmed IS_FESTIVAL_LEFTOVER?** The
`leftover_question_answered` material's own `concreteContent` ("洋平が、この手ぬぐいは祭りの残りだ
と答えた"), admitted via the same `stateDelta` → `admitMaterials` → State Admission pipeline every
other authoritative fact in this scene uses — NOT the ask-only experience entry, and NOT the
display string.

## Real leftover sequence (directive Section 8), all 4 states proven mechanically

| State | prerequisite | questionAsked | answerReceived | targetFactKnown |
|---|---|---|---|---|
| 0 — before reveal | false | false | false | false |
| 1 — after physical reveal | true | false | false | false |
| 2 — after player asks (real contract, single atomic dispatch) | true | true | true | true |

**Note on State 2's atomicity:** in the real, single-path production contract, `questionAsked`,
`answerReceived`, and `targetFactKnown` all become true in the SAME `resolveAction` call, because
this scene's only authored answer is a confirming one — there is no real intermediate "asked, not
yet answered" state reachable through the actual UI. Directive Section 14's requirement to prove
`questionAsked=true` while `targetFactKnown` remains false is satisfied via deterministic TEST-ONLY
contract variants (not real product content) — see `ANSWER_VARIANT_FALSIFICATION_V1.md` — which
dispatch through the same real, unmodified engine but author a different (non-confirming, or
absent) `stateDelta`, proving the EVALUATOR's logic is genuinely capable of separating these
states, not merely coincidentally consistent for this one scene.

| Synthetic state (test-only contract, real engine dispatch) | questionAsked | answerReceived | targetFactKnown |
|---|---|---|---|
| No response produced (`stateDelta: () => []`) | true | false | false |
| Answer received, does not confirm ("洋平にもよく分からないと言われた") | true | true | false |
| Answer received, confirms (real production contract) | true | true | true |
