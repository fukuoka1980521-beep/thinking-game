from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any

@dataclass
class WorkItem:
    id: str
    text: str
    priority: int = 100
    requires_route: bool = True

@dataclass
class Route:
    id: str
    text: str
    status: str = "VALID"  # VALID | RETIRED
    reason: str = ""

@dataclass
class AuditEvent:
    version: int
    event: str
    details: Dict[str, Any]

@dataclass
class WorkState:
    version: int
    goal_id: str
    goal_text: str
    done: List[str] = field(default_factory=list)
    open_items: Dict[str, WorkItem] = field(default_factory=dict)
    closed_items: Dict[str, str] = field(default_factory=dict)
    retired_items: Dict[str, str] = field(default_factory=dict)
    routes: Dict[str, Route] = field(default_factory=dict)
    constraints: List[str] = field(default_factory=list)
    audit: List[AuditEvent] = field(default_factory=list)

@dataclass
class Proposal:
    state_version: int
    open_id: str
    route_id: Optional[str]
    action_text: str

@dataclass
class Decision:
    status: str
    reason: str
    executable_action: Optional[str] = None
    state_version: Optional[int] = None

class GoalControllerV2:
    """
    Authority stays outside the model.

    Model:
      - may reason, draft, and explain.
      - can only select from capabilities compiled by this controller.

    Controller:
      - owns WorkState.
      - compiles allowed capabilities.
      - validates state version immediately before side effects.
      - rejects CLOSED/RETIRED/stale actions.
      - can synthesize a concrete action from OPEN + VALID_ROUTE.
    """

    def compile_capabilities(self, state: WorkState) -> Dict[str, Any]:
        active = sorted(state.open_items.values(), key=lambda x: (x.priority, x.id))
        if not active:
            open_ids: List[str] = []
        else:
            best_priority = active[0].priority
            open_ids = [x.id for x in active if x.priority == best_priority]

        route_ids = [
            r.id for r in state.routes.values()
            if r.status == "VALID"
        ]

        return {
            "state_version": state.version,
            "open_ids": open_ids,
            "route_ids": route_ids,
            "json_schema": {
                "type": "object",
                "properties": {
                    "state_version": {"type": "integer", "enum": [state.version]},
                    "open_id": {"type": "string", "enum": open_ids},
                    "route_id": {
                        "type": "string",
                        "enum": route_ids if route_ids else ["NONE"],
                    },
                    "action": {"type": "string"},
                },
                "required": ["state_version", "open_id", "route_id", "action"],
                "additionalProperties": False,
            },
        }

    def authorize(self, state: WorkState, proposal: Proposal) -> Decision:
        if proposal.state_version != state.version:
            return Decision(
                "REJECT_STALE_STATE",
                f"proposal version {proposal.state_version} != current {state.version}",
                state_version=state.version,
            )

        caps = self.compile_capabilities(state)

        if proposal.open_id not in caps["open_ids"]:
            if proposal.open_id in state.closed_items:
                return Decision("REJECT_CLOSED", f"{proposal.open_id} is CLOSED", state_version=state.version)
            if proposal.open_id in state.retired_items:
                return Decision("REJECT_RETIRED_WORK", f"{proposal.open_id} is RETIRED", state_version=state.version)
            return Decision("REJECT_UNAUTHORIZED_OPEN", f"{proposal.open_id} is not an authorized OPEN capability", state_version=state.version)

        item = state.open_items[proposal.open_id]

        if item.requires_route:
            if not caps["route_ids"]:
                return Decision("BLOCK_NO_VALID_ROUTE", "No VALID_ROUTE exists for route-dependent OPEN work", state_version=state.version)

            if proposal.route_id not in caps["route_ids"]:
                if proposal.route_id in state.routes and state.routes[proposal.route_id].status == "RETIRED":
                    route = state.routes[proposal.route_id]
                    return Decision("REJECT_RETIRED_ROUTE", f"{proposal.route_id} retired: {route.reason}", state_version=state.version)
                return Decision("REJECT_UNAUTHORIZED_ROUTE", f"{proposal.route_id} is not an authorized VALID_ROUTE", state_version=state.version)

            route = state.routes[proposal.route_id]
            action = self.synthesize(item, route)
            return Decision("ALLOW", "Authorized OPEN + VALID_ROUTE at current state version", action, state.version)

        return Decision("ALLOW", "Authorized route-free OPEN work at current state version", item.text, state.version)

    def synthesize(self, item: WorkItem, route: Route) -> str:
        return f"Use {route.text} to {item.text}."

    def _bump(self, state: WorkState, event: str, details: Dict[str, Any]) -> None:
        state.version += 1
        state.audit.append(AuditEvent(state.version, event, details))

    def close_item(self, state: WorkState, open_id: str, evidence: str) -> None:
        item = state.open_items.pop(open_id)
        state.closed_items[open_id] = item.text
        self._bump(state, "OPEN_TO_CLOSED", {"id": open_id, "evidence": evidence})

    def retire_route(self, state: WorkState, route_id: str, reason: str) -> None:
        route = state.routes[route_id]
        route.status = "RETIRED"
        route.reason = reason
        self._bump(state, "ROUTE_RETIRED", {"id": route_id, "reason": reason})

    def reopen_route(self, state: WorkState, route_id: str, evidence_reason_changed: str) -> None:
        if not evidence_reason_changed.strip():
            raise ValueError("Reopening a RETIRED route requires explicit changed evidence/reason")
        route = state.routes[route_id]
        old_reason = route.reason
        route.status = "VALID"
        route.reason = ""
        self._bump(state, "ROUTE_REOPENED", {"id": route_id, "old_reason": old_reason, "new_evidence": evidence_reason_changed})

    def change_goal(self, state: WorkState, new_goal_id: str, new_goal_text: str, authority_reason: str) -> None:
        if not authority_reason.strip():
            raise ValueError("Goal change requires authoritative reason")
        old = {"goal_id": state.goal_id, "goal_text": state.goal_text}
        state.goal_id = new_goal_id
        state.goal_text = new_goal_text
        self._bump(state, "GOAL_CHANGED", {"old": old, "new": {"goal_id": new_goal_id, "goal_text": new_goal_text}, "reason": authority_reason})
