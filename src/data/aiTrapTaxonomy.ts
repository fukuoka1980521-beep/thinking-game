import type { AiTrapType } from "../types/case";

/**
 * SPEC AMENDMENT Section D: the in-game selector exposes a practical subset
 * of the full AiTrapType taxonomy (see types/case.ts) — the categories a
 * novice can reasonably tell apart. CONFIRMATION / OVERCONFIDENCE / SYCOPHANCY
 * remain available for case authors to use as ground truth, but are not
 * offered as selectable options yet (see docs/AI_TRAP_TAXONOMY.md).
 */
export const AI_TRAP_TAXONOMY_OPTIONS: { id: AiTrapType; label: string }[] = [
  { id: "PLAUSIBLE_BUT_UNSUPPORTED", label: "根拠不足" },
  { id: "CAUSALITY_ERROR", label: "因果関係の混同" },
  { id: "SMALL_SAMPLE", label: "標本不足" },
  { id: "INTENT_ASSUMPTION", label: "意図の決めつけ" },
  { id: "OVERGENERALIZATION", label: "過度な一般化" },
  { id: "MISSING_INFORMATION", label: "情報不足" },
  { id: "NONE", label: "問題なし" },
];
