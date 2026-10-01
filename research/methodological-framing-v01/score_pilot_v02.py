from __future__ import annotations
import argparse,json,os,time,urllib.request
from datetime import datetime,timezone
from pathlib import Path

BASE=Path(__file__).resolve().parent
BLIND=BASE/"pilot"/"blind"
CFG=json.loads((BASE/"RESEARCH_STATE_SCHEMA_V0_2_DRAFT.json").read_text(encoding="utf-8"))
API="https://api.openai.com/v1/responses"
MODELS={"primary":"gpt-6-sol","secondary":"gpt-5.6-terra"}

COUNT_FIELDS=CFG["general_count_fields"]
BOOL_FIELDS=CFG["general_boolean_fields"]+[f for xs in CFG["signature_boolean_fields"].values() for f in xs]

INSTRUCTIONS="""You are a blinded research-methodology coder.
Score only explicit operational design content in the supplied plan. Do not infer the hidden prompting condition. Method names or slogans alone never count.

GENERAL COUNTS
problem_decomposition_count: count explicit distinct research subproblems/workstreams, not document headings and not every procedural step.
explicit_primary_endpoint_count: count only outcome metrics explicitly designated as primary/main endpoints; ordinary measurements do not count.
falsification_criterion_count: count distinct explicit observation-to-refutation mappings; a generic statement that a claim is falsifiable does not count.

GENERAL BOOLEANS
explicit_null_hypothesis_present: true only for an explicit testable no-effect/no-difference/null proposition.
sample_size_or_power_rationale_present: true only when sample size/repetitions are justified by power, precision, detectable effect, variance, or a comparable quantitative rationale.
strict_stopping_threshold_present: true only for an explicit threshold/event that determines stopping or a decision; vague 'until enough data' does not count.
measurement_reliability_plan_present: true only when the plan specifies a procedure such as independent double-coding, inter-rater agreement, repeated measurement calibration, or explicit measurement-error validation.

DIFFERENTIAL SIGNATURE
baseline_noise_floor_explicit: repeated identical baseline observations are explicitly used to estimate stochastic/baseline variability before judging perturbation effects.
local_one_factor_perturbation_explicit: one input factor is varied while relevant others are held fixed in a matched comparison.
ordered_perturbation_axis_explicit: the same perturbation has an explicit numerical or ordered multi-level intensity suitable for a finite-difference/response profile.

BAYESIAN SIGNATURE
prior_uncertainty_explicit: explicit pre-data prior probabilities/distributions or formal prior uncertainty over competing hypotheses.
evidence_to_belief_update_explicit: explicit prior-to-posterior or probability update driven by observations; generic confidence language does not count.
decision_tied_to_updated_belief: an accept/stop/act rule is explicitly tied to posterior/updated probability or uncertainty.

FALSIFICATION SIGNATURE
refutable_central_claim_explicit: a central claim/hypothesis is expressed with a concrete way it could be false.
severe_or_discriminating_test_explicit: a test is explicitly designed to distinguish alternatives or place the focal claim at genuine risk of failure.
refuting_observation_predeclared: a specific observable pattern is stated in advance as grounds to reject/materially weaken a claim.

CAUSAL SIGNATURE
treatment_outcome_pair_explicit: a candidate intervention/exposure and its outcome are explicitly identified.
confounder_or_identification_assumption_explicit: at least one concrete confounder or causal-identification assumption is explicitly specified.
counterfactual_estimand_or_intervention_contrast_explicit: an explicit counterfactual/intervention contrast, causal estimand, matched control, or do-style comparison is specified.

STATE-SPACE SIGNATURE
observable_state_vector_explicit: an explicit set/vector of multiple observable state components is defined for joint tracking.
transition_relation_explicit: turn-to-turn/time-step state transition is explicitly modeled or measured.
stability_or_path_dependence_analysis_explicit: the plan explicitly analyzes stability, persistence, path dependence, transition dynamics, or related sequential behavior.

SOFTWARE-TESTING SIGNATURE
invariant_or_metamorphic_relation_explicit: an explicit invariant or expected relation across transformed inputs is stated.
test_or_failure_oracle_explicit: an explicit rule determines pass/fail or expected output relation for a test.
replay_regression_or_boundary_harness_explicit: a concrete replay/regression/boundary test suite or reproducible harness is specified.

Return only schema-constrained JSON."""

