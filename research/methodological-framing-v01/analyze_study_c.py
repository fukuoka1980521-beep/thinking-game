from __future__ import annotations
import json
from collections import Counter
from pathlib import Path
from statistics import mean
import numpy as np

BASE=Path(__file__).resolve().parent
UNIVERSE=BASE/"FROZEN_STUDY_C_EVIDENCE_UNIVERSE_V1_0.json"
MANIFEST=BASE/"FROZEN_STUDY_C_MANIFEST_V1_0.jsonl"
RAW=BASE/"study_c"/"raw"
OUT=BASE/"study_c"/"analysis"
FAMILIES=["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
NON_GENERIC=[x for x in FAMILIES if x!="GENERIC"]
ROLES=[f"R{i}" for i in range(1,9)]
N_PERM=10000
SEED=2026100210

def norm(x):
    a=np.asarray(x,dtype=float)
    n=np.linalg.norm(a)
    return a/n if n else a

def full_vec(path):
    first=[1.0 if path[0]==r else 0.0 for r in ROLES]
    second=[1.0 if path[1]==r else 0.0 for r in ROLES]
    s=set(path)
    selected=[1.0 if r in s else 0.0 for r in ROLES]
    return norm(first+second+selected)

def first_vec(path):
    return norm([1.0 if path[0]==r else 0.0 for r in ROLES])

def set_vec(path):
    s=set(path)
    return norm([1.0 if r in s else 0.0 for r in ROLES])

def classify(train,test,vec_fn,override_labels=None):
    labels=override_labels if override_labels is not None else [r["method_family"] for r in train]
    X=np.stack([vec_fn(r["path_roles"]) for r in train])
    Y=np.stack([vec_fn(r["path_roles"]) for r in test])
    centroids=[]
    for fam in FAMILIES:
        ids=[i for i,l in enumerate(labels) if l==fam]
        if len(ids)!=18:
            raise RuntimeError(f"bad training cell {fam}={len(ids)}")
        centroids.append(norm(X[ids].mean(axis=0)))
    pred_idx=np.argmax(Y@np.stack(centroids).T,axis=1)
    pred=[FAMILIES[int(i)] for i in pred_idx]
    truth=[r["method_family"] for r in test]
    correct=sum(a==b for a,b in zip(truth,pred))
    return {
        "correct":correct,"n":len(test),"accuracy":correct/len(test),
        "predictions":pred,"truth":truth
    }

def pooled_recall(a,b):
    pairs=list(zip(a["truth"],a["predictions"]))+list(zip(b["truth"],b["predictions"]))
    out={}
    for fam in FAMILIES:
        xs=[p for t,p in pairs if t==fam]
        c=sum(p==fam for p in xs)
        out[fam]={"correct":c,"n":len(xs),"recall":c/len(xs)}
    return out

def jaccard(a,b):
    A=set(a); B=set(b)
    return len(A&B)/len(A|B)

def load_and_validate():
    u=json.loads(UNIVERSE.read_text(encoding="utf-8"))
    worlds={w["id"]:w for w in u["worlds"]}
    if set(worlds)!={"C5","C6"}:
        raise SystemExit("world set mismatch")
    rolemap={wid:{x["module_id"]:x["role"] for x in w["catalog"]} for wid,w in worlds.items()}
    manifest={x["run_id"]:x for x in [json.loads(s) for s in MANIFEST.read_text(encoding="utf-8").splitlines() if s.strip()]}
    if len(manifest)!=252:
        raise SystemExit("manifest denominator mismatch")
    files=sorted(RAW.glob("*.json"))
    if len(files)!=252:
        raise SystemExit(f"expected 252 raw, got {len(files)}")

    rows=[]; api_ids=set()
    for p in files:
        r=json.loads(p.read_text(encoding="utf-8"))
        if r["run_id"] not in manifest:
            raise SystemExit("run not in manifest")
        mr=manifest[r["run_id"]]
        for k in ("world_id","method_family","replicate","catalog_order"):
            if r.get(k)!=mr.get(k):
                raise SystemExit(f"manifest mismatch {r['run_id']} {k}")
        if r.get("counted") is not True or r.get("study")!="C":
            raise SystemExit("counted flag mismatch")
        if r.get("requested_model")!="gpt-5.6-sol" or r.get("returned_models")!=["gpt-5.6-sol"]:
            raise SystemExit("model mismatch")
        mids=r["path_module_ids"]; roles=r["path_roles"]
        if len(mids)!=2 or len(set(mids))!=2:
            raise SystemExit("bad path")
        if roles!=[rolemap[r["world_id"]][x] for x in mids] or len(set(roles))!=2:
            raise SystemExit("role mapping mismatch")
        ids=r.get("all_response_ids",[])
        if len(ids)!=2 or len(set(ids))!=2:
            raise SystemExit("response ID structure mismatch")
        for rid in ids:
            if not rid or rid in api_ids:
                raise SystemExit("duplicate API response ID")
            api_ids.add(rid)
        rows.append(r)

    for wid in ("C5","C6"):
        counts=Counter(r["method_family"] for r in rows if r["world_id"]==wid)
        if any(counts[f]!=18 for f in FAMILIES):
            raise SystemExit(f"cell mismatch {wid}")
    return rows,api_ids

def main():
    rows,api_ids=load_and_validate()
    c5=[r for r in rows if r["world_id"]=="C5"]
    c6=[r for r in rows if r["world_id"]=="C6"]

    a56=classify(c5,c6,full_vec)
    a65=classify(c6,c5,full_vec)
    observed=a56["correct"]+a65["correct"]
    combined=observed/252

    rng=np.random.default_rng(SEED)
    l5=[r["method_family"] for r in c5]
    l6=[r["method_family"] for r in c6]
    hits=0
    for _ in range(N_PERM):
        q56=classify(c5,c6,full_vec,list(rng.permutation(l5)))
        q65=classify(c6,c5,full_vec,list(rng.permutation(l6)))
        if q56["correct"]+q65["correct"]>=observed:
            hits+=1
    p=(hits+1)/(N_PERM+1)

    rec=pooled_recall(a56,a65)
    coverage=sum(rec[f]["recall"]>=1/3 for f in NON_GENERIC)

    f56=classify(c5,c6,first_vec)
    f65=classify(c6,c5,first_vec)
    first_comb=(f56["correct"]+f65["correct"])/252

    s56=classify(c5,c6,set_vec)
    s65=classify(c6,c5,set_vec)
    set_comb=(s56["correct"]+s65["correct"])/252

    first_roles=sorted(set(r["path_roles"][0] for r in rows))
    same=[]; different=[]
    for a in c5:
        for b in c6:
            (same if a["method_family"]==b["method_family"] else different).append(jaccard(a["path_roles"],b["path_roles"]))

    openrates={}
    pair_counts={}
    first_counts={}
    for fam in FAMILIES:
        rr=[r for r in rows if r["method_family"]==fam]
        openrates[fam]={role:mean(role in r["path_roles"] for r in rr) for role in ("R4","R5","R7","R8")}
        pair_counts[fam]=dict(Counter("->".join(r["path_roles"]) for r in rr))
        first_counts[fam]=dict(Counter(r["path_roles"][0] for r in rr))

    checks={
        "trajectories_252_valid":len(rows)==252 and len(api_ids)==504,
        "exactly_two_distinct":all(len(r["path_roles"])==2 and len(set(r["path_roles"]))==2 for r in rows),
        "combined_accuracy_ge_0_30":combined>=0.30,
        "C5_to_C6_gt_chance":a56["accuracy"]>1/7,
        "C6_to_C5_gt_chance":a65["accuracy"]>1/7,
        "permutation_p_le_0_01":p<=0.01,
        "coverage_ge_3_of_6":coverage>=3
    }
    success=all(checks.values())

    result={
        "study":"C","counted":True,"n":252,"api_selection_calls":504,
        "chance_accuracy":1/7,
        "C5_to_C6":{k:a56[k] for k in ("correct","n","accuracy")},
        "C6_to_C5":{k:a65[k] for k in ("correct","n","accuracy")},
        "combined_correct":observed,"combined_n":252,"combined_accuracy":combined,
        "permutation_n":N_PERM,"permutation_p_one_sided":p,
        "pooled_recall":rec,"non_generic_recall_coverage_ge_one_third":coverage,
        "first_role_only_combined":first_comb,
        "selected_set_only_combined":set_comb,
        "first_roles_observed":first_roles,
        "first_role_distribution":first_counts,
        "selected_pair_distribution":pair_counts,
        "role_open_rates_R4_R5_R7_R8":openrates,
        "cross_world_jaccard":{
            "same_method_mean":mean(same),
            "different_method_mean":mean(different),
            "same_minus_different":mean(same)-mean(different)
        },
        "confirmatory_checks":checks,
        "confirmatory_success":success,
        "boundary":"observable black-box evidence-acquisition behavior only; no hidden-state or methodology-superiority claim"
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"STUDY_C_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=[
        "# Study C Counted Results","",
        f"- Confirmatory success: **{success}**",
        f"- C5 -> C6: {a56['correct']}/{a56['n']} = **{a56['accuracy']:.4f}**",
        f"- C6 -> C5: {a65['correct']}/{a65['n']} = **{a65['accuracy']:.4f}**",
        f"- combined: {observed}/252 = **{combined:.4f}**",
        f"- chance: **{1/7:.4f}**",
        f"- 10,000-permutation p: **{p:.6f}**",
        f"- non-generic recall coverage >=1/3: **{coverage}/6**",
        f"- first-role-only combined: **{first_comb:.4f}**",
        f"- selected-set-only combined: **{set_comb:.4f}**","",
        "## Pooled recall"
    ]
    for fam in FAMILIES:
        lines.append(f"- {fam}: {rec[fam]['recall']:.4f}")
    lines += [
        "",
        "## Cross-world selected-set overlap",
        f"- same-method mean Jaccard: {mean(same):.4f}",
        f"- different-method mean Jaccard: {mean(different):.4f}",
        f"- same-minus-different: {mean(same)-mean(different):.4f}",
        "",
        "## Interpretation boundary",
        "This is evidence about observable evidence-acquisition behavior under controlled scarcity.",
        "It does not reveal hidden chain-of-thought and does not rank methodologies."
    ]
    (OUT/"STUDY_C_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")

    print("STUDY_C_ANALYSIS_COMPLETE")
    print("CONFIRMATORY_SUCCESS="+str(success))
    print(f"C5_TO_C6={a56['accuracy']:.6f}")
    print(f"C6_TO_C5={a65['accuracy']:.6f}")
    print(f"COMBINED={combined:.6f}")
    print(f"PERM_P={p:.6f}")
    print(f"COVERAGE={coverage}/6")

if __name__=="__main__":
    main()
