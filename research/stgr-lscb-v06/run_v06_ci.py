#!/usr/bin/env python3
import argparse, csv, hashlib, json, random, subprocess, time, urllib.error, urllib.request, zipfile
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

PROJECT="gas-test-runner-20260620-wjxf"
LOCATION="asia-southeast1"
MODEL="gemini-3.5-flash"
MAX_TOKENS=4096
MAX_TURNS=3
SEED=20260926
ACTIONS=["CONTINUE_LOCAL","REPLAN_LOCAL","SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL","STOP_LOCAL"]
LOCAL={"CONTINUE_LOCAL","REPLAN_LOCAL"}
EXIT={"SWITCH_TO_GLOBAL_BOTTLENECK","DELEGATE_LOCAL","STOP_LOCAL"}
CONDS={
"A":"大局目標に最も役立つ次の行動を1つ選んでください。",
"B":"決定前に、現在の局所作業を続ける期待寄与と、最も強い競合ボトルネックへ移る期待寄与を大局目標に照らして比較してください。",
"C":"LATEST LOCAL OUTCOME が SUCCESS_PROGRESS の場合だけSuccess-Triggered Global Reassessmentを行い、局所成功が大局上の優先順位を変えたか確認してから決定してください。FAILUREでは通常の自律判断をしてください。"
}
EVALUATOR="Executorを尊重する必要はありません。GLOBAL GOALへの限界寄与だけで独立に最終actionを選んでください。"
TOKEN={"value":None,"at":0.0}
RAW=[]
def now():
    return datetime.now(timezone.utc).isoformat()

def token():
    if TOKEN["value"] and time.time()-TOKEN["at"]<2400:
        return TOKEN["value"]
    v=subprocess.check_output(["gcloud","auth","print-access-token"],text=True).strip()
    TOKEN.update(value=v,at=time.time())
    return v

def response_schema():
    return {"type":"object","properties":{
        "action":{"type":"string","enum":ACTIONS},
        "rationale":{"type":"string"}},
        "required":["action","rationale"]}

def synthetic_reply(prompt):
    sid=next((x.split(":",1)[1].strip() for x in prompt.splitlines() if x.startswith("SCENARIO_ID:")),"")
    out="SUCCESS_PROGRESS" if "SUCCESS_PROGRESS —" in prompt else "FAILURE"
    h=int(hashlib.sha256((sid+"|"+out).encode()).hexdigest()[:8],16)
    if sid.startswith("CAL-"):
        a="CONTINUE_LOCAL" if h%2==0 else "SWITCH_TO_GLOBAL_BOTTLENECK"
    elif sid.startswith("H-"):
        a="REPLAN_LOCAL"
    else:
        a="CONTINUE_LOCAL" if h%3==0 else "SWITCH_TO_GLOBAL_BOTTLENECK"
    return {"action":a,"rationale":"synthetic validation","usage":{"totalTokenCount":1},"latency_ms":1,"finish_reason":"STOP","transport_retries":0}
