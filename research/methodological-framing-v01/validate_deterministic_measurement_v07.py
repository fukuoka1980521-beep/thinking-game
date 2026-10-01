from __future__ import annotations
import json, math, random, re
from collections import Counter, defaultdict
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v06"
BLIND = ROOT / "blind"
KEY = ROOT / "BLIND_KEY.jsonl"
OUT = BASE / "calibration_v07_deterministic"
SEED = 20261002
N_PERM = 10000
CONDITIONS = [
    "GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION",
    "CAUSAL","STATE_SPACE","SOFTWARE_TESTING"
]

FIXED_HEADINGS = [
    "objective and scope","assumptions","research design","data or evidence needed",
    "measurement","analysis","decision / stopping rule","decision stopping rule","limitations"
]

MASK_PHRASES = [
    # Treatment labels and close canonical names
    "differential approach","differential","derivative","derivatives","gradient","gradients",
    "local sensitivity","sensitivity analysis","finite difference","finite differences",
    "perturbation","perturbations","noise floor",
    "bayesian approach","bayesian","bayes","prior","priors","posterior","posteriors",
    "likelihood","likelihoods","bayes factor","bayes factors","credible interval","credible intervals",
    "falsification first","falsification","falsify","falsified","falsifiable",
    "disconfirmation","disconfirm","counterexample","counterexamples",
    "severe test","severe tests","refutation","refute","refuted",
    "causal inference","causal","causality","counterfactual","counterfactuals",
    "treatment effect","treatment effects","average treatment effect",
    "intervention effect","intervention effects","identification strategy",
    "propensity score","propensity scores","instrumental variable","instrumental variables",
    "difference in differences","directed acyclic graph","directed acyclic graphs",
    "state space","state vector","state vectors","latent state","latent states",
    "state transition","state transitions","transition equation","transition equations",
    "observation equation","observation equations","markov",
    "software testing","unit test","unit tests","integration test","integration tests",
    "regression test","regression tests","metamorphic test","metamorphic tests",
    "test oracle","test oracles","test case","test cases","test harness","test harnesses",
    "fuzz test","fuzz tests","boundary test","boundary tests"
]

def read_jsonl(path: Path):
    return [json.loads(x) for x in path.read_text(encoding="utf-8").splitlines() if x.strip()]

