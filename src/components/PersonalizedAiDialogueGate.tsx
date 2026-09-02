import { useEffect, useState } from "react";
import type { CaseData } from "../types/case";
import type { AiActionInput, AiMessageSource, FirstDecisionInput } from "../types/log";
import { getAiInterventionMessage } from "../engine/dialogueEngine";
import { performDialogueFetch, DIALOGUE_ENDPOINT_URL } from "../lib/aiDialogueClient";
import { getAiDialogueConsent, setAiDialogueConsent } from "../lib/aiDialogueConsent";
import { AiDialogueConsentScreen } from "../screens/AiDialogueConsentScreen";
import { ScreenContainer } from "../components/ScreenContainer";
import { AiInterventionScreen } from "../screens/AiInterventionScreen";

interface Props {
  caseData: CaseData;
  first: FirstDecisionInput;
  initial?: AiActionInput;
  onBack: () => void;
  onSubmit: (input: AiActionInput) => void;
  /** Fired once the message to display is resolved, so CaseSession can log accurately at RESULT time (Section 26). */
  onMessageResolved: (message: string, source: AiMessageSource) => void;
}

type GateState =
  | { phase: "need_consent" }
  | { phase: "loading" }
  | { phase: "failed"; reason: string }
  | { phase: "ready"; message: string; source: AiMessageSource };

function fallbackMessage(caseData: CaseData, first: FirstDecisionInput): string {
  return getAiInterventionMessage(caseData, first);
}

/**
 * REAL_AI_DIALOGUE Run: sits in front of AiInterventionScreen for cases with
 * `personalizedDialogue` configured, orchestrating consent -> real-AI call
 * -> success/failure, while leaving AiInterventionScreen itself (and every
 * case without `personalizedDialogue`) completely unchanged.
 */
export function PersonalizedAiDialogueGate({ caseData, first, initial, onBack, onSubmit, onMessageResolved }: Props) {
  const [state, setState] = useState<GateState>(() => {
    // No live endpoint yet (Section 12/28: deployment is pending Owner
    // billing setup, see docs/DECISIONS.md) -- there is nothing to ask
    // consent for, and nothing to attempt. Go straight to the same local
    // fallback dialogue every player already sees, silently, with no
    // consent screen and no doomed network call.
    if (!DIALOGUE_ENDPOINT_URL) {
      return { phase: "ready", message: fallbackMessage(caseData, first), source: "personalized_fallback" };
    }
    const consent = getAiDialogueConsent();
    if (consent === "declined") {
      return { phase: "ready", message: fallbackMessage(caseData, first), source: "personalized_fallback" };
    }
    if (consent === "accepted") {
      return { phase: "loading" };
    }
    return { phase: "need_consent" };
  });

  async function attemptRealAi() {
    setState({ phase: "loading" });
    // Calls performDialogueFetch directly against the imported
    // DIALOGUE_ENDPOINT_URL (rather than the requestAiDialogue wrapper,
    // whose own internal empty-URL guard closes over the *unmocked*
    // module's constant and so cannot be exercised via a mocked import).
    const result = await performDialogueFetch(DIALOGUE_ENDPOINT_URL, {
      situation: caseData.initialSituation,
      question: caseData.initialQuestion,
      choiceLabels: caseData.availableChoices.map((c) => c.label),
      choiceLabel: caseData.availableChoices.find((c) => c.id === first.choiceId)?.label ?? "",
      confidence: first.confidence,
      reason: first.reason,
      selectedInfoLabels: first.infoOptionsSelected
        .map((id) => caseData.infoOptions.find((o) => o.id === id)?.label)
        .filter((l): l is string => Boolean(l)),
      character: caseData.aiCharacter,
    });

    if (result.ok) {
      setState({ phase: "ready", message: result.message, source: "real_ai" });
    } else {
      setState({ phase: "failed", reason: result.reason });
    }
  }

  useEffect(() => {
    if (state.phase === "loading") {
      attemptRealAi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase === "loading"]);

  useEffect(() => {
    if (state.phase === "ready") {
      onMessageResolved(state.message, state.source);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.phase === "ready" ? state.message : null]);

  if (state.phase === "need_consent") {
    return (
      <AiDialogueConsentScreen
        onAccept={() => {
          setAiDialogueConsent("accepted");
          setState({ phase: "loading" });
        }}
        onDecline={() => {
          setAiDialogueConsent("declined");
          setState({ phase: "ready", message: fallbackMessage(caseData, first), source: "personalized_fallback" });
        }}
      />
    );
  }

  if (state.phase === "loading") {
    return (
      <ScreenContainer title="AIの意見" onBack={onBack}>
        <p className="muted">あなたの考えを整理しています…</p>
      </ScreenContainer>
    );
  }

  if (state.phase === "failed") {
    return (
      <ScreenContainer title="AIの意見" onBack={onBack}>
        <p className="muted">AIとの通信がうまくいきませんでした。</p>
        <div className="spacer" />
        <button type="button" className="btn btn-primary" onClick={attemptRealAi}>
          もう一度試す
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() =>
            setState({ phase: "ready", message: fallbackMessage(caseData, first), source: "personalized_fallback" })
          }
        >
          AIなしで続ける
        </button>
      </ScreenContainer>
    );
  }

  return (
    <AiInterventionScreen
      caseData={caseData}
      message={state.message}
      initial={initial}
      onBack={onBack}
      onSubmit={onSubmit}
      simplified={caseData.simplifiedFlow}
    />
  );
}
