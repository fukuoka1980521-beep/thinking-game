from __future__ import annotations
import math, random, re
from collections import Counter
import numpy as np

CONDITIONS = [
    "GENERIC","DIFFERENTIAL","BAYESIAN","FALSIFICATION",
    "CAUSAL","STATE_SPACE","SOFTWARE_TESTING"
]

FIXED_HEADINGS = [
    "objective and scope","assumptions","research design","data or evidence needed",
    "measurement","analysis","decision / stopping rule","decision stopping rule","limitations"
]

MASK_PHRASES = [
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

def features(text: str):
    ts = [x for x in normalize(text).split() if len(x) >= 2]
    out = ["u:" + x for x in ts]
    out.extend("b:" + ts[i] + "_" + ts[i+1] for i in range(len(ts)-1))
    return out

def fit_vectorizer(texts):
    docs = [features(t) for t in texts]
    df = Counter()
    for doc in docs:
        df.update(set(doc))
    n = len(docs)
    return {f: math.log((1+n)/(1+d)) + 1.0 for f,d in df.items()}

def vectorize(text, idf):
    c = Counter(f for f in features(text) if f in idf)
    v = {f:(1.0+math.log(n))*idf[f] for f,n in c.items()}
    norm = math.sqrt(sum(x*x for x in v.values()))
    return {k:x/norm for k,x in v.items()} if norm else {}

def dot(a,b):
    if len(a)>len(b):
        a,b=b,a
    return sum(x*b.get(k,0.0) for k,x in a.items())

def prepare_direction(train_rows, test_rows):
    idf = fit_vectorizer([r["text"] for r in train_rows])
    train_vecs = [vectorize(r["text"],idf) for r in train_rows]
    test_vecs = [vectorize(r["text"],idf) for r in test_rows]
    ntr, nte = len(train_vecs), len(test_vecs)
    tt = np.empty((ntr,ntr), dtype=np.float64)
    xt = np.empty((nte,ntr), dtype=np.float64)
    for i,a in enumerate(train_vecs):
        for j,b in enumerate(train_vecs):
            tt[i,j]=dot(a,b)
    for i,a in enumerate(test_vecs):
        for j,b in enumerate(train_vecs):
            xt[i,j]=dot(a,b)
    labels = np.array([CONDITIONS.index(r["condition"]) for r in train_rows],dtype=np.int16)
    return tt,xt,labels

def predict(tt,xt,label_indices):
    n=len(label_indices)
    m=np.zeros((n,len(CONDITIONS)),dtype=np.float64)
    m[np.arange(n),label_indices]=1.0
    num=xt @ m
    denom2=np.einsum("ic,ij,jc->c",m,tt,m,optimize=True)
    denom=np.sqrt(np.maximum(denom2,1e-15))
    scores=num/denom
    pred=np.argmax(scores,axis=1)
    return pred,scores

def evaluate_cross_task(rows,n_perm=10000,seed=20261002):
    t1=sorted([r for r in rows if r["task_id"]=="T1"],key=lambda x:x["id"])
    t2=sorted([r for r in rows if r["task_id"]=="T2"],key=lambda x:x["id"])
    tt1,xt12,l1=prepare_direction(t1,t2)
    tt2,xt21,l2=prepare_direction(t2,t1)
    truth2=np.array([CONDITIONS.index(r["condition"]) for r in t2],dtype=np.int16)
    truth1=np.array([CONDITIONS.index(r["condition"]) for r in t1],dtype=np.int16)
    pred12,scores12=predict(tt1,xt12,l1)
    pred21,scores21=predict(tt2,xt21,l2)
    c12=int(np.sum(pred12==truth2))
    c21=int(np.sum(pred21==truth1))
    observed=c12+c21
    rng=np.random.default_rng(seed)
    hits=0
    for _ in range(n_perm):
        pl1=rng.permutation(l1)
        pl2=rng.permutation(l2)
        p12,_=predict(tt1,xt12,pl1)
        p21,_=predict(tt2,xt21,pl2)
        c=int(np.sum(p12==truth2)+np.sum(p21==truth1))
        if c>=observed:
            hits+=1
    pval=(hits+1)/(n_perm+1)
    return {
        "train_T1_test_T2":{
            "correct":c12,"n":len(t2),"accuracy":c12/len(t2),
            "predictions":[
                {"id":r["id"],"true":r["condition"],"pred":CONDITIONS[int(p)]}
                for r,p in zip(t2,pred12)
            ]
        },
        "train_T2_test_T1":{
            "correct":c21,"n":len(t1),"accuracy":c21/len(t1),
            "predictions":[
                {"id":r["id"],"true":r["condition"],"pred":CONDITIONS[int(p)]}
                for r,p in zip(t1,pred21)
            ]
        },
        "combined_correct":observed,
        "combined_n":len(t1)+len(t2),
        "combined_accuracy":observed/(len(t1)+len(t2)),
        "permutation_p_one_sided":pval,
        "permutations":n_perm,
        "seed":seed
    }

def cross_task_distance(rows):
    idf=fit_vectorizer([r["text"] for r in rows])
    vec={r["id"]:vectorize(r["text"],idf) for r in rows}
    t1=[r for r in rows if r["task_id"]=="T1"]
    t2=[r for r in rows if r["task_id"]=="T2"]
    within=[]; between=[]
    for a in t1:
        for b in t2:
            d=1.0-dot(vec[a["id"]],vec[b["id"]])
            (within if a["condition"]==b["condition"] else between).append(d)
    return {
        "within_mean":sum(within)/len(within),
        "between_mean":sum(between)/len(between),
        "between_minus_within":sum(between)/len(between)-sum(within)/len(within),
        "within_n":len(within),
        "between_n":len(between)
    }
