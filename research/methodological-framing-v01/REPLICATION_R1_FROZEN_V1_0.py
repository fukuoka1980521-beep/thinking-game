from __future__ import annotations
import argparse, hashlib, json, os, threading, time, urllib.error, urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as m

BASE=Path(__file__).resolve().parent
METHODS=BASE/"FROZEN_STUDY_A_METHOD_BANK_V1_0.json"
TASKS=BASE/"FROZEN_REPLICATION_R1_TASK_BANK_V1_0.json"
MEASUREMENT=BASE/"FROZEN_STUDY_A_MEASUREMENT_V1_0.py"
PREREG=BASE/"REPLICATION_R1_PREREGISTRATION_V1_0.md"
FREEZE=BASE/"REPLICATION_R1_FREEZE_V1_0.json"
MANIFESTS={"R1A":BASE/"FROZEN_REPLICATION_R1A_MANIFEST_V1_0.jsonl","R1B":BASE/"FROZEN_REPLICATION_R1B_MANIFEST_V1_0.jsonl"}
ROOTS={"R1A":BASE/"replication_r1a","R1B":BASE/"replication_r1b"}
MODELS={"R1A":"gpt-5.6-sol","R1B":"gpt-6-luna"}
EXPECTED={"R1A":126,"R1B":252}
API="https://api.openai.com/v1/responses"
MAX_OUTPUT_TOKENS=8000
MAX_WORKERS=8
N_PERM=10000
SEED=20261002
CHANCE=1/7
LOCK=threading.Lock()

def now():
    return datetime.now(timezone.utc).isoformat()

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def verify_freeze():
    f=json.loads(FREEZE.read_text(encoding="utf-8"))
    checks={
        "method_bank_sha256":METHODS,
        "task_bank_sha256":TASKS,
        "measurement_code_sha256":MEASUREMENT,
        "preregistration_sha256":PREREG,
        "r1a_manifest_sha256":MANIFESTS["R1A"],
        "r1b_manifest_sha256":MANIFESTS["R1B"],
        "bundle_code_sha256":Path(__file__),
    }
    for k,p in checks.items():
        if sha(p)!=f[k]:
            raise SystemExit(f"freeze hash mismatch: {p.name}")
    if f.get("counted_runs_at_freeze")!=0:
        raise SystemExit("freeze counted_runs_at_freeze mismatch")
    return f

def get_key():
    key=os.environ.get("OPENAI_API_KEY","").strip()
    if key:
        return key
    if os.name=="nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER,r"Environment") as h:
                return str(winreg.QueryValueEx(h,"OPENAI_API_KEY")[0]).strip()
        except Exception:
            pass
    return ""

def prompt_for(objective,instruction):
    return f"""RESEARCH OBJECTIVE (identical within task):
{objective}

METHODOLOGICAL FRAMING:
{instruction}

OUTPUT REQUIREMENTS (identical across conditions):
Produce a research plan only, with these neutral headings:
1. Objective and scope
2. Assumptions
3. Research design
4. Data or evidence needed
5. Measurement
6. Analysis
7. Decision / stopping rule
8. Limitations

Within those headings, include whatever elements you judge scientifically necessary.
Do not mention that you are in an experiment comparing methodologies.
Do not use external tools."""

def output_text(resp):
    out=[]
    for item in resp.get("output",[]):
        if item.get("type")!="message":
            continue
        for part in item.get("content",[]):
            if part.get("type")=="output_text":
                out.append(part.get("text",""))
    return "".join(out)

def append_log(root,msg):
    root.mkdir(parents=True,exist_ok=True)
    with LOCK:
        with (root/"collection.log").open("a",encoding="utf-8") as h:
            h.write(f"{now()} {msg}\n")

