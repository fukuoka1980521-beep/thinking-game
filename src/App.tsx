import { useEffect, useState } from "react";
import "./styles/global.css";
import { CASES, getCaseById, getTodaysCaseId } from "./data/cases";
import { HomeScreen } from "./screens/HomeScreen";
import { CaseSelectScreen } from "./screens/CaseSelectScreen";
import { GrowthScreen } from "./screens/GrowthScreen";
import { SessionSummaryScreen } from "./screens/SessionSummaryScreen";
import { UserTestScreen } from "./screens/UserTestScreen";
import { UserTestThanksScreen } from "./screens/UserTestThanksScreen";
import { CaseSession } from "./CaseSession";
import {
  loadInProgressSession,
  loadCompletedLogs,
  createSessionId,
  createPlayRunId,
} from "./lib/storage";
import { recordMetricEvent } from "./lib/metrics";
import { saveUserTestResponse } from "./lib/userTestResponses";
import { computeSessionSummary } from "./engine/sessionSummary";
import type { InProgressSession, TrajectoryLog, UserTestResponse } from "./types/log";

type View =
  | { kind: "HOME" }
  | { kind: "CASE_SELECT" }
  | { kind: "GROWTH" }
  | { kind: "SESSION" }
  | { kind: "SESSION_SUMMARY" }
  | { kind: "USER_TEST" }
  | { kind: "USER_TEST_THANKS" };

// Section 7: after roughly this many cases in one sitting, offer the play-run summary.
const SESSION_SUMMARY_THRESHOLD = 5;

export default function App() {
  const [view, setView] = useState<View>({ kind: "HOME" });
  // The persisted in-progress session, used only to drive Home's "resume" button
  // and to seed a resumed session. Not touched while a session is actively playing.
  const [homeInProgress, setHomeInProgress] = useState<InProgressSession | null>(null);
  // The session currently mounted in SESSION view. Stays set (so RESULT can render)
  // even after the session finishes and homeInProgress is cleared.
  const [activeSession, setActiveSession] = useState<InProgressSession | null>(null);
  const [logs, setLogs] = useState<TrajectoryLog[]>([]);
  // Groups cases played back-to-back via "次の問題へ" into one play run (Section 5/7).
  // Ends (becomes null) whenever the player returns to Home, by any path.
  const [playRunId, setPlayRunId] = useState<string | null>(null);
  const [lastUserTestResponse, setLastUserTestResponse] = useState<UserTestResponse | null>(null);

  useEffect(() => {
    const inProgress = loadInProgressSession();
    setHomeInProgress(inProgress);
    setPlayRunId(inProgress?.playRunId ?? null);
    setLogs(loadCompletedLogs());
  }, []);

  function startCase(caseId: string, opts: { reuseRunId?: string } = {}) {
    if (!opts.reuseRunId && homeInProgress && homeInProgress.caseId !== caseId) {
      const confirmed = window.confirm(
        "進行中のケースがあります。新しいケースを始めると、進行中の内容は失われます。続けますか？",
      );
      if (!confirmed) return;
    }
    const runId = opts.reuseRunId ?? createPlayRunId();
    const fresh: InProgressSession = {
      sessionId: createSessionId(),
      caseId,
      screen: "CASE_INTRO",
      startedAt: new Date().toISOString(),
      playRunId: runId,
    };
    setPlayRunId(runId);
    recordMetricEvent("CASE_START", runId, caseId);
    setActiveSession(fresh);
    setView({ kind: "SESSION" });
  }

  function resumeCase() {
    if (homeInProgress) {
      setPlayRunId(homeInProgress.playRunId);
      setActiveSession(homeInProgress);
      setView({ kind: "SESSION" });
    }
  }

  function endPlayRunAndGoHome() {
    setPlayRunId(null);
    setActiveSession(null);
    setHomeInProgress(loadInProgressSession());
    setView({ kind: "HOME" });
  }

  function handleCompleted(log: TrajectoryLog) {
    setLogs((prev) => [...prev, log]);
    setHomeInProgress(null);
    recordMetricEvent("CASE_COMPLETE", log.playRunId, log.caseId);
  }

  function handleNextCase() {
    if (!activeSession) return;
    const runId = activeSession.playRunId;
    recordMetricEvent("NEXT_CASE_CLICK", runId, activeSession.caseId);

    const playedCaseIds = logs.filter((l) => l.playRunId === runId).map((l) => l.caseId);

    if (playedCaseIds.length >= SESSION_SUMMARY_THRESHOLD) {
      recordMetricEvent("SESSION_COMPLETE", runId);
      setActiveSession(null);
      setView({ kind: "SESSION_SUMMARY" });
      return;
    }

    const next = CASES.find((c) => !playedCaseIds.includes(c.caseId)) ?? CASES[0];
    startCase(next.caseId, { reuseRunId: runId });
  }

  if (view.kind === "SESSION" && activeSession) {
    const caseData = getCaseById(activeSession.caseId);
    if (!caseData) {
      setView({ kind: "HOME" });
      return null;
    }
    return (
      <CaseSession
        key={activeSession.sessionId}
        caseData={caseData}
        initialSession={activeSession}
        onExitToHome={endPlayRunAndGoHome}
        onViewGrowth={() => setView({ kind: "GROWTH" })}
        onNextCase={handleNextCase}
        onCompleted={handleCompleted}
      />
    );
  }

  if (view.kind === "CASE_SELECT") {
    return (
      <CaseSelectScreen
        cases={CASES}
        onSelect={(caseId) => startCase(caseId)}
        onBack={() => setView({ kind: "HOME" })}
      />
    );
  }

  if (view.kind === "GROWTH") {
    return <GrowthScreen logs={logs} onBack={() => setView({ kind: "HOME" })} />;
  }

  if (view.kind === "SESSION_SUMMARY" && playRunId) {
    const summary = computeSessionSummary(logs, playRunId);
    return (
      <SessionSummaryScreen
        summary={summary}
        onTakeSurvey={() => setView({ kind: "USER_TEST" })}
        onSkip={endPlayRunAndGoHome}
      />
    );
  }

  if (view.kind === "USER_TEST" && playRunId) {
    return (
      <UserTestScreen
        onSkip={endPlayRunAndGoHome}
        onSubmit={(answers) => {
          const response: UserTestResponse = {
            responseId: createSessionId(),
            timestamp: new Date().toISOString(),
            playRunId,
            ...answers,
          };
          saveUserTestResponse(response);
          recordMetricEvent("USER_TEST_SUBMITTED", playRunId);
          setLastUserTestResponse(response);
          setView({ kind: "USER_TEST_THANKS" });
        }}
      />
    );
  }

  if (view.kind === "USER_TEST_THANKS" && lastUserTestResponse) {
    return <UserTestThanksScreen response={lastUserTestResponse} onGoHome={endPlayRunAndGoHome} />;
  }

  return (
    <HomeScreen
      hasInProgress={homeInProgress !== null}
      onResume={resumeCase}
      onTodaysCase={() => startCase(getTodaysCaseId())}
      onSelectCase={() => setView({ kind: "CASE_SELECT" })}
      onViewGrowth={() => setView({ kind: "GROWTH" })}
    />
  );
}
