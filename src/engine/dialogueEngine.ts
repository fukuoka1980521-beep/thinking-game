import type { AiCharacterKey, CaseData, DialogueBranch } from "../types/case";
import type { FirstDecisionInput } from "../types/log";

/**
 * Dialogue Engine (Section C/V). For most cases, "dialogue" is still the
 * pre-authored CASE DATA verbatim — there is no generative model anywhere in
 * this app (PERSONALIZED_DIALOGUE Run Section 8: a real free-text-reading
 * LLM call would require a server-side secret and would send player-written
 * text off-device, neither of which safely exists yet; see docs/DECISIONS.md).
 *
 * What *is* new (Section 3/4/5, CASE-001 only): when a case defines
 * `personalizedDialogue`, the AI_INTERVENTION message is composed
 * deterministically from the player's own FIRST_DECISION input — which
 * choice they picked, which info options they flagged, and (verbatim, not
 * interpreted) what they wrote in the reason field — plus one pre-authored
 * challenge fragment selected by `(choiceId, aiCharacter)`. This is real
 * personalization (the output provably varies with real player input) but
 * is NOT natural-language understanding: the reason text is echoed back
 * unparsed, never semantically analyzed. Evaluation Engine never sees any of
 * this — it only ever consumes structured session state (Section 16).
 */

function characterField(character: AiCharacterKey): keyof DialogueBranch {
  switch (character) {
    case "DETECTIVE":
      return "detective";
    case "DEVIL":
      return "devil";
    case "OBSERVER":
      return "observer";
    case "STRATEGIST":
      return "strategist";
  }
}

export function getAiInterventionMessage(caseData: CaseData, first?: FirstDecisionInput): string {
  const config = caseData.personalizedDialogue;
  if (!config || !first) return caseData.aiIntervention;

  const branch = config.branches[first.choiceId];
  if (!branch) return caseData.aiIntervention; // authoring gap safety net, never crash

  const parts: string[] = [];

  const reason = first.reason.trim();
  if (reason) {
    parts.push(`「${reason}」――そう考えたんですね。`);
  }

  const chosenLabel = caseData.availableChoices.find((c) => c.id === first.choiceId)?.label;
  if (chosenLabel) {
    parts.push(`あなたは「${chosenLabel}」を選びましたね。`);
  }

  if (first.infoOptionsSelected.length > 0) {
    const labels = first.infoOptionsSelected
      .map((id) => caseData.infoOptions.find((o) => o.id === id)?.label)
      .filter((l): l is string => Boolean(l));
    if (labels.length > 0) {
      parts.push(`「${labels.join("」「")}」を重要な情報として選んでいました。`);
    }
  }

  parts.push(branch[characterField(caseData.aiCharacter)]);

  return parts.join("\n\n");
}

export function getNewEvidence(caseData: CaseData): string[] {
  return caseData.newFacts;
}