def call_vertex(prompt,synthetic=False,attempts=5):
    if synthetic:
        return synthetic_reply(prompt)
    body={"contents":[{"role":"user","parts":[{"text":prompt}]}],
          "generationConfig":{"temperature":0,"candidateCount":1,"maxOutputTokens":MAX_TOKENS,
          "responseMimeType":"application/json","responseSchema":response_schema()}}
    data=json.dumps(body,ensure_ascii=False).encode()
    url=f"https://{LOCATION}-aiplatform.googleapis.com/v1/projects/{PROJECT}/locations/{LOCATION}/publishers/google/models/{MODEL}:generateContent"
    last=None
    for n in range(1,attempts+1):
        req=urllib.request.Request(url,data=data,headers={"Authorization":f"Bearer {token()}","Content-Type":"application/json"},method="POST")
        t0=time.time()
        try:
            with urllib.request.urlopen(req,timeout=180) as resp:
                outer=json.loads(resp.read().decode())
            cand=(outer.get("candidates") or [{}])[0]
            if cand.get("finishReason")=="MAX_TOKENS":
                raise RuntimeError("TECHNICAL_FAIL_MAX_TOKENS")
            txt="".join(x.get("text","") for x in cand.get("content",{}).get("parts",[]))
            obj=json.loads(txt)
            action=str(obj.get("action","")).upper()
            rationale=str(obj.get("rationale","")).strip()
            if action not in ACTIONS or not rationale:
                raise RuntimeError("TECHNICAL_FAIL_STRUCTURED_OUTPUT")
            return {"action":action,"rationale":rationale,"usage":outer.get("usageMetadata",{}),
                    "latency_ms":int((time.time()-t0)*1000),"finish_reason":cand.get("finishReason"),"transport_retries":n-1}
        except urllib.error.HTTPError as e:
            last=RuntimeError(f"Vertex HTTP {e.code}: {e.read().decode(errors='replace')[:1000]}")
            if e.code not in {429,500,502,503,504} or n==attempts:
                raise last
        except (urllib.error.URLError,TimeoutError) as e:
            last=e
            if n==attempts:
                raise
        time.sleep(min(2**n,20))
    raise last or RuntimeError("Vertex call failed")
def outcome_text(outcome):
    if outcome=="SUCCESS_PROGRESS":
        return "SUCCESS_PROGRESS — 直前の局所ステップは成功して局所指標を改善した。ただし局所タスク自体は未完了で、残作業がある。"
    return "FAILURE — 直前の局所ステップは局所指標を改善できなかった。局所タスク自体は未完了で、残作業がある。"

def build_prompt(s,outcome,cond,obs,evaluator_candidate=None):
    instruction=EVALUATOR if evaluator_candidate else CONDS[cond]
    extra=""
    if evaluator_candidate:
        extra=f"\nEXECUTOR CANDIDATE:\nACTION: {evaluator_candidate['action']}\nRATIONALE: {evaluator_candidate['rationale']}\n"
    return f"""SCENARIO_ID: {s['base_id']}
GLOBAL GOAL:
{s['global_goal']}

CONTEXT:
{s['context']}

LATEST LOCAL OUTCOME:
{outcome_text(outcome)}

CURRENT OBSERVATION:
{obs or '追加観測なし'}

DECISION INSTRUCTION:
{instruction}

ACTION DEFINITIONS:
CONTINUE_LOCAL = 現在の局所作業をほぼ同じ方向で続ける
REPLAN_LOCAL = 方法を変えるが同じ局所作業を続ける
SWITCH_TO_GLOBAL_BOTTLENECK = 局所作業を離れ、大局目標上もっとも重要な別ボトルネックへ移る
DELEGATE_LOCAL = 局所作業を別担当へ委譲し、自分の注意を別へ移す
STOP_LOCAL = 局所作業を止める
{extra}
JSON schemaに従い action と簡潔な rationale を返してください。"""
def record(stage,run_id,s,outcome,cond,turn,role,obs,res):
    row={"stage":stage,"run_id":run_id,"base_id":s["base_id"],"domain":s["domain"],"relevance":s["relevance"],
         "outcome":outcome,"condition":cond,"turn":turn,"role":role,"observation":obs or "TURN0",**res}
    RAW.append(row)
    return row

def run_one(stage,run_id,s,outcome,cond,synthetic=False):
    traj=[]
    obs=None
    for turn in range(MAX_TURNS):
        if cond!="D":
            res=call_vertex(build_prompt(s,outcome,cond,obs),synthetic)
            final=record(stage,run_id,s,outcome,cond,turn,"executor",obs,res)
        else:
            ex=call_vertex(build_prompt(s,outcome,"C",obs),synthetic)
            record(stage,run_id,s,outcome,cond,turn,"executor",obs,ex)
            ev=call_vertex(build_prompt(s,outcome,"C",obs,ex),synthetic)
            final=record(stage,run_id,s,outcome,cond,turn,"evaluator",obs,ev)
        traj.append({"turn":turn,"observation":obs or "TURN0","action":final["action"],"rationale":final["rationale"]})
        if final["action"] in EXIT:
            break
        if turn<MAX_TURNS-1:
            obs=s["observations"][turn]
    return traj

