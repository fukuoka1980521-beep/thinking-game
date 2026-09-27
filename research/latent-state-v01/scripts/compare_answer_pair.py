#!/usr/bin/env python3
"""Deterministic comparison for materially-same-question answer pairs.

This tool does not judge truth or hallucination. It separates:
- explained variance caused by context/evidence/model differences
- stable core answers despite wording differences
- materially different core claims/decisions/actions that require review

Inputs should contain structured, privacy-safe summaries rather than raw private chats.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


def norm_set(values):
    if values is None:
        return set()
    return {str(v).strip() for v in values if str(v).strip()}


def compare(packet: dict[str, Any]) -> dict[str, Any]:
    required = {"pair_id", "question_fingerprint", "answer_a", "answer_b"}
    missing = sorted(required - set(packet))
    if missing:
        raise ValueError("missing required fields: " + ", ".join(missing))

    a = packet["answer_a"]
    b = packet["answer_b"]

    qa = str(a.get("question_fingerprint") or packet["question_fingerprint"]).strip()
    qb = str(b.get("question_fingerprint") or packet["question_fingerprint"]).strip()
    if qa != qb:
        return {
            "pair_id": packet["pair_id"],
            "status": "NOT_COMPARABLE_DIFFERENT_QUESTION",
            "material_variance": False,
        }

    context_a = str(a.get("context_fingerprint") or "").strip()
    context_b = str(b.get("context_fingerprint") or "").strip()
    evidence_a = norm_set(a.get("evidence_refs"))
    evidence_b = norm_set(b.get("evidence_refs"))
    model_a = str(a.get("model_or_route") or "").strip()
    model_b = str(b.get("model_or_route") or "").strip()

    claims_a = norm_set(a.get("core_claims"))
    claims_b = norm_set(b.get("core_claims"))
    actions_a = norm_set(a.get("next_actions"))
    actions_b = norm_set(b.get("next_actions"))
    decision_a = str(a.get("decision") or "").strip()
    decision_b = str(b.get("decision") or "").strip()

    context_delta = context_a != context_b
    evidence_delta = evidence_a != evidence_b
    model_delta = model_a != model_b

    claim_delta = claims_a != claims_b
    action_delta = actions_a != actions_b
    decision_delta = decision_a != decision_b

    core_delta = claim_delta or action_delta or decision_delta

    if not core_delta:
        status = "CORE_STABLE"
        material = False
    elif context_delta:
        status = "EXPLAINED_BY_CONTEXT_DELTA"
        material = False
    elif evidence_delta:
        status = "EXPLAINED_BY_EVIDENCE_DELTA"
        material = False
    elif model_delta:
        status = "MODEL_OR_ROUTE_DELTA_REVIEW"
        material = True
    else:
        status = "MATERIAL_VARIANCE_REVIEW"
        material = True

    return {
        "pair_id": packet["pair_id"],
        "status": status,
        "material_variance": material,
        "deltas": {
            "context": context_delta,
            "evidence": evidence_delta,
            "model_or_route": model_delta,
            "core_claims": claim_delta,
            "decision": decision_delta,
            "next_actions": action_delta,
        },
        "only_in_a": {
            "core_claims": sorted(claims_a - claims_b),
            "next_actions": sorted(actions_a - actions_b),
        },
        "only_in_b": {
            "core_claims": sorted(claims_b - claims_a),
            "next_actions": sorted(actions_b - actions_a),
        },
        "decision_a": decision_a or None,
        "decision_b": decision_b or None,
        "truth_judgment_allowed": False,
        "note": (
            "A variance flag means the core answer changed under materially similar "
            "structured conditions. It does not by itself identify which answer is correct."
        ),
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("packet", type=Path)
    p.add_argument("--output", type=Path)
    args = p.parse_args()

    packet = json.loads(args.packet.read_text(encoding="utf-8"))
    result = compare(packet)
    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
