from __future__ import annotations
import hashlib, json, math, random, re
from collections import Counter
from pathlib import Path
import numpy as np

BASE = Path(__file__).resolve().parent
RAW = BASE / "calibration_v07" / "raw"
OUT = BASE / "calibration_v07" / "analysis"
PERM_N = 10000
SEED = 20261002
DIM = 8192
CLASSES = ["GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION","CAUSAL","STATE_SPACE","SOFTWARE_TESTING"]
NON_GENERIC = [c for c in CLASSES if c != "GENERIC"]

REDACTIONS = [
    r"\bgeneric\b",
    r"\bdifferential\b",
    r"\blocal[- ]sensitivity\b",
    r"\bbayesian\b",
    r"\bfalsification[- ]first\b",
    r"\bfalsification\b",
    r"\bcausal[- ]inference\b",
    r"\bstate[- ]space\b",
    r"\bsoftware[- ]testing\b",
]
RX_REDACT = re.compile("|".join(REDACTIONS), re.I)
RX_TOKEN = re.compile(r"[a-z0-9]+(?:'[a-z]+)?", re.I)

def stable_bucket(s: str) -> int:
    h = hashlib.blake2b(s.encode("utf-8"), digest_size=8).digest()
    return int.from_bytes(h, "little") % DIM

def vectorize(text: str) -> np.ndarray:
    text = RX_REDACT.sub(" METHODLABEL ", text)
    words = RX_TOKEN.findall(text.lower())
    counts = Counter()
    for w in words:
        counts["u:" + w] += 1
    for a,b in zip(words, words[1:]):
        counts["b:" + a + "_" + b] += 1
    v = np.zeros(DIM, dtype=np.float32)
    for feat, n in counts.items():
        v[stable_bucket(feat)] += math.log1p(n)
    norm = float(np.linalg.norm(v))
    if norm:
        v /= norm
    return v

def load_rows():
    rows=[]
    for f in sorted(RAW.glob("*.json")):
        r=json.loads(f.read_text(encoding="utf-8"))
        rows.append({
            "run_id":r["run_id"],
            "task":r["task_id"],
            "label":r["condition"],
            "text":r["raw_text"],
        })
    if len(rows)!=42:
        raise SystemExit(f"expected 42 rows, got {len(rows)}")
    return rows

def macro_f1(y, pred):
    vals=[]
    for c in CLASSES:
        tp=sum(a==c and b==c for a,b in zip(y,pred))
        fp=sum(a!=c and b==c for a,b in zip(y,pred))
        fn=sum(a==c and b!=c for a,b in zip(y,pred))
        p=tp/(tp+fp) if tp+fp else 0.0
        r=tp/(tp+fn) if tp+fn else 0.0
        vals.append(2*p*r/(p+r) if p+r else 0.0)
    return sum(vals)/len(vals)

def direction(train_idx, test_idx, X, labels, override_labels=None):
    train_labels = override_labels if override_labels is not None else [labels[i] for i in train_idx]
    Xtr=X[train_idx]
    Xte=X[test_idx]
    D=Xte @ Xtr.T
    G=Xtr @ Xtr.T
    scores=np.full((len(test_idx), len(CLASSES)), -1e9, dtype=np.float64)
    for ci,c in enumerate(CLASSES):
        ids=[j for j,l in enumerate(train_labels) if l==c]
        if not ids:
            continue
        ids=np.array(ids, dtype=int)
        num=D[:,ids].sum(axis=1)
        den=float(np.sqrt(G[np.ix_(ids,ids)].sum()))
        if den>0:
            scores[:,ci]=num/den
    pred=[CLASSES[i] for i in np.argmax(scores,axis=1)]
    y=[labels[i] for i in test_idx]
    acc=sum(a==b for a,b in zip(y,pred))/len(y)
    return acc, macro_f1(y,pred), pred