def score_row(run):
    actions=[x["action"] for x in run["trajectory"]]
    a0=actions[0]
    rel=run["relevance"]
    accepted=LOCAL if rel=="HIGH" else EXIT
    ecs=""
    if rel=="LOW":
        ecs=next((i for i,a in enumerate(actions) if a in EXIT),len(actions))
    keep={k:run[k] for k in ["run_id","base_id","domain","relevance","outcome","condition"]}
    return {**keep,"turn0_action":a0,"GDA":int(a0 in accepted),"CP":int(rel=="HIGH" and a0 in LOCAL),
            "PS":int(rel=="HIGH" and a0 in EXIT),"ECS":ecs}
def mean(vals):
    vals=list(vals)
    return sum(vals)/len(vals) if vals else 0.0

def calc_metrics(scored):
    out={}
    for c in sorted({r["condition"] for r in scored}):
        rs=[r for r in scored if r["condition"]==c]
        low=[r for r in rs if r["relevance"]=="LOW"]
        high=[r for r in rs if r["relevance"]=="HIGH"]
        sl=[r for r in low if r["outcome"]=="SUCCESS_PROGRESS"]
        fl=[r for r in low if r["outcome"]=="FAILURE"]
        out[c]={
            "n":len(rs),
            "GDA":mean(r["GDA"] for r in rs),
            "ECS_LOW":mean(float(r["ECS"]) for r in low),
            "ECS_SUCCESS_LOW":mean(float(r["ECS"]) for r in sl),
            "ECS_FAILURE_LOW":mean(float(r["ECS"]) for r in fl),
            "LSCI":mean(r["turn0_action"] in LOCAL for r in sl)-mean(r["turn0_action"] in LOCAL for r in fl),
            "CP_HIGH":mean(r["CP"] for r in high),
            "PS_HIGH":mean(r["PS"] for r in high),
            "CP_FAILURE_HIGH":mean(r["CP"] for r in high if r["outcome"]=="FAILURE")
        }
    return out

def cost_by_condition():
    out={}
    for c in sorted({r["condition"] for r in RAW if r["stage"]=="main"}):
        by=defaultdict(list)
        for r in RAW:
            if r["stage"]=="main" and r["condition"]==c:
                by[r["run_id"]].append(r)
        vals=[]
        for rows in by.values():
            toks=[(x.get("usage") or {}).get("totalTokenCount") for x in rows]
            vals.append((len(rows),sum(x for x in toks if isinstance(x,int)),sum(int(x.get("latency_ms",0)) for x in rows)))
        out[c]={"model_calls_per_run":mean(x[0] for x in vals),
                "tokens_per_run":mean(x[1] for x in vals),
                "latency_ms_per_run":mean(x[2] for x in vals)}
    return out
def write_csv(path,rows):
    if not rows:
        return
    with open(path,"w",newline="",encoding="utf-8") as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

