import { useEffect, useReducer, useRef } from "react";
import type { CaseData } from "./types/case";
import type { InProgressSession, ThinkingLog } from "./types/log";
import { sessionReducer, canGoBack } from "./state/sessionReducer";
import { saveInProgressSession, clearInProgressSession, appendCompletedLog } from "./lib/storage";
import { computeAbilityObservations, buildReflection } from "./lib/reflection";
import { CaseIntroScreen } from "./screens/CaseIntroScreen";
import { FirstDecisionScreen } from "./screens/FirstDecisionScreen";
import { AiInterventionScreen } from "./screens/AiInterventionScreen";
import { NewFactScreen } from "./screens/NewFactScreen";
import { SecondDecisionScreen } from "./screens/SecondDecisionScreen";
import { ReflectionScreen } from "./screens/ReflectionScreen";
import { ResultScreen } from "./screens/ResultScreen";

interface Props {
  caseData: CaseData;
  initialSession: InProgressSession;
  onExitToHome: () => void;
  onViewGrowth: () => void;
  onCompleted: (log: ThinkingLog) => void;
}

export function CaseSession({ caseData, initialSession, onExitToHome, onViewGrowth, onCompleted }: Props) {
  const [session, dispatch] = useReducer(sessionReducer, initialSession);
  const finalizedRef = useRef(false);

  useEffect(() => {
    if (session.screen !== "RESULT") {
      saveInProgressSession(session);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  useEffect(() => {
    if (session.screen === "RESULT" && !finalizedRef.current && session.first && session.intervention && session.second) {
      finalizedRef.current = true;
      const observations = computeAbilityObservations(
        caseData,
        session.first,
        session.intervention,
        session.second,
      );
      const reflection = buildReflection(caseData, observations);
      const log: ThinkingLog = {
        sessionId: session.sessionId,
        caseId: session.caseId,
        timestamp: new Date().toISOString(),
        firstDecision: session.first.choiceId,
        firstReason: session.first.reason,
        firstConfidence: session.first.confidence,
        aiInterventionSeen: true,
        secondDecision: session.second.choiceId,
        secondReason: session.second.reason,
        secondConfidence: session.second.confidence,
        decisionChanged: session.second.choiceId !== session.first.choiceId,
        reflectionNote: session.reflectionNote ?? "",
        reflection,
        abilityObservations: observations,
        completed: true,
      };
      appendCompletedLog(log);
      clearInProgressSession();
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
    case "FIRST_DECISION":
      return (
        <FirstDecisionScreen
          caseData={caseData}
          initial={session.first}
          onBack={showBack ? onBack : onExitToHome}
          onSubmit={(input) => dispatch({ type: "SUBMIT_FIRST_DECISION", input })}
        />
      );
    case "AI_INTERVENTION":
      return (
        <AiInterventionScreen
          caseData={caseData}
          initial={session.intervention}
          onBack={onBack}
          onSubmit={(input) => dispatch({ type: "SUBMIT_INTERVENTION", input })}
        />
      );
    case "NEW_FACT":
      return (
        <NewFactScreen
          caseData={caseData}
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
      if (!session.first || !session.intervention || !session.second) return null;
      const observations = computeAbilityObservations(caseData, session.first, session.intervention, session.second);
      const reflection = buildReflection(caseData, observations);
      return (
        <ResultScreen
          caseData={caseData}
          reflection={reflection}
          onGoHome={onExitToHome}
          onViewGrowth={onViewGrowth}
        />
      );
    }
    default:
      return null;
  }
}
