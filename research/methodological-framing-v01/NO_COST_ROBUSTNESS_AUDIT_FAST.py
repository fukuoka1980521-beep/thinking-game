from __future__ import annotations
import json
from pathlib import Path
import numpy as np
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as m

BASE=Path(__file__).resolve().parent
OUT=BASE/"no_cost_analysis"
OUT.mkdir(parents=True,exist_ok=True)
SEED=20261003
N_PERM=10000
BATCH=250
N_SUB=50
CHANCE=1/7

def load_rows(path, task=None):
    rows=[]
    for p in sorted(path.glob("*.json")):
        r=json.loads(p.read_text(encoding="utf-8"))
        if r.get("instruction_depth")!="LABEL_ONLY":
            continue
        if task and r.get("task_id")!=task:
            continue
        rows.append({"id":r["run_id"],"task_id":r["task_id"],
                     "condition":r["method_family"],"text":r["raw_text"]})
    return rows

SETS={
    "A_T1":load_rows(BASE/"study_a"/"raw","T1"),
    "A_T2":load_rows(BASE/"study_a"/"raw","T2"),
    "A_T3":load_rows(BASE/"replication_r1a"/"raw","T3"),
    "B_T1":load_rows(BASE/"replication_r1b"/"raw","T1"),
    "B_T2":load_rows(BASE/"replication_r1b"/"raw","T2"),
}
for k,v in SETS.items():
    if len(v)!=126:
        raise SystemExit(f"{k} n={len(v)} expected 126")

def prep(train_name,test_name):
    train=SETS[train_name]; test=SETS[test_name]
    tt,xt,labels=m.prepare_direction(train,test)
    truth=np.array([m.CONDITIONS.index(r["condition"]) for r in test],dtype=np.int16)
    pred,_=m.predict(tt,xt,labels)
    return {
        "train":train_name,"test":test_name,
        "tt":tt,"xt":xt,"labels":labels,"truth":truth,
        "pred":pred,
        "correct":int(np.sum(pred==truth)),
        "n":len(test),
        "accuracy":float(np.mean(pred==truth)),
    }

PREP={}
def getprep(a,b):
    key=(a,b)
    if key not in PREP:
        PREP[key]=prep(a,b)
    return PREP[key]

def dir_public(a,b):
    z=getprep(a,b)
    return {"correct":z["correct"],"n":z["n"],"accuracy":z["accuracy"]}

def permute_labels(base_labels,nperm,rng):
    arr=np.empty((nperm,len(base_labels)),dtype=np.int16)
    for i in range(nperm):
        arr[i]=rng.permutation(base_labels)
    return arr

def batch_correct(z, perms):
    out=np.empty(len(perms),dtype=np.int32)
    tt=z["tt"]; xt=z["xt"]; truth=z["truth"]
    n=tt.shape[0]; c=len(m.CONDITIONS)
    ar=np.arange(n)
    for s in range(0,len(perms),BATCH):
        pl=perms[s:s+BATCH]
        b=len(pl)
        M=np.zeros((b,n,c),dtype=np.float64)
        M[:,ar,:][np.arange(b)[:,None],ar[None,:],pl] = 1.0
        # Above advanced assignment is unreliable on temporary views; build directly.
        M.fill(0.0)
        bi=np.arange(b)[:,None]
        M[bi,ar[None,:],pl]=1.0
        num=np.einsum("ij,bjc->bic",xt,M,optimize=True)
        denom2=np.einsum("bjc,jk,bkc->bc",M,tt,M,optimize=True)
        scores=num/np.sqrt(np.maximum(denom2[:,None,:],1e-15))
        pred=np.argmax(scores,axis=2)
        out[s:s+b]=np.sum(pred==truth[None,:],axis=1)
    return out

def combined_test(pairs,source_names,seed):
    zs=[getprep(a,b) for a,b in pairs]
    observed=sum(z["correct"] for z in zs)
    rng=np.random.default_rng(seed)
    perms={}
    for name in source_names:
        z=next(z for z in zs if z["train"]==name)
        perms[name]=permute_labels(z["labels"],N_PERM,rng)
    total=np.zeros(N_PERM,dtype=np.int32)
    for z in zs:
        total += batch_correct(z,perms[z["train"]])
    p=(int(np.sum(total>=observed))+1)/(N_PERM+1)
    return {
        "correct":observed,
        "n":sum(z["n"] for z in zs),
        "accuracy":observed/sum(z["n"] for z in zs),
        "p_one_sided":p,
        "permutations":N_PERM,
        "null_mean_accuracy":float(np.mean(total)/sum(z["n"] for z in zs)),
        "null_p95_accuracy":float(np.quantile(total/sum(z["n"] for z in zs),0.95)),
    }

