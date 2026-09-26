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
CORPUS=json.loads((HERE/"NATURALISTIC_TRAJECTORY_CORPUS_V0_8.json").read_text(encoding="utf-8"))
SELECTED=json.loads((HERE/"SELECTED_CHECKPOINTS_V0_8.json").read_text(encoding="utf-8"))
BLIND=json.loads((HERE/"BLIND_PACKETS_V0_8.json").read_text(encoding="utf-8"))

ACTIONS=["CONTINUE_LOCAL","REPLAN_LOCAL","SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL","STOP_LOCAL"]
LOCAL={"CONTINUE_LOCAL","REPLAN_LOCAL"}
TRIGGERS=["REPEATED_REPAIR","OWNER_MANUAL_REPEAT","LOCAL_GLOBAL_DIVERGENCE","EVIDENCE_STALL","SCOPE_MISMATCH","MEASUREMENT_CONFLICT","LIVE_EVIDENCE_GAP"]
CONDS={
"A":"Choose the next action that best advances the GLOBAL GOAL. Set gate_triggered=false and detected_triggers=[].",
"B":"Before choosing, compare the marginal global contribution of continuing or replanning the CURRENT LOCAL TASK with shifting attention to a higher-level bottleneck, architecture, measurement layer, or different task. Then choose the action that best advances the GLOBAL GOAL. Set gate_triggered=false and detected_triggers=[].",
"E":"""First check the visible history for these process triggers only:
- REPEATED_REPAIR: materially the same failure/path has already received multiple local repairs.
- OWNER_MANUAL_REPEAT: repeated Owner/manual relay is being used to keep the path alive.
- LOCAL_GLOBAL_DIVERGENCE: a local/technical metric improves while the global objective or evidence does not.
- EVIDENCE_STALL: technical success is accumulating without new decision-relevant evidence.
- SCOPE_MISMATCH: the current work unit no longer contains the actual target or expands beyond required scope.
- MEASUREMENT_CONFLICT: the observed failure is plausibly in the validator/measurement layer rather than the object being measured.
- LIVE_EVIDENCE_GAP: local/configured success exists but the required live path is unverified or failing.
If one or more are present, set gate_triggered=true, list the detected triggers, perform a global reassessment, then choose the action.
If none are present, set gate_triggered=false, detected_triggers=[], and make the baseline decision."""
}

blind_by={x["blind_id"]:x for x in BLIND}
traj_by={f"V8B{i+1:02d}":t for i,t in enumerate(CORPUS["trajectories"])}
label={**{x:"YES" for x in SELECTED["yes"]},**{x:"NO" for x in SELECTED["no"]}}
TOKEN={"v":None,"t":0.0}

def now(): return datetime.now(timezone.utc).isoformat()

def access_token():
    if TOKEN["v"] and time.time()-TOKEN["t"]<2400: return TOKEN["v"]
    v=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
    TOKEN.update(v=v,t=time.time())
    return v

def schema():
    return {"type":"object","properties":{
      "action":{"type":"string","enum":ACTIONS},
      "rationale":{"type":"string"},
      "gate_triggered":{"type":"boolean"},
      "detected_triggers":{"type":"array","items":{"type":"string","enum":TRIGGERS}}
    },"required":["action","rationale","gate_triggered","detected_triggers"]}

def build_prompt(bid,cond):
    p=blind_by[bid]
    t=traj_by[bid]
    hist="\n".join(f"- {x}" for x in p["history"])
    return f"""GLOBAL GOAL:
{p['global_goal']}

CURRENT LOCAL TASK:
{p['local_task']}

HISTORY AVAILABLE NOW:
{hist}

IMMEDIATELY PRECEDING LOCAL STEP:
{t['latest_step']}

DECISION INSTRUCTION:
{CONDS[cond]}

ACTION DEFINITIONS:
CONTINUE_LOCAL = continue the current local task in roughly the same direction
REPLAN_LOCAL = change method but continue the same local task
SWITCH_TO_GLOBAL_BOTTLENECK = leave the local task and move attention to a more important global bottleneck
DELEGATE_LOCAL = hand off the local task and move your own attention elsewhere
STOP_LOCAL = stop the local task

Return JSON only."""

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
            action=str(obj.get("action","")).upper()
            rationale=str(obj.get("rationale","")).strip()
            gt=bool(obj.get("gate_triggered",False))
            dt=[x for x in obj.get("detected_triggers",[]) if x in TRIGGERS]
            if action not in ACTIONS or not rationale: raise RuntimeError("BAD_STRUCTURED_OUTPUT")
            if attempt and False: pass
            return {"action":action,"rationale":rationale,"gate_triggered":gt,"detected_triggers":dt,
              "usage":outer.get("usageMetadata",{}),"finish_reason":cand.get("finishReason"),
              "latency_ms":int((time.time()-t0)*1000),"transport_retries":attempt-1}
        except urllib.error.HTTPError as e:
            last=RuntimeError(f"HTTP {e.code}: {e.read().decode(errors='replace')[:800]}")
            if e.code not in {429,500,502,503,504} or attempt==5: raise last
        except (urllib.error.URLError,TimeoutError) as e:
            last=e
            if attempt==5: raise
        time.sleep(min(2**attempt,20))
    raise last or RuntimeError("Vertex call failed")