def now():
    return datetime.now(timezone.utc).isoformat()

def get_api_key():
    key=os.environ.get("OPENAI_API_KEY","")
    if key:
        return key
    if os.name=="nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER,r"Environment") as h:
                value,_=winreg.QueryValueEx(h,"OPENAI_API_KEY")
                return str(value).strip()
        except Exception:
            pass
    return ""

def score_schema():
    props={}
    for f in COUNT_FIELDS:
        props[f]={"type":"integer","minimum":0,"maximum":50}
    for f in BOOL_FIELDS:
        props[f]={"type":"boolean"}
    return {
        "type":"object",
        "properties":props,
        "required":COUNT_FIELDS+BOOL_FIELDS,
        "additionalProperties":False
    }

def output_text(resp):
    parts=[]
    for item in resp.get("output",[]):
        if item.get("type")!="message":
            continue
        for part in item.get("content",[]):
            if part.get("type")=="output_text":
                parts.append(part.get("text",""))
            elif part.get("type")=="refusal":
                raise RuntimeError("SCORER_REFUSAL")
    return "".join(parts)

def validate_score(score):
    expected=set(COUNT_FIELDS+BOOL_FIELDS)
    if set(score)!=expected:
        raise ValueError("score keys mismatch")
    for f in COUNT_FIELDS:
        if type(score[f]) is not int or score[f] < 0 or score[f] > 50:
            raise ValueError("invalid count "+f)
    for f in BOOL_FIELDS:
        if type(score[f]) is not bool:
            raise ValueError("invalid bool "+f)

def build_body(item,model):
    user_payload={
        "blind_id":item["blind_id"],
        "research_plan":item["plan_text"]
    }
    return {
        "model":model,
        "input":[
            {"role":"developer","content":[{"type":"input_text","text":INSTRUCTIONS}]},
            {"role":"user","content":[{"type":"input_text","text":json.dumps(user_payload,ensure_ascii=False)}]}
        ],
        "store":False,
        "max_output_tokens":1800,
        "reasoning":{"effort":"medium"},
        "text":{
            "format":{
                "type":"json_schema",
                "name":"research_plan_state_v02",
                "strict":True,
                "schema":score_schema()
            }
        }
    }

def request_score(key,item,model):
    body=build_body(item,model)
    payload=json.dumps(body,ensure_ascii=False).encode("utf-8")
    headers={"Authorization":f"Bearer {key}","Content-Type":"application/json"}
    last=None
    for attempt in range(1,6):
        try:
            req=urllib.request.Request(API,data=payload,headers=headers,method="POST")
            with urllib.request.urlopen(req,timeout=240) as h:
                resp=json.loads(h.read().decode("utf-8"))
            text=output_text(resp)
            score=json.loads(text)
            validate_score(score)
            return body,resp,score
        except Exception as e:
            last=repr(e)
            time.sleep(min(2**attempt,20))
    raise RuntimeError(last or "scoring failure")

def run(label):
    key=get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")
    model=MODELS[label]
    files=sorted(BLIND.glob("*.json"))
    if len(files)!=21:
        raise SystemExit(f"blind items incomplete: {len(files)}/21")
    out=BASE/"pilot"/"scoring_v02"/f"{label}-{model}"
    scores=out/"scores"
    scores.mkdir(parents=True,exist_ok=True)
    done=0
    for f in files:
        item=json.loads(f.read_text(encoding="utf-8"))
        dest=scores/f.name
        if dest.exists():
            done+=1
            continue
        body,resp,score=request_score(key,item,model)
        rec={
            "blind_id":item["blind_id"],
            "timestamp_utc":now(),
            "requested_scorer_model":model,
            "returned_scorer_model":resp.get("model"),
            "response_id":resp.get("id"),
            "response_status":resp.get("status"),
            "usage":resp.get("usage"),
            "score":score,
            "raw_scorer_response":resp
        }
        tmp=dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec,ensure_ascii=False,indent=2),encoding="utf-8")
        tmp.replace(dest)
        done+=1
        print(f"V02_SCORED {label} {done}/21 {item['blind_id']}",flush=True)
    print(f"V02_SCORING_COMPLETE {label}=21/21",flush=True)

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--scorer",choices=["primary","secondary"],required=True)
    args=ap.parse_args()
    run(args.scorer)

if __name__=="__main__":
    main()
