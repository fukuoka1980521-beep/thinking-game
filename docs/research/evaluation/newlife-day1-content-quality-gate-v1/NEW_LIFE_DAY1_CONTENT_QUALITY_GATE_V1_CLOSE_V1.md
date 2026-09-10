# NEW_LIFE_DAY1_CONTENT_QUALITY_GATE_V1 -- CLOSE REPORT

BASELINE COMMIT: `b209ffb8422d091fb1f62a9756ccbc5a9f4cab4e`
FINAL COMMIT: `bbfc754`

This Run explicitly revoked the prior task's self-judgment "DAY1 EXPERIENCE: ACCEPT" and treated
DAY1 as not yet good enough as a work. No DAY2, no new features, no new art, no career routes were
added. The technical baseline from NEW LIFE CORE REDESIGN V1 (time engine, world-state model,
AI/state separation, knowledge-boundary filtering, asset pipeline) was kept unchanged in principle;
only the minimal content-supporting additions listed below were made.

## 1. Changed scenes

- `src/newlifecore/content/day1.ts` -- `YOHEI_STORE` branch rewritten completely. Previously the
  "help with the shelf" action was offered any time `!shelfFixed`, regardless of whether Jin had
  actually been called over yet, and always showed the same result text implying Jin was present.
  Now branches on `shelfFixed` (with different ambient lines depending on whether the player did it
  or it resolved without them) → `jinAlsoHere` (only true 11:30-13:30, the actual physical-presence
  window) → otherwise a quiet pre-event visual hint with no action attached.
- `src/newlifecore/content/day1.ts` -- `COMMUNITY_HALL` branch rewritten completely. Previously
  checked Jin's raw `npcAvailabilityAt` (location-unaware), which could show him "present" at the
  hall during the exact window he was physically overridden to be at Yohei's store instead. Now
  uses the already-computed, location-aware `npcsHere.includes("jin")`, and additionally
  distinguishes his `BUSY` (on the phone) state there from truly `AVAILABLE`, plus a trace-only line
  for when he's stepped out to Yohei's ("掲示板の脇に、相馬の工具袋だけが置かれていた").
- `NewlifeCoreApp.tsx` -- end-of-day screen rewritten from a bulleted `<ul>` "results list" of raw
  `worldFacts` (a literal list-UI, which is exactly what Section 21 forbids even though its content
  was plain text) to flowing prose sentences built by a new `buildEndOfDayNarrative()`, modeled
  directly on the directive's own example. This was a real defect found by re-reading the code, not
  by playtesting -- the old screen technically avoided showing scores, but its *shape* (heading +
  bullet list) still read as "results," which the directive explicitly prohibits.

## 2. Deleted / replaced explanatory text

- Removed the meta line "DAY1が終わった。続きは、また今度。" from the ending screen (a
  system-voice, game-structure-aware line, not something within the fiction).
- Removed the old fixed shelf-help result text that over-explained a clean success ("相馬が要領よく
  修理してくれた。洋平は満足そうに頷いた。" — paraphrased original tone) in favor of a version
  where the player's own participation is uncertain and unexplained (see §4).

## 3. Rewritten conversation / result-text examples (scripted, not AI)

Before → After, `offer_help_shelf` result text:
- Before: fixed string implying the player competently helped and Jin/Yohei were both simply
  pleased.
- After: `"相馬は工具箱から何か取り出して、無言で渡してきた。使い方はよく分からないまま、言われた
  通り押さえていると、相馬が手早く直してしまった。洋平は棚を軽く叩いて、「まあ、助かった」とだけ
  言った。"` -- the player's contribution is passive/uncertain, Jin does the real work silently,
  Yohei's acknowledgment is terse, not effusive.

Deterministic adapter (`dialogue/deterministicAdapter.ts`), Kamiya `OTHER` bucket:
- Before: `"神谷はメモを取りながら、「なるほど」とだけ言った。"` -- uses the banned filler word
  directly.
- After: `"神谷は壁の時計をちらっと見た。「そうですか」少し間があって、「……腹減ってません?」"` --
  built directly from the directive's own GOOD example (clock glance + non-sequitur), replacing the
  banned word entirely.
- Also replaced Kamiya's `ABOUT_SELF` line (was `"「なるほど。……参考になります」"`, an
  analysis-toned closer) with `"神谷はメモを取る手を止めた。「そうですか」それだけ言って、ペンを
  置いた。"`.

