# NEW LIFE — V43 Transfer Generalization Plan

Date: 2026-09-26
Mode: IMPLEMENT + LIVE HUMAN MICROTEST
Goal: prove the conversation architecture transfers beyond the theater case.

## Transfer case

Case ID: `STREET_BAKE_SALE_V1`

### People

**Hina / 陽菜**
- 20s, starting a tiny baked-goods shop.
- concrete offer: 20 scones at ¥280, 10 cookie bags at ¥240.
- total 30 items; 12 reserved; 18 available for walk-in.
- she plans to bake and sell herself; no pickup handler has been appointed.
- under criticism: initially defends the product/plan, then can inspect concrete buyer evidence.
- must answer actual quantities directly.
- must not invent unknown profit/cost numbers.

**Yohei / 洋平**
- early 60s, nearby general-store proprietor.
- terse, count-first, dry rather than warm.
- notices the difference between total production and customer-facing availability.
- does not become the owner of Hina's shop or force her decision.

### Opening

A sign says **「本日30点」**.
Yohei says that customers will read it as 30 items available to buy at the counter.
Hina says she made 30 items, so the sign is not false.

The player is a nearby participant, not Hina's boss.

### Canonical facts

- scones: 20 × ¥280
- cookie bags: 10 × ¥240
- total: 30
- reservations: 12
- walk-in stock: 18
- pickup handler: none
- costs/profit: unknown, not to be invented

### Editable artifact

Original sign:
> 本日30点。スコーンとクッキーあります。

A revised sign may be produced as an actual artifact. The engine must distinguish:
- a player merely saying “change the sign”;
- a concrete revised sign that actually exists.

### Pass conditions

1. Hina answers “what/how many/price/staff” with the canonical facts.
2. Yohei challenges the promise with quantities, not generic criticism.
3. Their voices remain distinguishable.
4. A concrete revised sign can be generated and carried as state.
5. NPC↔NPC continuation can occur without synthetic player speech.
6. Unknown cost/profit stays unknown.
7. A reasonable outcome can be:
   - corrected sign + small retry,
   - reduced scope,
   - pause until roles are assigned,
   - Hina choosing to continue alone at manageable scale.
8. Theater V42 regression tests remain green.

## Architecture requirement

Do not duplicate a second bespoke conversation engine.

Refactor to a server-owned case registry:
`caseId -> canon + allowed NPCs + dossiers + editable artifact metadata`.

The response schema may use the global NPC enum, but validation must enforce that `targetNpc` and `nextNpc` belong to the selected case.

Artifact handling must become case-generic; theater “script revision” is one artifact type, bake-sale “sign revision” is another.

## Stop condition

Do not expand to six characters or 30 days until this second live case passes human testing. If V43 fails, fix the **general abstraction** exposed by the transfer case, not a Hina-specific phrase table.
