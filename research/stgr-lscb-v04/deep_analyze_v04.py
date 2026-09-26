#!/usr/bin/env python3
import csv, json, sys
from collections import defaultdict, Counter
from pathlib import Path

ACTIONS={"CONTINUE","REPLAN","DELEGATE","STOP","RETURN_TO_GOAL"}

def mean(xs):
    xs=list(xs)
    return sum(xs)/len(xs) if xs else None

def load_jsonl(p):
    return [json.loads(x) for x in Path(p).read_text(encoding="utf-8").splitlines() if x.strip()]

def main(root):
    root=Path(root)
    scored=list(csv.DictReader((root/"scored_runs.csv").open(encoding="utf-8-sig", newline="")))
    raw=load_jsonl(root/"raw_runs.jsonl")
    fq=load_jsonl(root/"final_goal_quality.jsonl")

    # Normalize
    for r in scored:
        for k in ["GDA","PS","CP","FinalGoalQuality"]:
            r[k]=int(r[k])
        r["ECS"]=None if r["ECS"]=="" else float(r["ECS"])

    # Scenario x condition replicate agreement.
    cells=defaultdict(list)
    for r in scored:
        cells[(r["scenario_id"],r["condition_id"])].append(r)
    rep=[]
    for (sid,cid),rs in sorted(cells.items()):
        acts={r["turn0_action"] for r in rs}
        ecs={r["ECS"] for r in rs}
        fqs={r["FinalGoalQuality"] for r in rs}
        rep.append({
            "scenario_id":sid,"condition_id":cid,"n":len(rs),
            "turn0_action_agree":len(acts)==1,
            "ECS_agree":len(ecs)==1,
            "FQ_agree":len(fqs)==1,
            "actions":sorted(acts),
            "ECS_values":sorted(x for x in ecs if x is not None),
            "FQ_values":sorted(fqs),
        })

    # Scenario-level averages: treat duplicate deterministic prompts as stability checks.
    scen=[]
    for (sid,cid),rs in sorted(cells.items()):
        scen.append({
            "scenario_id":sid,
            "condition_id":cid,
            "domain":rs[0]["domain"],
            "local_outcome":rs[0]["local_outcome"],
            "global_relevance":rs[0]["global_relevance"],
            "GDA":mean(r["GDA"] for r in rs),
            "PS":mean(r["PS"] for r in rs),
            "CP":mean(r["CP"] for r in rs),
            "ECS":mean(r["ECS"] for r in rs if r["ECS"] is not None),
            "FQ":mean(r["FinalGoalQuality"] for r in rs),
        })

    cond={}
    for cid in "ABCD":
        rs=[r for r in scen if r["condition_id"]==cid]
        low=[r for r in rs if r["global_relevance"]=="LOW"]
        high=[r for r in rs if r["global_relevance"]=="HIGH"]
        cond[cid]={
            "scenario_n":len(rs),
            "GDA":mean(r["GDA"] for r in rs),
            "mean_ECS_LOW":mean(r["ECS"] for r in low),
            "PS_HIGH":mean(r["PS"] for r in high),
            "CP_HIGH":mean(r["CP"] for r in high),
            "mean_FQ":mean(r["FQ"] for r in rs),
        }

    # H1: paired domain-level success-low minus failure-low ECS using scenario means.
    h1={}
    for domain in sorted({r["domain"] for r in scen}):
        a=[r for r in scen if r["condition_id"]=="A" and r["domain"]==domain and r["global_relevance"]=="LOW"]
        s=[r for r in a if r["local_outcome"]=="SUCCESS"]
        f=[r for r in a if r["local_outcome"]=="FAILURE"]
        h1[domain]=(s[0]["ECS"]-f[0]["ECS"]) if s and f else None

    # D executor/evaluator changes at t0.
    d0=defaultdict(dict)
    for r in raw:
        if r["condition_id"]=="D" and int(r["turn"])==0:
            d0[r["run_id"]][r["role"]]=r
    # Need gold correctness from scored evaluator row; executor correctness cannot be
    # recovered from scored alone, so report changes and final GDA; final research
    # review can join frozen gold if needed.
    d_changes=[]
    for rid,p in sorted(d0.items()):
        if "executor" in p and "evaluator" in p:
            d_changes.append({
                "run_id":rid,
                "scenario_id":p["executor"]["scenario_id"],
                "executor":p["executor"]["final_action"],
                "evaluator":p["evaluator"]["final_action"],
                "changed":p["executor"]["final_action"]!=p["evaluator"]["final_action"],
            })

    # Cost per run: sum every actual model call, capturing D's extra evaluator.
    calls=defaultdict(list)
    for r in raw:
        calls[r["run_id"]].append(r)
    cost_rows=[]
    scored_by_id={r["run_id"]:r for r in scored}
    for rid,rs in calls.items():
        toks=[]
        for x in rs:
            u=x.get("usage") or {}
            v=u.get("totalTokenCount")
            if isinstance(v,int):
                toks.append(v)
        cost_rows.append({
            "run_id":rid,
            "condition_id":scored_by_id[rid]["condition_id"],
            "model_calls":len(rs),
            "total_tokens":sum(toks) if toks else None,
            "sum_latency_ms":sum(int(x.get("latency_ms",0) or 0) for x in rs),
        })
    cost={}
    for cid in "ABCD":
        rs=[r for r in cost_rows if r["condition_id"]==cid]
        cost[cid]={
            "mean_model_calls_per_run":mean(r["model_calls"] for r in rs),
            "mean_total_tokens_per_run":mean(r["total_tokens"] for r in rs if r["total_tokens"] is not None),
            "mean_sum_latency_ms_per_run":mean(r["sum_latency_ms"] for r in rs),
        }

    out={
        "replicate_agreement":{
            "cells":len(rep),
            "turn0_action_agreement_rate":mean(x["turn0_action_agree"] for x in rep),
            "ECS_agreement_rate":mean(x["ECS_agree"] for x in rep),
            "FQ_agreement_rate":mean(x["FQ_agree"] for x in rep),
            "rows":rep,
        },
        "scenario_level_condition_metrics":cond,
        "H1_domain_ECS_success_minus_failure":h1,
        "D_turn0_action_changes":{
            "pairs":len(d_changes),
            "changed":sum(x["changed"] for x in d_changes),
            "rows":d_changes,
        },
        "per_run_cost":cost,
    }
    print(json.dumps(out,ensure_ascii=False,indent=2))

if __name__=="__main__":
    if len(sys.argv)!=2:
        raise SystemExit("usage: deep_analyze_v04.py <extracted-results-dir>")
    main(sys.argv[1])
