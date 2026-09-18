/**
 * PHASE_17_NEW_LIFE_VISUAL_FEYNMAN_REBUILD_V1 (STAGE A, both the original pack and the
 * USER STAMP SOURCE EXPANSION addendum) -- visual assets sourced from the Owner's own LINE sticker
 * packs. Pack 1 (`assets/newlife-stamps-source/`, uploaded 2026-09-10) and pack 2
 * (`assets/newlife-stamps-source-v2/`, uploaded 2026-09-19) are both real, hash-verified uploads --
 * see each folder's own PROVENANCE.md / PROVENANCE_ORIGINAL.md, and
 * `docs/product/NEWLIFE_STAMP_ASSET_AUDIT_V1.md` / `NEWLIFE_STAMP_ASSET_AUDIT_V2.md` for the full
 * classification. Every export below is a byte-identical copy of one of those originals (no
 * crop/recolor/text removal applied to the file itself -- any visual cropping done in the UI is
 * CSS `object-fit`/`object-position` framing, not a pixel edit), so each one is classified
 * SOURCE_ORIGINAL_USER_STAMP, not derived.
 *
 * None of these depict any named New Life NPC (Yohei/Miyoko/Jin/Daisuke/etc.) -- per directive
 * Section 2/6 (and the addendum's A4), they are used only as neutral, out-of-fiction
 * "companion"/atmosphere beats (day transitions, the 30-day retrospective, the welcome moment),
 * never as a stand-in portrait for a specific resident. `ossanWelcome`/`duoWelcome` reuse or match
 * an asset already shipped elsewhere in this app (HomeScreen/episodes), for continuity with the
 * game's other confirmed-real character art.
 *
 * Three distinct real characters exist across both packs -- referred to here only by a neutral
 * descriptive name, never a guessed NPC identity: "ossan" (the already-shipped older man),
 * "wavyWoman" (long wavy hair, tan/navy fleece jacket), and "bunWoman" (hair in a bun, red/grey
 * sweater, new in pack 2).
 */
import ossanWelcome from "../assets/home-welcome-felt.png";
import ossanUnderstood from "../assets/newlife-stamps/ossan-understood.jpeg";
import ossanCheers from "../assets/newlife-stamps/ossan-cheers.jpeg";
import ossanOtsukaresama2 from "../assets/newlife-stamps/ossan-otsukaresama-2.jpeg";
import scenicEveningSunset from "../assets/newlife-stamps/scenic-evening-sunset.jpeg";
import memoryNostalgicView from "../assets/newlife-stamps/memory-nostalgic-view.jpeg";
import wavyWomanThumbsUp from "../assets/newlife-stamps/woman-thumbs-up.jpeg";
import wavyWomanStopHand from "../assets/newlife-stamps/woman-stop-hand.jpeg";
import wavyWomanLookingCloser from "../assets/newlife-stamps/wavywoman-looking-closer.jpeg";
import bunWomanThumbsUp from "../assets/newlife-stamps/bunwoman-thumbs-up.jpeg";
import bunWomanBreak from "../assets/newlife-stamps/bunwoman-break.jpeg";
import duoWelcome from "../assets/newlife-stamps/duo-welcome.png";

export const STAMP_ASSETS = {
  /** "よろしくお願いします" -- ossan alone; superseded on-screen by `duoWelcome`, kept for reference. */
  ossanWelcome,
  /** "よろしくお願いします" -- ossan + bunWoman together -- used once, on the arrival/guide screen. */
  duoWelcome,
  /** "承知しました" -- used once, as a small confirmation beat. */
  ossanUnderstood,
  /** "かんぱい" -- used once, closing the Day 30 retrospective. */
  ossanCheers,
  /** "おつかれさま" (arms crossed) -- a second ossan expression of the same phrase; not wired in yet. */
  ossanOtsukaresama2,
  /** "おつかれさま" over a residential sunset -- used once, on the end-of-day screen. */
  scenicEveningSunset,
  /** "しみじみ" (someone looking back at a framed town scene) -- opens the Day 30 retrospective. */
  memoryNostalgicView,
  /** "了解です" (wavyWoman) -- reserved; not wired into a screen yet. */
  wavyWomanThumbsUp,
  /** stop-hand refusal (wavyWoman) -- reserved; not wired into a screen yet. */
  wavyWomanStopHand,
  /** "目先に捉われ過ぎ" (wavyWoman, magnifying glass) -- reviewed for Reality Bridge, deliberately not
   *  placed (tonally mismatched next to a genuine personal concern -- see visual-language doc). */
  wavyWomanLookingCloser,
  /** "了解です" (bunWoman) -- reserved; not wired into a screen yet. */
  bunWomanThumbsUp,
  /** "ちょっと休憩" (bunWoman, face mask) -- reviewed for ActivitySession, deliberately not placed
   *  (that component is shared by every activity type, not just resting -- see visual-language doc). */
  bunWomanBreak,
} as const;
