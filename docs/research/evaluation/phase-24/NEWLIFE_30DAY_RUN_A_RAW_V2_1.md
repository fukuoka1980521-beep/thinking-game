# NEW LIFE 30-Day Gamebook — RUN_A Raw Playthrough V2.1 (social / empathetic)

Played against `NEWLIFE_30DAY_GAMEBOOK_TEXT_PROTOTYPE_V2_1.md` (no home_hub -- every day auto-enters
its own main scene; roaming used deliberately here to build Daisuke's evidence early). Raw record
only, no interpretation.

Fields: CHOICE | INTEREST(0-5) | TOMORROW_PULL(0-5) | WORLD_PROGRESS_VISIBLE(Y/N) |
PLAYER_CAUSALITY(YES/PARTIAL/NO) | WHAT_CHANGED_WITHOUT_PLAYER | WHAT_CHANGED_BECAUSE_OF_PLAYER.

D1: Helped Hina with the box. | 4|4|N|YES| -- |`helped_hina_move_box` created.
D2: Noticed Yohei's overnight change; roamed to Hina, ambient. | 3|3|Y|PARTIAL|A small overnight
restock at Yohei's, unprompted.|Acknowledged it.
D3: Asked Fumiko about the flyer; roamed to Yohei. | 4|4|N|YES| -- |`festival_flyer_seen` set.
D4: Reassured Hina about Yohei (Yohei absent); THEN used the day04_roam to go tell Yohei directly.
| 5|5|N|YES| -- |`reassured_hina_about_yohei` AND (via the separate roam) `defended_hina_to_yohei`
created for BOTH Hina and Yohei -- correctly, only because Yohei was actually present for the second
part.
D5: Jin's offer hadn't fired yet (no evidence); roamed to Miyoko. | 3|3|N|NO|An ordinary day for
Jin, nothing offered.| -- 
D6: Watched the Yohei/Daisuke moment; roamed to Daisuke (ambient only, Day 8 hasn't happened yet).
| 3|3|Y|PARTIAL|The old friends' moment happens regardless.|Watched it.
D7: Watched the comedy day warmly; roamed to Fumiko. | 4|4|N|YES| -- |`witnessed_daisuke_comedy_day`
created.
D8: Asked Daisuke something personal; deflected; roamed to Yohei. | 4|4|N|YES| -- |
`attempted_daisuke_personal` created (Daisuke evidence count now 2).
D9: Helped Yohei sort spoiled stock; roamed to Hina. | 3|3|N|YES| -- |`helped_yohei_sort_stock`
created.
D10: Suggested Jin for the bench; roamed to Jin. | 4|5|N|YES| -- |`suggested_jin_for_bench = true`.
D11: Reacted warmly to the new beans; roamed to Fumiko. | 4|3|N|YES| -- |
`reacted_to_miyoko_new_beans` created.
D12: Asked Daisuke again (roaming touchpoint, per Fix A) -- evidence count reaches 2, his decision
resolves EARLY, today, and the player witnesses it directly. | 5|5|Y (Daisuke's own arc, resolved
early because of accumulated evidence, not caused by one question)|YES|His arc was always going to
resolve by Day 20 regardless -- the player's accumulated presence only moved the DATE earlier and
let it be witnessed firsthand.|`returned_to_daisuke_after_deflection` (count 2) ->
`daisuke_renovation_decided="yes"`, `daisuke_renovation_decision_day=12`,
`player_witnessed_daisuke_decision=true`.
D13: Asked Yohei gently about the phone. | 5|5|N|YES| -- |`noticed_yohei_son_thread` created.
D14: Asked Hina "juggling how?"; roamed to Daisoke (ambient, card gate not yet met). | 5|5|N|YES|
-- |`noticed_hina_money_pressure` created.
D15: Asked Fumiko about the letter; roamed to Miyoko. | 5|5|N|YES| -- |
`asked_about_fumikos_letter`, `player_knows_fumiko_letter=true`, `Promise(fumiko, help_soon)`
created.
D16: Listened to Miyoko about her daughter; roamed to Yohei. | 4|4|N|YES| -- |
`listened_to_miyoko_daughter_worry` created.
D17: Agreed to help Yohei "next time"; roamed to Miyoko and Fumiko (a deliberate quiet check-in on
Miyoko specifically). | 4|4|N|YES| -- |`Promise(yohei, help_soon)` created;
`checked_on_miyoko_on_quiet_day` created via the roaming stop.
D18: Both promises collided; kept Yohei's, explained to Fumiko. | 5|4|N|YES| -- |Yohei's promise
kept; Fumiko's explained/deferred.
D19: Helped Fumiko with festival prep; roamed to Daisuke (ambient, his arc already resolved D12).
| 4|4|N|YES| -- |`helped_fumiko_festival_prep`, `festival_prep_progress=1`.
D20: Helped Yohei decide generously; Daisuke's arc already resolved D12 so no independent-progress
trigger fires here. | 4|5|N|YES| -- |`yohei_festival_stock="full"`,
`supported_yohei_festival_stock` created.
D21: Thanked Jin specifically; bench fixed (suggested D10); Jin's LATE window also fires
(early-window evidence was insufficient by D5, but by D21 it's now `>=2` cumulative) -- accepted.
| 5|5|N|YES| -- |`thanked_jin_for_unseen_work`, `bench_fixed=true`,
`jin_arrangement="accepted"`.
D22: Gate met (2+ Hina evidence items, `noticed_hina_money_pressure` present) -- the reveal. | 5|5|
N|YES| -- |`player_knows_hina_true_reason=true` (explicitly, `hina_shop_readiness` unaffected by
this -- confirmed still advancing on its own separate schedule).
D23: Investigated the false alarm (explicitly non-causal); roamed to Daisuke (ambient, nothing new
-- his gate for the CARD specifically still needs count>=2 of the deflection-return item
specifically, which stands separately at 1 so far from Day 12 alone). | 3|4|N|NO| -- | -- 
D24 (festival): Spent both slots at Yohei's full stall and the Hall (fixed bench). | 5|5|Y (the
assembled composite scene itself)|YES| -- |Witnessed the specific, evidence-built version of today
at two of the four live locations.
D25: Checked in on Yohei. | 3|3|N|YES| -- |Warm, low-stakes exchange.
D26: Yohei's son call (world progress, already true) is now learned -- gate met
(`noticed_yohei_son_thread` + a DISTINCT additional item, `helped_yohei_sort_stock`, satisfies the
corrected Fix-D check). | 5|5|Y (the call itself happened independently, around Day 20, regardless
of the player)|YES (learning about it, not the call itself)|The call already happened on its own
timeline.|The player is specifically told about it, because distinct evidence existed.
D27: Gate check for the card: `returned_to_daisuke_after_deflection` total is only 1 (from Day 12
alone) -- **below the required 2**, so an ordinary, comfortable afternoon instead. | 2|3|N|NO| -- |
-- (an honest, disclosed near-miss -- see the verdict).
D28: Rule resolves: `listened_to_miyoko_daughter_worry` AND `checked_on_miyoko_on_quiet_day` both
exist -> `miyoko_daughter_outcome="compromise"`. | 4|4|N|YES| -- |The deterministic rule reads real,
accumulated evidence across two different registers of attentiveness.
D29: Did the quiet kindness (toward Jin, though his arrangement was already accepted -- a genuinely
unwitnessed extra gesture); Fumiko's write-back resolves: `player_knows_fumiko_letter` AND
`helped_fumiko_festival_prep` both true -> `fumiko_writes_back="true"`. | 4|4|N|PARTIAL (kindness
itself has no visible trace by design; the letter resolution IS real state, read from Days 15/19)|
Fumiko's letter thread resolves in the background, from evidence already on record.|The kindness
itself changes nothing observable, by design.
D30: Wrote a reflection. | 5|N/A|N|YES| -- |A specifically warm, mostly-resolved Day 30, reading:
shop readiness progressed on its own schedule (independently reported from the true-reason
knowledge), son-call learned, Daisuke's decision witnessed early but the card narrowly missed,
Jin's arrangement accepted, Miyoko's compromise, Fumiko's bench fixed and letter answered.

## Summary tally

Days with WORLD_PROGRESS_VISIBLE=Y even where the player wasn't the direct cause: D2, D6, D24, D26
-- confirming independent world movement is perceivable even in this high-engagement run, not only
in lower-engagement ones. Lowest INTEREST day: D27 (2) -- an honest near-miss (missed the card
reveal by exactly 1 count of one specific evidence item), not a design failure.
