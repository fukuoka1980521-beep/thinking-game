from __future__ import annotations
import json, math, os, re
from concurrent.futures import ProcessPoolExecutor, as_completed
from collections import defaultdict
from pathlib import Path
import numpy as np
import FROZEN_STUDY_A_MEASUREMENT_V1_0 as m

BASE = Path(__file__).resolve().parent
N_PERM = int(os.environ.get("MF_PERMUTATIONS", "10000"))
SEED = 20261003

SECTION_NAMES = [
    "objective and scope",
    "assumptions",
    "research design",
    "data or evidence needed",
    "measurement",
    "analysis",
    "decision / stopping rule",
    "limitations",
]

def load_rows(path: Path, source: str):
    target={"SOL":"StudyA","SOL_T3":"R1A","LUNA":"R1B"}[source]
    public_data=BASE.parent/"data"/"all_counted_plans_714.jsonl"
    rows=[]
    for line in public_data.read_text(encoding="utf-8").splitlines():
        if not line.strip():
            continue
        r=json.loads(line)
        if r.get("study")!=target or r.get("instruction_depth")!="LABEL_ONLY":
            continue
        rows.append({
            "id":source+":"+r["run_id"],
            "source":source,
            "task_id":r["task_id"],
            "condition":r["method_family"],
            "text":r["raw_text"],
        })
    return rows

def text_direction(train_rows,test_rows):
    tt,xt,labels=m.prepare_direction(train_rows,test_rows)
    truth=np.array([m.CONDITIONS.index(r["condition"]) for r in test_rows],dtype=np.int16)
    pred,_=m.predict(tt,xt,labels)
    c=int(np.sum(pred==truth))
    return {
        "train_key":train_rows[0]["source"]+":"+train_rows[0]["task_id"],
        "tt":tt,"xt":xt,"labels":labels,"truth":truth,
        "correct":c,"n":len(test_rows),"accuracy":c/len(test_rows),
        "predictions":[{"id":r["id"],"true":r["condition"],"pred":m.CONDITIONS[int(p)]}
                       for r,p in zip(test_rows,pred)]
    }

def normalize_heading(line: str):
    x=line.lower().strip()
    x=re.sub(r"^[#>*\-\s]+","",x)
    x=re.sub(r"^\d+[.)\s:-]+","",x)
    x=x.replace("—","-").replace("–","-")
    x=re.sub(r"\s+"," ",x).strip(" :.-")
    return x

def structure_vector(text: str):
    lines=text.splitlines()
    sec_words=np.zeros(8,float)
    sec_lines=np.zeros(8,float)
    sec_bullets=np.zeros(8,float)
    sec_nums=np.zeros(8,float)
    current=None
    global_words=0
    nonempty=0
    bullet_total=0
    numbered_total=0
    heading_total=0
    sentence_total=0
    digit_total=0
    table_total=0
    for line in lines:
        raw=line
        s=raw.strip()
        if not s:
            continue
        nonempty+=1
        h=normalize_heading(s)
        matched=None
        for i,name in enumerate(SECTION_NAMES):
            if h==name or h.startswith(name+" "):
                matched=i
                break
        if matched is not None:
            current=matched
            heading_total+=1
            continue
        words=re.findall(r"\b\w+\b",s,flags=re.UNICODE)
        nw=len(words)
        global_words+=nw
        sentence_total+=len(re.findall(r"[.!?。！？]+",s))
        digit_total+=len(re.findall(r"\d",s))
        is_bullet=bool(re.match(r"^\s*[-*•]\s+",raw))
        is_num=bool(re.match(r"^\s*\d+[.)]\s+",raw))
        if is_bullet: bullet_total+=1
        if is_num: numbered_total+=1
        if "|" in s and s.count("|")>=2: table_total+=1
        if current is not None:
            sec_words[current]+=nw
            sec_lines[current]+=1
            sec_bullets[current]+=1 if is_bullet else 0
            sec_nums[current]+=1 if is_num else 0
    chars=len(text)
    paragraphs=len([x for x in re.split(r"\n\s*\n",text) if x.strip()])
    avg_line=global_words/nonempty if nonempty else 0
    globals_=np.array([
        global_words, chars, len(lines), nonempty, paragraphs,
        bullet_total, numbered_total, heading_total,
        sentence_total, digit_total, table_total, avg_line
    ],float)
    return np.concatenate([globals_,sec_words,sec_lines,sec_bullets,sec_nums])

