import type { AiTrapType } from "../types/case";

/**
 * SPEC AMENDMENT Section D: the in-game selector exposes a practical subset
 * of the full AiTrapType taxonomy (see types/case.ts) — the categories a
 * novice can reasonably tell apart. CONFIRMATION / OVERCONFIDENCE / SYCOPHANCY
 * remain available for case authors to use as ground truth, but are not
 * offered as selectable options yet (see docs/AI_TRAP_TAXONOMY.md).
 *
 * COMPREHENSION_FIX Run Section A: labels below are player-facing plain
 * Japanese, not the internal taxonomy jargon. `id` (the AiTrapType enum
 * value used by schema/logging/evaluation) is unchanged -- only `label`
 * changed. Each wording was checked against docs/AI_TRAP_TAXONOMY.md's
 * official definition; MISSING_INFORMATION's owner-suggested "まだ分からな
 * いことがある" was corrected to "まだ確認していないことがある" because the
 * definition is about ignoring an available, checkable fact (an oversight),
 * not general unknowability -- the original wording was indistinguishable
 * from plain uncertainty and would have blurred it with PLAUSIBLE_BUT_UNSUPPORTED.
 */
export const AI_TRAP_TAXONOMY_OPTIONS: { id: AiTrapType; label: string }[] = [
  { id: "PLAUSIBLE_BUT_UNSUPPORTED", label: "そう言える材料が足りない" },
  { id: "CAUSALITY_ERROR", label: "原因だと決めるのは早い" },
  { id: "SMALL_SAMPLE", label: "少ない例だけで決めている" },
  { id: "INTENT_ASSUMPTION", label: "相手の気持ちを決めつけている" },
  { id: "OVERGENERALIZATION", label: "一部のことを全体に広げすぎている" },
  { id: "MISSING_INFORMATION", label: "まだ確認していないことがある" },
  { id: "NONE", label: "特に気になるところはない" },
];

/**
 * COMPREHENSION_FIX Run Section B: optional one-line concrete example per
 * option, shown only behind a "？" toggle the player opts into (AiInterventionScreen).
 * Never shown by default -- the goal is UI-alone clarity first, this is a
 * fallback for anyone still unsure, not a required read.
 */
export const AI_TRAP_TAXONOMY_HELP: Record<AiTrapType, string> = {
  PLAUSIBLE_BUT_UNSUPPORTED: "例：「きっと平気だよ」と言うだけで、そう言える理由が示されていない。",
  CAUSALITY_ERROR: "例：既読が減った＝仲が悪くなった、と決めているが、他の理由があるかもしれない。",
  SMALL_SAMPLE: "例：1回だけ返信が遅かったことから、いつもそうだと判断している。",
  INTENT_ASSUMPTION: "例：本人に確かめていないのに、「怒っている」と決めつけている。",
  OVERGENERALIZATION: "例：一つの出来事だけで、「みんなそう思っている」と話を広げている。",
  MISSING_INFORMATION: "例：本人に直接聞けば分かることを、確認しないまま話している。",
  NONE: "例：この意見に、無理な決めつけは特に見当たらない。",
  CONFIRMATION: "例：自分の考えに都合のいい情報しか見ていない。",
  OVERCONFIDENCE: "例：まだ確かめていないことを、確定した話のように言っている。",
  SYCOPHANCY: "例：根拠よりも、相手が聞きたそうな方に合わせている。",
};