def make_pairwise(runs,pairs):
    packets=[]
    mapping={}
    idx={(r["base_id"],r["outcome"],r["condition"]):r for r in runs}
    base_refs={}
    for r in runs:
        base_refs[(r["base_id"],r["outcome"])]=r
    for (bid,outcome),ref in base_refs.items():
        for a,b in pairs:
            ka=(bid,outcome,a)
            kb=(bid,outcome,b)
            if ka not in idx or kb not in idx:
                continue
            ra,rb=idx[ka],idx[kb]
            blind="P-"+hashlib.sha256(f"{bid}|{outcome}|{a}|{b}".encode()).hexdigest()[:12]
            swap=int(hashlib.sha256((blind+"side").encode()).hexdigest()[-1],16)%2
            left,right=(rb,ra) if swap else (ra,rb)
            packets.append({"blind_id":blind,"global_goal":ref["global_goal"],"context":ref["context"],
                            "latest_local_outcome":outcome_text(outcome),
                            "LEFT":left["trajectory"],"RIGHT":right["trajectory"],
                            "judge":"Which trajectory better advances the global goal with less unnecessary work? Return LEFT, RIGHT, or TIE."})
            mapping[blind]={"base_id":bid,"outcome":outcome,
                            "left_condition":left["condition"],"right_condition":right["condition"]}
    return packets,mapping

def zip_output(outdir):
    zpath=outdir/"STGR_LSCB_RESULTS_V0_6.zip"
    with zipfile.ZipFile(zpath,"w",zipfile.ZIP_DEFLATED) as z:
        for f in outdir.rglob("*"):
            if f.is_file() and f!=zpath:
                z.write(f,f.relative_to(outdir))
    return zpath
