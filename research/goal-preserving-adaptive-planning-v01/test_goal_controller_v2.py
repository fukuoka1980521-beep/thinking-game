from goal_controller_v2 import GoalControllerV2, WorkState, WorkItem, Route, Proposal

ctl=GoalControllerV2()

state=WorkState(
    version=1,
    goal_id="G1",
    goal_text="Deliver audited variance report",
    done=["all rows reconciled","reviewable report produced"],
    open_items={
        "O1": WorkItem("O1","reconcile remaining rows",priority=1,requires_route=True),
        "O2": WorkItem("O2","produce final report",priority=2,requires_route=False),
    },
    routes={
        "V1": Route("V1","local CSV export","VALID"),
        "R1": Route("R1","paid connector","RETIRED","additional spend prohibited"),
    },
    constraints=["no additional spend"],
)

caps=ctl.compile_capabilities(state)
assert caps["open_ids"]==["O1"], caps
assert caps["route_ids"]==["V1"], caps
assert "R1" not in caps["json_schema"]["properties"]["route_id"]["enum"]

# Authorized capability executes.
p=Proposal(state_version=1,open_id="O1",route_id="V1",action_text="anything")
d=ctl.authorize(state,p)
assert d.status=="ALLOW", d
assert d.executable_action=="Use local CSV export to reconcile remaining rows."

# Retired route can never execute.
d=ctl.authorize(state,Proposal(1,"O1","R1","use paid connector"))
assert d.status=="REJECT_RETIRED_ROUTE", d

# Lower-priority OPEN is not currently executable.
d=ctl.authorize(state,Proposal(1,"O2","NONE","produce report"))
assert d.status=="REJECT_UNAUTHORIZED_OPEN", d

# A state change invalidates already-planned work.
ctl.retire_route(state,"V1","local export temporarily unavailable")
assert state.version==2
d=ctl.authorize(state,p)
assert d.status=="REJECT_STALE_STATE", d

# No valid route means fail closed.
p2=Proposal(state_version=2,open_id="O1",route_id="NONE",action_text="continue")
d=ctl.authorize(state,p2)
assert d.status=="BLOCK_NO_VALID_ROUTE", d

# New evidence can reopen route and increments version.
ctl.reopen_route(state,"V1","local export restored")
assert state.version==3
caps=ctl.compile_capabilities(state)
assert caps["route_ids"]==["V1"]

# Closing O1 promotes O2 and invalidates old proposals.
ctl.close_item(state,"O1","reconciliation passed")
assert state.version==4
caps=ctl.compile_capabilities(state)
assert caps["open_ids"]==["O2"]
d=ctl.authorize(state,Proposal(4,"O2","NONE","produce report"))
assert d.status=="ALLOW"
assert d.executable_action=="produce final report"

# Legitimate goal change is explicit and versioned.
ctl.change_goal(state,"G2","Publish CSV-only compliant report","client compliance requirement changed")
assert state.version==5
assert state.goal_id=="G2"
assert state.audit[-1].event=="GOAL_CHANGED"

# A proposal from version 4 cannot execute after goal change.
d=ctl.authorize(state,Proposal(4,"O2","NONE","produce old-scope report"))
assert d.status=="REJECT_STALE_STATE"

print("GOAL_CONTROLLER_V2_TESTS=PASS")
