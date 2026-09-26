# NEW LIFE — V42 Human Accepted Baseline

Date: 2026-09-26
Status: OWNER HUMAN PLAYTEST PASS / BASELINE FREEZE

## Accepted evidence

The community-theater conflict reached a complete playable loop in live human testing:

1. conflict is understandable immediately;
2. player can ask either NPC direct factual questions;
3. NPCs preserve distinct practical interests;
4. player can propose a concrete rewrite;
5. a real script artifact exists rather than only a conversational claim;
6. Mika can inspect the concrete revision and accept/reject it;
7. Ryo can move from objection to rehearsal execution;
8. the scene can close naturally after agreement;
9. bounded NPC-to-NPC continuation works when player authority is no longer needed.

Owner verdict after live V42 transcript: **「問題ないのでは」**.

## Accepted reference state

- isolated backend contract: V42
- refoundation candidate SHA: `16ce1df5dc22195de5fd06e742e85faed0ac8ed8`
- live deploy run: `36220180218` — PASS
- human-test page master SHA: `38d9504bcc239e24cba33d675c5c2e29d5da823b`
- legacy NEW LIFE unchanged
- model default unchanged
- PR #22 remains draft/open/unmerged

## Freeze rule

Do not keep tuning the theater scene merely to improve wording. Minor register issues such as Mika saying 「尽力します」 are not blockers.

The theater case is now the regression baseline. Any next change must preserve:
- raw free-text understanding;
- no phrase-specific reply table;
- character-specific boundaries;
- real artifact/state when a physical/document object matters;
- bounded NPC↔NPC continuation;
- no fabricated player speech;
- natural scene closure.

## Next proof required

One passing scene can still be overfit. The next test must use **different people, different stakes, different facts, and a different kind of artifact**.

Selected transfer case: **Hina / Yohei — small baked-goods trial sale** from the Phase 25–26 canonical design.

Reason:
- operational/customer promise rather than consent/privacy;
- concrete quantities (30 total / 12 reserved / 18 walk-in);
- a misleading sign rather than a script;
- Hina and Yohei have materially different speech/decision styles from Mika/Ryo;
- there is no single moral answer;
- facts can be checked without inventing profit/cost data.

V42 is accepted only when V43 work treats it as a frozen regression case rather than rewriting it.
