from __future__ import annotations
import argparse, json, os, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v05"
BLIND = ROOT / "blind"
CFG = json.loads((BASE / "CALIBRATION_V05_SCHEMA.json").read_text(encoding="utf-8"))
API = "https://api.openai.com/v1/responses"
MODELS = {"primary": "gpt-6-sol", "secondary": "gpt-5.6-terra"}
COUNT_FIELDS = CFG["count_fields"]
BOOL_FIELDS = CFG["boolean_fields"]

DEFINITIONS = {
    "primary_endpoint_explicit":
        "True only if one or more outcomes/metrics are explicitly designated primary, main, core, or the principal basis for the conclusion. A mere list of measurements is false.",
    "sample_size_or_precision_rationale_present":
        "True only if sample size or repetitions are justified by power, precision, uncertainty, variance, detectable effect, or another quantitative adequacy rationale.",
    "explicit_null_hypothesis_present":
        "True only if a concrete no-effect, no-difference, or null proposition is explicitly stated. Merely listing competing explanations is false.",
    "concrete_decision_or_stop_rule_present":
        "True only if a specific observable threshold, criterion, or event is explicitly linked to a research decision or stopping action. Generic 'stop when evidence is sufficient' is false.",
    "baseline_noise_floor_explicit":
        "True only if repeated unchanged/baseline observations are explicitly used to estimate stochastic/background variability before interpreting perturbation effects.",
    "graded_single_factor_perturbation_explicit":
        "True only if one named input factor is varied across at least two ordered or numerical non-baseline levels while other relevant factors are intended to remain fixed.",
    "quantified_prior_or_prior_distribution_explicit":
        "True only if a pre-data prior probability, odds, probability distribution, or explicitly quantified prior uncertainty is specified. The word 'prior' alone is false.",
    "posterior_or_quantified_belief_update_explicit":
        "True only if observations are explicitly mapped to posterior probabilities/distributions, Bayes factors, odds, or another quantified belief update.",
    "claim_observation_rejection_pair_explicit":
        "True only if the plan contains an explicit pair: a substantive claim/hypothesis AND a specific observable result that would reject or materially weaken that same claim.",
    "active_disconfirmation_search_explicit":
        "True only if the design deliberately searches for counterexamples, adversarial cases, severe tests, or evidence selected specifically to disconfirm a central claim.",
    "causal_estimand_explicit":
        "True only if the plan explicitly defines a causal quantity or intervention contrast to estimate, such as an average treatment effect or outcome under intervention versus counterfactual.",
    "identification_strategy_assumption_pair_explicit":
        "True only if the plan names a causal identification strategy AND at least one concrete assumption required by that strategy, linked together. Naming confounding alone is false.",
    "time_indexed_observable_state_components_explicit":
        "True only if two or more observable state components are explicitly defined and intended to be measured repeatedly across ordered times, turns, or stages.",
    "transition_relation_explicit":
        "True only if the plan explicitly analyzes or models how observable state at one time/turn/stage relates to state at a later one.",
    "concrete_test_case_expected_relation_pair_explicit":
        "True only if a specific test input/transformation/case is paired with an explicit expected invariant, relation, or output property whose violation would constitute a test failure.",
    "repeatable_regression_harness_explicit":
        "True only if the plan specifies a repeatable test suite, replay procedure, automated harness, or fixed regression set intended to be rerun consistently across conditions or versions.",
}

INSTRUCTIONS = """You are a condition-blinded research-methodology coder.
Score only explicit operational content in the supplied research plan.
Do not infer the hidden prompt condition.
Do not give credit for a method name, slogan, heading, or vague intention alone.
For every field, apply the definition literally. If a required relation has multiple parts, all parts must be explicit in the plan.
Return only schema-constrained JSON.

FIELD DEFINITIONS:
""" + "\n".join(f"{k}: {v}" for k, v in DEFINITIONS.items())

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
    payload = {"blind_id": item["blind_id"], "research_plan": item["plan_text"]}
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
                "name": "methodological_framing_calibration_v05",
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
            if resp.get("status") != "completed" or resp.get("incomplete_details") is not None:
                raise RuntimeError("incomplete scorer response")
            if resp.get("model") != model:
                raise RuntimeError("scorer model mismatch")
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
        print(f"CAL_V05_SCORED {label} {done}/42 {item['blind_id']}", flush=True)
    print(f"CAL_V05_SCORING_COMPLETE {label}=42/42")

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scorer", choices=["primary", "secondary"], required=True)
    args = ap.parse_args()
    run(args.scorer)

if __name__ == "__main__":
    main()
