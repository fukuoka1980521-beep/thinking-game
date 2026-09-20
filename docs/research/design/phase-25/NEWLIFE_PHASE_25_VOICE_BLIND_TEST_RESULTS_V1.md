# NEW LIFE — Blind Voice Test Results V1 (PHASE_25, Section 15 + Addendum Section 6)

Classification performed by an independent fresh agent with zero exposure to this project's
characters, given only `NEWLIFE_PHASE_25_VOICE_SAMPLES_ANONYMIZED.md` (six anonymized voice
profiles + 60 shuffled lines). Scored here against the hidden ground truth in
`NEWLIFE_PHASE_25_VOICE_SAMPLES_GROUND_TRUTH.md`. Speaker-letter mapping used for scoring:
A=Jin, B=Fumiko, C=Daisuke, D=Hina, E=Miyoko, F=Yohei (never revealed to the evaluator).

## Gate 1 — Speaker identification (Section 15's original gate)

**Overall accuracy: 44/60 = 73.3%.** Target was `>=80%` overall. **This target is NOT met.**

Per-character recall (out of 10 lines each):

| Character | Correct | Recall |
|---|---|---|
| Jin (A) | 10/10 | 100% |
| Hina (D) | 9/10 | 90% |
| Miyoko (E) | 9/10 | 90% |
| Yohei (F) | 8/10 | 80% |
| Fumiko (B) | 4/10 | 40% |
| Daisuke (C) | 4/10 | 40% |

**Pairwise discrimination target (`no NPC pair below 65%`) is NOT met**, specifically and only for
the Fumiko/Daisuke pair: of Daisuke's 10 actual lines, 6 were misclassified as Fumiko; of Fumiko's
10 actual lines, 1 was misclassified as Daisuke, with the remaining 5 errors scattered to Jin,
Yohei, and Hina. Every other pair clears 65% comfortably (Jin's 100% recall means no pair involving
Jin can be below 65%; Hina/Miyoko/Yohei's 80-90% recall likewise clears every pair not involving
Fumiko/Daisoke).

## Root cause (the evaluator's own diagnosis, independently reached — not asserted by this doc)

The evaluator explicitly reported the Daisuke/Fumiko confusion was concentrated on **short,
factual, occupation-neutral answers** (e.g., Daisuke's plain "what do you do here" opening line
read to the evaluator as matching Fumiko's clipped, precise profile, not Daisuke's own warm/flowing
profile) — his characteristic warmth and question-asking only reliably distinguished him from
Fumiko on his *longer*, more personal or redirecting lines. The evaluator's own words: "sentence
length alone was the weakest standalone cue, since B [Fumiko], D [Hina, in professional-topic mode],
and F [Yohei] all overlap heavily in the 'short and clipped' register" — and Daisuke's brief,
factual answers fall into that same short-and-clipped register despite his underlying model being
warm and flowing overall. **Diagnosis: Daisuke's voice model is under-expressed specifically in
short factual exchanges** — his distinguishing traits (warmth, redirection, question-asking) need a
sample even on plain factual questions, not only on personal/pressure questions, to stay legible
against Fumiko's default clipped register.

## Gate 2 — Naturalness Gate (Addendum Section 6, using the Hina Gold Reference as the quality bar,
## not as a content target)

Independent per-line average across all 60 lines (DIRECTNESS, NATURAL CONTINUITY, INITIATIVE,
SPECIFICITY, EMOTIONAL BELIEVABILITY, NON-GENERICNESS, combined): **~4.5/5**. The evaluator's own
summary: "nearly every line is anchored by a concrete object, number, or physical action... which
is exactly what generic/robotic dialogue usually lacks," and explicitly: **"no line struck me as
truly robotic/AI-customer-service in register."** Two lines were flagged as comparatively weaker
(most generic in the batch, not failing): Fumiko's plain administrative Hall description (line 2)
and one of Miyoko's truisms (line 18) — both still rated above the flat "generic" floor, described
as having "idiosyncratic phrasing" rather than corporate-neutral phrasing. **Naturalness Gate:
PASS**, cleanly, for all six characters, including the five that are not Hina.

## HINA_POSITIVE_CONTROL_PRESERVED

Hina's own 10 lines scored 9/10 on identification (90%, tied for second-best in the cast) and were
never flagged as weak on naturalness. This is consistent with, not contradicted by, the Owner's own
live positive verdict — nothing in this blind test motivates or requires any change to Hina's
model, voice, or samples.

## OTHER_FIVE_NATURALNESS_VS_HINA

All five non-Hina characters clear the naturalness bar at a comparable level to Hina (no character
was singled out as sounding more generic, robotic, or "game information terminal"-like than any
other, including Hina) — **the problem this round is discriminability between two specific voices
(Fumiko/Daisuke) on short factual lines, not a naturalness gap between Hina and the rest.** These
are explicitly different failure categories, and this document keeps them separate rather than
conflating a discrimination miss with a naturalness miss.

## Disposition

Per this task's own Section 17/Addendum Section 8 ("do not rewrite Hina," "continue current phase,"
"do not restart Phase 25," "the next decision belongs to the Owner"), this honestly-measured
shortfall is **reported, not silently patched**. The fix, when authorized, is narrow and specific:
add a small amount of Daisuke's own warmth/redirection texture to his short, factual-answer lines
specifically (not a broad rewrite, not a change to his personality model, not a change to Hina or
any other character) — a targeted, scoped repair in the same spirit as every prior corridor repair
in this project's history, deferred to whenever the Owner authorizes a next round.
