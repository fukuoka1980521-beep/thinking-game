# V43 IMPLEMENTATION TASK — Cross-case transfer without bespoke reply logic

## Goal

Prove the accepted V42 conversation architecture transfers from the community-theater case to a second, materially different case from existing Phase 25–26 canon:

- caseId: `STREET_BAKE_SALE_V1`
- NPCs: HINA / YOHEI
- artifact: customer-facing sales sign
- stakes: quantity/promise/role clarity, not privacy/consent

V42 theater behavior is frozen regression baseline.

## Non-negotiable constraints

1. Do not add per-utterance phrase tables, regex routers, canned reply lookup, or transcript-specific conditions.
2. Do not weaken V38/V39/V41/V42 behavior.
3. Do not change model default (`gemini-2.5-flash`).
4. Do not touch legacy NEW LIFE functions/routes.
5. Do not merge PR #22.
6. Keep canon server-owned; browser must not become authority for hidden case facts.
7. Do not invent profit/cost data for the bake-sale case.
8. Keep bounded NPC↔NPC continuation and no synthetic player speech.
9. Any artifact rewrite must be real state, not just a conversational claim.
10. Update tests first/alongside code; all existing regression tests must remain green.

## Required architecture

Refactor from the current single hard-coded `SCENE_CANON` + `CHARACTER_DOSSIERS` assumption into a server-owned case registry.

Suggested shape (names may differ if implementation is cleaner):

```js
CASE_REGISTRY = {
  COMMUNITY_THEATER_V1: {
    npcIds: ["MIKA", "RYO"],
    canon: {...},
    dossiers: {...},
    editableArtifact: {
      label: "...",
      originalText: "...",
      revisionPurpose: "..."
    }
  },
  STREET_BAKE_SALE_V1: {
    npcIds: ["HINA", "YOHEI"],
    canon: {...},
    dossiers: {...},
    editableArtifact: {...}
  }
}
```

Validation must enforce:
- caseId exists;
- targetNpc belongs to that case;
- continue_npc_exchange's source/target NPCs belong to that case;
- nextNpc cannot escape the selected case.

The response schema may retain one global NPC enum if necessary, but runtime validation/normalization must be case-scoped.

## Generic artifact state

V42 introduced theater-specific names:
- `sceneRevisionText`
- `sceneRevisionProposal`

V43 should make artifact handling case-generic while preserving V42 behavior.

Preferred:
- `artifactRevisionText` in dynamic state
- `artifactRevisionProposal: {hasProposal,revisedText,changeSummary}` in response

If compatibility requires accepting the V42 legacy field temporarily, do so explicitly and test it. New human-test code should use the generic field.

The system instruction must refer to the selected case's editable artifact rather than assuming every case has a script.

## STREET_BAKE_SALE_V1 canon

Use the existing Phase 25–26 design as source.

### Hina / 陽菜

- 20s, starting a small baked-goods shop.
- actual offer:
  - 20 scones, ¥280 each
  - 10 cookie bags, ¥240 each
  - 30 total
  - 12 reserved
  - 18 walk-in
- she is baking and selling herself;
- no pickup handler is assigned;
- materials/time/profit totals are not yet known.
- under direct criticism she may initially defend the plan/product, but she can revise after concrete customer evidence.
- voice: short/medium, quick, concrete quantities, product vocabulary, can become quiet under direct criticism.
- must answer factual questions directly rather than evade.

### Yohei / 洋平

- early 60s, nearby general-store proprietor.
- terse, reliable, count-first.
- sees that “30 total” and “30 available at the counter” are different promises.
- dry rather than warm.
- does not own Hina's shop or decide for her.
- can help distinguish reservation/walk-in counts.
- must not become a generic advisor.

### Opening facts

- Hina has prepared 30 total items.
- 12 are already reserved.
- 18 are available to walk-in customers.
- Original public sign:
  `本日30点。スコーンとクッキーあります。`
- No pickup handler has been appointed.
- Costs/profit are unknown.

### Opening dialogue

HINA:
`今日、スコーン二十個とクッキー十袋を出します。看板も書きました。`

YOHEI:
`その「本日30点」、予約の十二も入ってるんだろ。店頭に三十あるように読めるぞ。`

Do not make either side a villain.

## Bake-sale pass behaviors

The live model should be capable of:
- answering “何を売る？何個？いくら？人は足りる？” with the actual facts;
- explaining that 12 reserved means only 18 walk-in;
- admitting profit cannot yet be determined from sales numbers alone;
- revising the actual sign as a concrete artifact;
- Hina inspecting/owning the revised wording;
- Yohei distinguishing facts from his judgment;
- moving to RESOLVED / AWAIT_PLAYER / STALLED appropriately;
- allowing bounded Hina↔Yohei continuation after player delegation.

## Human test

Do not overwrite the accepted theater page. Add a separate transfer-test page, e.g.

`public/newlife-v43-transfer.html`

It should:
- verify V43 health;
- expose Hina / Yohei target buttons;
- show the original sign;
- show the current revised sign when generated;
- carry artifact revision state into subsequent turns;
- retain the same safe endpoint and consent posture;
- keep debug/evaluation available.

The existing `public/newlife-v37.html` theater baseline must continue to work and should be migrated to the generic artifact response/state only if needed for V43 compatibility.

## Deployment identity

Advance health contract to V43 and include the same primary operations.

Permanent deploy smoke must cover:
1. health/build identity;
2. theater converse_turn regression;
3. bake-sale factual converse_turn;
4. continue_npc_exchange;
5. organize_thought.

Do not change permanent endpoint.

## Close criteria

Return only after:
- implementation complete;
- all relevant tests green;
- Claude review has no blocking issue;
- helper PR can merge into refoundation candidate;
- automatic permanent deploy completes;
- all live smokes pass;
- V42 theater human page still loads against V43;
- V43 transfer human page is published from master only after backend passes.

Do not claim human PASS for V43; that requires Owner playtest.
