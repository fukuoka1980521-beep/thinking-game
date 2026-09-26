# NEW LIFE V28 — ENDING VECTOR CONTRACT (V27) DESIGN AUDIT RESULT

Date: 2026-09-24
Status: DESIGN AUDIT / NO PRODUCT CODE ABOVE THIS PATCH SET

## 0. Scope and method

Unlike V13-V24 (which govern the blind-validated per-turn classifier and were checked by isolated
subagent classification rounds against a hidden oracle), V27 is a case-level *design* contract —
there is no text-classification ambiguity to blind-test, only a causal-fairness/architecture
question: does the derivation rule for `SHOW`/`BOUNDARY`/`PERSONAL_TRACK` actually satisfy the
trigger's five constraints without reopening the validated four-layer contract or smuggling in a
score. This round's audit was conducted as a direct, adversarial re-derivation against V4, V13 §1B,
V14, and the existing `types.ts`/`relationshipReducer.ts`/`timeEconomy.ts` implementations —
checking each of V27's rules against a concrete walk-through, not accepting V27's own claims. One
real blocker was found and closed in V27 itself before implementation; the fix is reflected in the
V27 text already committed alongside this file, not left as a follow-up.

## 1. Blocker found and closed this round

**B1 — `SHOW`'s viability rule assumed exactly one NPC.** V27 §2.3's first draft took a single
`relationshipState: RelationshipState` parameter and tested it against `WITHDRAWN`. But
`NpcRelationshipRecord` (types.ts, V16 §6.6) is explicitly *per-NPC*, and the vertical-slice case
(`VERTICAL_SLICE_CASE_001_V1.md`) has two named NPCs — Mika (the personal-boundary character) and
Ryo (the director, whose cooperation a staging/rewrite commitment may separately depend on). A
single-NPC parameter would silently assume only Mika's withdrawal could ever void a commitment,
which is an invented, unstated assumption about case structure — exactly the kind of unauthorized
product judgment call this whole V13-V27 series has been refusing to make without a citation.
**Closed**: V27 §2.3 now takes `requiredRelationshipStates: readonly RelationshipState[]` — the
relationship states of every NPC a given commitment's cooperation actually depends on, supplied by
the caller (who has the case-specific knowledge this generic module deliberately does not). The
implementation (`ending.ts`, this round) matches the corrected signature; no case-specific NPC
identity leaks into the generic reducer, preserving the same genericity `relationshipReducer.ts`
and `types.ts` already maintain (neither file references "Mika"/"Ryo" by name).

## 2. Candidate issues checked and found not to be blockers

- **Does the WITHDRAWN-voiding rule create a perverse incentive (deliberately provoke a rupture
  after securing an NPC-independent commitment, to lock in PROCEEDS "for free")?** No — V4 §5
  already names `SURFACE_FIX` ("show proceeds, relationship damaged") as a legitimate, intended
  outcome family, not a loophole. Nothing is hidden: `boundary` and `trust` independently and
  visibly record the damage (`OVERRIDDEN`/degraded `RelationshipState`) in the same `EndingVector`.
  A non-ranked vector's entire purpose is to make a trade-off like this legible rather than folding
  it into one number that could be gamed toward "success." No blocker.
- **Can `boundary`'s final-commitment-only rule be gamed by committing to something harmless last
  to launder an earlier real override?** This is §3.2's intended recovery semantics, not a bug: the
  override still exists forever in `causalEventHistory` (unaffected by this contract — V27 does not
  touch that ledger), and reaching a non-`CROSS_WITHOUT_PERMISSION` final commitment after an
  earlier one requires the player to actually take a different, boundary-respecting action — the
  same effortful-recovery shape V4 §7 and the relationship reducer's REPAIR mechanism already use
  elsewhere in this PR. No blocker.
- **Does `PERSONAL_TRACK` risk leaking into `SHOW`/`BOUNDARY` through a future careless edit?** §4.3
  states this is structural (the parameter is absent from both functions' signatures, not merely
  unused), and this round adds a regression test (`ending.test.ts`, "structural independence") that
  fails if a future edit threads `personalTrackOpened` into either function — turning the design
  intent into an enforced property, not just documentation. Confirmed closed by test, not just by
  claim.
- **Is `boundary`'s ambiguity handling (`UNKNOWN` `boundaryMode` at commit time defaults to
  `RESPECTED`, not `OVERRIDDEN`) consistent with the rest of this PR's ambiguity philosophy?** Yes —
  V13 §3's conservative-ambiguity-default rule ("don't move state on an ambiguous read") has been
  applied identically at every other layer in this series (BOUNDARY_MODE, RELATIONAL_EVENTS); this
  is the same principle applied to the one new axis V27 adds, not a new philosophy invented for this
  round.
- **Does treating `ledger.commitment === null` at deadline as `BREAKDOWN` collapse the V4 §5
  distinction between `STALEMATE` (passive, non-worsening) and `BREAKDOWN` (actively caused)?** V27
  §2.3 states this explicitly and correctly scopes it: the two-value `SHOW` field does not
  distinguish these; the four-family classification is out of scope for this patch (§6) because the
  trigger for this round asks only for the `EndingVector`'s fields, not the four-family layer. This
  is a disclosed scope limit, not a silent one — no blocker, but flagged as the natural next
  question if a future round is asked to implement V4 §5's outcome families on top of this vector.
- **Does the ending BOUNDARY definition require a new NPC-consent fact-tracking channel beyond
  `boundaryMode`?** Considered and explicitly rejected in V27 §3.3: `CROSS_WITHOUT_PERMISSION` is
  already, by its blind-validated V13/V14 definition (100% classifier agreement across V17 §RECONSIDER
  -vs-CROSS_WITHOUT_PERMISSION gate through V25/V27's predecessor rounds), the single source of
  truth for "crossed without permission." A second channel would invent an undocumented mechanism
  and risk two disagreeing truths for the same fact. No blocker.
- **Four-layer contract integrity**: confirmed `ActionType`, `BoundaryMode`, `RelationalEvent` are
  untouched by V27/this implementation (no new member added to any of the three closed sets; grep
  of `types.ts` after this round shows the same 20/7/8 counts `types.test.ts` already pins).
- **No-score property**: confirmed no function in `ending.ts` combines two or more `EndingVector`
  fields into a single derived value; each of `show`/`boundary`/`personalTrack` is computed by its
  own pure function from disjoint-as-possible inputs (only `boundary` and `show` share
  `ledger.commitment` — by design, both read "what was finally committed," not a synthesized score).

## 3. Verdict

`PASS_FOR_IMPLEMENTATION` — one real blocker (B1, multi-NPC viability) found by this round's own
audit and closed in the V27 text and matching implementation before any code was written to the
uncorrected version. No blocker remains. Proceeding to implement V27 as corrected.
