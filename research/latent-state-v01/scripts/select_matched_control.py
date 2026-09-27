#!/usr/bin/env python3
"""Deterministic matched ordinary control selector for OLSR.

Selection rule:
NEAREST_PRIOR_ORDINARY_SAME_PROJECT

The input trace index must describe already-existing ordinary work. This tool
never creates an ordinary task for research.
"""
from __future__ import annotations

import argparse
import json
from datetime import datetime
from pathlib import Path
from typing import Any

from analyze_latent_structure import CORE_FEATURES

PRIVACY_PASS = "PASS_NO_SECRET_OR_IDENTIFYING_RAW_CONTENT"
SELECTION_RULE = "NEAREST_PRIOR_ORDINARY_SAME_PROJECT"


def parse_time(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


def load_jsonl(path: Path) -> list[dict[str, Any]]:
    rows = []
    if not path.exists():
        return rows
    for raw in path.read_text(encoding="utf-8").splitlines():
        if raw.strip():
            rows.append(json.loads(raw))
    return rows


def complete_features(features: Any) -> bool:
    if not isinstance(features, dict):
        return False
    if set(features) != set(CORE_FEATURES):
        return False
    return all(features[k] in (0, 1, None) for k in CORE_FEATURES)


def select_control(target: dict[str, Any], traces: list[dict[str, Any]]) -> dict[str, Any]:
    if target.get("case_role") != "TARGET_EVENT":
        return {"status": "INVALID_TARGET", "selected": False}
    if target.get("dataset_role") != "PROSPECTIVE":
        return {"status": "INVALID_TARGET_DATASET_ROLE", "selected": False}
    if not target.get("case_id") or not target.get("project") or not target.get("captured_at"):
        return {"status": "INVALID_TARGET_IDENTITY", "selected": False}

    target_time = parse_time(target["captured_at"])
    candidates = []
    for trace in traces:
        if trace.get("project") != target["project"]:
            continue
        if trace.get("ordinary_eligible") is not True:
            continue
        if trace.get("target_event_eligible") is not False:
            continue
        if trace.get("used_as_control") is True:
            continue
        if trace.get("privacy_review") != PRIVACY_PASS:
            continue
        if not trace.get("evidence_refs"):
            continue
        if not complete_features(trace.get("observed_features")):
            continue
        try:
            t = parse_time(trace["captured_at"])
        except Exception:
            continue
        if t >= target_time:
            continue
        candidates.append((t, str(trace.get("trace_id") or ""), trace))

    if not candidates:
        return {
            "status": "NO_MATCHED_CONTROL_AVAILABLE",
            "selected": False,
            "selection_rule": SELECTION_RULE,
        }

    candidates.sort(key=lambda item: (item[0], item[1]), reverse=True)
    _, trace_id, trace = candidates[0]
    control_id = str(trace.get("case_id") or f"OLSR-CTRL-{target['case_id']}-{trace_id}")
    draft = {
        "case_id": control_id,
        "captured_at": trace["captured_at"],
        "project": trace["project"],
        "track": target["track"],
        "dataset_role": "PROSPECTIVE",
        "natural_case": True,
        "parent_case_id": None,
        "question_or_task_fingerprint": trace.get("question_or_task_fingerprint"),
        "summary": trace.get("summary") or "Matched ordinary workflow control",
        "context_delta": trace.get("context_delta"),
        "evidence_set_summary": trace.get("evidence_set_summary"),
        "core_claim_or_action_diff": None,
        "classification": "MATCHED_ORDINARY_CONTROL",
        "epistemic_failure_views": [],
        "claim_state": trace.get("claim_state", "UNKNOWN"),
        "impact": None,
        "intervention": None,
        "outcome": trace.get("outcome"),
        "hypothesis_status": "NOT_APPLICABLE",
        "observed_features": trace["observed_features"],
        "embedding": trace.get("embedding"),
        "embedding_model": trace.get("embedding_model"),
        "embedding_generated_at": trace.get("embedding_generated_at"),
        "text_for_topic_model": trace.get("text_for_topic_model"),
        "topic_tokens": trace.get("topic_tokens"),
        "evidence_refs": trace["evidence_refs"],
        "notes": trace.get("notes"),
        "case_role": "MATCHED_ORDINARY_CONTROL",
        "matched_case_id": target["case_id"],
        "eligibility_basis": "PREEXISTING_ORDINARY_NON_TARGET_TRACE",
        "materiality_reason": None,
        "selection_rule": SELECTION_RULE,
        "privacy_review": PRIVACY_PASS,
    }
    return {
        "status": "MATCHED_CONTROL_SELECTED",
        "selected": True,
        "selection_rule": SELECTION_RULE,
        "selected_trace_id": trace_id,
        "control_draft": draft,
        "note": "Descriptive specificity control only; not causal evidence.",
    }


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--target", required=True, type=Path)
    p.add_argument("--traces", required=True, type=Path)
    p.add_argument("--output", type=Path)
    args = p.parse_args()

    target = json.loads(args.target.read_text(encoding="utf-8"))
    traces = load_jsonl(args.traces)
    result = select_control(target, traces)
    rendered = json.dumps(result, ensure_ascii=False, indent=2)
    if args.output:
        args.output.write_text(rendered + "\n", encoding="utf-8")
    else:
        print(rendered)


if __name__ == "__main__":
    main()
