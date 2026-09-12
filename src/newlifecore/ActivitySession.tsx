import { useState } from "react";
import type { ActivityDef, ActivityTask } from "./content/activityDefs";

/**
 * PHASE_14_NEW_LIFE_GAMEPLAY_CORE_V1 Section 5-10 -- the GAMEPLAY ACTIVITY session UI. Same
 * "structural action, canonical the moment it's confirmed" discipline as ShoppingPicker.tsx: what
 * happens here is exactly what `engine.ts`'s `runActivity` records, never something free-text
 * conversation could claim happened on its own.
 *
 * No score, no progress bar, no "3/4 complete" counter anywhere (Section 9) -- only a plain
 * remaining-time readout (the same "残り◯分" register the movelist already uses) and a running log
 * of what was actually done, in plain sentences. Finishing early (before the budget runs out) is
 * always available and exactly as legitimate an ending as running out of time (Section 6: "必ず解決
 * する必要はない").
 */
export function ActivitySession({ def, onFinish }: { def: ActivityDef; onFinish: (done: ActivityTask[]) => void }) {
  const [remaining, setRemaining] = useState(def.timeBudgetMinutes);
  const [done, setDone] = useState<ActivityTask[]>([]);
  const [log, setLog] = useState<string[]>([]);

  function doTask(task: ActivityTask) {
    if (task.minutes > remaining) return;
    setRemaining((r) => r - task.minutes);
    setDone((d) => [...d, task]);
    setLog((l) => [...l, task.resultText]);
  }

  const remainingTasks = def.tasks.filter((t) => !done.some((d) => d.id === t.id));
  const anyAffordable = remainingTasks.some((t) => t.minutes <= remaining);

  return (
    <div data-testid="nlc-activity-session">
      <p className="nlc-npc-line">{def.introText}</p>
      <p className="nlc-ambient" data-testid="nlc-activity-remaining">
        残り{remaining}分程度
      </p>
      {log.length > 0 && (
        <div className="nlc-result" data-testid="nlc-activity-log">
          {log.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}
      <div className="nlc-choices">
        {remainingTasks.map((task) => (
          <button
            key={task.id}
            className="nlc-choice"
            onClick={() => doTask(task)}
            disabled={task.minutes > remaining}
            data-testid={`nlc-activity-task-${task.id}`}
          >
            {task.label}（{task.minutes}分）
          </button>
        ))}
        <button className="nlc-choice" onClick={() => onFinish(done)} data-testid="nlc-activity-finish">
          {anyAffordable && remainingTasks.length > 0 ? "ここで切り上げる" : "終える"}
        </button>
      </div>
    </div>
  );
}
