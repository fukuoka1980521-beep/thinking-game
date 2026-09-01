import { useEffect, useState } from "react";
import "./styles/global.css";
import { CASES, getCaseById, getTodaysCaseId } from "./data/cases";
import { HomeScreen } from "./screens/HomeScreen";
import { CaseSelectScreen } from "./screens/CaseSelectScreen";
import { GrowthScreen } from "./screens/GrowthScreen";
import { CaseSession } from "./CaseSession";
import {
  loadInProgressSession,
  loadCompletedLogs,
  createSessionId,
} from "./lib/storage";
import type { InProgressSession, TrajectoryLog } from "./types/log";

type View = { kind: "HOME" } | { kind: "CASE_SELECT" } | { kind: "GROWTH" } | { kind: "SESSION" };

export default function App() {
  const [view, setView] = useState<View>({ kind: "HOME" });
  // The persisted in-progress session, used only to drive Home's "resume" button
  // and to seed a resumed session. Not touched while a session is actively playing.
  const [homeInProgress, setHomeInProgress] = useState<InProgressSession | null>(null);
  // The session currently mounted in SESSION view. Stays set (so RESULT can render)
  // even after the session finishes and homeInProgress is cleared.
  const [activeSession, setActiveSession] = useState<InProgressSession | null>(null);
  const [logs, setLogs] = useState<TrajectoryLog[]>([]);

  useEffect(() => {
    setHomeInProgress(loadInProgressSession());
    setLogs(loadCompletedLogs());
  }, []);

  function startCase(caseId: string) {
    if (homeInProgress && homeInProgress.caseId !== caseId) {
      const confirmed = window.confirm(
        "進行中のケースがあります。新しいケースを始めると、進行中の内容は失われます。続けますか？",
      );
      if (!confirmed) return;
    }
    const fresh: InProgressSession = {
      sessionId: createSessionId(),
      caseId,
      screen: "CASE_INTRO",
      startedAt: new Date().toISOString(),
    };
    setActiveSession(fresh);
    setView({ kind: "SESSION" });
  }

  function resumeCase() {
    if (homeInProgress) {
      setActiveSession(homeInProgress);
      setView({ kind: "SESSION" });
    }
  }

  function exitToHome() {
    setActiveSession(null);
    setHomeInProgress(loadInProgressSession());
    setView({ kind: "HOME" });
  }

  function handleCompleted(log: TrajectoryLog) {
    setLogs((prev) => [...prev, log]);
    setHomeInProgress(null);
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
        onExitToHome={exitToHome}
        onViewGrowth={() => setView({ kind: "GROWTH" })}
        onCompleted={handleCompleted}
      />
    );
  }

  if (view.kind === "CASE_SELECT") {
    return (
      <CaseSelectScreen
        cases={CASES}
        onSelect={startCase}
        onBack={() => setView({ kind: "HOME" })}
      />
    );
  }

  if (view.kind === "GROWTH") {
    return <GrowthScreen logs={logs} onBack={() => setView({ kind: "HOME" })} />;
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
