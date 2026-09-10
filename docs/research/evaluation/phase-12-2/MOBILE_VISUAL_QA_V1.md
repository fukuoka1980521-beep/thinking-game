# Mobile Visual QA V1 — PHASE 12.2

Directive Section 19/21. Real Playwright run at `devices["iPhone 13"]` (390×844 logical px,
matching real smartphone-portrait dimensions) against a live `npx vite --port 5230` dev server.
Script: `mobile_visual_qa_script.mjs`. Evidence: `mobile_visual_qa_evidence.json`. One real live
Vertex call included (frozen pipeline, unmodified).

## Required screenshots — all captured (directive Section 21)

| # | Screenshot | What it shows |
|---|---|---|
| 1 | `00_opening.png` | Opening scene, no horizontal scroll |
| 2 | `01_first_map.png` | First map view — 5 spatially-positioned location markers |
| 3 | `02_yohei_location.png` | Yohei's location: portrait + name + activity, before conversation |
| 4 | `03_miyoko_location.png` | Miyoko's location: same |
| 5 | `04_jin_location.png` | Jin's real, state-derived location (co-located with Yohei at this world-tick — honest, not staged; see note below) |
| 6 | `05_conversation_before_send.png` | Conversation opened, no message sent yet |
| 7 | `06_conversation_waiting_for_live_ai.png` | Real live Vertex call in flight — pulsing-dots waiting bubble, environment still visible |
| 8 | `07_conversation_after_response.png` | Real live response rendered |
| 9 | `08_persistent_consequence.png` | Natural-language consequence note after a commit |
| 10 | `09_returned_changed_map.png` | Returned to map after the encounter |

## Mechanical checks — 11/11 PASS

Opening: no horizontal scroll. Map: marker tap target ≥ 40px. Yohei/Miyoko/Jin locations: portrait
slots present. Conversation: input present, no chatbot-log appearance. Waiting state: a genuine
waiting indicator (not a spinner/model-name string) shown during the real live call. Real live
response rendered with non-empty text. Persistent consequence: natural-language, not a raw id.
Returned to map view. No classification/model/prompt text anywhere on the primary surface across
the entire run. Full log: `mobile_visual_qa_evidence.json` (`allPass: true`).

## Human-eye visual inspection (not selector-only, directive's explicit requirement)

Reviewed `01_first_map.png` and `06_conversation_waiting_for_live_ai.png` directly:

- The map reads clearly as 5 distinct places positioned around a central hub, with the current
  location visually distinguished — even with placeholder square markers, "this is a town, I am
  moving between places" is legible, which is the property directive Section 4 actually asks for.
- The conversation screen, after the mobile-scroll fix (see `CONVERSATION_PRODUCT_UI_V1.md`), fits
  entirely within one mobile viewport with no scrolling: portrait, name, waiting bubble, input,
  send button, and "地図に戻る" are all visible at once.

## Honest note: Jin's location screenshot

Directive Section 21 lists "Yohei location," "Miyoko location," and "Jin location" as three
screenshots. Jin's canon-real behavior (`NPC_INDEPENDENCE_EVIDENCE_V1.md`, PHASE 12.1) means his
presence always overlaps with either Yohei's or Miyoko's own location at any given world-tick — he
never occupies a third, distinct location in this slice's current implementation. The captured
`04_jin_location.png` is therefore the SAME real screen as `02_yohei_location.png` (both NPCs
genuinely present together at that tick) — reported honestly rather than staging an artificial
separate scene that wouldn't reflect real behavior.

## Other mobile QA items checked (directive Section 19's list)

- **Opening text density**: 3 short lines with explicit breaks, not a dense paragraph.
- **Map labels**: HTML overlays, legible at mobile width.
- **Tap targets**: map markers and travel/talk buttons all comfortably tappable (verified ≥40px
  markers directly; buttons use normal padding, no dedicated measurement beyond visual review).
- **Character crop**: not yet applicable — portraits are placeholder boxes at their final slot
  dimensions (`NPC_VISUAL_PRESENTATION_V1.md`), so crop behavior cannot be meaningfully judged
  until real art is installed; the SLOT itself was confirmed to render at spec size.
- **Dialogue readability**: speech-bubble sizing/line-length reads comfortably on a 390px-wide
  viewport in the reviewed screenshots.
- **Keyboard/input behavior**: not deeply tested (Playwright's `fill`/`type` bypass the real mobile
  on-screen-keyboard-appears/viewport-resizes behavior) — flagged as an open item, not claimed as
  verified.
- **Send button**: present, disables while pending (verified mechanically in
  `tests/newlifeBgw121VisualProduct.test.tsx`).
- **Return-to-map action**: present and functional (`08`/`09` screenshots).
- **Generation waiting state**: captured live, see above.

## Verdict

**MOBILE VISUAL: PASS for layout/legibility with current placeholders.** Real on-device keyboard
behavior remains unverified (Playwright limitation, not a known defect) — carried as an open item.