def main():
    rows=load_rows()
    X=np.stack([vectorize(r["text"]) for r in rows],axis=0)
    labels=[r["label"] for r in rows]
    t1=[i for i,r in enumerate(rows) if r["task"]=="T1"]
    t2=[i for i,r in enumerate(rows) if r["task"]=="T2"]

    a12,f12,p12=direction(t1,t2,X,labels)
    a21,f21,p21=direction(t2,t1,X,labels)
    combined=(a12+a21)/2
    macro=(f12+f21)/2

    rng=random.Random(SEED)
    lab1=[labels[i] for i in t1]
    lab2=[labels[i] for i in t2]
    hits=0
    null_sum=0.0
    for _ in range(PERM_N):
        x1=lab1[:]; x2=lab2[:]
        rng.shuffle(x1); rng.shuffle(x2)
        pa12,_,_=direction(t1,t2,X,labels,x1)
        pa21,_,_=direction(t2,t1,X,labels,x2)
        val=(pa12+pa21)/2
        null_sum += val
        if val >= combined:
            hits += 1
    pval=(hits+1)/(PERM_N+1)
    null_mean=null_sum/PERM_N

    confusion={c:{d:0 for d in CLASSES} for c in CLASSES}
    for idx,p in list(zip(t2,p12))+list(zip(t1,p21)):
        confusion[labels[idx]][p]+=1

    pooled_recall={}
    for c in CLASSES:
        denom=sum(confusion[c].values())
        pooled_recall[c]=confusion[c][c]/denom if denom else 0.0
    covered_non_generic=sum(pooled_recall[c] >= (1/3) for c in NON_GENERIC)

    checks={
        "combined_accuracy_ge_0_40": combined >= 0.40,
        "T1_to_T2_accuracy_ge_0_25": a12 >= 0.25,
        "T2_to_T1_accuracy_ge_0_25": a21 >= 0.25,
        "combined_macro_f1_ge_0_30": macro >= 0.30,
        "permutation_p_le_0_01": pval <= 0.01,
        "non_generic_recall_coverage_ge_4_of_6": covered_non_generic >= 4,
    }
    gate="GO" if all(checks.values()) else "NO_GO"

    result={
        "validation_only":True,
        "measurement":"delexicalized hashed unigram/bigram cosine nearest-centroid cross-task discriminability",
        "feature_dim":DIM,
        "direct_label_redaction":REDACTIONS,
        "T1_train_T2_test":{"accuracy":a12,"macro_f1":f12},
        "T2_train_T1_test":{"accuracy":a21,"macro_f1":f21},
        "combined_accuracy":combined,
        "combined_macro_f1":macro,
        "chance_accuracy":1/7,
        "permutation_n":PERM_N,
        "permutation_p":pval,
        "null_mean":null_mean,
        "pooled_recall":pooled_recall,
        "non_generic_classes_recall_ge_one_third":covered_non_generic,
        "confusion":confusion,
        "gate_checks":checks,
        "study_A_freeze":gate,
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"CALIBRATION_V07_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=[
        "# Calibration v0.7 Results",
        "",
        "**NON-COUNTED FRESH INSTRUMENT VALIDATION.**",
        "",
        f"- Study A freeze: **{gate}**",
        f"- T1 -> T2 accuracy: **{a12:.3f}**",
        f"- T2 -> T1 accuracy: **{a21:.3f}**",
        f"- combined cross-task accuracy: **{combined:.3f}**",
        f"- combined macro-F1: **{macro:.3f}**",
        f"- chance accuracy: **{1/7:.3f}**",
        f"- permutation p ({PERM_N}): **{pval:.6f}**",
        f"- permutation null mean: **{null_mean:.3f}**",
        f"- non-generic recall coverage >=1/3: **{covered_non_generic}/6**",
        "",
        "## Pooled class recall",
        "",
    ]
    for c in CLASSES:
        lines.append(f"- {c}: {pooled_recall[c]:.3f}")
    lines += ["", "## Gate checks", ""]
    for k,v in checks.items():
        lines.append(f"- {k}: {v}")
    lines += [
        "",
        "Interpretation boundary: observable cross-task method-linked plan signature only; no hidden-state or method-quality claim.",
    ]
    (OUT/"CALIBRATION_V07_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")

    print("CALIBRATION_V07_ANALYSIS_COMPLETE")
    print("STUDY_A_FREEZE="+gate)
    print(f"T1_TO_T2_ACC={a12:.6f}")
    print(f"T2_TO_T1_ACC={a21:.6f}")
    print(f"COMBINED_ACC={combined:.6f}")
    print(f"MACRO_F1={macro:.6f}")
    print(f"PERM_P={pval:.6f}")
    print(f"NON_GENERIC_COVERAGE={covered_non_generic}/6")

if __name__=="__main__":
    main()
