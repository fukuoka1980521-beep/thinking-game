from __future__ import annotations

import argparse
import json
from pathlib import Path

from goal_controller_v2 import WorkItem, Route, WorkState, Proposal
from goal_controller_shadow import GoalControllerShadow


def load_json(path: str | Path) -> dict:
    return json.loads(Path(path).read_text(encoding="utf-8"))


def build_state(data: dict) -> WorkState:
    open_items = {
        x["id"]: WorkItem(
            id=x["id"],
            text=x["text"],
            priority=int(x.get("priority", 100)),
            requires_route=bool(x.get("requires_route", True)),
        )
        for x in data.get("open", [])
    }

    closed_items = {
        x["id"]: x["text"]
        for x in data.get("closed", [])
    }

    retired_items = {
        x["id"]: x["text"]
        for x in data.get("retired", [])
    }

    routes = {}
    for x in data.get("valid_routes", []):
        routes[x["id"]] = Route(
            id=x["id"],
            text=x["text"],
            status="VALID",
            reason="",
        )

    for x in data.get("retired", []):
        if x["id"].startswith("V") or x["id"].startswith("R"):
            routes[x["id"]] = Route(
                id=x["id"],
                text=x["text"],
                status="RETIRED",
                reason=x.get("reason", ""),
            )

    goal = data.get("goal") or {}

    return WorkState(
        version=int(data["state_version"]),
        goal_id=goal["id"],
        goal_text=goal["text"],
        done=list(data.get("done", [])),
        open_items=open_items,
        closed_items=closed_items,
        retired_items=retired_items,
        routes=routes,
        constraints=list(data.get("constraints", [])),
    )


def build_proposal(data: dict) -> Proposal:
    return Proposal(
        state_version=int(data["state_version"]),
        open_id=data["open_id"],
        route_id=data.get("route_id"),
        action_text=data.get("action_text", ""),
    )


def main() -> None:
    ap = argparse.ArgumentParser(
        description="Evaluate one model proposal through Goal Controller shadow mode."
    )
    ap.add_argument("--state", required=True, help="Canonical state JSON")
    ap.add_argument("--proposal", required=True, help="Proposal JSON")
    ap.add_argument("--audit", required=True, help="Audit JSONL path")
    args = ap.parse_args()

    state_data = load_json(args.state)
    proposal_data = load_json(args.proposal)

    state = build_state(state_data)
    proposal = build_proposal(proposal_data)

    risk_class = proposal_data.get("risk_class", "LOW_REVERSIBLE")
    actual_action = proposal_data.get("actual_action")
    human_override = bool(proposal_data.get("human_override", False))
    execution_result = proposal_data.get("execution_result")

    shadow = GoalControllerShadow(args.audit)
    outcome = shadow.evaluate(
        state,
        proposal,
        risk_class=risk_class,
        actual_action=actual_action,
        human_override=human_override,
        execution_result=execution_result,
    )

    result = {
        "controller_status": outcome.controller_status,
        "controller_reason": outcome.controller_reason,
        "hard_block": outcome.hard_block,
        "shadow_only": outcome.shadow_only,
        "executable_action": outcome.executable_action,
        "state_version": outcome.state_version,
    }
    print(json.dumps(result, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
