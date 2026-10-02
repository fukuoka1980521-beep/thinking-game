# NEW LIFE — AI Town Memory / Reflection Live Evidence — 2026-10-03

Status: TECHNICAL LIVE PASS / HUMAN PRODUCT VERDICT PENDING

## Environment

- Branch: `refactor/chat-first-goal-integrity-20260929`
- Isolated test backend: `newlife-refoundation-ai-chatfirst-test`
- Test backend build used for final cross-day probe: `9afa9af532dea33b755b2456d947e0529904fe22`
- Local test UI: `http://localhost:5175/?newlife30=1`
- Production route unchanged.

## Cross-day durable memory probe

### Day 3

Player:
> 商売ですからね、できることとできないことは決めておいたほうが良いですよ

Observed NPC reply in the latest probe:
> そうですね、おっしゃる通りです。でも、いざ席のこととなると、どこまでが許されるのか、線引きが難しいもので…

The stored Miyoko memory included:
- scene title;
- concrete issue;
- unresolved decision;
- authority owner;
- understood player meaning;
- Miyoko's actual reply.

The memory persisted through:
1. advancing to later days;
2. localStorage save;
3. full browser reload;
4. continuing the saved session.

Its `lastAccessSeq` advanced from 1 to 2 after cross-day retrieval, confirming actual retrieval/touch rather than static persistence only.

### Day 5 recall

Player:
> この前の待つ場所の話、どう考えてます？

Observed reply:
> ええ、あの時の話ですね。喫茶の席を待機場所にする件、どうすれば皆さんに気持ちよく使っていただけるか、まだ決めかねています。

This is materially more specific than the earlier generic response and refers to the recalled concrete topic instead of only "担当" / "線引き".

## Important failure found during iteration

Earlier live runs produced phrases such as:
- 「あの後もずっと考えてはいる」
- 「いつも頭にはあります」
- specific crowding claims inferred from persona text.

Those statements were not supported by observed episodic memory.

Repairs added:
1. `OBSERVATION`, `REFLECTION`, and `PLAN` now have distinct epistemic meanings.
2. An observation proves only that something was said/seen at that time; it does not prove ongoing off-screen thought.
3. Personality / motivational traits are behavioral priors, not evidence that a concrete event happened.
4. Current canonical state overrides old memories.
5. Cross-day recall prioritizes the matching episode over an unrelated current-day scene focus.

## Reflection endpoint live probe

A direct `reflect_agent` call using three grounded Miyoko memories returned HTTP 200 and three evidence-indexed insights:

1. 「美代子は喫茶の席の利用条件や人数制限について決定権を持つが、まだ明確な基準を設定できていない。」 evidence [0,2]
2. 「プレイヤーは美代子に対し、商売としてできることとできないことを事前に決めるよう助言した。」 evidence [1]
3. 「会館前が混雑した際の客の待機場所と喫茶の席利用について、美代子の中でまだ未解決の課題となっている。」 evidence [0,2]

The reflection result did not mutate canonical state.

## Product interpretation

Technical conclusions:
- durable per-NPC memory survives day/session boundaries;
- retrieval is actually exercised;
- cross-day recall can use the stored episode;
- background reflection endpoint returns evidence-grounded insights;
- canonical state remains outside reflection authority.

Not yet established:
- that the player consistently feels "this person remembers me";
- that all six NPCs retrieve the right memory in ambiguous multi-topic histories;
- that reflections improve human-perceived naturalness;
- that automatic reflection frequency is optimal.

Therefore this evidence is **not** a product PASS.


## Six-NPC cross-day recall probe

A six-NPC isolated-backend probe was then run with one grounded memory per character.

Transport/shape result:
- Hina: PASS
- Yohei: PASS
- Daisuke: PASS
- Jin: PASS
- Miyoko: PASS
- Fumiko: PASS

Semantic review found a mixed but useful result:

- **Yohei** preserved the actual issue: the problem was not 12/18 themselves but how the reservation/walk-in split reached customers.
- **Daisuke** correctly recalled the workshop-use question as still unresolved.
- **Jin** correctly separated the completed two-hour job from any additional work.
- **Hina** recalled the reservation/storefront distinction and proposed clearer storefront labeling; this is a present proposal, not evidence that the action already occurred.
- **Miyoko** correctly recalled the cafe-seat issue, but one run still added an unsupported external justification about lunch-time seat occupancy. A later grounding rule now forbids persona/style vocabulary from becoming current world facts.
- **Fumiko** remembered that the earlier confirmation was vague, but her reply still tended to compress the concrete requirement ("confirm Miyoko's seat conditions before posting") into generic role/confirmation language.

Therefore:
- six-NPC **technical recall is established**;
- six-NPC **semantic recall is not yet uniformly product-ready**;
- the remaining failure is not memory absence but **memory-to-reply re-anchoring fidelity**.

This is consistent with the earlier Semantic Re-Anchoring Failure finding: retrieving the correct episode is necessary but not sufficient; the reply must preserve the episode's concrete object, unresolved decision, and authority.