def mean(xs):
    xs=list(xs)
    return sum(xs)/len(xs) if xs else 0.0

def main():
    out=HERE/"run_output"
    out.mkdir(exist_ok=True)
    for p in out.iterdir():
        if p.is_file(): p.unlink()
    if len(SELECTED["yes"])<3 or len(SELECTED["no"])<3:
        raise RuntimeError("ANNOTATION_GATE_FAIL")
    for bid in label:
        prompt=build_prompt(bid,"A")
        if "process_triggers" in prompt or "source_trace" in prompt:
            raise RuntimeError("PROMPT_LEAK_FAIL")

    started=now()
    tasks=[(bid,c) for bid in label for c in ["A","B","E"]]
    random.Random(SEED).shuffle(tasks)
    rows=[]; raw=[]
    for i,(bid,cond) in enumerate(tasks,1):
        res=call_vertex(build_prompt(bid,cond))
        gold_trigger=bool(traj_by[bid].get("process_triggers"))
        row={"run_id":f"V08-{i:03d}","blind_id":bid,"trajectory_id":traj_by[bid]["id"],
          "primary":label[bid],"condition":cond,"action":res["action"],
          "local_persistence":int(res["action"] in LOCAL),"gate_triggered":int(res["gate_triggered"]),
          "detected_triggers":"|".join(res["detected_triggers"]),"gold_trigger_present":int(gold_trigger),
          "rationale":res["rationale"],"finish_reason":res["finish_reason"],
          "latency_ms":res["latency_ms"],"transport_retries":res["transport_retries"],
          "total_tokens":(res["usage"] or {}).get("totalTokenCount")}
        rows.append(row); raw.append({**row,"prompt":build_prompt(bid,cond),"usage":res["usage"]})
        print(f"[v0.8] {i}/{len(tasks)}",flush=True)

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
    sensitivity=mean(r["gate_triggered"] for r in pos)
    false_rate=mean(r["gate_triggered"] for r in neg)
    h4=sensitivity>=0.67 and false_rate<=0.50
    h5=metrics["E"]["YES_CP"]>=0.75
    cost={}
    for c in ["A","B","E"]:
        rs=[r for r in rows if r["condition"]==c]
        cost[c]={"n":len(rs),"tokens_per_run":mean((r["total_tokens"] or 0) for r in rs),
          "latency_ms_per_run":mean(r["latency_ms"] for r in rs)}

    summary={"technical_validity":"PASS","model":MODEL,"location":LOCATION,"temperature":0,
      "selected":SELECTED,"n_runs":len(rows),"metrics":metrics,
      "H1":{"supported_direction":h1,"A_minus_B_NO":b_delta,"YES_CP_loss":b_loss},
      "H2":{"supported_direction":h2,"A_minus_E_NO":e_delta,"YES_CP_loss":e_loss},
      "H3":{"supported_direction":h3,"E_minus_B_NO":metrics["E"]["NO_persistence"]-metrics["B"]["NO_persistence"]},
      "H4":{"supported_direction":h4,"trigger_sensitivity":sensitivity,"false_trigger_rate":false_rate,
        "trigger_positive_n":len(pos),"trigger_negative_n":len(neg)},
      "H5":{"supported_direction":h5,"E_YES_CP":metrics["E"]["YES_CP"]},
      "cost":cost,"started_at":started,"completed_at":now()}
    (out/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
    (out/"research_report.md").write_text(
      f"# v0.8 Result\n\nRuns: {len(rows)}\n\nH1={h1}\nH2={h2}\nH3={h3}\nH4={h4}\nH5={h5}\n",encoding="utf-8")
    z=out/"STGR_GLOBAL_REASSESSMENT_RESULTS_V0_8.zip"
    with zipfile.ZipFile(z,"w",zipfile.ZIP_DEFLATED) as zz:
        for p in out.iterdir():
            if p.is_file() and p!=z: zz.write(p,p.name)

if __name__=="__main__": main()
