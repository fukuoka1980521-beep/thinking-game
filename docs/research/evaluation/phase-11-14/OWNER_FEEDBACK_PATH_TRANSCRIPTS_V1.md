# Owner Feedback Path Transcripts V1 — PHASE 11.14

Real transcripts captured from the actual running scene (Playwright, `product_visual_qa_script.mjs`,
`http://localhost:5211/?newlifeplayable11=1`) and the real unit-level dispatch path
(`tests/newlifePlayable11RealPathIntegration.test.ts`) — not hand-written/imagined dialogue.
Directive Section 16's four required paths.

## PATH A — accept immediately, only the unresolved contextual question appears

1. `祭りの翌日。顔なじみの洋平の店を訪れた。洋平は、値引き用の棚の準備をしている。` [店に入る]
2. `値引き用の棚を整理していた洋平が、話しかけてきた。「ちょっと手伝ってくれる？」`
3. Actions: 手伝う / 今日はやめておく / 何を手伝えばいい？ / 祭りどうだった？ / その場を離れる
4. [手伝う] → `「OKです。この棚に置きますね」と答え、洋平と二人で箱を値引き用の棚まで運んだ。`
   `棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。`
5. Actions now: 祭りどうだった？ / これ、祭りの残り？ / その場を離れる — the still-unresolved
   contextual question (`これ、祭りの残り？`) is present; the resolved-request `何を手伝えばいい？`
   is gone. This is the `04_path_d_reveal_without_festival.png` screenshot state.

## PATH B — ask festival first, redundant follow-ups never appear

1. (same opening as PATH A)
2. [祭りどうだった？] → `「8割くらいは売れたよ。残りは今値引きして出す準備してるところだ。」`
3. Actions immediately after: 手伝う / 今日はやめておく / 何を手伝えばいい？ / その場を離れる —
   `祭りどうだった？` is gone (one-shot) and `売れ行きどうだった？` never appeared at all (its
   target, FESTIVAL_SALES_STATUS, was resolved by the same response). Screenshot:
   `01_after_festival_question.png`.
4. [手伝う] → `「OKです。この棚に置きますね」と答え、洋平と二人で箱を値引き用の棚まで運んだ。`
   `棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。`
5. Actions now: **その場を離れる only.** `これ、祭りの残り？` never appears — its target
   (LEFTOVER_STATUS) was already resolved by the festival response in step 2, before the box was
   even moved. Screenshot: `02_after_accept_path_b.png` (matches the exact scenario the Owner
   flagged in observation #6/#8).

## PATH C — asking a question removes it, and can also remove another

Real dispatch trace (`tests/newlifePlayable11RealPathIntegration.test.ts`):

```
accepted = ACCEPT (leftover_stock_moved admitted)
ids(accepted) = ["ASK_FESTIVAL_SCENE", "ASK_ABOUT_LEFTOVER_STOCK"]

afterAsked = askInFull(accepted, ASK_ABOUT_LEFTOVER_STOCK, "これ、祭りの残り？")
  -> Yohei: 「ああ、そうだ。祭りの残りだよ。値引きで出すから、棚に並べるんだ。」
ids(afterAsked) = ["ASK_FESTIVAL_SCENE"]   // ASK_ABOUT_LEFTOVER_STOCK gone -- its own target resolved
```

And the cross-response case (same question removed by a DIFFERENT response, PATH B's mechanism
restated at the dispatch level):

```
afterFestival = askInFull(baseState, ASK_FESTIVAL_SCENE, "祭りどうだった？")
accepted = ACCEPT(afterFestival)
ids(accepted) does NOT contain "ASK_ABOUT_LEFTOVER_STOCK"
accepted.materials contains "leftover_question_response_confirm"  // set by the FESTIVAL response, not by asking the leftover question at all
```

## PATH D — physical reveal only, leftover question remains legitimate

Real Playwright trace (`product_visual_qa_script.mjs`, second browser session):

1. [店に入る] → [手伝う] (festival never asked)
2. `棚に置いて蓋を開けると、中には祭りの柄の手ぬぐいがたくさん入っていた。`
3. Actions: `祭りどうだった？` / `これ、祭りの残り？` / `その場を離れる` — the leftover question
   remains, because its target has not been resolved by anything yet. Screenshot:
   `04_path_d_reveal_without_festival.png`.
4. [これ、祭りの残り？] → `「ああ、そうだ。祭りの残りだよ。値引きで出すから、棚に並べるんだ。」`
5. Actions now: `祭りどうだった？` / `その場を離れる` — the just-asked question is gone (PATH C).
   Screenshot: `05_path_d_after_leftover_answered.png`.
