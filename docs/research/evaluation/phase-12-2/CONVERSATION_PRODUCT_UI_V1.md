# Conversation Product UI V1 — PHASE 12.2

Directive Section 11. Free text preserved unchanged (no return to fixed buttons) — only its visual
presentation changed.

## Required elements (directive Section 11 checklist)

| Required element | Implementation |
|---|---|
| Character visual | `.bgw-conversation-header` shows the NPC's portrait slot + name, persistently visible above the log while talking |
| NPC speech | `.bgw-line-npc` — a left-aligned speech-bubble-styled element, distinct background/shape from the player's own lines |
| PLAYER free-text field | `.bgw-free-text-input`, unchanged underlying `<input>`/state wiring from PHASE 12.1 |
| Minimal send control | A single round icon button (`.bgw-send-button`, "送"), not a labeled "Send Message" chatbot-style control |
| Leave/return control | `.bgw-leave-button` ("地図に戻る"), always available while a conversation is open |

## Avoiding the "chatbot inside a game" appearance

- Player and NPC lines are rendered as two visually distinct, colored/shaped speech bubbles
  (`.bgw-line-player` right-aligned dark, `.bgw-line-npc` left-aligned light), not a uniform
  monospace/log-style transcript.
- No message avatars-in-a-row, no timestamps, no "typing..." attribution text, no send/receive
  ticks — none of the visual grammar of a messaging app.
- The character's own portrait stays visible throughout (`.bgw-conversation-header`), keeping the
  frame "a person you're looking at" rather than "a text stream with no one in it."
- The input placeholder is character-specific ("洋平に話しかける"), not a generic "Type a
  message..." placeholder.

## What was deliberately left as PHASE 12.1's unchanged behavior

- The underlying free-text submission flow (`buildNpcDialoguePacket` → adapter → `validateEnvelope`
  → optional `commitConsequence`) is byte-for-byte the same call sequence as PHASE 12.1 — this
  document covers presentation only, per directive Section 1's freeze.
- Multiple NPCs at one location can each be talked to independently (unchanged) — the new visual
  layer only changes how each one's own conversation panel looks once opened.

## Mobile scroll fix made this phase (a real, small UX correction, not scope creep)

Initial mobile QA found the stacked map + location + conversation sections together produced a
tall page requiring scrolling to see an open conversation fully. Fixed by conditionally hiding the
map and the pre-conversation location/"who's here" panel while a conversation is open — the
conversation surface alone now fits within a single mobile screen with no scrolling
(`screenshots/06_conversation_waiting_for_live_ai.png`, captured after the fix, confirms this).
This is a presentation-only visibility change (`{!activeNpc && (...)}`), not a change to what data
exists or how it is computed.
