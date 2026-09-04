/**
 * Hand-authored inline SVG placeholders for CASE1's characters/backgrounds (PHASE 4.3
 * Section10/11). No image-generation tool is available in this environment, so these are
 * simple flat-shape vector stand-ins -- distinct silhouettes and color-coding per
 * CHARACTER_BIBLE_V1.md's motifs, not final illustration. Flagged as a known limitation in the
 * CHECKPOINT report; swapping these for real art later needs no code changes beyond replacing
 * these components' contents (props/usage sites stay the same).
 *
 * OjisanFigure is the one exception (PHASE 4.5 Owner audit): Owner already supplied real
 * transparent-background character art (`ossan-cheerful.png` / `ossan-listening.png`, also used
 * by `src/episodes/steps/*StepView.tsx`), so it renders that art instead of an SVG stand-in.
 * Only these 2 poses exist -- there is no "surprised/alarmed" pose, a gap already noted in
 * StoryStepView's V0.5 asset audit. Callers pick whichever of the 2 reads closest for the beat.
 */
import ossanCheerfulImg from "../assets/ossan-cheerful.png";
import ossanListeningImg from "../assets/ossan-listening.png";

const OJISAN_POSE_IMG = { cheerful: ossanCheerfulImg, listening: ossanListeningImg } as const;

export function OjisanFigure({
  size = 84,
  pose = "cheerful",
}: {
  size?: number;
  pose?: "cheerful" | "listening";
}) {
  return (
    <img
      src={OJISAN_POSE_IMG[pose]}
      alt=""
      aria-hidden="true"
      style={{ width: size, height: "auto", display: "block" }}
    />
  );
}

