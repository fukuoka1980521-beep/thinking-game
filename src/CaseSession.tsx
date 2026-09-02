import { useEffect, useReducer, useRef } from "react";
import type { CaseData } from "./types/case";
import type { InProgressSession, TrajectoryLog } from "./types/log";
import { sessionReducer, canGoBack } from "./state/sessionReducer";
import { saveInProgressSession } from "./lib/storage";
import { computeAbilityObservations, computeRubricResult, buildReflection } from "./engine/evaluationEngine";
import { finalizeTrajectory } from "./engine/playerActionLogger";
import { getAiInterventionMessage, getNewEvidence } from "./engine/dialogueEngine";
import { CaseIntroScreen } from "./screens/CaseIntroScreen";
import { ObservedFactScreen } from "./screens/ObservedFactScreen";
import { FirstDecisionScreen } from "./screens/FirstDecisionScreen";
import { AiInterventionScreen } from "./screens/AiInterventionScreen";
import { PersonalizedAiDialogueGate } from "./components/PersonalizedAiDialogueGate";
import { NewFactScreen } from "./screens/NewFactScreen";
import { SecondDecisionScreen } from "./screens/SecondDecisionScreen";
import { ReflectionScreen } from "./screens/ReflectionScreen";
import { ResultScreen } from "./screens/ResultScreen";

interface Props {
  caseData: CaseData;
  initialSession: InProgressSession;
  onExitToHome: () => void;
  onViewGrowth: () => void;
  onNextCase: () => void;
  onCompleted: (log: TrajectoryLog) => void;
}

export function CaseSession({
  caseData,
  initialSession,
  onExitToHome,
  onViewGrowth,
  onNextCase,
  onCompleted,
}: Props) {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (session.screen !== "RESULT") {
      saveInProgressSession(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (
      session.screen === "RESULT" &&
      !finalizedRef.current &&
      session.observedFact &&
      session.first &&
      session.aiAction &&
      session.second
    ) {
      finalizedRef.current = true;
      const rubricResult = computeRubricResult(
        caseData,
        session.observedFact,
        session.first,
        session.aiAction,
        session.second,
      );
      const shownMessage = session.shownAiMessage ?? getAiInterventionMessage(caseData, session.first);
      const messageSource = session.aiMessageSource ?? (caseData.personalizedDialogue ? "personalized_fallback" : "static");
      const log = finalizeTrajectory(caseData, session, rubricResult, shownMessage, messageSource);
      onCompleted(log);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.screen]);

  const onBack = () => dispatch({ type: "GO_BACK" });
  const showBack = canGoBack(session.screen);

  switch (session.screen) {
    case "CASE_INTRO":
      return (
        <CaseIntroScreen
          caseData={caseData}
          onStart={() => dispatch({ type: "ADVANCE_FROM_INTRO" })}
          onExit={onExitToHome}
        />
      );
    case "OBSERVED_FACT":
      return (
        <ObservedFactScreen
          caseData={caseData}
          initial={session.observedFact}
          onBack={showBack ? onBack : onExitToHome}
          onSubmit={(input) => dispatch({ type: "SUBMIT_OBSERVED_FACT", input })}
        />
      );
    case "FIRST_DECISION":
      return (
        <FirstDecisionScreen
          caseData={caseData}
          initial={session.first}
          onBack={onBack}
          onSubmit={(input) => dispatch({ type: "SUBMIT_FIRST_DECISION", input })}
        />
      );
    case "AI_INTERVENTION":
      if (caseData.personalizedDialogue && session.first) {
        return (
          <PersonalizedAiDialogueGate
            caseData={caseData}
            first={session.first}
            initial={session.aiAction}
            onBack={onBack}
            onSubmit={(input) => dispatch({ type: "SUBMIT_AI_ACTION", input })}
            onMessageResolved={(message, source) => dispatch({ type: "SET_SHOWN_AI_MESSAGE", message, source })}
          />
        );
      }
      return (
        <AiInterventionScreen
          caseData={caseData}
          message={getAiInterventionMessage(caseData)}
          initial={session.aiAction}
          onBack={onBack}
          onSubmit={(input) => dispatch({ type: "SUBMIT_AI_ACTION", input })}
        />
      );
    case "NEW_FACT":
      return (
        <NewFactScreen
          newEvidence={getNewEvidence(caseData)}
          onBack={onBack}
          onNext={() => dispatch({ type: "ADVANCE_FROM_NEW_FACT" })}
        />
      );
    case "SECOND_DECISION":
      return (
        <SecondDecisionScreen
          caseData={caseData}
          initial={session.second}
          onBack={onBack}
          onSubmit={(input) => dispatch({ type: "SUBMIT_SECOND_DECISION", input })}
        />
      );
    case "REFLECTION":
      if (!session.first || !session.second) return null;
      return (
        <ReflectionScreen
          first={session.first}
          second={session.second}
          initialNote={session.reflectionNote}
          onBack={onBack}
          onSubmit={(note) => dispatch({ type: "SUBMIT_REFLECTION", note })}
        />
      );
    case "RESULT": {
      if (!session.observedFact || !session.first || !session.aiAction || !session.second) return null;
      const rubricResult = computeRubricResult(
        caseData,
        session.observedFact,
        session.first,
        session.aiAction,
        session.second,
      );
      const observations = computeAbilityObservations(session.first, session.second, rubricResult);
      const reflection = buildReflection(caseData, observations, rubricResult);
      return (
        <ResultScreen
          caseData={caseData}
          first={session.first}
          second={session.second}
          reflection={reflection}
          onNextCase={onNextCase}
          onGoHome={onExitToHome}
          onViewGrowth={onViewGrowth}
        />
      );
    }
    default:
      return null;
  }
}