def family_recall(pairs):
    stats={c:{"correct":0,"n":0} for c in m.CONDITIONS}
    for a,b in pairs:
        z=getprep(a,b)
        test=SETS[b]
        for row,pred in zip(test,z["pred"]):
            c=row["condition"]
            stats[c]["n"]+=1
            stats[c]["correct"]+=int(m.CONDITIONS[int(pred)]==c)
    for c in stats:
        stats[c]["recall"]=stats[c]["correct"]/stats[c]["n"]
    return stats

orig_pairs=[
    ("A_T1","A_T2"),("A_T2","A_T1"),
    ("A_T1","A_T3"),("A_T3","A_T1"),
    ("A_T2","A_T3"),("A_T3","A_T2"),
]
same_task_pairs=[
    ("A_T1","B_T1"),("B_T1","A_T1"),
    ("A_T2","B_T2"),("B_T2","A_T2"),
]
cross_pairs=[
    ("A_T1","B_T2"),("A_T2","B_T1"),
    ("B_T1","A_T2"),("B_T2","A_T1"),
]
all_model_pairs=same_task_pairs+cross_pairs

orig_dirs={f"{a}->{b}":dir_public(a,b) for a,b in orig_pairs}
same_dirs={f"{a}->{b}":dir_public(a,b) for a,b in same_task_pairs}
cross_dirs={f"{a}->{b}":dir_public(a,b) for a,b in cross_pairs}

orig_comb=combined_test(orig_pairs,["A_T1","A_T2","A_T3"],SEED)
same_comb=combined_test(same_task_pairs,["A_T1","A_T2","B_T1","B_T2"],SEED+1)
cross_comb=combined_test(cross_pairs,["A_T1","A_T2","B_T1","B_T2"],SEED+2)
all_model_comb=combined_test(all_model_pairs,["A_T1","A_T2","B_T1","B_T2"],SEED+3)

# Cost-efficiency audit: fixed measurement re-fit on smaller stratified subsets.
def stratified(rows,n,rng):
    out=[]
    for c in m.CONDITIONS:
        idx=np.array([i for i,r in enumerate(rows) if r["condition"]==c],dtype=int)
        pick=rng.choice(idx,size=n,replace=False)
        out += [rows[int(i)] for i in pick]
    return sorted(out,key=lambda x:x["id"])

def two_way_acc(x1,x2):
    tt,xt,l1=m.prepare_direction(x1,x2)
    truth2=np.array([m.CONDITIONS.index(r["condition"]) for r in x2],dtype=np.int16)
    p12,_=m.predict(tt,xt,l1)
    tt,xt,l2=m.prepare_direction(x2,x1)
    truth1=np.array([m.CONDITIONS.index(r["condition"]) for r in x1],dtype=np.int16)
    p21,_=m.predict(tt,xt,l2)
    return float((np.sum(p12==truth2)+np.sum(p21==truth1))/(len(x1)+len(x2)))

def qstats(xs):
    a=np.array(xs,float)
    return {"mean":float(np.mean(a)),"median":float(np.median(a)),
            "p05":float(np.quantile(a,.05)),"p95":float(np.quantile(a,.95)),
            "min":float(np.min(a)),"max":float(np.max(a))}

rng=np.random.default_rng(SEED+10)
sub={}
for n in [3,6,9,12,18]:
    va=[]; vb=[]
    for _ in range(N_SUB):
        va.append(two_way_acc(stratified(SETS["A_T1"],n,rng),stratified(SETS["A_T2"],n,rng)))
        vb.append(two_way_acc(stratified(SETS["B_T1"],n,rng),stratified(SETS["B_T2"],n,rng)))
    sub[str(n)]={"plans_per_task":7*n,"total_plans_two_tasks":14*n,
                 "original_model":qstats(va),"second_model":qstats(vb)}

