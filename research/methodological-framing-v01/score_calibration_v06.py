from __future__ import annotations
import argparse, json, os, time, urllib.request
from datetime import datetime, timezone
from pathlib import Path

BASE = Path(__file__).resolve().parent
ROOT = BASE / "calibration_v06"
BLIND = ROOT / "blind"
CFG = json.loads((BASE / "CALIBRATION_V06_SCHEMA.json").read_text(encoding="utf-8-sig"))
API = "https://api.openai.com/v1/responses"
MODELS = {"primary": "gpt-6-sol", "secondary": "gpt-5.6-terra"}
ARTIFACTS = list(CFG["artifacts"].values())

DEFINITIONS = {
    "differential_baseline_gradient_artifact":
        "True only if BOTH are explicit: (1) repeated unchanged/baseline observations used to estimate background or stochastic variation, AND (2) the same named factor is varied across at least two ordered non-baseline levels while relevant other factors are intended to remain fixed.",
    "bayesian_prior_update_artifact":
        "True only if BOTH are explicit: (1) a quantified prior probability, odds, probability distribution, or formal quantified prior uncertainty, AND (2) evidence is mapped to a posterior probability/distribution, Bayes factor, posterior odds, or another quantified belief update.",
    "falsification_rejection_rule_artifact":
        "True only if the plan explicitly maps a specific observable result to rejection or material weakening of a named claim or hypothesis. Generic falsifiability language is false.",
    "causal_identification_artifact":
        "True only if BOTH are explicit: (1) a causal estimand or intervention/counterfactual contrast to estimate, AND (2) an identification strategy or concrete identifying assumption linked to that estimand. Naming confounding alone is false.",
    "state_transition_artifact":
        "True only if BOTH are explicit: (1) at least two observable state components are intended to be tracked at ordered times, turns, or stages, AND (2) an explicit relation, model, or equation links earlier state to later state.",
    "test_oracle_artifact":
        "True only if ALL are explicit: (1) a concrete test input, transformation, or fixed replay case, (2) an expected output, invariant, or relation, AND (3) a criterion under which violation counts as a failure.",
}

INSTRUCTIONS = """You are a condition-blinded research-methodology coder.

Score only explicit operational content in the supplied research plan.
Do not infer the hidden prompting condition.
A method name, slogan, heading, or vague intention alone never counts.

For every artifact return:
- present: true or false
- evidence: 1 or 2 minimal EXACT substrings copied verbatim from the research plan if present=true; otherwise []

Rules:
1. Every required part of the artifact definition must be established by the quoted evidence.
2. Evidence must be literal substrings of the plan, not paraphrases.
3. If you cannot quote exact evidence establishing every required part, present=false.
4. Do not use the blind_id as evidence.
5. Return only schema-constrained JSON.

ARTIFACT DEFINITIONS:
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

def artifact_schema():
    return {
        "type": "object",
        "properties": {
            "present": {"type": "boolean"},
            "evidence": {
                "type": "array",
                "items": {"type": "string", "minLength": 1, "maxLength": 800},
                "maxItems": 2,
            },
        },
        "required": ["present", "evidence"],
        "additionalProperties": False,
    }

def score_schema():
    return {
        "type": "object",
        "properties": {f: artifact_schema() for f in ARTIFACTS},
        "required": ARTIFACTS,
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

def validate_score(score, plan_text):
    if set(score) != set(ARTIFACTS):
        raise ValueError("artifact keys mismatch")
    for field in ARTIFACTS:
        row = score[field]
        if set(row) != {"present", "evidence"}:
            raise ValueError("artifact row keys mismatch: " + field)
        if type(row["present"]) is not bool:
            raise ValueError("present is not bool: " + field)
        evidence = row["evidence"]
        if not isinstance(evidence, list) or len(evidence) > 2:
            raise ValueError("bad evidence list: " + field)
        if row["present"]:
            if not (1 <= len(evidence) <= 2):
                raise ValueError("true without evidence: " + field)
            for span in evidence:
                if not isinstance(span, str) or not span or span not in plan_text:
                    raise ValueError("evidence not exact substring: " + field)
        else:
            if evidence != []:
                raise ValueError("false with evidence: " + field)

def request_score(key, item, model):
    payload = {"blind_id": item["blind_id"], "research_plan": item["plan_text"]}
    body = {
        "model": model,
        "input": [
            {"role": "developer", "content": [{"type": "input_text", "text": INSTRUCTIONS}]},
            {"role": "user", "content": [{"type": "input_text", "text": json.dumps(payload, ensure_ascii=False)}]},
        ],
        "store": False,
        "max_output_tokens": 2600,
        "reasoning": {"effort": "medium"},
        "text": {
            "format": {
                "type": "json_schema",
                "name": "methodological_framing_calibration_v06",
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
            validate_score(score, item["plan_text"])
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
        print(f"CAL_V06_SCORED {label} {done}/42 {item['blind_id']}", flush=True)
    print(f"CAL_V06_SCORING_COMPLETE {label}=42/42", flush=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--scorer", choices=["primary", "secondary"], required=True)
    args = ap.parse_args()
    run(args.scorer)

if __name__ == "__main__":
    main()
