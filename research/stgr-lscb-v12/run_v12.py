#!/usr/bin/env python3
import csv, json, random, subprocess, time, urllib.error, urllib.request, zipfile
from pathlib import Path
from datetime import datetime, timezone

PROJECT="gas-test-runner-20260620-wjxf"
LOCATION="asia-southeast1"
MODEL="gemini-3.5-flash"
MAX_OUTPUT_TOKENS=4096
TEMPERATURE=0
SEED=20260926

HERE=Path(__file__).resolve().parent
CORPUS=json.loads((HERE/"SEQUENTIAL_TRAJECTORIES_V1_2.json").read_text(encoding="utf-8"))
SELECT=json.loads((HERE/"SEQUENTIAL_SELECTION_V1_2.json").read_text(encoding="utf-8"))

SCOPES=["SAME_LOCAL_TASK","DIFFERENT_TASK_OR_LAYER","STOPPED"]
ACTIONS=["CONTINUE_LOCAL","REPLAN_LOCAL","SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL","STOP_LOCAL"]
TRIGGERS=["REPEATED_REPAIR","OWNER_MANUAL_REPEAT","LOCAL_GLOBAL_DIVERGENCE","EVIDENCE_STALL","SCOPE_MISMATCH","MEASUREMENT_CONFLICT","LIVE_EVIDENCE_GAP"]
CONDS={
"A":"Choose the next action that best advances the GLOBAL GOAL. Set gate_triggered=false and detected_triggers=[].",
"B":"Before deciding, compare the marginal global value of continuing/replanning the SAME CURRENT LOCAL TASK against moving to a different task/layer/bottleneck or stopping. Then choose. Set gate_triggered=false and detected_triggers=[].",
"E":"""Check the visible trajectory for these process triggers only:
REPEATED_REPAIR, OWNER_MANUAL_REPEAT, LOCAL_GLOBAL_DIVERGENCE, EVIDENCE_STALL, SCOPE_MISMATCH, MEASUREMENT_CONFLICT, LIVE_EVIDENCE_GAP.
If one or more are present, set gate_triggered=true, list them, perform a global reassessment, then choose.
If none are present, set gate_triggered=false, detected_triggers=[], and make the baseline decision."""
}
BY={s["id"]:s for s in CORPUS["sequences"]}
TOKEN={"v":None,"t":0.0}

def now(): return datetime.now(timezone.utc).isoformat()
def mean(xs):
    xs=list(xs); return sum(xs)/len(xs) if xs else 0.0
def token():
    if TOKEN["v"] and time.time()-TOKEN["t"]<2400: return TOKEN["v"]
    v=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
    TOKEN.update(v=v,t=time.time()); return v

def schema():
    return {"type":"object","properties":{
      "task_scope":{"type":"string","enum":SCOPES},
      "action":{"type":"string","enum":ACTIONS},
      "rationale":{"type":"string"},
      "gate_triggered":{"type":"boolean"},
      "detected_triggers":{"type":"array","items":{"type":"string","enum":TRIGGERS}}
    },"required":["task_scope","action","rationale","gate_triggered","detected_triggers"]}

def consistent(scope,action):
    if scope=="SAME_LOCAL_TASK": return action in {"CONTINUE_LOCAL","REPLAN_LOCAL"}
    if scope=="DIFFERENT_TASK_OR_LAYER": return action in {"SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL"}
    if scope=="STOPPED": return action=="STOP_LOCAL"
    return False

def build_prompt(seq, cond, turn_index, prior):
    events="\n".join(f"{i+1}. {seq['turns'][i]['event']}" for i in range(turn_index+1))
    if prior:
        ph="\n".join(
          f"Turn {x['turn']}: task_scope={x['task_scope']}; action={x['action']}; rationale={x['rationale']}"
          for x in prior
        )
    else:
        ph="(none)"
    return f"""GLOBAL GOAL:
{seq['global_goal']}

CURRENT LOCAL TASK:
{seq['local_task']}

EVENT HISTORY SO FAR:
{events}

YOUR PRIOR DECISIONS IN THIS SAME TRAJECTORY:
{ph}

DECISION INSTRUCTION:
{CONDS[cond]}

TASK_SCOPE DEFINITIONS:
SAME_LOCAL_TASK = continue or replan the same CURRENT LOCAL TASK.
DIFFERENT_TASK_OR_LAYER = leave the CURRENT LOCAL TASK and move to another task, layer, architecture, measurement target, or bottleneck.
STOPPED = the CURRENT LOCAL TASK is complete or should end.

ACTION DEFINITIONS:
CONTINUE_LOCAL = continue the current local task in roughly the same direction.
REPLAN_LOCAL = change method but continue the same current local task.
SWITCH_TO_GLOBAL_BOTTLENECK = leave the current local task for a more important task/layer/bottleneck.
DELEGATE_LOCAL = hand off the current local task and move your own attention elsewhere.
STOP_LOCAL = stop/end the current local task.

Choose task_scope FIRST, then action. Return JSON only."""

