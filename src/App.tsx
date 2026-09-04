import { useEffect, useState } from "react";
import "./styles/global.css";
import { CASES, getCaseById, getTodaysCaseId } from "./data/cases";
import { HomeScreen } from "./screens/HomeScreen";
import { CaseSelectScreen } from "./screens/CaseSelectScreen";
import { GrowthScreen } from "./screens/GrowthScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { SessionSummaryScreen } from "./screens/SessionSummaryScreen";
import { UserTestScreen } from "./screens/UserTestScreen";
import { UserTestThanksScreen } from "./screens/UserTestThanksScreen";
import { CaseSession } from "./CaseSession";
import { Case1CApp } from "./case1c/Case1CApp";
import { Case1TestResultsScreen } from "./case1c/Case1TestResultsScreen";
import {
  loadInProgressSession,
  loadCompletedLogs,
  createSessionId,
  createPlayRunId,
} from "./lib/storage";
import { hasSeenOnboarding, markOnboardingSeen } from "./lib/onboarding";
import { recordMetricEvent } from "./lib/metrics";
import { saveUserTestResponse } from "./lib/userTestResponses";
import { computeSessionSummary } from "./engine/sessionSummary";
import type { InProgressSession, TrajectoryLog, UserTestResponse } from "./types/log";

type View =
  | { kind: "HOME" }
  | { kind: "CASE_SELECT" }
  | { kind: "GROWTH" }
  | { kind: "ONBOARDING" }
  | { kind: "SESSION" }
  | { kind: "SESSION_SUMMARY" }
  | { kind: "USER_TEST" }
  | { kind: "USER_TEST_THANKS" }
  | { kind: "CASE1C" }
  | { kind: "CASE1C_RESULTS" };

// Section 7: after roughly this many cases in one sitting, offer the play-run summary.
const SESSION_SUMMARY_THRESHOLD = 5;

/**
 * PHASE 4.6 (Section19/20): a tester reaching HomeScreen directly would see every other
 * entry point on Home, including the old case-select flow -- exactly the "既存未完成機能へ
 * 簡単に迷い込む" risk the external-test package must avoid. These 2 query-param direct links
 * (for the tester invite / for Owner's own result-checking, respectively) bypass HomeScreen
 * entirely. Neither is linked from any screen -- only from the invite text/Owner's own bookmark --
 * so a tester or casual visitor can never stumble into either by clicking.
 *
 * PHASE 4.7 (independent-review finding): episodes/ and pilot/ (separate, still-unfinished
 * prototypes with their own open bugs -- e.g. a companion step that dead-ends when no AI
 * endpoint is configured, which is this deployment's actual production config) are deliberately
 * NOT wired into this build. Owner's release directive scopes this external test to CASE1 only;
 * wiring them back in only requires restoring the 2 imports/routes/HomeScreen props this Run
 * removed -- their source under src/episodes/ and src/pilot/ is untouched.
 */
function initialViewFromLocation(): View {
  if (typeof window === "undefined") return { kind: "HOME" };
  const params = new URLSearchParams(window.location.search);
  if (params.has("case1results")) return { kind: "CASE1C_RESULTS" };
  if (params.has("case1test")) return { kind: "CASE1C" };
  return { kind: "HOME" };
}

export default function App() {
  const [view, setView] = useState<View>(initialViewFromLocation);
  // PHASE 4.7 (Section5): whether THIS page load started from the external-test direct link --
  // stays fixed for the life of the tab even if `view` later changes, so Case1CApp's ending can
  // tell "opened via the tester URL" apart from "Owner clicked the Home button internally".
  const [enteredViaCase1TestLink] = useState(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("case1test"),
  );
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
  // Section 3/4: shown once ever, before a player's first case. Separate
  // from onboardingSeen's persisted flag — this just tracks in-memory which
  // case start is waiting behind it.
  const [onboardingSeen, setOnboardingSeen] = useState(true);
  const [pendingOnboarding, setPendingOnboarding] = useState<{ caseId: string; runId: string } | null>(null);

  useEffect(() => {
    const inProgress = loadInProgressSession();
    setHomeInProgress(inProgress);
    setPlayRunId(inProgress?.playRunId ?? null);
    setLogs(loadCompletedLogs());
    setOnboardingSeen(hasSeenOnboarding());
  }, []);

  function startCase(caseId: string, opts: { reuseRunId?: string } = {}) {
    if (!onboardingSeen && !opts.reuseRunId) {
      const runId = createPlayRunId();
      setPendingOnboarding({ caseId, runId });
      recordMetricEvent("ONBOARDING_SHOWN", runId, caseId);
      setView({ kind: "ONBOARDING" });
      return;
    }
    reallyStartCase(caseId, opts);
  }

  function reallyStartCase(caseId: string, opts: { reuseRunId?: string } = {}) {
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

  function completeOnboarding() {
    if (!pendingOnboarding) return;
    markOnboardingSeen();
    setOnboardingSeen(true);
    recordMetricEvent("ONBOARDING_COMPLETE", pendingOnboarding.runId, pendingOnboarding.caseId);
    const { caseId, runId } = pendingOnboarding;
    setPendingOnboarding(null);
    reallyStartCase(caseId, { reuseRunId: runId });
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

  if (view.kind === "ONBOARDING") {
    return (
      <OnboardingScreen
        onStart={completeOnboarding}
        onBack={() => {
          setPendingOnboarding(null);
          setView({ kind: "HOME" });
        }}
      />
    );
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

  if (view.kind === "CASE1C") {
    return <Case1CApp onExit={() => setView({ kind: "HOME" })} standalone={enteredViaCase1TestLink} />;
  }

  if (view.kind === "CASE1C_RESULTS") {
    return <Case1TestResultsScreen onExit={() => setView({ kind: "HOME" })} />;
  }

  return (
    <HomeScreen
      hasInProgress={homeInProgress !== null}
      onResume={resumeCase}
      onTodaysCase={() => startCase(getTodaysCaseId())}
      onSelectCase={() => setView({ kind: "CASE_SELECT" })}
      onViewGrowth={() => setView({ kind: "GROWTH" })}
      onPlayCase1C={() => setView({ kind: "CASE1C" })}
    />
  );
}