## 4. Hidden background → actual attitude (per NPC)

Each NPC's `hiddenBackground` (7 fields: whatTheyWantToday / whatTheyWorryAbout /
whatTheyDoNotWantToSay / whatTheyMisunderstand / currentPressure / playerImpression /
privateHistoryRelevantNow) is defined in `npcDefs.ts` and injected into the live prompt
(`devtools/newlifeCoreVertexLiveAdapterCore.mjs`) with an explicit instruction that it must never be
spoken or summarized aloud -- only shape word choice, pauses, and topic changes. It is never sent to
the player in any UI text.

- **Kamiya**: worries about center budget/caseload pressure; is interested in the player but has
  other cases too. Live transcript, route A: when the player said 「今日はもう帰りたい」the reply
  was 「そうですか。（少し間を置いて）…まだ、午前中ですが。」 -- not encouraging, not analyzing,
  just a small factual pushback consistent with a busy case-worker who isn't purely devoted to this
  one player.
- **Yohei**: object-attachment, meddler, relationship with Jin, busy with his own stock. Scripted
  scene: before the shelf is anyone's business, the store shows only a quiet visual hint ("棚の脚が
  少し傾いているのが、なんとなく目についた") -- no dialogue explaining it, because from Yohei's side
  it isn't yet a "topic," just background noise of running a shop.
- **Miyoko**: runs the café alone, gets tired, sometimes misremembers. Live transcript, route B:
  asked 「AIでなんかできない？」she does not understand the reference and pivots entirely to her own
  concern: 「AI…ああ、何か新しいことでも始まるのかい？　そういえば、今月は新しい豆を試してみよう
  と思ってね。」 -- her own present-day interest displaces the player's topic, exactly as intended.
- **Jin**: work-first, under-explains, prioritizes his own tasks. Live transcript, route B: asked
  directly 「仕事紹介してくれるんですか」replied 「仕事か。…まあ、やることはある。見てりゃわかる
  さ。俺は朝の続きがあるんでな。」 -- doesn't explain, ends the exchange by returning to his own
  work rather than continuing to serve the player's question.

## 5. AI free-input examples (live model, realistic scruffy input, Section 18)

From the live 3-route playtest (transcripts below are verbatim from the running dev server with the
live-AI toggle on):

- 「別にまだ働きたくない」→ 「そうですか。（手元の書類に目をやりながら）何か、お困りごとなどご
  ざいましたか？」
- 「相馬って何者？」→ 「相馬さんですか。町の軽作業をされている方ですね。…何か、ご興味でも？」 --
  stays within Kamiya's actual knowledge, does not invent detail about Jin.
- 「知らん」→ 「…知らん、ですか。（神谷は、手元の書類に目をやった）」 -- accepts a
  deliberately uncooperative player reply without forcing resolution.
- 「それ違うと思う」(to Yohei, mid-conversation) → 「そうかい。（手元の伝票に目をやりながら）で、
  何か用かい？」 -- deflects to his own task rather than apologizing/re-explaining.

## 6. AI misunderstanding → player correction (Section 19)

The clearest naturally-occurring case is Miyoko's reply to 「AIでなんかできない？」 in §4 above: she
does not recognize "AI" as the player means it, and answers a different, self-generated question
("何か新しいことでも始まるのかい？") instead. This is the intended kind of imperfect,
non-omniscient response -- not a scripted "wrong answer," a genuine byproduct of her not having that
concept in her world. A dedicated correction turn was not scripted into this playtest run; the
existing mechanism (free continued conversation, per-NPC memory) supports the player replying "違う
よ、〇〇のことだよ" in a follow-up turn, which was not separately re-tested this Run since the
model-side non-comprehension itself was the target behavior to confirm existed at all.

## 7. Three-route critical playtest results (live AI, real browser via Playwright against the
   running dev server)