def call(key,model,prompt,run_id,root):
    body={
        "model":model,
        "input":[{"role":"user","content":[{"type":"input_text","text":prompt}]}],
        "store":False,
        "max_output_tokens":MAX_OUTPUT_TOKENS,
        "temperature":1.0,
        "top_p":1.0,
        "reasoning":{"effort":"none"},
    }
    payload=json.dumps(body,ensure_ascii=False).encode("utf-8")
    last=None
    for attempt in range(1,6):
        started=now()
        try:
            req=urllib.request.Request(API,data=payload,headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},method="POST")
            with urllib.request.urlopen(req,timeout=240) as h:
                resp=json.loads(h.read().decode("utf-8"))
            if resp.get("model")!=model:
                raise RuntimeError(f"returned model mismatch: {resp.get('model')}")
            if resp.get("status")=="completed" and resp.get("incomplete_details") is None:
                return body,resp,attempt,started
            append_log(root,f"RETRY_INCOMPLETE run_id={run_id} attempt={attempt} status={resp.get('status')}")
            last=f"incomplete status={resp.get('status')}"
        except urllib.error.HTTPError as e:
            txt=e.read().decode("utf-8",errors="replace")
            append_log(root,f"HTTP_ERROR run_id={run_id} attempt={attempt} code={e.code}")
            if "credit_balance_exhausted" in txt or "insufficient_quota" in txt:
                raise RuntimeError("API_CREDIT_BALANCE_EXHAUSTED")
            last=repr(e)
        except Exception as e:
            append_log(root,f"RETRY run_id={run_id} attempt={attempt} error={type(e).__name__}")
            last=repr(e)
        time.sleep(min(2**attempt,20))
    raise RuntimeError(last or "request failure")

def load_config():
    methods={x["id"]:x for x in json.loads(METHODS.read_text(encoding="utf-8"))["conditions"]}
    tasks={x["id"]:x for x in json.loads(TASKS.read_text(encoding="utf-8"))["tasks"]}
    return methods,tasks

def collect(cohort):
    verify_freeze()
    key=get_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")
    methods,tasks=load_config()
    manifest=[json.loads(x) for x in MANIFESTS[cohort].read_text(encoding="utf-8").splitlines() if x.strip()]
    exp=EXPECTED[cohort]
    if len(manifest)!=exp or len({x["run_id"] for x in manifest})!=exp:
        raise SystemExit(f"{cohort} manifest invalid")
    root=ROOTS[cohort]; raw=root/"raw"; raw.mkdir(parents=True,exist_ok=True)
    model=MODELS[cohort]
    pending=[x for x in manifest if not (raw/f"{x['run_id']}.json").exists()]
    print(f"{cohort}_START done={exp-len(pending)} pending={len(pending)} workers={MAX_WORKERS}",flush=True)
    append_log(root,f"START pending={len(pending)}")
    def one(row):
        dest=raw/f"{row['run_id']}.json"
        if dest.exists(): return row["run_id"],"SKIP"
        cond=methods[row["condition_id"]]
        prompt=prompt_for(tasks[row["task_id"]]["objective"],cond["instruction"])
        body,resp,attempt,started=call(key,model,prompt,row["run_id"],root)
        txt=output_text(resp)
        if not txt.strip(): raise RuntimeError("empty output "+row["run_id"])
        rec={
            **row,"counted":True,"replication":"R1",
            "request_started_utc":started,"timestamp_utc":now(),
            "requested_model":model,"returned_model":resp.get("model"),
            "store":False,"max_output_tokens":MAX_OUTPUT_TOKENS,
            "temperature":1.0,"top_p":1.0,"reasoning_effort":"none",
            "attempt_count":attempt,"prompt_text":prompt,
            "prompt_sha256":hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
            "request_body":body,"response_id":resp.get("id"),
            "response_status":resp.get("status"),"incomplete_details":resp.get("incomplete_details"),
            "usage":resp.get("usage"),"raw_text":txt,"raw_response":resp,
        }
        tmp=dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        if dest.exists():
            tmp.unlink(missing_ok=True); return row["run_id"],"SKIP_RACE"
        tmp.replace(dest)
        append_log(root,f"COUNTED run_id={row['run_id']} response_id={resp.get('id')}")
        return row["run_id"],"OK"
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as ex:
        futs=[ex.submit(one,row) for row in pending]
        for fut in as_completed(futs):
            rid,status=fut.result()
            n=len(list(raw.glob("*.json")))
            print(f"{cohort} {n}/{exp} {rid} {status}",flush=True)
    n=len(list(raw.glob("*.json")))
    if n!=exp: raise SystemExit(f"{cohort} collection incomplete {n}/{exp}")
    append_log(root,f"COLLECTION_COMPLETE {exp}/{exp}")
    print(f"{cohort}_COLLECTION_COMPLETE={exp}/{exp}")

