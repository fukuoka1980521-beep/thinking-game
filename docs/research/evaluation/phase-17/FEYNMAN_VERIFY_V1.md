# PHASE_17 — FEYNMAN_VERIFY

Format per directive Section 18. Screens actually touched this phase. Verified against real
Playwright screenshots at 360x800 / 390x844 / 430x932 / 1440x900 (see
`docs/research/evaluation/phase-17/screenshots/`), not code-reading alone.

## SCREEN: 到着ガイド (`PlayGuideCard`, `nlc-play-guide`)

WHAT USER SEES: the "よろしくお願いします" felt-character image, a short bullet list of five
plain actions, and one button "町へ出る".
WHAT USER SHOULD UNDERSTAND: someone is glad you're here; here is everything you're allowed to
do; nothing more is required before playing.
WHAT USER CAN DO NEXT: press "町へ出る" and start.
Match without explanation: YES. No internal terms (no "trajectory"/"event state"/etc.) appear;
the bullet list is already five short, concrete sentences (pre-existing text, not touched).

## SCREEN: 一日の終わり (`state.ended`, `nlc-day-end`)

WHAT USER SEES: a sunset photo over rooftops captioned "おつかれさま", a small heading
"DAY{n}が終わった", then 2-4 short narrative lines, then "次の日へ進む" (+ the retrospective
block only on day 30).
WHAT USER SHOULD UNDERSTAND: today is over; here's what happened; nothing to solve here, just
move on.
WHAT USER CAN DO NEXT: press "次の日へ進む".
Match without explanation: YES. One risk found and fixed during this pass: the image's own
caption ("おつかれさま") and my first draft of the heading text said the same thing twice
("DAY1、おつかれさま") -- corrected to "DAY{n}が終わった" so the image and the heading each
carry a different piece of information (feeling vs. fact) instead of repeating.

## SCREEN: 30日の振り返り (`Day30Retrospective`, `nlc-day30-retrospective`)

WHAT USER SEES: a "しみじみ" image (someone looking at a framed nostalgic town view), then the
same short-sentence retrospective lines already shipped in PHASE_12_8, an optional one-line
reflection box, and -- once submitted -- a small "かんぱい" image next to "（自分の言葉を書き残
した。）".
WHAT USER SHOULD UNDERSTAND: this is a moment to look back, not a scorecard; writing a reflection
is optional and just for you.
WHAT USER CAN DO NEXT: write a line (or skip), then continue to Day 31.
Match without explanation: YES. Deliberately did NOT add a "30日達成！" banner, a checklist, or
any achievement framing -- the existing screen's own design note (Section 26: "no
table/chart/number/achievement-list") already rules that out, and the two images are sized and
placed to support that same restraint (small, not full-bleed triumphant hero banners).

## Screens NOT touched this phase (named here, not silently skipped)

IntakeForm, PromiseOffer, LifeOpportunityOffer, RealityBridgeOffer/CheckIn, ShoppingPicker,
ActivitySession, FortuneCardPicker, and every in-game NPC/location card were reviewed but not
visually changed this phase -- see `NEWLIFE_VISUAL_LANGUAGE_V1.md` for why (no real stamp asset
fits a "Big Choice"/accept-decline moment without becoming decoration, and six NPCs still have no
portrait to add). These remain running Feynman self-checks for a follow-up phase, not evidence
suppressed here.
