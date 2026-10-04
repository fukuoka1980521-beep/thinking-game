from pathlib import Path
import tempfile

from goal_controller_v2 import WorkState, WorkItem, Route, Proposal
from goal_controller_shadow import GoalControllerShadow

with tempfile.TemporaryDirectory() as td:
    audit = Path(td) / "shadow.jsonl"
    shadow = GoalControllerShadow(audit)

    state = WorkState(
        version=1,
        goal_id="G1",
        goal_text="Deliver audited report",
        open_items={
            "O1": WorkItem("O1", "reconcile remaining rows", priority=1, requires_route=True),
        },
        routes={
            "V1": Route("V1", "local CSV export", "VALID"),
            "R1": Route("R1", "paid connector", "RETIRED", "additional spend prohibited"),
        },
        constraints=["no additional spend"],
    )

    # Authorized proposal remains allowed.
    ok = shadow.evaluate(
        state,
        Proposal(1, "O1", "V1", "use local export"),
        risk_class="LOW_REVERSIBLE",
    )
    assert ok.controller_status == "ALLOW"
    assert not ok.hard_block
    assert not ok.shadow_only

    # Low-risk bad proposal is recorded but shadow mode does not hard-block it.
    low = shadow.evaluate(
        state,
        Proposal(1, "O1", "R1", "use paid connector"),
        risk_class="LOW_REVERSIBLE",
    )
    assert low.controller_status == "REJECT_RETIRED_ROUTE"
    assert not low.hard_block
    assert low.shadow_only

    # The same invalid route is hard-blocked when money is involved.
    money = shadow.evaluate(
        state,
        Proposal(1, "O1", "R1", "spend on paid connector"),
        risk_class="MONEY",
    )
    assert money.controller_status == "REJECT_RETIRED_ROUTE"
    assert money.hard_block
    assert not money.shadow_only

    # A stale proposal is hard-blocked for production deployment.
    state.version = 2
    stale = shadow.evaluate(
        state,
        Proposal(1, "O1", "V1", "deploy old plan"),
        risk_class="PRODUCTION_DEPLOY",
    )
    assert stale.controller_status == "REJECT_STALE_STATE"
    assert stale.hard_block

    lines = audit.read_text(encoding="utf-8").splitlines()
    assert len(lines) == 4

print("GOAL_CONTROLLER_SHADOW_TESTS=PASS")
