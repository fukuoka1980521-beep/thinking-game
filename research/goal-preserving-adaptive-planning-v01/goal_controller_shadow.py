from __future__ import annotations
from dataclasses import dataclass, asdict
from datetime import datetime, timezone
import json
from pathlib import Path
from typing import Optional

from goal_controller_v2 import GoalControllerV2, WorkState, Proposal, Decision

HIGH_RISK_CLASSES = {
    "MONEY",
    "PRODUCTION_DEPLOY",
    "DESTRUCTIVE",
    "CANONICAL_OVERWRITE",
    "IRREVERSIBLE_EXTERNAL",
}

@dataclass
class ShadowOutcome:
    controller_status: str
    controller_reason: str
    hard_block: bool
    shadow_only: bool
    executable_action: Optional[str]
    state_version: int

class GoalControllerShadow:
    """
    Shadow-mode adapter around GoalControllerV2.

    Low-risk disagreements are logged but do not block execution.
    High-risk disagreements fail closed even during shadow mode.
    """

    def __init__(self, audit_path: str | Path):
        self.controller = GoalControllerV2()
        self.audit_path = Path(audit_path)
        self.audit_path.parent.mkdir(parents=True, exist_ok=True)

    def evaluate(
        self,
        state: WorkState,
        proposal: Proposal,
        *,
        risk_class: str,
        actual_action: Optional[str] = None,
        human_override: bool = False,
        execution_result: Optional[str] = None,
    ) -> ShadowOutcome:
        decision: Decision = self.controller.authorize(state, proposal)
        allowed = decision.status == "ALLOW"
        high_risk = risk_class in HIGH_RISK_CLASSES

        hard_block = (not allowed) and high_risk
        shadow_only = (not allowed) and (not high_risk)

        outcome = ShadowOutcome(
            controller_status=decision.status,
            controller_reason=decision.reason,
            hard_block=hard_block,
            shadow_only=shadow_only,
            executable_action=decision.executable_action,
            state_version=state.version,
        )

        record = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "state_version": state.version,
            "target": state.goal_text,
            "open_id": proposal.open_id,
            "route_id": proposal.route_id,
            "model_action": proposal.action_text,
            "risk_class": risk_class,
            "controller_result": decision.status,
            "controller_reason": decision.reason,
            "hard_block": hard_block,
            "shadow_only": shadow_only,
            "authorized_action": decision.executable_action,
            "actual_action": actual_action,
            "human_override": human_override,
            "execution_result": execution_result,
        }
        self._append(record)
        return outcome

    def _append(self, record: dict) -> None:
        with self.audit_path.open("a", encoding="utf-8") as f:
            f.write(json.dumps(record, ensure_ascii=False, sort_keys=True) + "\n")
