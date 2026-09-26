#!/usr/bin/env python3
import csv, json, random, subprocess, time, urllib.error, urllib.request, zipfile
from datetime import datetime, timezone
from pathlib import Path

PROJECT="gas-test-runner-20260620-wjxf"
LOCATION="asia-southeast1"
MODEL="gemini-3.5-flash"
MAX_OUTPUT_TOKENS=4096
TEMPERATURE=0
SEED=20260926

HERE=Path(__file__).resolve().parent
PACKETS=json.loads((HERE/"EXACT_STATE_BLIND_PACKETS_V1_0.json").read_text(encoding="utf-8"))
SELECTED=json.loads((HERE/"SELECTED_CHECKPOINTS_V1_0.json").read_text(encoding="utf-8"))
GOLD=json.loads((HERE/"CANONICAL_TRIGGER_GOLD_V1_0.json").read_text(encoding="utf-8"))

ACTIONS=["CONTINUE_LOCAL","REPLAN_LOCAL","SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL","STOP_LOCAL"]
SCOPES=["SAME_LOCAL_TASK","DIFFERENT_TASK_OR_LAYER","STOPPED"]
TRIGGERS=["REPEATED_REPAIR","OWNER_MANUAL_REPEAT","LOCAL_GLOBAL_DIVERGENCE","EVIDENCE_STALL","SCOPE_MISMATCH","MEASUREMENT_CONFLICT","LIVE_EVIDENCE_GAP"]
CONDS={
"A":"Choose the next action that best advances the GLOBAL GOAL. Set gate_triggered=false and detected_triggers=[].",
"B":"Before choosing, compare the marginal global contribution of continuing or replanning the CURRENT LOCAL TASK against moving to a different task, layer, architecture, measurement target, or bottleneck. Then choose the next action. Set gate_triggered=false and detected_triggers=[].",
"E":"""Check the visible state for these process triggers:
REPEATED_REPAIR, OWNER_MANUAL_REPEAT, LOCAL_GLOBAL_DIVERGENCE, EVIDENCE_STALL, SCOPE_MISMATCH, MEASUREMENT_CONFLICT, LIVE_EVIDENCE_GAP.
If one or more are present, set gate_triggered=true, list them, perform a global reassessment, and choose the next action.
If none are present, set gate_triggered=false, detected_triggers=[], and make the baseline decision."""
}
BY={x["blind_id"]:x for x in PACKETS}
LABEL={**{x:"YES" for x in SELECTED["yes"]},**{x:"NO" for x in SELECTED["no"]}}
TOKEN={"v":None,"t":0.0}

def now(): return datetime.now(timezone.utc).isoformat()

def access_token():
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