def normalize(text: str) -> str:
    t = text.lower()
    t = t.replace("–","-").replace("—","-").replace("−","-")
    t = re.sub(r"[-_/]+", " ", t)
    for h in FIXED_HEADINGS:
        t = re.sub(r"\b" + re.escape(h) + r"\b", " ", t)
    for phrase in sorted(MASK_PHRASES, key=len, reverse=True):
        p = phrase.replace("-"," ")
        t = re.sub(r"(?<![a-z])" + re.escape(p) + r"(?![a-z])", " ", t)
    t = re.sub(r"[^a-z\s]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def tokens(text: str):
    return [x for x in text.split() if len(x) >= 2]

def features(text: str):
    ts = tokens(normalize(text))
    out = []
    out.extend("u:" + x for x in ts)
    out.extend("b:" + ts[i] + "_" + ts[i+1] for i in range(len(ts)-1))
    return out

def fit_vectorizer(texts):
    docs = [features(t) for t in texts]
    df = Counter()
    for doc in docs:
        df.update(set(doc))
    n = len(docs)
    idf = {f: math.log((1+n)/(1+d)) + 1.0 for f,d in df.items()}
    return idf

def vectorize(text, idf):
    c = Counter(f for f in features(text) if f in idf)
    v = {}
    for f,n in c.items():
        v[f] = (1.0 + math.log(n)) * idf[f]
    norm = math.sqrt(sum(x*x for x in v.values()))
    if norm:
        v = {k:x/norm for k,x in v.items()}
    return v

def dot(a,b):
    if len(a) > len(b):
        a,b=b,a
    return sum(x*b.get(k,0.0) for k,x in a.items())

def prepare_direction(train_rows, test_rows):
    idf = fit_vectorizer([r["text"] for r in train_rows])
    train_vecs = [vectorize(r["text"], idf) for r in train_rows]
    test_vecs = [vectorize(r["text"], idf) for r in test_rows]
    tt = [[dot(a,b) for b in train_vecs] for a in train_vecs]
    xt = [[dot(x,t) for t in train_vecs] for x in test_vecs]
    return train_vecs, test_vecs, tt, xt

def groups_from_labels(labels):
    groups = {c:[] for c in CONDITIONS}
    for i,l in enumerate(labels):
        groups[l].append(i)
    return groups

def predict_with_groups(tt, xt, groups):
    centroid_den = {}
    for c, idxs in groups.items():
        # norm of the unscaled sum of normalized document vectors
        s = 0.0
        for i in idxs:
            for j in idxs:
                s += tt[i][j]
        centroid_den[c] = math.sqrt(max(s, 1e-15))
    preds=[]
    scores_all=[]
    for xrow in xt:
        scores={}
        for c in CONDITIONS:
            idxs=groups[c]
            num=sum(xrow[i] for i in idxs)
            scores[c]=num/centroid_den[c]
        best=max(CONDITIONS, key=lambda c:(scores[c], -CONDITIONS.index(c)))
        preds.append(best)
        scores_all.append(scores)
    return preds, scores_all

def direction(train_rows,test_rows):
    _,_,tt,xt=prepare_direction(train_rows,test_rows)
    labels=[r["condition"] for r in train_rows]
    groups=groups_from_labels(labels)
    preds,scores=predict_with_groups(tt,xt,groups)
    correct=sum(p==r["condition"] for p,r in zip(preds,test_rows))
    return {
        "correct":correct,
        "n":len(test_rows),
        "accuracy":correct/len(test_rows),
        "predictions":[
            {"blind_id":r["blind_id"],"true":r["condition"],"pred":p,"scores":s}
            for r,p,s in zip(test_rows,preds,scores)
        ],
        "_tt":tt,"_xt":xt,"_train_labels":labels
    }

def perm_test(d1,d2,test1,test2):
    rnd=random.Random(SEED)
    observed=d1["correct"]+d2["correct"]
    hits=0
    labels1=list(d1["_train_labels"])
    labels2=list(d2["_train_labels"])
    for _ in range(N_PERM):
        p1=list(labels1); p2=list(labels2)
        rnd.shuffle(p1); rnd.shuffle(p2)
        pred1,_=predict_with_groups(d1["_tt"],d1["_xt"],groups_from_labels(p1))
        pred2,_=predict_with_groups(d2["_tt"],d2["_xt"],groups_from_labels(p2))
        c=sum(p==r["condition"] for p,r in zip(pred1,test1))
        c+=sum(p==r["condition"] for p,r in zip(pred2,test2))
        if c >= observed:
            hits += 1
    return (hits+1)/(N_PERM+1)

def cross_task_distance(rows):
    # Secondary statistic: labels do not enter feature fitting.
    idf=fit_vectorizer([r["text"] for r in rows])
    vec={r["blind_id"]:vectorize(r["text"],idf) for r in rows}
    t1=[r for r in rows if r["task_id"]=="T1"]
    t2=[r for r in rows if r["task_id"]=="T2"]
    within=[]; between=[]
    for a in t1:
        for b in t2:
            d=1.0-dot(vec[a["blind_id"]],vec[b["blind_id"]])
            (within if a["condition"]==b["condition"] else between).append(d)
    return {
        "within_mean":sum(within)/len(within),
        "between_mean":sum(between)/len(between),
        "between_minus_within":sum(between)/len(between)-sum(within)/len(within),
        "within_n":len(within),"between_n":len(between)
    }

def confusion(predictions):
    m={c:{d:0 for d in CONDITIONS} for c in CONDITIONS}
    for r in predictions:
        m[r["true"]][r["pred"]]+=1
    return m

def main():
    key=read_jsonl(KEY)
    if len(key)!=42:
        raise SystemExit("expected 42 key rows")
    rows=[]
    for meta in key:
        p=BLIND/(meta["blind_id"]+".json")
        item=json.loads(p.read_text(encoding="utf-8"))
        rows.append({**meta,"text":item["plan_text"]})
    counts=Counter((r["task_id"],r["condition"]) for r in rows)
    if any(counts[(t,c)]!=3 for t in ("T1","T2") for c in CONDITIONS):
        raise SystemExit("cell count mismatch")

    t1=sorted([r for r in rows if r["task_id"]=="T1"],key=lambda x:x["blind_id"])
    t2=sorted([r for r in rows if r["task_id"]=="T2"],key=lambda x:x["blind_id"])

    a=direction(t1,t2)  # train T1 -> test T2
    b=direction(t2,t1)  # train T2 -> test T1
    p=perm_test(a,b,t2,t1)
    dist=cross_task_distance(rows)

    combined=a["correct"]+b["correct"]
    gate=(
        a["correct"]>=7 and b["correct"]>=7 and combined>=14
        and p<=0.01 and dist["between_minus_within"]>0
    )

    result={
        "calibration_only":True,
        "algorithm":"masked_word_1_2gram_tfidf_cross_task_nearest_centroid",
        "seed":SEED,"permutations":N_PERM,
        "train_T1_test_T2":{k:v for k,v in a.items() if not k.startswith("_")},
        "train_T2_test_T1":{k:v for k,v in b.items() if not k.startswith("_")},
        "combined_correct":combined,
        "combined_n":42,
        "combined_accuracy":combined/42,
        "permutation_p_one_sided":p,
        "cross_task_distance":dist,
        "confusion_T1_to_T2":confusion(a["predictions"]),
        "confusion_T2_to_T1":confusion(b["predictions"]),
        "gate":"GO" if gate else "NO_GO"
    }
    OUT.mkdir(parents=True,exist_ok=True)
    (OUT/"CALIBRATION_V07_RESULTS.json").write_text(json.dumps(result,indent=2),encoding="utf-8")

    lines=[
        "# Calibration v0.7 Deterministic Measurement Results","",
        "**NON-COUNTED INSTRUMENT VALIDATION.**","",
        f"- Gate: **{result['gate']}**",
        f"- T1 -> T2: {a['correct']}/21 = {a['accuracy']:.3f}",
        f"- T2 -> T1: {b['correct']}/21 = {b['accuracy']:.3f}",
        f"- combined: {combined}/42 = {combined/42:.3f}",
        f"- permutation p (10,000): {p:.6f}",
        f"- cross-task within distance: {dist['within_mean']:.6f}",
        f"- cross-task between distance: {dist['between_mean']:.6f}",
        f"- between-minus-within: {dist['between_minus_within']:.6f}",
        "",
        "Method labels and the frozen broad method lexicon were removed before feature extraction.",
        "No LLM judge was used for the primary measurement."
    ]
    (OUT/"CALIBRATION_V07_RESULTS.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("CALIBRATION_V07_ANALYSIS_COMPLETE")
    print("GATE="+result["gate"])
    print(f"T1_TO_T2={a['correct']}/21")
    print(f"T2_TO_T1={b['correct']}/21")
    print(f"COMBINED={combined}/42")
    print(f"PERM_P={p:.6f}")
    print(f"DIST_EXCESS={dist['between_minus_within']:.6f}")

if __name__=="__main__":
    main()
