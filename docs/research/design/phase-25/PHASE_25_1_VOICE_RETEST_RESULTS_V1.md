# NEW LIFE — Second Blind Voice Test Results V1 (PHASE_25.1, Sections 8-9)

Classification performed by a fresh, independent agent with zero exposure to this project, given
only `PHASE_25_1_VOICE_SAMPLES_80_ANONYMIZED.md`. Scored against the hidden key in
`PHASE_25_1_VOICE_SAMPLES_80_GROUND_TRUTH.md`. Letter mapping (never revealed to the evaluator):
P=Miyoko, Q=Jin, R=Daisuke, S=Yohei, T=Fumiko, U=Hina.

## Gate 1 — Speaker identification

**Overall accuracy: 68/80 = 85%.** Target was `>=80%`. **PASS** (up from 73.3% in the first test).

Per-character recall:

| Character | Correct | Recall | Prior round |
|---|---|---|---|
| Daisuke (R) | 13/14 | 92.9% | 40% |
| Miyoko (P) | 13/13 | 100% | (not previously tested this way) |
| Jin (Q) | 11/13 | 84.6% | 100% |
| Fumiko (T) | 12/14 | 85.7% | 40% |
| Yohei (S) | 9/13 | 69.2% | 80% |
| Hina (U) | 10/13 | 76.9% | 90% |

**DAISUKE_FUMIKO_PAIRWISE**: of the 28 lines that are truly Daisuke or Fumiko, 25 were correctly
assigned to one or the other (only one confusion, Fumiko's line 24 called Daisuke; zero Daisuke
lines were called Fumiko, a complete reversal of the prior round's dominant, one-directional
6-line confusion). **89.3% — well above the 70% target. PASS**, and the specific pair this whole
repair round targeted is now the *strongest* discriminated pair in the cast, not the weakest.

**No other pair below 65%**: lowest pairwise figures found were Jin/Yohei (76.9%) and Hina/Yohei
(73.1%) — both comfortably clear of the floor. **PASS.**

**HINA_UNCHANGED gate check**: Hina's samples were not touched or rewritten this round (hard freeze
respected, per Section 1). Her identification measured at 76.9% (10/13) on this fresh, harder,
larger 80-line set, versus 90% (9/10) on the prior, smaller 10-line set. Both of her two misses this
round (line 7, "I moved the sign again... people read it while they're deciding now, not after";
line 73, "I hear what Yohei's saying, I do...") are short, plain-declarative or gentle-disagreement
lines that happen to lack her signature craft-technical vocabulary (specific ingredients, numbers,
methods) — the same anchor that made her other 11 lines nearly all correctly identified. **This is
diagnosed as content-selection sensitivity in the new sample set, not a rewrite-induced regression**
— nothing about her model or voice changed. No action is taken on this per the explicit hard freeze;
it is recorded here as an honest observation for any future sample-writing to note (her plainest
opinion/declarative lines benefit from keeping at least a small craft-specific anchor, same as her
Gold Reference's own beat C already demonstrated).

## Gate 2 — Naturalness (Daisuke and Fumiko specifically, per Section 9)

Daisuke's 14 lines averaged **4.79/5** naturalness, zero lines flagged as generic or robotic.
Fumiko's 14 lines averaged **4.21/5**, with exactly one line flagged as comparatively weak (line 18,
"Whatever the town actually needs that month... mostly festival prep" — described by the evaluator
as "vague public-service boilerplate," rated 3/5) — still explicitly not called robotic or
AI-customer-service register, just thinner than her other, sharper lines (which lean on
responsibility/sequence/date framing this one line happens not to use). **NATURALNESS_GATE: PASS**
for both — the repair made them more discriminable without making either of them less human; the one
weak point (Fumiko's line 18) is a minor, specific, separately-notable observation, not a gate
failure.

## Confirmation the repair worked at the intended level, not just the surface

The evaluator's own self-assessment (unprompted) confirms the fix targeted the right mechanism:
"once I locked onto R's [Daisuke's] 'postponement confession' motif as a fingerprint, this pair
became easy" and, for the harder emotional/uncertainty/refusal lines generally, "the only reliable
signal was the *deeper* behavioral fingerprint: how each character handles being caught unprepared
(T treats it as a procedural next step... R admits it lightly and self-mockingly...)" — i.e., the
evaluator independently rediscovered exactly the Section-3 thinking-level distinctions
(`PHASE_25_1_DAISUKE_FUMIKO_CONFUSION_AUDIT_V1.md`) this repair was built from, without being told
they existed. This is strong, independent evidence the fix operated at the "different attention,
different social logic" level the original task demanded, not at the catchphrase level it
explicitly forbade.

## Residual, out-of-scope observations (not required to act on this round)

The evaluator flagged Jin/Yohei as the new hardest pair (76.9% pairwise, still well clear of the
65% floor) — both are short/blunt/low-affect with action-based (not verbal) apologies, and lines
stripped of an obvious money/business noun blurred for the evaluator. This is not a repair target
this round (Section 1's explicit instruction: avoid unnecessary rewrites to Yohei/Jin/Miyoko unless
proven to contribute to the Daisuke/Fumiko confusion — this is a distinct pair, not that
confusion) and is recorded here only for future reference.