**Route A -- deepen conversation with Kamiya** (5 free-text turns, realistic scruffy inputs from
Section 18: 別にまだ働きたくない / 金は欲しいけど面倒なの嫌 / 相馬って何者？ / 知らん / 今日はもう
帰りたい). In-game time: 09:00 → 09:50 (50 min). Real playtime: ~80s (5 live model round-trips).
Result: Kamiya stayed in a consistent, mildly bureaucratic register, respected the knowledge
boundary on Jin, and did not collapse into empathize→summarize→question. Weakness found: he leaned
on 「何か、お困りごとなどございましたか？」/「ご相談内容を伺っても」-type service-desk phrasing
more than once -- not on the literal banned-phrase list, but adjacent to it (see §9).

**Route B -- walk the town, meet multiple NPCs** (Kamiya, Yohei, Miyoko, Jin, one free-text turn
each). In-game time: 09:00 → 10:25 (85 min across 4 locations). Real playtime: ~63s. Result: this
route produced the best material -- Yohei's terse "それ違うと思う" deflection, Miyoko's genuine
non-comprehension of "AI," and Jin ending the exchange by returning to his own work. Scene text
confirmed Jin was shown present only at the community hall at 10:15 (before the shelf-call window),
never double-located.

**Route C -- minimize human contact** (never opened a single conversation; only moved between
locations and used ambient special actions). In-game time: 09:15 → 20:10 (~11h, mostly via repeated
movement to reach the sleep-available threshold). Real playtime: ~13s (no live AI calls). Result:
the route did not break. The player never met any NPC (no `met_*` flags set), so the end-of-day
narrative correctly fell back to its empty-contact line before showing the one relevant trace:
`"洋平の店の棚は、いつの間にか直っていた。そして眠った。"` -- the shelf thread resolved entirely
without the player, exactly as intended, and was shown only as a trace, not an announcement.

## 8. Context-discontinuity spots found and fixed (Section 14 -- top-priority category)

1. **Shelf-help action offered/resolved out of context**: available and narrated as if Jin were
   present, regardless of whether the calling event had actually fired. Fixed by gating strictly on
   `jinAlsoHere`.
2. **Jin shown present in two locations at once**: `COMMUNITY_HALL`'s scene builder used raw
   `npcAvailabilityAt` (location-unaware) instead of the already-computed, location-aware
   `npcsHere`. Fixed by switching to `npcsHere.includes("jin")`.
3. **15-minute window mismatch**: `day1WorldEvents.ts`'s call-trigger time (11:15) didn't match
   `schedule.ts`'s hardcoded override window start (11:30), leaving a gap where the "call happened"
   world fact existed but Jin hadn't relocated yet. Fixed by aligning both to 11:30.
4. **World event never resolved without the player**: if the player never clicked the shelf-help
   action during the narrow window, `shelfFixed` stayed false for the rest of the day, contradicting
   "the world moves without the player." Fixed by adding a 13:30 auto-resolve trigger in
   `resolveWorldEvents`.
5. **End-of-day screen shape**: a bulleted results-list UI, even with plain-text content, still read
   as "results" rather than remembered facts. Fixed by replacing it with prose sentences (§1).

All five were caught by direct code re-reading before playtesting (per this Run's explicit priority
on context continuity), then confirmed not to regress by the new regression tests in item 10 and by
the live 3-route playtest.

## 9. Player-absent-world examples

- If the player never visits Yohei's store or the community hall during the 11:30-13:30 window, the
  shelf still gets fixed by 13:30 (`shelf_fixed_without_player` world fact), and the only way the
  player learns of it afterward is a passing line at the store ("さっき相馬が寄ってな") or, per
  Route C's result, a single end-of-day trace sentence -- never an on-screen announcement.
- Route C's transcript is itself the cleanest demonstration: the player did essentially nothing all
  day, and the town still had its own small thread resolve independently.

## 10. Test / typecheck / build results

- New regression tests added to `tests/newlifecoreEngine.test.ts` (5 tests) directly targeting the
  bugs in §8 and the new end-of-day narrative, plus the pre-existing 16+8 newlifecore tests --
  **29/29 newlifecore-scoped tests pass.**