def validate():
    f=verify_freeze()
    methods,tasks=load_config()
    study_ids=set()
    for p in (BASE/"study_a"/"raw").glob("*.json"):
        r=json.loads(p.read_text(encoding="utf-8"))
        if r.get("response_id"): study_ids.add(r["response_id"])
    all_ids=set()
    families=m.CONDITIONS
    for cohort in ("R1A","R1B"):
        manifest=[json.loads(x) for x in MANIFESTS[cohort].read_text(encoding="utf-8").splitlines() if x.strip()]
        expected={x["run_id"]:x for x in manifest}; exp=EXPECTED[cohort]
        files=sorted((ROOTS[cohort]/"raw").glob("*.json"))
        if len(files)!=exp or {p.stem for p in files}!=set(expected):
            raise SystemExit(f"{cohort} raw incomplete/mismatch {len(files)}/{exp}")
        counts={}
        for p in files:
            r=json.loads(p.read_text(encoding="utf-8")); mr=expected[r["run_id"]]
            for k in ("task_id","condition_id","method_family","instruction_depth","replicate","cohort"):
                if r.get(k)!=mr.get(k): raise SystemExit(f"{cohort} manifest mismatch {r['run_id']} {k}")
            if r.get("counted") is not True or r.get("replication")!="R1": raise SystemExit("counted flag mismatch")
            if r.get("requested_model")!=MODELS[cohort] or r.get("returned_model")!=MODELS[cohort]: raise SystemExit("model mismatch")
            if r.get("response_status")!="completed" or r.get("incomplete_details") is not None: raise SystemExit("incomplete")
            if r.get("max_output_tokens")!=8000 or r.get("temperature")!=1.0 or r.get("top_p")!=1.0 or r.get("reasoning_effort")!="none": raise SystemExit("generation settings mismatch")
            api=r.get("response_id")
            if not api or api in all_ids or api in study_ids: raise SystemExit("duplicate/overlap response id")
            all_ids.add(api)
            prompt=prompt_for(tasks[r["task_id"]]["objective"],methods[r["condition_id"]]["instruction"])
            if r.get("prompt_text")!=prompt or r.get("prompt_sha256")!=hashlib.sha256(prompt.encode()).hexdigest(): raise SystemExit("prompt mismatch")
            if not str(r.get("raw_text","")).strip(): raise SystemExit("empty output")
            k=(r["task_id"],r["method_family"]); counts[k]=counts.get(k,0)+1
        if cohort=="R1A":
            for fam in families:
                if counts.get(("T3",fam))!=18: raise SystemExit(f"R1A cell mismatch {fam}")
        else:
            for task in ("T1","T2"):
                for fam in families:
                    if counts.get((task,fam))!=18: raise SystemExit(f"R1B cell mismatch {task} {fam}")
    print("REPLICATION_R1_VALIDATION=PASS")
    print("R1A=126 R1B=252 TOTAL=378")
    print("UNIQUE_R1_RESPONSE_IDS=378")
    print("STUDY_A_RESPONSE_ID_OVERLAP=0")
    print("COUNTED_RUNS_AT_FREEZE="+str(f["counted_runs_at_freeze"]))

def load_rows(path):
    rows=[]
    for p in sorted(path.glob("*.json")):
        r=json.loads(p.read_text(encoding="utf-8"))
        if r.get("instruction_depth")!="LABEL_ONLY": continue
        rows.append({"id":r["run_id"],"task_id":r["task_id"],"condition":r["method_family"],"text":r["raw_text"]})
    return rows

