from goal_controller_v1 import GoalController, WorkState, WorkItem, Route, Proposal

def cost_route_state():
    return WorkState(
        goal_id="G1",
        goal_text="Deliver the audited monthly variance report by Friday",
        open_items={
            "O1": WorkItem("O1", "reconcile the remaining rows"),
            "O2": WorkItem("O2", "produce the reviewable Friday report", requires_route=False),
        },
        closed_items={"C1":"quota diagnosis"},
        retired_items={},
        routes={
            "V1": Route("V1","the local CSV export","VALID"),
            "R1": Route("R1","the paid connector","RETIRED","additional spend prohibited"),
        },
    )

ctl=GoalController()

s=cost_route_state()

# Valid high-level action with omitted route is repaired deterministically.
d=ctl.validate(s, Proposal("O1",None,"Reconcile the remaining rows"))
assert d.status=="REPAIRED_WITH_VALID_ROUTE", d
assert "local CSV export" in d.executable_action

# Explicit valid route is accepted.
d=ctl.validate(s, Proposal("O1","V1","Use local CSV export to reconcile the remaining rows"))
assert d.status=="ACCEPT", d

# Retired route is rejected even when the action sounds goal-consistent.
d=ctl.validate(s, Proposal("O1","R1","Use paid connector to reconcile the remaining rows"))
assert d.status=="REJECT_RETIRED_ROUTE", d

# CLOSED work cannot be selected.
d=ctl.validate(s, Proposal("C1",None,"Inspect quota logs"))
assert d.status=="REJECT_CLOSED", d

# Closed work remains available as history but cannot execute.
ctl.close_item(s,"O2")
d=ctl.validate(s, Proposal("O2",None,"Produce the report again"))
assert d.status=="REJECT_CLOSED", d

# Retired route cannot silently return.
try:
    ctl.reopen_route(s,"R1",False)
    raise AssertionError("expected failure")
except ValueError:
    pass

ctl.reopen_route(s,"R1",True)
assert s.routes["R1"].status=="VALID"

print("GOAL_CONTROLLER_TESTS=PASS")
