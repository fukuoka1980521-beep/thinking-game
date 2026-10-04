from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, Optional, List

@dataclass
class WorkItem:
    id: str
    text: str
    requires_route: bool = True

@dataclass
class Route:
    id: str
    text: str
    status: str = "VALID"  # VALID or RETIRED
    reason: str = ""

@dataclass
class WorkState:
    goal_id: str
    goal_text: str
    open_items: Dict[str, WorkItem] = field(default_factory=dict)
    closed_items: Dict[str, str] = field(default_factory=dict)
    retired_items: Dict[str, str] = field(default_factory=dict)
    routes: Dict[str, Route] = field(default_factory=dict)

@dataclass
class Proposal:
    open_id: str
    route_id: Optional[str]
    action_text: str

@dataclass
class Decision:
    status: str
    reason: str
    executable_action: Optional[str] = None

class GoalController:
    def validate(self, state: WorkState, proposal: Proposal) -> Decision:
        if proposal.open_id in state.closed_items:
            return Decision("REJECT_CLOSED", f"{proposal.open_id} is CLOSED")
        if proposal.open_id in state.retired_items:
            return Decision("REJECT_RETIRED_WORK", f"{proposal.open_id} is RETIRED")
        item = state.open_items.get(proposal.open_id)
        if item is None:
            return Decision("REJECT_UNKNOWN_OPEN", f"{proposal.open_id} is not OPEN")

        if item.requires_route:
            if not proposal.route_id:
                valid = [r for r in state.routes.values() if r.status == "VALID"]
                if len(valid) == 1:
                    route = valid[0]
                    return Decision(
                        "REPAIRED_WITH_VALID_ROUTE",
                        f"OPEN item {item.id} required a route; unique valid route {route.id} supplied",
                        self.synthesize(item, route),
                    )
                return Decision("REPAIR_REQUIRED", "OPEN item requires an explicit VALID_ROUTE")

            route = state.routes.get(proposal.route_id)
            if route is None:
                return Decision("REJECT_UNKNOWN_ROUTE", f"{proposal.route_id} is not a known route")
            if route.status != "VALID":
                return Decision("REJECT_RETIRED_ROUTE", f"{proposal.route_id} is RETIRED: {route.reason}")
            return Decision("ACCEPT", "OPEN item and VALID_ROUTE are authorized", proposal.action_text)

        return Decision("ACCEPT", "OPEN item requires no route", proposal.action_text)

    def synthesize(self, item: WorkItem, route: Route) -> str:
        return f"Use {route.text} to {item.text}."

    def retire_route(self, state: WorkState, route_id: str, reason: str) -> None:
        route = state.routes[route_id]
        route.status = "RETIRED"
        route.reason = reason

    def reopen_route(self, state: WorkState, route_id: str, reason_changed: bool) -> None:
        if not reason_changed:
            raise ValueError("Cannot reopen a RETIRED route without changed evidence/reason")
        route = state.routes[route_id]
        route.status = "VALID"
        route.reason = ""

    def close_item(self, state: WorkState, open_id: str) -> None:
        item = state.open_items.pop(open_id)
        state.closed_items[open_id] = item.text