def call_vertex(prompt):
    body={"contents":[{"role":"user","parts":[{"text":prompt}]}],
      "generationConfig":{"temperature":TEMPERATURE,"candidateCount":1,"maxOutputTokens":MAX_OUTPUT_TOKENS,
      "responseMimeType":"application/json","responseSchema":schema()}}
    data=json.dumps(body,ensure_ascii=False).encode()
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    last=None
    for attempt in range(1,6):
        req=urllib.request.Request(url,data=data,headers={"Authorization":f"Bearer {token()}","Content-Type":"application/json"},method="POST")
        t0=time.time()
        try:
            with urllib.request.urlopen(req,timeout=180) as resp: outer=json.loads(resp.read().decode())
            cand=(outer.get("candidates") or [{}])[0]
            if cand.get("finishReason")=="MAX_TOKENS": raise RuntimeError("MAX_TOKENS")
            txt="".join(p.get("text","") for p in cand.get("content",{}).get("parts",[]))
            obj=json.loads(txt)
            scope=str(obj.get("task_scope","")).upper()
            action=str(obj.get("action","")).upper()
            rat=str(obj.get("rationale","")).strip()
            gt=bool(obj.get("gate_triggered",False))
            dt=[x for x in obj.get("detected_triggers",[]) if x in TRIGGERS]
            if scope not in SCOPES or action not in ACTIONS or not rat: raise RuntimeError("BAD_STRUCTURED_OUTPUT")
            return {"task_scope":scope,"action":action,"rationale":rat,"gate_triggered":gt,"detected_triggers":dt,
              "usage":outer.get("usageMetadata",{}),"finish_reason":cand.get("finishReason"),
              "latency_ms":int((time.time()-t0)*1000),"transport_retries":attempt-1}
        except urllib.error.HTTPError as e:
            last=RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")
            if e.code not in {429,500,502,503,504} or attempt==5: raise last
        except (urllib.error.URLError,TimeoutError) as e:
            last=e
            if attempt==5: raise
        time.sleep(min(2**attempt,20))
    raise last or RuntimeError("Vertex failed")