def structure_direction(train_rows,test_rows):
    X=np.stack([structure_vector(r["text"]) for r in train_rows])
    Y=np.stack([structure_vector(r["text"]) for r in test_rows])
    mu=X.mean(axis=0)
    sd=X.std(axis=0)
    sd[sd<1e-9]=1.0
    X=(X-mu)/sd
    Y=(Y-mu)/sd
    labels=np.array([m.CONDITIONS.index(r["condition"]) for r in train_rows],dtype=np.int16)
    cent=np.zeros((len(m.CONDITIONS),X.shape[1]),float)
    for ci in range(len(m.CONDITIONS)):
        cent[ci]=X[labels==ci].mean(axis=0)
    # Euclidean nearest centroid
    d=((Y[:,None,:]-cent[None,:,:])**2).sum(axis=2)
    pred=np.argmin(d,axis=1)
    truth=np.array([m.CONDITIONS.index(r["condition"]) for r in test_rows],dtype=np.int16)
    c=int(np.sum(pred==truth))
    # Store train/test matrices for permutation centroid rebuild
    return {
        "train_key":train_rows[0]["source"]+":"+train_rows[0]["task_id"],
        "X":X,"Y":Y,"labels":labels,"truth":truth,
        "correct":c,"n":len(test_rows),"accuracy":c/len(test_rows),
        "predictions":[{"id":r["id"],"true":r["condition"],"pred":m.CONDITIONS[int(p)]}
                       for r,p in zip(test_rows,pred)]
    }

def perm_predict_structure(block, perm_labels):
    X,Y=block["X"],block["Y"]
    cent=np.zeros((len(m.CONDITIONS),X.shape[1]),float)
    for ci in range(len(m.CONDITIONS)):
        xs=X[perm_labels==ci]
        if len(xs):
            cent[ci]=xs.mean(axis=0)
    d=((Y[:,None,:]-cent[None,:,:])**2).sum(axis=2)
    return np.argmin(d,axis=1)

def joint_permutation(blocks, kind: str, n_perm=N_PERM, seed=SEED):
    observed=sum(b["correct"] for b in blocks)
    rng=np.random.default_rng(seed)
    unique={}
    for b in blocks:
        unique.setdefault(b["train_key"],b["labels"])
    hits=0
    null_sum=0
    for _ in range(n_perm):
        perms={k:rng.permutation(v) for k,v in unique.items()}
        c=0
        for b in blocks:
            pl=perms[b["train_key"]]
            if kind=="text":
                pred,_=m.predict(b["tt"],b["xt"],pl)
            else:
                pred=perm_predict_structure(b,pl)
            c+=int(np.sum(pred==b["truth"]))
        null_sum+=c
        if c>=observed: hits+=1
    return {
        "correct":observed,
        "n":sum(b["n"] for b in blocks),
        "accuracy":observed/sum(b["n"] for b in blocks),
        "permutation_p_one_sided":(hits+1)/(n_perm+1),
        "null_mean_accuracy":(null_sum/n_perm)/sum(b["n"] for b in blocks),
        "permutations":n_perm,
    }

def recall(blocks):
    xs=[]
    for b in blocks: xs.extend(b["predictions"])
    out={}
    for fam in m.CONDITIONS:
        z=[x for x in xs if x["true"]==fam]
        cor=sum(x["pred"]==fam for x in z)
        out[fam]={"correct":cor,"n":len(z),"recall":cor/len(z) if z else None}
    return out

def run_family(kind, train_test_pairs):
    builder=text_direction if kind=="text" else structure_direction
    blocks=[]
    for name,tr,te in train_test_pairs:
        b=builder(tr,te); b["name"]=name; blocks.append(b)
    joint=joint_permutation(blocks,kind)
    return {
        "directions":{b["name"]:{k:b[k] for k in ("correct","n","accuracy","predictions")} for b in blocks},
        "joint":joint,
        "pooled_recall":recall(blocks),
    }