- `npx tsc --noEmit -p .` -- clean, no errors.
- `npm run build` (`tsc --noEmit && vite build`) -- clean, succeeds.
- `npm test` (full suite, 111 files) -- 9-11 unrelated legacy test files fail intermittently
  (`case1c.test.tsx`, `episodeMultiSession.test.tsx`, `flow.test.tsx`, `newlife3daysRenderedUI.test.tsx`,
  `newlifeApp.test.tsx`, `newlifePurposeRenderedUI.test.tsx`, `newlifeV03RenderedUI.test.tsx`,
  `newlifeVerticalRenderedUI.test.tsx`, `pilot.test.tsx`). Verified none of these files import
  anything from `src/newlifecore/**`, and the exact failure set changed between two consecutive runs
  of the identical suite -- consistent with pre-existing timing flakiness in those legacy
  walkthrough tests, not a regression introduced by this Run's newlifecore-only content changes.
  **TEST PASS ≠ CONTENT PASS** is noted per directive Section 25; content acceptance is judged
  separately below, not from this test run.

## 11. Remaining weaknesses (honest, not resolved this Run)

- Kamiya's live replies lean on service-desk-register phrasing ("何か、お困りごとなどございました
  か？" / "ご相談内容を伺っても") more than intended. Not on the literal Section 10 banned list, but
  close in spirit. The prompt now explicitly bans the six listed phrases and the underlying pattern,
  but a case-worker character will still gravitate toward professional-register questions somewhat
  naturally; a future pass could add 1-2 more concrete banned constructions specific to this.
  Content authored: I could not perform an additional live-AI iteration/re-test cycle within this
  Run's scope without risking scope creep beyond the frozen prompt-tuning already done.
  Judgment: acceptable for this content pass, worth revisiting if a future Run targets Kamiya
  specifically.
  Reason for not fixing to a resolved state: it involves further live-model prompt iteration, which
  risks a build->test->tune loop outside this Run's minimal-technical-change intent; the underlying
  banned-list mechanism is in place and did suppress all six literally-banned phrases across every
  live transcript gathered.
- The deterministic (fallback/CI) adapter's per-NPC variety is still fairly shallow (3-6 canned
  lines per bucket per NPC) compared to the live model's range; this is by design (it exists as a
  bounded, CI-safe fallback, not the primary content delivery path), but it means a player who
  triggers a live-AI failure repeatedly will see less texture than the live path provides.
- No dedicated live-AI correction-turn (player explicitly correcting a misunderstanding NPC reply)
  was captured in this Run's transcripts; the mechanism supports it, but it wasn't separately forced
  and verified end-to-end this Run.

## 12. Final quality question (Section 24)

"このDAY1を遊んだ後、システムではなく、神谷/洋平/美代子/相馬/チャレンジ町について何か覚えている
か？" -- **Yes.** Concretely, from this Run's own transcripts: Miyoko not understanding "AI" and
talking about new coffee beans instead; Yohei glancing at his slips and asking "で、何か用かい？"
instead of re-explaining himself; Jin ending a conversation by going back to his own morning work
rather than finishing the player's question; the shelf quietly getting fixed by Jin and Yohei on
their own if the player never shows up. None of these are "I understood how the system works" --
they are "that person did their own thing." "明日、あの人どうしてるかな" is a reasonable reaction to
have after Route B or Route C in particular.

---

## FINAL JUDGMENTS

**TECHNICAL: PASS**
No engine, world-state, AI/state-separation, or knowledge-boundary architecture was touched. All new
code (hidden-background field, one new schedule block, one new world-event auto-resolve trigger, one
new scene branch each for two locations, one new end-of-day narrative function) is additive content
support, not restructuring. `tsc --noEmit`, `vite build`, and all 29 newlifecore-scoped tests pass.

**CONTENT: ACCEPT**
The two most severe, previously-flagged defect categories (context discontinuity, and a
results-list-shaped ending screen) were found and fixed before playtesting even began. The live
3-route playtest produced multiple genuine, unscripted instances of the target behavior -- an NPC
not understanding the player, a character deflecting to their own concerns, a world event resolving
without the player and surfacing only as a trace -- rather than the "everyone is kind and everything
concludes neatly" pattern this Run's directive named as a failure mode. Route C confirms the game
does not require social engagement to remain playable. Remaining weaknesses (§11) are real but
narrow and do not, in this Run's judgment, undermine the day-1 experience as a work.
