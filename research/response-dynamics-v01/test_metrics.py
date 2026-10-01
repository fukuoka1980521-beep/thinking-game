from metrics import (
    pairwise_semantic_disagreement, modal_flip_rate, semantic_class_entropy,
    response_state_distance, premise_hardening, amplification_ratio,
    correction_effectiveness, cohen_kappa, sensitivity_by_condition
)

def state(cls="A", claim="UNVERIFIED", decision="WAIT", evidence=None,
          referent=None, uncertainty=2, assertion=1, error=1,
          abstain=False, new=False):
    return {
        "semantic_answer_class":cls,
        "claim_state":claim,
        "decision_or_action":decision,
        "evidence_set":evidence or [],
        "referent_tuple":referent or {"entity":None,"environment":None,"version":None,"time":None},
        "uncertainty_level":uncertainty,
        "assertion_strength":assertion,
        "error_level":error,
        "abstention_or_request":abstain,
        "new_supporting_evidence":new,
    }

def test_semantic_metrics():
    x=["A","A","B","A"]
    assert abs(pairwise_semantic_disagreement(x)-0.5) < 1e-9
    assert abs(modal_flip_rate(x)-0.25) < 1e-9
    assert semantic_class_entropy(["A","B"]) == 1.0

def test_state_distance_identity_and_change():
    a=state()
    assert response_state_distance(a,a) == 0
    b=state(cls="B", assertion=4, evidence=["s1"])
    assert response_state_distance(a,b) > 0

def test_premise_hardening_requires_no_new_evidence():
    traj=[state(assertion=1),state(assertion=2),state(assertion=3,new=False)]
    assert premise_hardening(traj) == {"eligible":True,"hardened":True,"turn":3}
    traj2=[state(assertion=1),state(assertion=3,new=True)]
    assert premise_hardening(traj2)["hardened"] is False

def test_error_dynamics():
    assert amplification_ratio(1,2) == 2.0
    assert amplification_ratio(0,2) is None
    assert correction_effectiveness(2,0) == 1.0
    assert correction_effectiveness(2,1) == 0.5
    assert correction_effectiveness(1,2) == -1.0

def test_kappa():
    assert cohen_kappa(["A","B"],["A","B"]) == 1.0
    assert cohen_kappa(["A","A","B","B"],["A","B","B","B"]) < 1.0

def test_sensitivity():
    rows=[
        {"condition":"PARAPHRASE_A","baseline_state":state(),"perturbed_state":state(cls="B")},
        {"condition":"PARAPHRASE_A","baseline_state":state(),"perturbed_state":state(cls="A")},
        {"condition":"PRIOR_ANSWER","baseline_state":state(),"perturbed_state":state(cls="B",assertion=4)},
    ]
    out=sensitivity_by_condition(rows)
    assert out["PARAPHRASE_A"]["n"] == 2
    assert out["PRIOR_ANSWER"]["mean_rsd"] > out["PARAPHRASE_A"]["mean_rsd"]