result={
    "status":"POST_HOC_NO_COST_ROBUSTNESS",
    "paid_api_calls":0,
    "existing_counted_responses_used":714,
    "chance_accuracy":CHANCE,
    "original_model_three_task_transfer":{
        "directions":orig_dirs,"combined":orig_comb,
        "per_family_recall":family_recall(orig_pairs)},
    "cross_model_same_task_transfer":{
        "directions":same_dirs,"combined":same_comb,
        "per_family_recall":family_recall(same_task_pairs)},
    "cross_model_cross_task_transfer":{
        "directions":cross_dirs,"combined":cross_comb,
        "per_family_recall":family_recall(cross_pairs)},
    "all_cross_model_transfer":{
        "combined":all_model_comb,
        "per_family_recall":family_recall(all_model_pairs)},
    "subsampling_cost_efficiency":{
        "repetitions_per_n":N_SUB,"results":sub},
    "boundary":"post-hoc robustness using existing data only; no new API generation and no hidden-state or methodology-quality claim"
}
(OUT/"NO_COST_ROBUSTNESS_AUDIT.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

lines=["# No-Cost Robustness Audit","",
       "**Existing counted data only. Paid API calls in this audit: 0.**","",
       "## Original model: T1/T2/T3 all six transfer directions",""]
for k,v in orig_dirs.items(): lines.append(f"- {k}: {v['correct']}/{v['n']} = {v['accuracy']:.4f}")
lines += [f"- combined: {orig_comb['correct']}/{orig_comb['n']} = **{orig_comb['accuracy']:.4f}**",
          f"- 10,000-permutation p: **{orig_comb['p_one_sided']:.6f}**","",
          "## Cross-model transfer, same task",""]
for k,v in same_dirs.items(): lines.append(f"- {k}: {v['correct']}/{v['n']} = {v['accuracy']:.4f}")
lines += [f"- combined: {same_comb['correct']}/{same_comb['n']} = **{same_comb['accuracy']:.4f}**",
          f"- 10,000-permutation p: **{same_comb['p_one_sided']:.6f}**","",
          "## Cross-model + cross-task transfer",""]
for k,v in cross_dirs.items(): lines.append(f"- {k}: {v['correct']}/{v['n']} = {v['accuracy']:.4f}")
lines += [f"- combined: {cross_comb['correct']}/{cross_comb['n']} = **{cross_comb['accuracy']:.4f}**",
          f"- 10,000-permutation p: **{cross_comb['p_one_sided']:.6f}**","",
          "## All cross-model transfer pooled","",
          f"- combined: {all_model_comb['correct']}/{all_model_comb['n']} = **{all_model_comb['accuracy']:.4f}**",
          f"- 10,000-permutation p: **{all_model_comb['p_one_sided']:.6f}**","",
          "## Cost-efficiency audit","",
          "| n/method/task | total plans (2 tasks) | original mean | original 5-95% | second-model mean | second-model 5-95% |",
          "|---:|---:|---:|---:|---:|---:|"]
for n,row in sub.items():
    a=row["original_model"]; b=row["second_model"]
    lines.append(f"| {n} | {row['total_plans_two_tasks']} | {a['mean']:.3f} | {a['p05']:.3f}-{a['p95']:.3f} | {b['mean']:.3f} | {b['p05']:.3f}-{b['p95']:.3f} |")
lines += ["","This is post-hoc robustness and cost-efficiency analysis, not a new preregistered experiment."]
(OUT/"NO_COST_ROBUSTNESS_AUDIT.md").write_text("\n".join(lines)+"\n",encoding="utf-8")

print("NO_COST_ROBUSTNESS=COMPLETE")
print("PAID_API_CALLS=0")
print(f"ORIG_3TASK_ACC={orig_comb['accuracy']:.6f} P={orig_comb['p_one_sided']:.6f}")
print(f"CROSS_MODEL_SAME_TASK_ACC={same_comb['accuracy']:.6f} P={same_comb['p_one_sided']:.6f}")
print(f"CROSS_MODEL_CROSS_TASK_ACC={cross_comb['accuracy']:.6f} P={cross_comb['p_one_sided']:.6f}")
print(f"ALL_CROSS_MODEL_ACC={all_model_comb['accuracy']:.6f} P={all_model_comb['p_one_sided']:.6f}")