export function DetectiveFigure({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 84 105" aria-hidden="true">
      <ellipse cx="42" cy="72" rx="24" ry="28" fill="#2a2f3d" />
      <circle cx="42" cy="36" r="20" fill="#f0c9a0" />
      <path d="M18 30 Q42 4 66 30 L66 22 Q42 10 18 22Z" fill="#2a2f3d" />
      <rect x="14" y="24" width="12" height="6" rx="2" fill="#2a2f3d" />
      <circle cx="34" cy="38" r="6" fill="none" stroke="#1b1f2a" strokeWidth="2.2" />
      <circle cx="50" cy="38" r="6" fill="none" stroke="#1b1f2a" strokeWidth="2.2" />
      <circle cx="66" cy="70" r="10" fill="none" stroke="#a15c00" strokeWidth="3" />
      <line x1="73" y1="77" x2="80" y2="84" stroke="#a15c00" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function MinagawaFigure({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 84 105" aria-hidden="true">
      <ellipse cx="42" cy="72" rx="22" ry="26" fill="#f2ead9" />
      <rect x="26" y="60" width="32" height="18" rx="4" fill="#d94f4f" opacity="0.15" />
      <circle cx="42" cy="34" r="19" fill="#f6dcc0" />
      <ellipse cx="20" cy="40" rx="6" ry="14" fill="#3a2e22" />
      <ellipse cx="64" cy="40" rx="6" ry="14" fill="#3a2e22" />
      <path d="M23 24 Q42 12 61 24 Q61 16 42 15 Q23 16 23 24Z" fill="#3a2e22" />
      <circle cx="34" cy="36" r="2.4" fill="#1b1f2a" />
      <circle cx="50" cy="36" r="2.4" fill="#1b1f2a" />
      <path d="M35 45 Q42 49 49 45" fill="none" stroke="#a15c00" strokeWidth="2" strokeLinecap="round" />
      <circle cx="20" cy="30" r="3" fill="#d94f4f" />
    </svg>
  );
}

export function TaishouFigure({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 84 105" aria-hidden="true">
      <ellipse cx="42" cy="72" rx="27" ry="28" fill="#4a7c4e" />
      <rect x="28" y="58" width="28" height="24" rx="3" fill="#e8e2d0" />
      <circle cx="42" cy="34" r="21" fill="#e8b98a" />
      <rect x="18" y="22" width="48" height="8" rx="4" fill="#3a3226" />
      <circle cx="33" cy="37" r="6.5" fill="none" stroke="#3a3226" strokeWidth="2.4" />
      <circle cx="51" cy="37" r="6.5" fill="none" stroke="#3a3226" strokeWidth="2.4" />
      <path d="M30 49 Q42 56 54 49" fill="none" stroke="#3a3226" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function YuukunFigure({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 84 96" aria-hidden="true">
      <ellipse cx="42" cy="66" rx="19" ry="22" fill="#3a6ea5" />
      <rect x="18" y="52" width="10" height="20" rx="4" fill="#d94f4f" />
      <rect x="56" y="52" width="10" height="20" rx="4" fill="#d94f4f" />
      <circle cx="42" cy="32" r="18" fill="#f6dcc0" />
      <path d="M22 26 Q42 4 62 26 L62 30 Q42 16 22 30Z" fill="#f2c94c" />
      <ellipse cx="42" cy="18" rx="21" ry="7" fill="#f2c94c" />
      <circle cx="35" cy="34" r="2.2" fill="#1b1f2a" />
      <circle cx="49" cy="34" r="2.2" fill="#1b1f2a" />
      <circle cx="30" cy="40" r="3" fill="#f6a6a6" opacity="0.7" />
      <circle cx="54" cy="40" r="3" fill="#f6a6a6" opacity="0.7" />
    </svg>
  );
}

export function HomeBackdrop() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMax slice" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} aria-hidden="true">
      <rect width="300" height="220" fill="#eef1f6" />
      <rect x="0" y="150" width="300" height="70" fill="#dfe4ee" />
      <rect x="40" y="60" width="90" height="130" rx="4" fill="#f4efe0" stroke="#d8cfb4" strokeWidth="2" />
      <rect x="60" y="140" width="14" height="18" rx="2" fill="#8a6a45" />
      <rect x="170" y="90" width="60" height="60" rx="4" fill="#c9553a" opacity="0.85" />
      <rect x="170" y="90" width="60" height="60" rx="4" fill="none" stroke="#9c3f2a" strokeWidth="2" />
      <rect x="192" y="108" width="16" height="24" rx="2" fill="#e8dcc4" />
    </svg>
  );
}

export function TownBackdrop() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMax slice" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} aria-hidden="true">
      <rect width="300" height="220" fill="#f6f0e2" />
      <rect x="0" y="160" width="300" height="60" fill="#e2d6b8" />
      <rect x="20" y="70" width="110" height="100" rx="4" fill="#f2ead9" stroke="#d8b979" strokeWidth="2" />
      <rect x="20" y="70" width="110" height="22" fill="#d9a441" />
      <rect x="170" y="80" width="110" height="90" rx="4" fill="#e6efdd" stroke="#7fae6e" strokeWidth="2" />
      <rect x="170" y="80" width="110" height="20" fill="#4a7c4e" />
      <circle cx="195" cy="130" r="10" fill="#c9553a" />
      <circle cx="215" cy="135" r="8" fill="#e0973a" />
      <circle cx="235" cy="128" r="9" fill="#7fae6e" />
    </svg>
  );
}

export function ParkBackdrop() {
  return (
    <svg viewBox="0 0 300 220" preserveAspectRatio="xMidYMax slice" style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} aria-hidden="true">
      <rect width="300" height="220" fill="#eaf3ec" />
      <rect x="0" y="170" width="300" height="50" fill="#cfe4c9" />
      <circle cx="60" cy="90" r="42" fill="#7fae6e" />
      <rect x="54" y="120" width="12" height="50" fill="#8a6a45" />
      <circle cx="250" cy="70" r="34" fill="#8fbd7f" />
      <rect x="244" y="98" width="10" height="40" fill="#8a6a45" />
      <rect x="140" y="150" width="70" height="10" rx="3" fill="#a9805a" />
      <rect x="146" y="160" width="8" height="16" fill="#7a5f42" />
      <rect x="196" y="160" width="8" height="16" fill="#7a5f42" />
    </svg>
  );
}

export function BikeFigure({ size = 90, variant = "other" }: { size?: number; variant?: "own" | "other" }) {
  const frame = variant === "own" ? "#3a6ea5" : "#c9553a";
  return (
    <svg width={size} height={size * 0.75} viewBox="0 0 100 75" aria-hidden="true">
      <circle cx="24" cy="56" r="16" fill="none" stroke="#3a3226" strokeWidth="4" />
      <circle cx="76" cy="56" r="16" fill="none" stroke="#3a3226" strokeWidth="4" />
      <path d="M24 56 L46 30 L60 30 L76 56" fill="none" stroke={frame} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M46 30 L38 56" stroke={frame} strokeWidth="4" strokeLinecap="round" />
      <path d="M60 30 L52 18" stroke={frame} strokeWidth="4" strokeLinecap="round" />
      <rect x="16" y="24" width="16" height="10" rx="3" fill="#e8dcc4" stroke="#a9805a" strokeWidth="2" />
      {variant === "other" && <circle cx="24" cy="29" r="3" fill="#f2c94c" />}
    </svg>
  );
}

