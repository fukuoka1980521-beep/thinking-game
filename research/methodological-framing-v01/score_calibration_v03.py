from __future__ import annotations
import argparse, json, os, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v03"
BLIND = ROOT / "blind"
CFG = json.loads((BASE / "CALIBRATION_V03_SCHEMA.json").read_text(encoding="utf-8"))
API = "https://api.openai.com/v1/responses"
MODELS = {"primary": "gpt-6-sol", "secondary": "gpt-5.6-terra"}
COUNT_FIELDS = CFG["count_fields"]
BOOL_FIELDS = CFG["boolean_fields"]

INSTRUCTIONS = """You are a condition-blinded research-methodology coder.
Score only explicit operational content in the supplied research plan.
Do not infer the hidden prompt condition.
A method name or slogan alone never counts.

COUNT FIELDS
problem_decomposition_count:
Count explicit distinct research subproblems/workstreams. Do not count headings or every procedural step.

explicit_primary_endpoint_count:
Count only metrics explicitly designated primary/main/core endpoints. Ordinary measurements do not count.

falsification_criterion_count:
Count distinct explicit mappings from an observable result to rejection/material weakening of a claim.

GENERAL BOOLEANS
sample_size_or_power_rationale_present:
True only if sample size/repetitions are justified by power, precision, detectable effect, variance, uncertainty, or comparable quantitative rationale.

explicit_null_hypothesis_present:
True only if an explicit testable no-effect/no-difference/null proposition is stated. Merely listing alternatives is false.

strict_stopping_threshold_present:
True only if a concrete threshold/event determines stopping or a decision. Generic 'stop when enough evidence' is false.

DIFFERENTIAL
baseline_noise_floor_explicit:
True only if repeated unchanged/baseline observations are explicitly used to estimate stochastic/background variability before interpreting perturbation effects.

ordered_perturbation_axis_explicit:
True only if the same perturbation factor has an ordered or numerical multi-level intensity suitable for a response profile or finite-difference comparison.

BAYESIAN
prior_uncertainty_explicit:
True only if explicit pre-data prior probabilities/distributions, prior odds, or a formal prior uncertainty representation is specified.

evidence_to_belief_update_explicit:
True only if the plan explicitly maps observations to posterior/update of probabilities or quantified belief. Generic 'update the hypothesis' is false.

FALSIFICATION
refutable_central_claim_explicit:
True only if a central claim is stated together with a concrete way it could be false.

refuting_observation_predeclared:
True only if a specific observable result is declared in advance as grounds to reject or materially weaken a claim.

CAUSAL
causal_estimand_explicit:
True only if the plan explicitly defines a causal quantity or intervention contrast to estimate, not merely an association or predictor.

identification_threat_or_assumption_explicit:
True only if at least one concrete causal identification threat/assumption is stated, such as unmeasured confounding, exchangeability, parallel trends, exclusion restriction, no interference, or selection mechanism.

intervention_or_quasi_experimental_contrast_explicit:
True only if the plan specifies an intervention/randomization or a recognized quasi-experimental contrast such as difference-in-differences, regression discontinuity, instrumental variables, interrupted time series, matched intervention/control, or target-trial emulation.

STATE SPACE
observable_state_vector_explicit:
True only if multiple observable state components are explicitly defined and intended for joint tracking.

transition_relation_explicit:
True only if the plan explicitly models or measures state at one time/turn as related to state at a later time/turn.

SOFTWARE TESTING
replay_regression_or_boundary_harness_explicit:
True only if a concrete repeatable replay, regression, boundary-case, or automated test harness is specified.

concrete_metamorphic_relation_explicit:
True only if the plan specifies both an input transformation and an expected invariant/relationship in the outputs under that transformation.

operational_test_or_failure_oracle_explicit:
True only if a concrete measurable rule determines pass/fail or classifies a failure for a test case. A vague quality criterion is false.

Return only schema-constrained JSON."""

def now():
    return datetime.now(timezone.utc).isoformat()