def direction(train_rows,test_rows):
    tt,xt,labels=m.prepare_direction(train_rows,test_rows)
    truth=np.array([m.CONDITIONS.index(r["condition"]) for r in test_rows],dtype=np.int16)
    pred,_=m.predict(tt,xt,labels)
    c=int(np.sum(pred==truth))
    return {"tt":tt,"xt":xt,"labels":labels,"truth":truth,"correct":c,"n":len(test_rows),"accuracy":c/len(test_rows),
            "predictions":[{"id":r["id"],"true":r["condition"],"pred":m.CONDITIONS[int(p)]} for r,p in zip(test_rows,pred)]}

def pair_distance(a,b):
    idf=m.fit_vectorizer([r["text"] for r in a+b])
    vec={r["id"]:m.vectorize(r["text"],idf) for r in a+b}
    within=[]; between=[]
    for x in a:
        for y in b:
            d=1.0-m.dot(vec[x["id"]],vec[y["id"]])
            (within if x["condition"]==y["condition"] else between).append(d)
    return {"within_mean":sum(within)/len(within),"between_mean":sum(between)/len(between),
            "between_minus_within":sum(between)/len(between)-sum(within)/len(within)}

def family_recall(blocks):
    preds=[]
    for b in blocks: preds+=b["predictions"]
    out={}
    for c in m.CONDITIONS:
        xs=[x for x in preds if x["true"]==c]; n=len(xs); cor=sum(x["pred"]==c for x in xs)
        out[c]={"correct":cor,"n":n,"recall":cor/n if n else None}
    return out