export function BookVisual() {
  return (
    <svg width={70} height={54} viewBox="0 0 70 54" aria-hidden="true">
      <rect x="4" y="4" width="62" height="46" rx="3" fill="#e0973a" stroke="#a9642a" strokeWidth="2" />
      <rect x="10" y="10" width="50" height="8" rx="2" fill="#fff5e4" />
      <rect x="4" y="4" width="18" height="46" fill="#fff5e4" opacity="0.5" />
      <rect x="46" y="30" width="16" height="10" rx="1" fill="#3a6ea5" />
    </svg>
  );
}

export function StickerVisual() {
  return (
    <svg width={40} height={40} viewBox="0 0 40 40" aria-hidden="true">
      <path
        d="M20 2 L24 15 L38 15 L27 23 L31 37 L20 28 L9 37 L13 23 L2 15 L16 15 Z"
        fill="#f2c94c"
        stroke="#d9a441"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function ShopkeeperFigure({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size * 1.25} viewBox="0 0 84 105" aria-hidden="true">
      <ellipse cx="42" cy="72" rx="25" ry="27" fill="#3a6ea5" />
      <rect x="26" y="58" width="32" height="22" rx="3" fill="#dbe6f0" />
      <circle cx="42" cy="34" r="20" fill="#e8b98a" />
      <path d="M22 28 Q42 8 62 28 Q62 20 42 18 Q22 20 22 28Z" fill="#4a4a4a" />
      <circle cx="33" cy="37" r="6" fill="none" stroke="#3a3226" strokeWidth="2.2" />
      <circle cx="51" cy="37" r="6" fill="none" stroke="#3a3226" strokeWidth="2.2" />
      <rect x="60" y="68" width="14" height="5" rx="2" fill="#7a7a7a" transform="rotate(30 60 68)" />
    </svg>
  );
}

export function ParentChildFigure({ size = 90 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 130 105" aria-hidden="true">
      <ellipse cx="42" cy="72" rx="24" ry="28" fill="#8a5a9c" />
      <circle cx="42" cy="34" r="20" fill="#f0c9a0" />
      <path d="M22 30 Q42 10 62 30 Q62 18 42 16 Q22 18 22 30Z" fill="#3a2e22" />
      <circle cx="34" cy="37" r="2.2" fill="#1b1f2a" />
      <circle cx="50" cy="37" r="2.2" fill="#1b1f2a" />
      <ellipse cx="98" cy="82" rx="16" ry="18" fill="#e0973a" />
      <circle cx="98" cy="56" r="14" fill="#f6dcc0" />
      <path d="M85 52 Q98 38 111 52 Q111 44 98 43 Q85 44 85 52Z" fill="#2e2418" />
      <circle cx="93" cy="58" r="1.8" fill="#1b1f2a" />
      <circle cx="103" cy="58" r="1.8" fill="#1b1f2a" />
    </svg>
  );
}

export function NoticeboardVisual() {
  return (
    <svg width={70} height={56} viewBox="0 0 70 56" aria-hidden="true">
      <rect x="6" y="4" width="58" height="40" rx="2" fill="#e8dcc4" stroke="#a9805a" strokeWidth="2" />
      <rect x="12" y="10" width="46" height="8" fill="#fff" opacity="0.8" />
      <rect x="12" y="22" width="30" height="6" fill="#fff" opacity="0.6" />
      <rect x="30" y="44" width="10" height="10" fill="#a9805a" />
    </svg>
  );
}

export function NoteVisual() {
  return (
    <div
      style={{
        background: "#fbf7ec",
        border: "1px solid #e6dcc2",
        borderRadius: 8,
        padding: 16,
        textAlign: "center",
        fontFamily: "cursive",
        fontSize: 20,
        color: "#2b2620",
      }}
    >
      ありがとうございました
    </div>
  );
}
