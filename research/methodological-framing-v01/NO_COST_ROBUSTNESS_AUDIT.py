from __future__ import annotations
import json, math
from pathlib import Path
from statistics import mean, median
import numpy as np
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as m

BASE=Path(__file__).resolve().parent
OUT=BASE/"no_cost_analysis"
OUT.mkdir(parents=True,exist_ok=True)
SEED=20261003
N_PERM=10000
N_SUB=200
CHANCE=1/7

def load_rows(path, task=None):
    rows=[]
    for p in sorted(path.glob("*.json")):
        r=json.loads(p.read_text(encoding="utf-8"))
        if r.get("instruction_depth")!="LABEL_ONLY":
            continue
        if task and r.get("task_id")!=task:
            continue
        rows.append({
            "id":r["run_id"],
            "task_id":r["task_id"],
            "condition":r["method_family"],
            "text":r["raw_text"],
        })
    return rows

A1=load_rows(BASE/"study_a"/"raw","T1")
A2=load_rows(BASE/"study_a"/"raw","T2")
A3=load_rows(BASE/"replication_r1a"/"raw","T3")
B1=load_rows(BASE/"replication_r1b"/"raw","T1")
B2=load_rows(BASE/"replication_r1b"/"raw","T2")

SETS={"A_T1":A1,"A_T2":A2,"A_T3":A3,"B_T1":B1,"B_T2":B2}
for k,v in SETS.items():
    if len(v)!=126:
        raise SystemExit(f"{k} n={len(v)} expected 126")

def prep(train,test):
    tt,xt,labels=m.prepare_direction(train,test)
    truth=np.array([m.CONDITIONS.index(r["condition"]) for r in test],dtype=np.int16)
    pred,_=m.predict(tt,xt,labels)
    return {"tt":tt,"xt":xt,"labels":labels,"truth":truth,
            "correct":int(np.sum(pred==truth)),"n":len(test),
            "accuracy":float(np.mean(pred==truth)),
            "pred":[m.CONDITIONS[int(x)] for x in pred]}

def dir_result(train_name,test_name):
    z=prep(SETS[train_name],SETS[test_name])
    return {k:z[k] for k in ("correct","n","accuracy")}

def combined_permutation(direction_pairs, shared_train_names):
    prepared=[(tr,te,prep(SETS[tr],SETS[te])) for tr,te in direction_pairs]
    observed=sum(z["correct"] for _,_,z in prepared)
    rng=np.random.default_rng(SEED)
    hits=0
    for _ in range(N_PERM):
        perms={}
        for name in shared_train_names:
            # all outgoing directions from same source use same permuted source labels
            source=next(z for tr,te,z in prepared if tr==name)
            perms[name]=rng.permutation(source["labels"])
        c=0
        for tr,te,z in prepared:
            pred,_=m.predict(z["tt"],z["xt"],perms[tr])
            c += int(np.sum(pred==z["truth"]))
        if c>=observed:
            hits += 1
    return {"correct":observed,
            "n":sum(z["n"] for _,_,z in prepared),
            "accuracy":observed/sum(z["n"] for _,_,z in prepared),
            "p_one_sided":(hits+1)/(N_PERM+1),
            "permutations":N_PERM}

def per_family(direction_pairs):
    stats={c:{"correct":0,"n":0} for c in m.CONDITIONS}
    for tr,te in direction_pairs:
        z=prep(SETS[tr],SETS[te])
        truth=[r["condition"] for r in SETS[te]]
        for t,p in zip(truth,z["pred"]):
            stats[t]["n"]+=1
            stats[t]["correct"]+=int(t==p)
    for c in stats:
        stats[c]["recall"]=stats[c]["correct"]/stats[c]["n"]
    return stats

# Original model, three tasks, all 6 directions
orig_pairs=[
    ("A_T1","A_T2"),("A_T2","A_T1"),
    ("A_T1","A_T3"),("A_T3","A_T1"),
    ("A_T2","A_T3"),("A_T3","A_T2"),
]
orig_dirs={f"{a}->{b}":dir_result(a,b) for a,b in orig_pairs}
orig_comb=combined_permutation(orig_pairs,["A_T1","A_T2","A_T3"])

# Cross-model, same task
same_task_pairs=[
    ("A_T1","B_T1"),("B_T1","A_T1"),
    ("A_T2","B_T2"),("B_T2","A_T2"),
]
same_dirs={f"{a}->{b}":dir_result(a,b) for a,b in same_task_pairs}
same_comb=combined_permutation(same_task_pairs,["A_T1","A_T2","B_T1","B_T2"])

# Cross-model AND cross-task
cross_pairs=[
    ("A_T1","B_T2"),("A_T2","B_T1"),
    ("B_T1","A_T2"),("B_T2","A_T1"),
]
cross_dirs={f"{a}->{b}":dir_result(a,b) for a,b in cross_pairs}
cross_comb=combined_permutation(cross_pairs,["A_T1","A_T2","B_T1","B_T2"])

# All model-transfer directions pooled
all_model_pairs=same_task_pairs+cross_pairs
all_model_comb=combined_permutation(all_model_pairs,["A_T1","A_T2","B_T1","B_T2"])

# Cost-efficiency/subsampling audit using Study A original T1/T2 and R1B T1/T2.
def stratified_sample(rows,n_per_class,rng):
    out=[]
    for c in m.CONDITIONS:
        idx=[i for i,r in enumerate(rows) if r["condition"]==c]
        pick=rng.choice(idx,size=n_per_class,replace=False)
        out += [rows[int(i)] for i in pick]
    return sorted(out,key=lambda x:x["id"])

