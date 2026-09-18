/**
 * PHASE_17_NEW_LIFE_VISUAL_FEYNMAN_REBUILD_V1 -- visual assets sourced from the Owner's own LINE
 * sticker packs (real photos of the original stamps, uploaded 2026-09-10; archived unmodified at
 * `assets/newlife-stamps-source/`, see that folder's PROVENANCE.md). Every export below is a
 * byte-identical copy of one of those originals (no crop/recolor/text removal applied to the
 * file itself -- any visual cropping done in the UI is CSS `object-fit`/`object-position`
 * framing, not a pixel edit), so each one is classified SOURCE_ORIGINAL_USER_STAMP, not derived.
 *
 * None of these depict any named New Life NPC (Yohei/Miyoko/Jin/Daisuke/etc.) -- per directive
 * Section 2/6, they are used only as neutral, out-of-fiction "companion"/atmosphere beats (day
 * transitions, the 30-day retrospective, the welcome moment), never as a stand-in portrait for a
 * specific resident. `ossanWelcome` reuses an asset already shipped elsewhere in this app
 * (HomeScreen/episodes), for continuity with the game's one other confirmed-real character art.
 */
import ossanWelcome from "../assets/home-welcome-felt.png";
import ossanUnderstood from "../assets/newlife-stamps/ossan-understood.jpeg";
import ossanCheers from "../assets/newlife-stamps/ossan-cheers.jpeg";
import scenicEveningSunset from "../assets/newlife-stamps/scenic-evening-sunset.jpeg";
import memoryNostalgicView from "../assets/newlife-stamps/memory-nostalgic-view.jpeg";
import womanThumbsUp from "../assets/newlife-stamps/woman-thumbs-up.jpeg";

export const STAMP_ASSETS = {
  /** "よろしくお願いします" -- used once, on the arrival/guide screen. */
  ossanWelcome,
  /** "承知しました" -- used once, as a small confirmation beat. */
  ossanUnderstood,
  /** "かんぱい" -- used once, closing the Day 30 retrospective. */
  ossanCheers,
  /** "おつかれさま" over a residential sunset -- used once, on the end-of-day screen. */
  scenicEveningSunset,
  /** "しみじみ" (someone looking back at a framed town scene) -- opens the Day 30 retrospective. */
  memoryNostalgicView,
  /** "了解です" -- reserved for a future small confirmation touch; not wired into any screen yet. */
  womanThumbsUp,
} as const;
