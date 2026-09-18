# PHASE_17_COMPLETION STAGE A — FEYNMAN_VERIFY V2 (all 9 required screens)

Directive Section A5/A6 format, WHAT-SEES / WHAT-SHOULD-UNDERSTAND / WHAT-CAN-DO-NEXT, verified
against real Playwright screenshots (`docs/research/evaluation/phase-17/screenshots-stage-a-completion/`
for the screens new to this stage; `.../screenshots/` for opening/day-end/day30 already verified
in the prior CLOSE and unchanged this stage except the welcome image swap).

## 1. Opening / Arrival

Unchanged in substance from the prior CLOSE, plus the welcome image now shows two figures instead
of one (`guide_duo_welcome.png`). SEES: town photo, then "よろしくお願いします" with two people,
a short bullet list, one button. UNDERSTANDS: arrived somewhere, someone's glad you're here,
here's everything allowed. CAN DO: press "町へ出る". PASS.

## 2. Town / location selection

SEES (`npc_kamiya_and_movelist_who_preview.png`): six buttons, each now with a second line naming
who's there right now (or "誰もいないかも"). UNDERSTANDS: where people actually are before
committing to walk there. CAN DO: pick a destination with that information already in hand. This
is a genuine behavior change from the prior CLOSE (previously the buttons were bare location
names) -- verified real, not just present in code, by screenshot. PASS.

## 3. NPC conversation

SEES (`npc_yohei_kiyoshi.png`, `active_event_community_hall.png`): a portrait or a colored initial
badge, the NPC's name, a new one-line "◯◯の人" subtitle, their spoken line, and action buttons.
UNDERSTANDS: who this is (photographed NPCs) or at least what kind of place they belong to (badge
NPCs -- an honest partial answer, not a fabricated photo). CAN DO: talk freely or take a listed
action. The 6 badge NPCs are now visually distinct from each other (color-coded), not identical
grey circles -- a real, verified improvement, though still CONDITIONAL relative to a real portrait.

## 4. Active event

SEES (`active_event_community_hall.png`): a scene card with a visible blue left border, an ambient
line describing something specific ("掲示板に、見覚えのない紙が新しく貼られていた"), and
event-specific actions ("読んでみる"/"気にせず通り過ぎる") alongside the ordinary "自由に話す".
UNDERSTANDS: something different is happening here, not ordinary chat -- confirmed visually in a
live screenshot, not just by reading the CSS. This is PHASE_16's own existing treatment,
re-verified rather than changed (its own directive explicitly banned adding an icon/badge/popup on
top of it, and this stage found no reason to override that call). PASS.

## 5. Fortune House

SEES (`fortune_card_picker.png`, `fortune_card_picked_result.png`, `fortune_memory_chip_day2.png`):
three plain cards to choose from, a result line naming the drawn card, and -- on a later day -- a
follow-up line plus a small repeated "前回のカード：道" chip. UNDERSTANDS: this is a small,
low-stakes moment (no reading/prophecy shown), and the game remembers which card you drew.
CAN DO: pick a card or leave; talk to Shizuko again later. Confirmed the cross-day memory chip
renders in a real browser across an actual day boundary, not just asserted by a unit test. PASS.
Still reads as "one shop in town," not an app -- no glow/sparkle was added.

## 6. Big Choice

SEES (`big_choice_opportunity_offer.png`): an NPC's dialogue leading into a distinctly
amber-bordered line ("この返事で、しばらく生活が変わるかもしれない"), then two equally-styled
buttons. UNDERSTANDS: this reply matters more than ordinary chat -- and, verified in this exact
screenshot (which happens to also contain an active-event blue border on the outer card), that
signal is visually distinct from "something is happening," not the same color reused. Neither
button is visually favored. PASS.

## 7. Trial house / belongings

SEES (`shopping_picker_belongings.png`): a checklist of items with prices, a running total against
money on hand, confirm/cancel. UNDERSTANDS: what's affordable, nothing hidden. CAN DO: buy or
back out. No code in this flow was touched this stage (PHASE_16's purchase-state fix was not
disturbed) -- confirmed via the full automated purchase-flow regression tests, still passing, and
this live screenshot shows the same behavior in a real browser. PASS.

## 8. Day transition

Unchanged from the prior CLOSE (sunset hero image, heading no longer duplicates the caption).
Re-confirmed still working after this stage's other changes (full suite green). PASS.

## 9. Day 30 retrospective

Unchanged from the prior CLOSE (memory image opener, cheers image on reflection). Re-confirmed
still working. PASS.

## Internal-term leak check (directive A7)

Grepped the touched files for the banned internal terms (trajectory, event state, relationship
state, memory tier, scene context, life material, recurring event) appearing in player-facing
strings (JSX text/labels), not code identifiers or comments: none found. The one new player-facing
line this stage added is a subtitle ("◯◯の人") and a chip label ("前回のカード：◯◯"), both
already plain, name-based, non-technical phrasing -- no rewrite of existing dialogue text was
needed or attempted this stage (PHASE_12-16's existing copy already met this bar in the screens
touched).