def two_way_acc(x1,x2):
    z12=prep(x1,x2); z21=prep(x2,x1)
    return (z12["correct"]+z21["correct"])/(z12["n"]+z21["n"])

def quantiles(xs):
    arr=np.array(xs,float)
    return {
        "mean":float(np.mean(arr)),
        "median":float(np.median(arr)),
        "p05":float(np.quantile(arr,0.05)),
        "p95":float(np.quantile(arr,0.95)),
        "min":float(np.min(arr)),
        "max":float(np.max(arr)),
    }

rng=np.random.default_rng(SEED)
subsampling={}
for n in [3,6,9,12,15,18]:
    vals_a=[]; vals_b=[]
    for _ in range(N_SUB):
        vals_a.append(two_way_acc(stratified_sample(A1,n,rng),stratified_sample(A2,n,rng)))
        vals_b.append(two_way_acc(stratified_sample(B1,n,rng),stratified_sample(B2,n,rng)))
    subsampling[str(n)]={
        "plans_per_task":7*n,
        "total_plans_two_tasks":14*n,
        "original_model":quantiles(vals_a),
        "second_model":quantiles(vals_b),
    }

result={
    "status":"POST_HOC_NO_COST_ROBUSTNESS",
    "paid_api_calls":0,
    "existing_counted_responses_used":714,
    "chance_accuracy":CHANCE,
    "original_model_three_task_transfer":{
        "directions":orig_dirs,
        "combined":orig_comb,
        "per_family_recall":per_family(orig_pairs),
    },
    "cross_model_same_task_transfer":{
        "directions":same_dirs,
        "combined":same_comb,
        "per_family_recall":per_family(same_task_pairs),
    },
    "cross_model_cross_task_transfer":{
        "directions":cross_dirs,
        "combined":cross_comb,
        "per_family_recall":per_family(cross_pairs),
    },
    "all_cross_model_transfer":{
        "combined":all_model_comb,
        "per_family_recall":per_family(all_model_pairs),
    },
    "subsampling_cost_efficiency":{
        "repetitions_per_n":N_SUB,
        "results":subsampling,
    },
    "boundary":"post-hoc robustness using existing data only; no new API generation and no hidden-state or methodology-quality claim"
}
(OUT/"NO_COST_ROBUSTNESS_AUDIT.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

lines=[
    "# No-Cost Robustness Audit",
    "",
    "**Existing data only. Paid API calls in this audit: 0.**",
    "",
    "## Original model: all three tasks",
    "",
]
for k,v in orig_dirs.items():
    lines.append(f"- {k}: {v['correct']}/{v['n']} = {v['accuracy']:.4f}")
lines += [
    f"- combined: {orig_comb['correct']}/{orig_comb['n']} = **{orig_comb['accuracy']:.4f}**",
    f"- 10,000-permutation p: **{orig_comb['p_one_sided']:.6f}**",
    "",
    "## Cross-model transfer, same task",
    "",
]
for k,v in same_dirs.items():
    lines.append(f"- {k}: {v['correct']}/{v['n']} = {v['accuracy']:.4f}")
lines += [
    f"- combined: {same_comb['correct']}/{same_comb['n']} = **{same_comb['accuracy']:.4f}**",
    f"- 10,000-permutation p: **{same_comb['p_one_sided']:.6f}**",
    "",
    "## Cross-model + cross-task transfer",
    "",
]
for k,v in cross_dirs.items():
    lines.append(f"- {k}: {v['correct']}/{v['n']} = {v['accuracy']:.4f}")
lines += [
    f"- combined: {cross_comb['correct']}/{cross_comb['n']} = **{cross_comb['accuracy']:.4f}**",
    f"- 10,000-permutation p: **{cross_comb['p_one_sided']:.6f}**",
    "",
    "## All cross-model transfer pooled",
    "",
    f"- combined: {all_model_comb['correct']}/{all_model_comb['n']} = **{all_model_comb['accuracy']:.4f}**",
    f"- 10,000-permutation p: **{all_model_comb['p_one_sided']:.6f}**",
    "",
    "## Cost-efficiency audit",
    "",
    "| n/method/task | total plans (2 tasks) | original mean | original 5-95% | second-model mean | second-model 5-95% |",
    "|---:|---:|---:|---:|---:|---:|",
]
for n,row in subsampling.items():
    a=row["original_model"]; b=row["second_model"]
    lines.append(f"| {n} | {row['total_plans_two_tasks']} | {a['mean']:.3f} | {a['p05']:.3f}-{a['p95']:.3f} | {b['mean']:.3f} | {b['p05']:.3f}-{b['p95']:.3f} |")
lines += [
    "",
    "Interpretation: this is post-hoc robustness and cost-efficiency analysis, not a new preregistered experiment.",
]
(OUT/"NO_COST_ROBUSTNESS_AUDIT.md").write_text("\n".join(lines)+"\n",encoding="utf-8")

print("NO_COST_ROBUSTNESS=COMPLETE")
print("PAID_API_CALLS=0")
print(f"ORIG_3TASK_ACC={orig_comb['accuracy']:.6f} P={orig_comb['p_one_sided']:.6f}")
print(f"CROSS_MODEL_SAME_TASK_ACC={same_comb['accuracy']:.6f} P={same_comb['p_one_sided']:.6f}")
print(f"CROSS_MODEL_CROSS_TASK_ACC={cross_comb['accuracy']:.6f} P={cross_comb['p_one_sided']:.6f}")
print(f"ALL_CROSS_MODEL_ACC={all_model_comb['accuracy']:.6f} P={all_model_comb['p_one_sided']:.6f}")