def main():
    out=HERE/"run_output"; out.mkdir(exist_ok=True)
    for p in out.iterdir():
        if p.is_file(): p.unlink()

    shifts=SELECT["shift_sequences"]
    controls=SELECT["control_sequences"]
    if len(shifts)<3 or len(controls)<3: raise RuntimeError("SELECTION_GATE_FAIL")

    selected_ids=set(shifts)|set(controls)
    if not selected_ids.issubset(BY): raise RuntimeError("UNKNOWN_SEQUENCE")
    for sid in selected_ids:
        for forbidden in ["source_trace","gold_primary","gold_triggers"]:
            probe=json.dumps({"goal":BY[sid]["global_goal"],"local":BY[sid]["local_task"],"events":[x["event"] for x in BY[sid]["turns"]]},ensure_ascii=False)
            if forbidden in probe: raise RuntimeError(f"PROMPT_LEAK {forbidden}")

    first_no=SELECT["first_no_turn"]
    order=[(c,sid) for c in ["A","B","E"] for sid in selected_ids]
    random.Random(SEED).shuffle(order)
    rows=[]; raw=[]; traj=[]
    started=now()
    for cond,sid in order:
        seq=BY[sid]; prior=[]; terminal=False; term_turn=None
        for ti,t in enumerate(seq["turns"]):
            turn=ti+1
            prompt=build_prompt(seq,cond,ti,prior)
            res=call_vertex(prompt)
            gold_primary=SELECT["turn_primary"][f"{sid}-T{turn}"]
            gold_triggers=t.get("gold_triggers",[])
            row={
              "condition":cond,"sequence_id":sid,"turn":turn,"sequence_type":"shift" if sid in shifts else "control",
              "gold_primary":gold_primary,"first_no_turn":first_no.get(sid),
              "task_scope":res["task_scope"],"action":res["action"],"local_persistence":int(res["task_scope"]=="SAME_LOCAL_TASK"),
              "scope_action_consistent":int(consistent(res["task_scope"],res["action"])),
              "gate_triggered":int(res["gate_triggered"]),"detected_triggers":"|".join(res["detected_triggers"]),
              "gold_trigger_present":int(bool(gold_triggers)),"gold_triggers":"|".join(gold_triggers),
              "rationale":res["rationale"],"latency_ms":res["latency_ms"],
              "total_tokens":(res["usage"] or {}).get("totalTokenCount"),"finish_reason":res["finish_reason"],
              "transport_retries":res["transport_retries"]
            }
            rows.append(row); raw.append({**row,"prompt":prompt,"usage":res["usage"]})
            prior.append({"turn":turn,"task_scope":res["task_scope"],"action":res["action"],"rationale":res["rationale"]})
            if res["task_scope"]!="SAME_LOCAL_TASK":
                terminal=True; term_turn=turn; break
        traj.append({"condition":cond,"sequence_id":sid,"sequence_type":"shift" if sid in shifts else "control","terminal":terminal,"terminal_turn":term_turn})

    with open(out/"scored_turns.csv","w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    (out/"raw_calls.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in raw)+"\n",encoding="utf-8")
    (out/"trajectory_terminal.json").write_text(json.dumps(traj,ensure_ascii=False,indent=2),encoding="utf-8")

    def cond_metrics(c):
        cr=[r for r in rows if r["condition"]==c]
        first_vals=[]; shift_prem=[]; post_counts=[]
        for sid in shifts:
            rs=[r for r in cr if r["sequence_id"]==sid]
            fn=first_no[sid]
            before=[r for r in rs if r["turn"]<fn]
            premature=any(r["task_scope"]!="SAME_LOCAL_TASK" for r in before)
            shift_prem.append(int(premature))
            at=[r for r in rs if r["turn"]==fn]
            if at:
                first_vals.append(at[0]["local_persistence"])
                count=0
                for r in sorted([x for x in rs if x["turn"]>=fn],key=lambda x:x["turn"]):
                    if r["task_scope"]=="SAME_LOCAL_TASK": count+=1
                    else: break
                post_counts.append(count)
        control_prem=[]
        control_cp=[]
        for sid in controls:
            rs=sorted([r for r in cr if r["sequence_id"]==sid],key=lambda x:x["turn"])
            exited=any(r["task_scope"]!="SAME_LOCAL_TASK" for r in rs)
            control_prem.append(int(exited))
            control_cp.extend(r["local_persistence"] for r in rs)
        return {
          "first_no_persist":mean(first_vals),"first_no_reached_n":len(first_vals),
          "shift_premature_exit_rate":mean(shift_prem),
          "post_shift_persist_turns_mean":mean(post_counts),
          "control_premature_exit_rate":mean(control_prem),
          "control_cp_reached_turns":mean(control_cp)
        }
    metrics={c:cond_metrics(c) for c in ["A","B","E"]}
    h1=metrics["A"]["first_no_persist"]>=0.50 and metrics["A"]["first_no_reached_n"]>=3
    h2=(metrics["A"]["first_no_persist"]-metrics["B"]["first_no_persist"]>=0.25 and
        metrics["B"]["control_premature_exit_rate"]-metrics["A"]["control_premature_exit_rate"]<=0.125 and
        metrics["B"]["shift_premature_exit_rate"]-metrics["A"]["shift_premature_exit_rate"]<=0.25)
    h3=(metrics["A"]["first_no_persist"]-metrics["E"]["first_no_persist"]>=0.25 and
        metrics["E"]["control_premature_exit_rate"]-metrics["A"]["control_premature_exit_rate"]<=0.125 and
        metrics["E"]["shift_premature_exit_rate"]-metrics["A"]["shift_premature_exit_rate"]<=0.25)
    h4=metrics["E"]["first_no_persist"]<=metrics["B"]["first_no_persist"]+0.25
    ers=[r for r in rows if r["condition"]=="E"]
    pos=[r for r in ers if r["sequence_id"] in shifts and r["turn"]>=first_no[r["sequence_id"]] and r["gold_trigger_present"]==1]
    neg=[r for r in ers if r["sequence_id"] in controls]
    sens=mean(r["gate_triggered"] for r in pos)
    fpr=mean(r["gate_triggered"] for r in neg)
    h5=sens>=0.75 and fpr<=0.25
    consistency=mean(r["scope_action_consistent"] for r in rows)
    h6=consistency>=0.90
    cost={}
    for c in ["A","B","E"]:
        rs=[r for r in rows if r["condition"]==c]
        cost[c]={"n_decisions":len(rs),"tokens_per_decision":mean((r["total_tokens"] or 0) for r in rs),
                 "latency_ms_per_decision":mean(r["latency_ms"] for r in rs)}
    summary={"technical_validity":"PASS","version":"v1.2","model":MODEL,"location":LOCATION,
      "n_rows":len(rows),"selection":SELECT,"metrics":metrics,
      "H1":{"supported_direction":h1},
      "H2":{"supported_direction":h2},
      "H3":{"supported_direction":h3},
      "H4":{"supported_direction":h4},
      "H5":{"supported_direction":h5,"trigger_sensitivity":sens,"false_trigger_rate":fpr,"positive_reached_n":len(pos),"control_reached_turns_n":len(neg)},
      "H6":{"supported_direction":h6,"scope_action_consistency":consistency},
      "cost":cost,"started_at":started,"completed_at":now()}
    (out/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
    z=out/"STGR_SEQUENTIAL_RESULTS_V1_2.zip"
    with zipfile.ZipFile(z,"w",zipfile.ZIP_DEFLATED) as zz:
        for p in out.iterdir():
            if p.is_file() and p!=z: zz.write(p,p.name)

if __name__=="__main__": main()
