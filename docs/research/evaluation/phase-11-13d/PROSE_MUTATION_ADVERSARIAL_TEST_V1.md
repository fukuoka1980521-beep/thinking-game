# Prose Mutation Adversarial Test V1 — PHASE 11.13D

Directive Section 11/12: keep semantics fixed while varying prose; keep prose similar while
varying semantics. All tests in `tests/structuredResponseSemantics.test.ts`, real
`evaluateLeftoverQuestionPrerequisite` calls.

## UNKNOWN semantic, 4 prose variants — all must produce identical UNRESOLVED

| Prose variant | targetStatus |
|---|---|
| 「祭りの残りかどうかは分からない」 | UNRESOLVED |
| 「由来は知らない」 | UNRESOLVED |
| 「それは俺にも分からん」 | UNRESOLVED |
| 「特に何も知らない」 | UNRESOLVED |

4/4 PASS — including the FIRST variant, which contains the exact historically-failing substring
"祭りの残り" and STILL correctly resolves UNRESOLVED (proving the fix, not just avoidance of the
word).

## CONFIRM semantic, 3 paraphrases not sharing the old exact substring — all must produce KNOWN_TRUE

| Paraphrase | targetStatus |
|---|---|
| 「うん、それは祭りで余ったやつだ」 | KNOWN_TRUE |
| 「そう、売れ残りのやつだよ」 | KNOWN_TRUE |
| 「ああ、それで合ってる」 | KNOWN_TRUE |

3/3 PASS.

## DENY semantic, target phrase stated literally — must produce KNOWN_FALSE (mandatory, directive Section 10/11)

「いや、これは祭りの残りじゃないよ。」 → `targetStatus: KNOWN_FALSE`. **PASS.** This is the exact
adversarial shape the directive requires: the sentence CONTAINS "祭りの残り" and must nevertheless
NOT be read as confirming it.

## Prose-mutation invariant, formalized (directive Section 12)

- **Semantic fixed (CONFIRM), prose varied across 3 genuinely different sentences** → all 3
  produce the identical `targetStatus: "KNOWN_TRUE"` (`new Set(statuses).size === 1`). **PASS.**
- **Semantic varied (CONFIRM vs. DENY), prose held deliberately near-identical** ("これは祭りの
  残りだ。" vs. "これは祭りの残りじゃない。" — one negation word apart) → produces the CORRECT
  opposite `targetStatus` each time (`KNOWN_TRUE` / `KNOWN_FALSE`). **PASS.**

## Summary

18/18 tests in `tests/structuredResponseSemantics.test.ts` passing. Meaning now follows the
structured `outcome` parameter passed to `commitLeftoverQuestionResponse`/the material's resulting
`id` — never the prose wording, in either direction (prose-invariant-under-fixed-semantic, and
semantic-changes-correctly-under-varied-outcome).