def get_api_key():
    key = os.environ.get("OPENAI_API_KEY", "").strip()
    if key:
        return key
    if os.name == "nt":
        try:
            import winreg
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, r"Environment") as h:
                value, _ = winreg.QueryValueEx(h, "OPENAI_API_KEY")
                return str(value).strip()
        except Exception:
            pass
    return ""

def score_schema():
    props = {f: {"type": "integer", "minimum": 0, "maximum": 50} for f in COUNT_FIELDS}
    props.update({f: {"type": "boolean"} for f in BOOL_FIELDS})
    return {
        "type": "object",
        "properties": props,
        "required": COUNT_FIELDS + BOOL_FIELDS,
        "additionalProperties": False,
    }

def output_text(resp):
    parts = []
    for item in resp.get("output", []):
        if item.get("type") != "message":
            continue
        for part in item.get("content", []):
            if part.get("type") == "output_text":
                parts.append(part.get("text", ""))
            elif part.get("type") == "refusal":
                raise RuntimeError("SCORER_REFUSAL")
    return "".join(parts)

def validate_score(score):
    expected = set(COUNT_FIELDS + BOOL_FIELDS)
    if set(score) != expected:
        raise ValueError("score keys mismatch")
    for f in COUNT_FIELDS:
        if type(score[f]) is not int or not (0 <= score[f] <= 50):
            raise ValueError("invalid count " + f)
    for f in BOOL_FIELDS:
        if type(score[f]) is not bool:
            raise ValueError("invalid bool " + f)

def request_score(key, item, model):
    payload = {
        "blind_id": item["blind_id"],
        "research_plan": item["plan_text"],
    }
    body = {
        "model": model,
        "input": [
            {"role": "developer", "content": [{"type": "input_text", "text": INSTRUCTIONS}]},
            {"role": "user", "content": [{"type": "input_text", "text": json.dumps(payload, ensure_ascii=False)}]},
        ],
        "store": False,
        "max_output_tokens": 1600,
        "reasoning": {"effort": "medium"},
        "text": {
            "format": {
                "type": "json_schema",
                "name": "methodological_framing_calibration_v03",
                "strict": True,
                "schema": score_schema(),
            }
        },
    }
    raw = json.dumps(body, ensure_ascii=False).encode("utf-8")
    last = None
    for attempt in range(1, 6):
        try:
            req = urllib.request.Request(
                API, data=raw,
                headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(req, timeout=240) as h:
                resp = json.loads(h.read().decode("utf-8"))
            score = json.loads(output_text(resp))
            validate_score(score)
            return resp, score
        except Exception as e:
            last = repr(e)
            time.sleep(min(2 ** attempt, 20))
    raise RuntimeError(last or "scoring failure")

def run(label):
    key = get_api_key()
    if not key:
        raise SystemExit("OPENAI_API_KEY missing")
    model = MODELS[label]
    files = sorted(BLIND.glob("*.json"))
    if len(files) != 42:
        raise SystemExit(f"blind calibration incomplete: {len(files)}/42")
    out = ROOT / "scoring" / f"{label}-{model}" / "scores"
    out.mkdir(parents=True, exist_ok=True)
    done = 0
    for f in files:
        item = json.loads(f.read_text(encoding="utf-8"))
        dest = out / f.name
        if dest.exists():
            done += 1
            continue
        resp, score = request_score(key, item, model)
        rec = {
            "blind_id": item["blind_id"],
            "timestamp_utc": now(),
            "requested_scorer_model": model,
            "returned_scorer_model": resp.get("model"),
            "response_id": resp.get("id"),
            "response_status": resp.get("status"),
            "usage": resp.get("usage"),
            "score": score,
            "raw_scorer_response": resp,
        }
        tmp = dest.with_suffix(".tmp")
        tmp.write_text(json.dumps(rec, ensure_ascii=False, indent=2), encoding="utf-8")
        tmp.replace(dest)
        done += 1
        print(f"CAL_V03_SCORED {label} {done}/42 {item['blind_id']}", flush=True)
    print(f"CAL_V03_SCORING_COMPLETE {label}=42/42")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scorer", choices=["primary", "secondary"], required=True)
    args = ap.parse_args()
    run(args.scorer)

if __name__ == "__main__":
    main()