def analyze():
    validate()
    study=load_rows(BASE/"study_a"/"raw")
    t1=sorted([r for r in study if r["task_id"]=="T1"],key=lambda x:x["id"])
    t2=sorted([r for r in study if r["task_id"]=="T2"],key=lambda x:x["id"])
    t3=sorted(load_rows(ROOTS["R1A"]/"raw"),key=lambda x:x["id"])
    if (len(t1),len(t2),len(t3))!=(126,126,126): raise SystemExit("R1A denominator mismatch")
    d13=direction(t1,t3); d31=direction(t3,t1); d23=direction(t2,t3); d32=direction(t3,t2)
    dirs=[d13,d31,d23,d32]; observed=sum(x["correct"] for x in dirs)
    rng=np.random.default_rng(SEED); hits=0
    for _ in range(N_PERM):
        pl1=rng.permutation(d13["labels"]); pl2=rng.permutation(d23["labels"]); pl3=rng.permutation(d31["labels"])
        p13,_=m.predict(d13["tt"],d13["xt"],pl1); p23,_=m.predict(d23["tt"],d23["xt"],pl2)
        p31,_=m.predict(d31["tt"],d31["xt"],pl3); p32,_=m.predict(d32["tt"],d32["xt"],pl3)
        c=int(np.sum(p13==d13["truth"])+np.sum(p23==d23["truth"])+np.sum(p31==d31["truth"])+np.sum(p32==d32["truth"]))
        if c>=observed: hits+=1
    p_a=(hits+1)/(N_PERM+1)
    success_a=p_a<=0.01 and all(x["accuracy"]>CHANCE for x in dirs)
    r1b=load_rows(ROOTS["R1B"]/"raw")
    if len(r1b)!=252: raise SystemExit("R1B denominator mismatch")
    evb=m.evaluate_cross_task(r1b,n_perm=N_PERM,seed=SEED); distb=m.cross_task_distance(r1b)
    success_b=evb["permutation_p_one_sided"]<=0.01 and evb["train_T1_test_T2"]["accuracy"]>CHANCE and evb["train_T2_test_T1"]["accuracy"]>CHANCE
    result={
        "replication":"R1","counted":True,"total_new_n":378,"chance_accuracy":CHANCE,
        "R1A_new_task":{"model":"gpt-5.6-sol","new_n":126,
            "directions":{
                "T1_to_T3":{k:d13[k] for k in ("correct","n","accuracy","predictions")},
                "T3_to_T1":{k:d31[k] for k in ("correct","n","accuracy","predictions")},
                "T2_to_T3":{k:d23[k] for k in ("correct","n","accuracy","predictions")},
                "T3_to_T2":{k:d32[k] for k in ("correct","n","accuracy","predictions")}},
            "combined_correct":observed,"combined_n":504,"combined_accuracy":observed/504,
            "permutation_p_one_sided":p_a,"permutations":N_PERM,"per_family_recall":family_recall(dirs),
            "distance_T1_T3":pair_distance(t1,t3),"distance_T2_T3":pair_distance(t2,t3),
            "replication_success":success_a},
        "R1B_second_model":{"model":"gpt-6-luna","new_n":252,"cross_task_classification":evb,
            "cross_task_distance":distb,
            "per_family_recall":family_recall([{"predictions":evb["train_T1_test_T2"]["predictions"]},{"predictions":evb["train_T2_test_T1"]["predictions"]}]),
            "replication_success":success_b},
        "joint_external_replication_support":bool(success_a and success_b),
        "boundary":"observable black-box research-plan signatures only; no hidden-state or methodology-quality claim"}
    out=BASE/"replication_r1"/"analysis"; out.mkdir(parents=True,exist_ok=True)
    (out/"REPLICATION_R1_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")
    lines=["# External Replication R1 — Counted Results","",
        f"- Joint external replication support: **{result['joint_external_replication_support']}**","",
        "## R1a — New task, original model","",
        f"- replication success: **{success_a}**",
        f"- T1 -> T3: {d13['correct']}/{d13['n']} = {d13['accuracy']:.4f}",
        f"- T3 -> T1: {d31['correct']}/{d31['n']} = {d31['accuracy']:.4f}",
        f"- T2 -> T3: {d23['correct']}/{d23['n']} = {d23['accuracy']:.4f}",
        f"- T3 -> T2: {d32['correct']}/{d32['n']} = {d32['accuracy']:.4f}",
        f"- combined: {observed}/504 = {observed/504:.4f}",
        f"- 10,000-permutation p: {p_a:.6f}","",
        "## R1b — Second model, original tasks","",
        f"- model: gpt-6-luna",
        f"- replication success: **{success_b}**",
        f"- T1 -> T2: {evb['train_T1_test_T2']['correct']}/{evb['train_T1_test_T2']['n']} = {evb['train_T1_test_T2']['accuracy']:.4f}",
        f"- T2 -> T1: {evb['train_T2_test_T1']['correct']}/{evb['train_T2_test_T1']['n']} = {evb['train_T2_test_T1']['accuracy']:.4f}",
        f"- combined: {evb['combined_correct']}/{evb['combined_n']} = {evb['combined_accuracy']:.4f}",
        f"- 10,000-permutation p: {evb['permutation_p_one_sided']:.6f}","",
        "## Interpretation boundary","",
        "R1 tests task and model generalization of the frozen observable plan-signature effect.",
        "It does not reveal hidden reasoning states and does not rank methodologies."]
    (out/"REPLICATION_R1_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("REPLICATION_R1_ANALYSIS_COMPLETE")
    print("R1A_SUCCESS="+str(success_a))
    print("R1B_SUCCESS="+str(success_b))
    print("JOINT_EXTERNAL_REPLICATION_SUPPORT="+str(bool(success_a and success_b)))
    print(f"R1A_P={p_a:.6f}")
    print(f"R1B_P={evb['permutation_p_one_sided']:.6f}")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("action",choices=["verify-freeze","collect","validate","analyze"])
    ap.add_argument("--cohort",choices=["R1A","R1B"])
    args=ap.parse_args()
    if args.action=="verify-freeze":
        verify_freeze(); print("REPLICATION_R1_FREEZE_VERIFY=PASS")
    elif args.action=="collect":
        if not args.cohort: raise SystemExit("--cohort required")
        collect(args.cohort)
    elif args.action=="validate": validate()
    elif args.action=="analyze": analyze()

if __name__=="__main__":
    main()