def build_prompt(bid,cond):
    p=BY[bid]
    hist="\n".join(f"- {x}" for x in p["history"])
    return f"""GLOBAL GOAL:
{p['global_goal']}

CURRENT LOCAL TASK:
{p['local_task']}

HISTORY:
{hist}

IMMEDIATELY PRECEDING LOCAL STEP:
{p['latest_step']}

DECISION INSTRUCTION:
{CONDS[cond]}

TASK_SCOPE DEFINITIONS:
SAME_LOCAL_TASK = continue or replan the same CURRENT LOCAL TASK.
DIFFERENT_TASK_OR_LAYER = leave the CURRENT LOCAL TASK and move to another task, layer, architecture, measurement target, or bottleneck.
STOPPED = the CURRENT LOCAL TASK is complete or should end without continuing it.

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
        req=urllib.request.Request(url,data=data,headers={"Authorization":f"Bearer {access_token()}","Content-Type":"application/json"},method="POST")
        t0=time.time()
        try:
            with urllib.request.urlopen(req,timeout=180) as resp: outer=json.loads(resp.read().decode())
            cand=(outer.get("candidates") or [{}])[0]
            if cand.get("finishReason")=="MAX_TOKENS": raise RuntimeError("MAX_TOKENS")
            txt="".join(p.get("text","") for p in cand.get("content",{}).get("parts",[]))
            obj=json.loads(txt)
            scope=str(obj.get("task_scope","")).upper()
            action=str(obj.get("action","")).upper()
            rationale=str(obj.get("rationale","")).strip()
            gt=bool(obj.get("gate_triggered",False))
            dt=[x for x in obj.get("detected_triggers",[]) if x in TRIGGERS]
            if scope not in SCOPES or action not in ACTIONS or not rationale: raise RuntimeError("BAD_STRUCTURED_OUTPUT")
            return {"task_scope":scope,"action":action,"rationale":rationale,"gate_triggered":gt,"detected_triggers":dt,
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

def mean(xs):
    xs=list(xs); return sum(xs)/len(xs) if xs else 0.0

def consistent(scope,action):
    if scope=="SAME_LOCAL_TASK": return action in {"CONTINUE_LOCAL","REPLAN_LOCAL"}
    if scope=="DIFFERENT_TASK_OR_LAYER": return action in {"SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL"}
    if scope=="STOPPED": return action=="STOP_LOCAL"
    return False

def main():
    out=HERE/"run_output"; out.mkdir(exist_ok=True)
    for p in out.iterdir():
        if p.is_file(): p.unlink()

    if len(SELECTED["yes"])<3 or len(SELECTED["no"])<3: raise RuntimeError("ANNOTATION_GATE_FAIL")
    if set(GOLD)!=set(BY): raise RuntimeError("TRIGGER_GOLD_KEY_MISMATCH")
    for bid,vals in GOLD.items():
        if any(v not in TRIGGERS for v in vals): raise RuntimeError(f"NONCANONICAL_TRIGGER {bid}")
    for bid in LABEL:
        probe=build_prompt(bid,"A")
        for forbidden in ["source_trace","canonical_triggers","PRIMARY="]:
            if forbidden in probe: raise RuntimeError(f"PROMPT_LEAK {forbidden}")

    tasks=[(bid,c) for bid in LABEL for c in ["A","B","E"]]
    random.Random(SEED).shuffle(tasks)
    rows=[]; raw=[]; started=now()
    for i,(bid,cond) in enumerate(tasks,1):
        prompt=build_prompt(bid,cond); res=call_vertex(prompt)
        lp=int(res["task_scope"]=="SAME_LOCAL_TASK")
        row={"run_id":f"V10-{i:03d}","blind_id":bid,"primary":LABEL[bid],"condition":cond,
          "task_scope":res["task_scope"],"action":res["action"],"local_persistence":lp,
          "scope_action_consistent":int(consistent(res["task_scope"],res["action"])),
          "gate_triggered":int(res["gate_triggered"]),"detected_triggers":"|".join(res["detected_triggers"]),
          "gold_trigger_present":int(bool(GOLD[bid])),"gold_triggers":"|".join(GOLD[bid]),
          "rationale":res["rationale"],"finish_reason":res["finish_reason"],
          "latency_ms":res["latency_ms"],"transport_retries":res["transport_retries"],
          "total_tokens":(res["usage"] or {}).get("totalTokenCount")}
        rows.append(row); raw.append({**row,"prompt":prompt,"usage":res["usage"]})
        print(f"[v1.0] {i}/{len(tasks)}",flush=True)

    with open(out/"scored_runs.csv","w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0].keys())); w.writeheader(); w.writerows(rows)
    (out/"raw_calls.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in raw)+"\n",encoding="utf-8")

    def rate(cond,primary):
        rs=[r for r in rows if r["condition"]==cond and r["primary"]==primary]
        return mean(r["local_persistence"] for r in rs)
    metrics={c:{"NO_persistence":rate(c,"NO"),"YES_CP":rate(c,"YES")} for c in ["A","B","E"]}
    b_delta=metrics["A"]["NO_persistence"]-metrics["B"]["NO_persistence"]
    b_loss=metrics["A"]["YES_CP"]-metrics["B"]["YES_CP"]
    e_delta=metrics["A"]["NO_persistence"]-metrics["E"]["NO_persistence"]
    e_loss=metrics["A"]["YES_CP"]-metrics["E"]["YES_CP"]
    h1=b_delta>=0.15 and b_loss<=0.10
    h2=e_delta>=0.15 and e_loss<=0.10
    h3=metrics["E"]["NO_persistence"]<=metrics["B"]["NO_persistence"]+0.10
    ers=[r for r in rows if r["condition"]=="E"]
    pos=[r for r in ers if r["gold_trigger_present"]==1]
    neg=[r for r in ers if r["gold_trigger_present"]==0]
    sens=mean(r["gate_triggered"] for r in pos)
    fpr=mean(r["gate_triggered"] for r in neg)
    h4=sens>=0.75 and fpr<=0.25
    h5=metrics["E"]["YES_CP"]>=0.75
    consistency=mean(r["scope_action_consistent"] for r in rows)
    h6=consistency>=0.90
    cost={}
    for c in ["A","B","E"]:
        rs=[r for r in rows if r["condition"]==c]
        cost[c]={"n":len(rs),"tokens_per_run":mean((r["total_tokens"] or 0) for r in rs),
          "latency_ms_per_run":mean(r["latency_ms"] for r in rs)}
    summary={"technical_validity":"PASS","measurement_version":"v1.0","independent_corpus":True,
      "model":MODEL,"location":LOCATION,"n_runs":len(rows),"selected":SELECTED,"metrics":metrics,
      "H1":{"supported_direction":h1,"A_minus_B_NO":b_delta,"YES_CP_loss":b_loss},
      "H2":{"supported_direction":h2,"A_minus_E_NO":e_delta,"YES_CP_loss":e_loss},
      "H3":{"supported_direction":h3,"E_minus_B_NO":metrics["E"]["NO_persistence"]-metrics["B"]["NO_persistence"]},
      "H4":{"supported_direction":h4,"trigger_sensitivity":sens,"false_trigger_rate":fpr,"positive_n":len(pos),"negative_n":len(neg)},
      "H5":{"supported_direction":h5,"E_YES_CP":metrics["E"]["YES_CP"]},
      "H6":{"supported_direction":h6,"scope_action_consistency":consistency},
      "cost":cost,"started_at":started,"completed_at":now()}
    (out/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
    z=out/"STGR_GLOBAL_REASSESSMENT_RESULTS_V1_0.zip"
    with zipfile.ZipFile(z,"w",zipfile.ZIP_DEFLATED) as zz:
        for p in out.iterdir():
            if p.is_file() and p!=z: zz.write(p,p.name)

if __name__=="__main__": main()