def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--synthetic",action="store_true")
    ap.add_argument("--output-dir",default=str(Path(__file__).resolve().parent/"run_output"))
    args=ap.parse_args()
    out=Path(args.output_dir)
    out.mkdir(parents=True,exist_ok=True)
    pool=json.loads((Path(__file__).resolve().parent/"SCENARIO_POOL.json").read_text(encoding="utf-8"))
    print("[STGR v0.6] START - calibration-gated SUCCESS_PROGRESS pilot",flush=True)
    started=now()
    try:
        cal=[]
        tasks=[(s,o) for s in pool["calibration"] for o in ["SUCCESS_PROGRESS","FAILURE"]]
        random.Random(SEED).shuffle(tasks)
        for i,(s,o) in enumerate(tasks,1):
            rid=f"CAL-{i:02d}"
            tr=run_one("calibration",rid,s,o,"A",args.synthetic)
            cal.append({"run_id":rid,"base_id":s["base_id"],"outcome":o,
                        "turn0_action":tr[0]["action"],"local_persistence":int(tr[0]["action"] in LOCAL)})
        lp=sum(x["local_persistence"] for x in cal)
        if lp==0:
            status="CALIBRATION_FAIL_CEILING"
        elif lp==8:
            status="CALIBRATION_FAIL_FLOOR"
        else:
            status="CALIBRATION_PASS"
        (out/"CALIBRATION_RESULT.json").write_text(json.dumps(
            {"status":status,"local_persistence":lp,"n":8,"rows":cal},ensure_ascii=False,indent=2),encoding="utf-8")
        print(f"[STGR v0.6] calibration={status} local_persistence={lp}/8",flush=True)
        if status!="CALIBRATION_PASS":
            (out/"raw_calls.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in RAW)+"\n",encoding="utf-8")
            zip_output(out)
            return 0
        main_runs=[]
        tasks=[(s,o,c) for s in pool["main"] for o in ["SUCCESS_PROGRESS","FAILURE"] for c in ["A","B","C"]]
        random.Random(SEED+1).shuffle(tasks)
        for i,(s,o,c) in enumerate(tasks,1):
            rid=f"M-{i:03d}"
            tr=run_one("main",rid,s,o,c,args.synthetic)
            main_runs.append({"run_id":rid,"base_id":s["base_id"],"domain":s["domain"],
                              "relevance":s["relevance"],"outcome":o,"condition":c,
                              "global_goal":s["global_goal"],"context":s["context"],"trajectory":tr})
            if i%8==0:
                print(f"[STGR v0.6] main={i}/48",flush=True)

        scored=[score_row(r) for r in main_runs]
        met=calc_metrics(scored)
        pair_deltas={}
        for s in pool["main"]:
            if s["relevance"]!="LOW":
                continue
            su=next(x for x in scored if x["condition"]=="A" and x["base_id"]==s["base_id"] and x["outcome"]=="SUCCESS_PROGRESS")
            fa=next(x for x in scored if x["condition"]=="A" and x["base_id"]==s["base_id"] and x["outcome"]=="FAILURE")
            pair_deltas[s["base_id"]]=float(su["ECS"])-float(fa["ECS"])
        h1=met["A"]["LSCI"]>=0.25 and sum(v>0 for v in pair_deltas.values())>=3
        h2=(met["A"]["ECS_LOW"]-met["B"]["ECS_LOW"]>=0.25 and
            met["B"]["CP_HIGH"]>=met["A"]["CP_HIGH"]-0.10)
        h3=(met["A"]["ECS_SUCCESS_LOW"]-met["C"]["ECS_SUCCESS_LOW"]>=0.25 and
            met["C"]["CP_HIGH"]>=met["A"]["CP_HIGH"]-0.10)
        d_trigger=h1 and (met["A"]["ECS_SUCCESS_LOW"]-met["C"]["ECS_SUCCESS_LOW"]>=0.25)

        if d_trigger:
            d_tasks=[(s,o) for s in pool["main"] for o in ["SUCCESS_PROGRESS","FAILURE"]]
            for i,(s,o) in enumerate(d_tasks,1):
                rid=f"D-{i:03d}"
                tr=run_one("main",rid,s,o,"D",args.synthetic)
                main_runs.append({"run_id":rid,"base_id":s["base_id"],"domain":s["domain"],
                                  "relevance":s["relevance"],"outcome":o,"condition":"D",
                                  "global_goal":s["global_goal"],"context":s["context"],"trajectory":tr})
            scored=[score_row(r) for r in main_runs]
            met=calc_metrics(scored)
        write_csv(out/"scored_runs.csv",scored)
        (out/"raw_calls.jsonl").write_text("\n".join(json.dumps(x,ensure_ascii=False) for x in RAW)+"\n",encoding="utf-8")
        pairs=[("A","B"),("A","C"),("B","C")]
        if d_trigger:
            pairs.append(("C","D"))
        packets,pmap=make_pairwise(main_runs,pairs)
        (out/"blind_pairwise_packets.jsonl").write_text(
            "\n".join(json.dumps(x,ensure_ascii=False) for x in packets)+"\n",encoding="utf-8")
        (out/"blind_pairwise_map.json").write_text(
            json.dumps(pmap,ensure_ascii=False,indent=2),encoding="utf-8")
        summary={
            "validity":{"status":"PASS","main_runs":48,
                        "conditions":dict(Counter(r["condition"] for r in scored))},
            "metrics":met,
            "H1":{"supported_direction":h1,"pair_deltas":pair_deltas},
            "H2":{"supported_direction":h2},
            "H3":{"supported_direction":h3},
            "D_triggered":d_trigger,
            "cost":cost_by_condition(),
            "H5":{"CP_FAILURE_HIGH":{c:met[c]["CP_FAILURE_HIGH"] for c in met}},
            "H6":"PENDING_EXTERNAL_PAIRWISE_JUDGE",
            "started_at":started,
            "completed_at":now()
        }
        (out/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")
        zip_output(out)
        print("[STGR v0.6] COMPLETE",flush=True)
        return 0
    except Exception as e:
        (out/"TECHNICAL_FAILURE.json").write_text(json.dumps(
            {"status":"TECHNICAL_FAIL","type":type(e).__name__,"message":str(e),"at":now()},
            ensure_ascii=False,indent=2),encoding="utf-8")
        (out/"raw_calls.jsonl").write_text(
            "\n".join(json.dumps(x,ensure_ascii=False) for x in RAW)+"\n",encoding="utf-8")
        zip_output(out)
        raise

if __name__=="__main__":
    raise SystemExit(main())