def main():
    study=load_rows(BASE/"study_a"/"raw","SOL")
    r1a=load_rows(BASE/"replication_r1a"/"raw","SOL_T3")
    r1b=load_rows(BASE/"replication_r1b"/"raw","LUNA")
    sol_t1=sorted([r for r in study if r["task_id"]=="T1"],key=lambda x:x["id"])
    sol_t2=sorted([r for r in study if r["task_id"]=="T2"],key=lambda x:x["id"])
    sol_t3=sorted(r1a,key=lambda x:x["id"])
    luna_t1=sorted([r for r in r1b if r["task_id"]=="T1"],key=lambda x:x["id"])
    luna_t2=sorted([r for r in r1b if r["task_id"]=="T2"],key=lambda x:x["id"])
    sizes={k:len(v) for k,v in {
        "sol_t1":sol_t1,"sol_t2":sol_t2,"sol_t3":sol_t3,"luna_t1":luna_t1,"luna_t2":luna_t2}.items()}
    if sizes!={"sol_t1":126,"sol_t2":126,"sol_t3":126,"luna_t1":126,"luna_t2":126}:
        raise SystemExit("unexpected dataset sizes "+repr(sizes))

    double_pairs=[
        ("SOL_T1_to_LUNA_T2",sol_t1,luna_t2),
        ("SOL_T2_to_LUNA_T1",sol_t2,luna_t1),
        ("LUNA_T1_to_SOL_T2",luna_t1,sol_t2),
        ("LUNA_T2_to_SOL_T1",luna_t2,sol_t1),
    ]
    bridge_pairs=[
        ("SOL_T3_to_LUNA_T1",sol_t3,luna_t1),
        ("SOL_T3_to_LUNA_T2",sol_t3,luna_t2),
        ("LUNA_T1_to_SOL_T3",luna_t1,sol_t3),
        ("LUNA_T2_to_SOL_T3",luna_t2,sol_t3),
    ]
    same_pairs=[
        ("SOL_T1_to_LUNA_T1",sol_t1,luna_t1),
        ("LUNA_T1_to_SOL_T1",luna_t1,sol_t1),
        ("SOL_T2_to_LUNA_T2",sol_t2,luna_t2),
        ("LUNA_T2_to_SOL_T2",luna_t2,sol_t2),
    ]

    jobs={
        "frozen_text_measurement_double_shift":("text",double_pairs),
        "frozen_text_measurement_T3_bridge":("text",bridge_pairs),
        "frozen_text_measurement_same_task_cross_model":("text",same_pairs),
        "structure_only_double_shift":("structure",double_pairs),
        "structure_only_T3_bridge":("structure",bridge_pairs),
    }
    computed={}
    with ProcessPoolExecutor(max_workers=5) as ex:
        futs={ex.submit(run_family,kind,pairs):key for key,(kind,pairs) in jobs.items()}
        for fut in as_completed(futs):
            key=futs[fut]
            computed[key]=fut.result()
            print("DONE",key,flush=True)
    result={
        "status":"EXPLORATORY_ZERO_COST_ROBUSTNESS",
        "new_model_calls":0,
        "complete_counted_plans_available":714,
        "label_only_plans_used":630,
        **computed,
        "interpretation_boundary":"post-hoc robustness analysis on existing counted data; no new confirmatory claim",
    }
    out=BASE/"zero_cost_analysis"
    out.mkdir(exist_ok=True)
    (out/"ZERO_COST_ROBUSTNESS_V1.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=[
        "# Zero-Cost Robustness Analysis v1",
        "",
        "**Post-hoc robustness analysis using existing counted data only. New model calls: 0.**",
        "",
        "Complete counted plans available: Study A 336 + R1 378 = 714.",
        "This robustness analysis uses the 630 LABEL_ONLY plans: Study A 252 + R1 378.",
        "",
    ]
    sections=[
        ("Frozen text measurement: simultaneous model + task shift","frozen_text_measurement_double_shift"),
        ("Frozen text measurement: T3 / second-model bridge","frozen_text_measurement_T3_bridge"),
        ("Frozen text measurement: same-task cross-model","frozen_text_measurement_same_task_cross_model"),
        ("Structure-only: simultaneous model + task shift","structure_only_double_shift"),
        ("Structure-only: T3 / second-model bridge","structure_only_T3_bridge"),
    ]
    for title,key in sections:
        x=result[key]
        lines += ["## "+title,""]
        for name,d in x["directions"].items():
            lines.append(f"- {name}: {d['correct']}/{d['n']} = {d['accuracy']:.4f}")
        j=x["joint"]
        lines += [
            f"- combined: {j['correct']}/{j['n']} = **{j['accuracy']:.4f}**",
            f"- 10,000-permutation p: **{j['permutation_p_one_sided']:.6f}**",
            f"- permutation null mean accuracy: {j['null_mean_accuracy']:.4f}",
            "",
        ]
    lines += [
        "## Boundary",
        "",
        "This is exploratory robustness work performed after the confirmatory Study A/R1 results.",
        "It uses no new model generation and cannot upgrade the preregistered claim ceiling.",
        "The structure-only analysis intentionally discards lexical content and uses only plan-length / section / line / bullet / numbering features.",
    ]
    (out/"ZERO_COST_ROBUSTNESS_V1.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("ZERO_COST_ROBUSTNESS_V1=COMPLETE")
    for key in ("frozen_text_measurement_double_shift","frozen_text_measurement_T3_bridge","structure_only_double_shift","structure_only_T3_bridge"):
        j=result[key]["joint"]
        print(key, f"acc={j['accuracy']:.6f}", f"p={j['permutation_p_one_sided']:.6f}")

if __name__=="__main__":
    main()
