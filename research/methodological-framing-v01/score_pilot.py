from __future__ import annotations
import argparse, json, os, time, urllib.request, urllib.error
from datetime import datetime, timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
BLIND=BASE/"pilot"/"blind"
API="https://api.openai.com/v1/responses"
PRIMARY="gpt-6-sol"
SECONDARY="gpt-5.6-terra"

BOOL_FIELDS=[
"competing_hypotheses_present","explicit_null_hypothesis_present",
"semantic_vs_nonsemantic_state_separated","multicomponent_output_state_present",
"sequential_state_or_transition_model_present","perturbation_design_present",
"graded_perturbation_present","baseline_repeat_noise_estimation_present",
"causal_treatment_outcome_framing_present","counterfactual_or_matched_control_present",
"irrelevant_control_present","measurement_error_explicit","scorer_reliability_explicit",
"blinding_present","randomization_present","stopping_rule_present",
"sample_size_or_power_rationale_present","reproducibility_harness_present",
"metamorphic_relation_present","uncertainty_update_rule_present",
"evidence_acquisition_plan_present","history_as_explicit_factor_present",
"verification_as_explicit_factor_present","referent_or_provenance_factor_present",
"claim_ceiling_or_scope_limit_present"
]
COUNT_FIELDS=["problem_decomposition_count","named_variable_count","hypothesis_count","falsification_criterion_count","primary_endpoint_count"]

INSTRUCTIONS="""You are a blinded research-methodology coder.
Score only design operations actually present in the supplied research plan.
Do not infer the hidden prompt condition.

Critical rule: method vocabulary alone does not count.
Examples:
- saying Bayesian does not establish an uncertainty update rule;
- saying causal does not establish a counterfactual;
- saying falsification does not establish a falsification criterion;
- saying state-space does not establish a transition model;
- saying testing does not establish a metamorphic relation.

Count explicit operational elements, not rhetorical synonyms.
problem_decomposition_count = number of explicit distinct research subproblems/workstreams.
named_variable_count = unique explicitly defined experimental variables, treatments, outcomes, or scored state variables.
hypothesis_count = explicit testable hypotheses; do not count generic questions.
falsification_criterion_count = distinct observable outcomes explicitly said to refute/weaken a claim.
primary_endpoint_count = explicitly designated primary outcome metrics; zero if none are designated primary.
Return only schema-constrained JSON."""

def now(): return datetime.now(timezone.utc).isoformat()

def api_key():
    k=os.environ.get("OPENAI_API_KEY","")
    if k: return k
    if os.name=="nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER,r"Environment") as h:
                v,_=winreg.QueryValueEx(h,"OPENAI_API_KEY")
                return str(v).strip()
        except Exception:
            pass
    return ""

def schema():
    props={}
    for f in BOOL_FIELDS: props[f]={"type":"boolean"}
    for f in COUNT_FIELDS: props[f]={"type":"integer","minimum":0,"maximum":50}
    props["plan_summary"]={"type":"string"}
    props["distinctive_method_signature"]={"type":"array","items":{"type":"string"},"maxItems":10}
    req=COUNT_FIELDS+BOOL_FIELDS+["plan_summary","distinctive_method_signature"]
    return {"type":"object","properties":props,"required":req,"additionalProperties":False}

def output_text(resp):
    out=[]
    for item in resp.get("output",[]):
        if item.get("type")=="message":
            for p in item.get("content",[]):
                if p.get("type")=="output_text": out.append(p.get("text",""))
    return "".join(out)

def request(key,model,item):
    body={
      "model":model,
      "input":[
        {"role":"developer","content":[{"type":"input_text","text":INSTRUCTIONS}]},
        {"role":"user","content":[{"type":"input_text","text":json.dumps(item,ensure_ascii=False)}]}
      ],
      "store":False,
      "max_output_tokens":1800,
      "reasoning":{"effort":"medium"},
      "text":{"format":{"type":"json_schema","name":"research_plan_state","strict":True,"schema":schema()}}
    }
    payload=json.dumps(body,ensure_ascii=False).encode("utf-8")
    req=urllib.request.Request(API,data=payload,headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"},method="POST")
    last=None
    for a in range(1,6):
        try:
            with urllib.request.urlopen(req,timeout=240) as h:
                resp=json.loads(h.read().decode("utf-8"))
            score=json.loads(output_text(resp))
            return body,resp,score
        except Exception as e:
            last=repr(e); time.sleep(min(2**a,20))
    raise RuntimeError(last)

def run(model,label):
    key=api_key()
    if not key: raise SystemExit("OPENAI_API_KEY missing")
    files=sorted(BLIND.glob("*.json"))
    if len(files)!=21: raise SystemExit(f"blind items incomplete: {len(files)}/21")
    out=BASE/"pilot"/"scoring"/label
    scores=out/"scores"; scores.mkdir(parents=True,exist_ok=True)
    done=0
    for f in files:
        item=json.loads(f.read_text(encoding="utf-8"))
        dest=scores/f.name
        if dest.exists():
            done+=1; continue
        body,resp,score=request(key,model,item)
        rec={
          "blind_id":item["blind_id"],"timestamp_utc":now(),
          "requested_scorer_model":model,"returned_scorer_model":resp.get("model"),
          "score":score,"response_id":resp.get("id"),"usage":resp.get("usage"),
          "raw_scorer_response":resp
        }
        dest.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        done+=1
        print(f"SCORED {label} {done}/21 {item['blind_id']}",flush=True)
    print(f"SCORING_COMPLETE {label}=21/21")

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--scorer",choices=["primary","secondary"],required=True)
    args=ap.parse_args()
    if args.scorer=="primary": run(PRIMARY,"primary-gpt-6-sol")
    else: run(SECONDARY,"secondary-gpt-5.6-terra")

if __name__=="__main__":
    main()
