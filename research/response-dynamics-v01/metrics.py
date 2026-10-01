from __future__ import annotations
from collections import Counter, defaultdict
from math import log2

def _jaccard_distance(a, b):
    sa, sb = set(a or []), set(b or [])
    if not sa and not sb:
        return 0.0
    return 1.0 - len(sa & sb) / len(sa | sb)

def _referent_distance(a, b):
    a, b = a or {}, b or {}
    keys = ["entity", "environment", "version", "time"]
    material = [k for k in keys if a.get(k) is not None or b.get(k) is not None]
    if not material:
        return None
    return sum(a.get(k) != b.get(k) for k in material) / len(material)

def component_distances(a, b):
    out = {}
    for k in ("semantic_answer_class", "claim_state", "decision_or_action"):
        av, bv = a.get(k), b.get(k)
        out[k] = None if av is None or bv is None else float(av != bv)
    out["evidence_set"] = _jaccard_distance(a.get("evidence_set", []), b.get("evidence_set", []))
    out["referent_tuple"] = _referent_distance(a.get("referent_tuple"), b.get("referent_tuple"))
    for k, scale in (("uncertainty_level", 4), ("assertion_strength", 4), ("error_level", 2)):
        av, bv = a.get(k), b.get(k)
        out[k] = None if av is None or bv is None else abs(float(av) - float(bv)) / scale
    av, bv = a.get("abstention_or_request"), b.get("abstention_or_request")
    out["abstention_or_request"] = None if av is None or bv is None else float(bool(av) != bool(bv))
    return out

def response_state_distance(a, b, weights=None):
    ds = component_distances(a, b)
    available = {k:v for k,v in ds.items() if v is not None}
    if not available:
        raise ValueError("no comparable state components")
    if weights is None:
        weights = {k:1.0 for k in available}
    den = sum(float(weights.get(k, 0.0)) for k in available)
    if den <= 0:
        raise ValueError("non-positive available weight")
    return sum(float(weights.get(k,0.0))*v for k,v in available.items()) / den

def pairwise_semantic_disagreement(classes):
    n = len(classes)
    if n < 2:
        raise ValueError("need >=2 classes")
    total = n*(n-1)//2
    disagree = sum(classes[i] != classes[j] for i in range(n) for j in range(i+1,n))
    return disagree/total

def modal_flip_rate(classes):
    if not classes:
        raise ValueError("empty classes")
    counts = Counter(classes)
    return 1 - max(counts.values())/len(classes)

def semantic_class_entropy(classes):
    if not classes:
        raise ValueError("empty classes")
    counts = Counter(classes); n = len(classes)
    return -sum((c/n)*log2(c/n) for c in counts.values())

def transition_counts(values):
    out = defaultdict(lambda: defaultdict(int))
    for a,b in zip(values, values[1:]):
        out[a][b] += 1
    return {a:dict(bs) for a,bs in out.items()}

def premise_hardening(states):
    if not states or int(states[0].get("assertion_strength",0)) > 2:
        return {"eligible":False,"hardened":False,"turn":None}
    for idx,s in enumerate(states[1:], start=2):
        if int(s.get("assertion_strength",0)) >= 3 and not bool(s.get("new_supporting_evidence",False)):
            return {"eligible":True,"hardened":True,"turn":idx}
    return {"eligible":True,"hardened":False,"turn":None}

def error_value(level):
    if level is None:
        return None
    if level not in (0,1,2):
        raise ValueError("error_level must be 0,1,2 or None")
    return level/2.0

def amplification_ratio(pre_level, post_level):
    pre,post = error_value(pre_level), error_value(post_level)
    if pre is None or post is None or pre == 0:
        return None
    return post/pre

def correction_effectiveness(pre_level, post_level):
    pre,post = error_value(pre_level), error_value(post_level)
    if pre is None or post is None or pre == 0:
        return None
    return (pre-post)/pre

def cohen_kappa(labels_a, labels_b):
    if len(labels_a) != len(labels_b) or not labels_a:
        raise ValueError("equal non-empty label lists required")
    n = len(labels_a)
    po = sum(a==b for a,b in zip(labels_a,labels_b))/n
    cats = set(labels_a)|set(labels_b)
    ca, cb = Counter(labels_a), Counter(labels_b)
    pe = sum((ca[c]/n)*(cb[c]/n) for c in cats)
    return 1.0 if pe == 1 else (po-pe)/(1-pe)

def sensitivity_by_condition(matched_pairs):
    bucket = defaultdict(list)
    for row in matched_pairs:
        bucket[row["condition"]].append((row["baseline_state"], row["perturbed_state"]))
    out = {}
    for condition,pairs in bucket.items():
        rsd = [response_state_distance(a,b) for a,b in pairs]
        comp = defaultdict(list)
        for a,b in pairs:
            for k,v in component_distances(a,b).items():
                if v is not None:
                    comp[k].append(v)
        out[condition] = {
            "n":len(pairs),
            "mean_rsd":sum(rsd)/len(rsd),
            **{f"mean_{k}_distance":sum(vs)/len(vs) for k,vs in comp.items()}
        }
    return out
