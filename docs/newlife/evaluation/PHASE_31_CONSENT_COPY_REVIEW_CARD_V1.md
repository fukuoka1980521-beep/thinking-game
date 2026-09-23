# PHASE 31 — NEW LIFE AI-dialogue consent copy: Owner review card

SOURCE FACT: this is the exact, current copy in
`src/newlife/semantic/NewLifeAiConsentPrompt.tsx`, only ever rendered once
`NEWLIFE_DIALOGUE_ENDPOINT_URL` is non-empty (shipped empty — this screen is
not live for any player today). This card does not claim Owner approval of
either the current copy or the proposed tightening below; it only presents
the one decision needed.

## Exact copy currently shipped (not live yet)

> この会話では、あなたが自由入力で話しかけた内容を外部のAIサービスへ送信し、NPCの返答を生成します。
>
> 個人情報や、他人に知られたくない内容は書かないでください。
>
> 送信されるのは、今の発言内容と、NEW LIFEの中で今わかっている範囲の物語上の事実だけです。
>
> 同意しない場合も、これまでと同じ会話ルールでゲームを続けられます。
>
> [同意して続ける]　[AIなしで続ける]

## Factual-accuracy check against `docs/DATA_BOUNDARY.md` and the actual payload (`httpInterpreter.ts`)

INFERENCE (comparing the copy's own claims to `src/newlife/semantic/httpInterpreter.ts`'s actual `fetch` body and `docs/DATA_BOUNDARY.md`'s NEW LIFE section):

| Copy's claim | Actual payload | Match? |
|---|---|---|
| "外部のAIサービスへ送信" (sent to an external AI service) | `functions/newlife-dialogue/` → Vertex AI Gemini | Accurate |
| "今の発言内容" (this utterance) | `utterance` field, capped 200 chars | Accurate |
| "物語上の事実だけ" (only story facts) | `snapshot`: `npc` id, `day` number, `known` fact strings, `unknown` category list, `negativeConstraints` list | **Imprecise, not misleading** — see finding below |
| "同意しない場合も…続けられます" (declining still lets you continue) | `coordinator.ts` falls back to the deterministic router on decline | Accurate |

### Finding (non-blocking, presented for wording decision only)

"物語上の事実だけ" ("only story facts") most naturally reads as "only the
`known` fact text." The actual payload also includes the NPC id you're
talking to, the current day number (1–30), the list of *still-unknown* fact
categories, and the fixed `negativeConstraints` deny-list — none of which
are sensitive (all four are small, non-identifying, and already visible
in-game to the player themselves), but a strict reading of the sentence
could be called imprecise rather than fully accurate. This is not a
legal/privacy problem — nothing sent is more sensitive than what the copy
already implies — it is a **wording precision** question.

**Proposed tightened alternative (not applied — Owner's choice):**

> 送信されるのは、今の発言内容と、話している相手（NPC）や現在の日数、NEW LIFEの中で今わかっている範囲の物語上の事実だけです。プレイヤーの行動履歴や他のNPCの情報は送信されません。

(Adds "who you're talking to and the current day," and makes the existing
data-minimization guarantee — no action history, no other NPC's data — into
an explicit positive statement instead of only being true by omission.)

## The one human judgment needed

**Approve the current copy as-is, or approve the tightened alternative above, or provide different wording.** No other action is required from this
card. Whichever is chosen (or neither, if left as a future decision), this
remains PENDING until an Owner explicitly picks one — this Run does not and
cannot make that choice.

This finding does not block anything: the endpoint is empty, so this screen
cannot be shown to any player regardless of wording, until both the deploy
prerequisite (`docs/newlife/evaluation/PHASE_31_DEPLOYMENT_READINESS_AND_OWNER_MINIMAL_ACTION_V1.md`)
and this wording decision are resolved.
