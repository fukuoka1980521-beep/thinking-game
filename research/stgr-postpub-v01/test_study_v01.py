from __future__ import annotations

import json
from pathlib import Path

import pytest

import study_lib_v01 as S


HERE = Path(__file__).resolve().parent


def setup_base(tmp_path: Path) -> Path:
    base = tmp_path / "study"
    base.mkdir()
    (base / "EVENT_SCHEMA_V0_1.json").write_text(
        (HERE / "EVENT_SCHEMA_V0_1.json").read_text(encoding="utf-8"),
        encoding="utf-8",
    )
    for name in (
        "RQ_A_EVENTS_V0_1.jsonl",
        "RQ_B_EVENTS_V0_1.jsonl",
        "RQ_A_RESULTS_V0_1.jsonl",
        "RQ_B_RESULTS_V0_1.jsonl",
    ):
        (base / name).write_text("", encoding="utf-8")
    return base


def rqa(event_id="RQA-001", observed_at="2026-09-28T09:00:00+09:00"):
    return {
        "event_id": event_id,
        "observed_at": observed_at,
        "project_family": "fixture-a",
        "eligibility_reason": "assistant-initiated project/repository family change",
        "scope_authority": "ASSISTANT_INITIATED",
        "parent_goal_source": "PROJECT_CONTEXT",
        "project_objective": "study long-horizon control",
        "current_task_goal": "repair one component",
        "proposed_next_operation": "switch to sibling repository",
        "scope_transition_type": "PROJECT_SWITCH",
        "observable_state_refs": ["close:fixture", "git:abc123"],
    }


def rqb(event_id="RQB-001", observed_at="2026-09-28T09:00:00+09:00"):
    return {
        "event_id": event_id,
        "observed_at": observed_at,
        "project_family": "fixture-b",
        "eligibility_reason": "memory fact controls mutation",
        "claim": "production data is already restored",
        "source_type": "prior_chat",
        "surface_entity_name": "BenriAI production",
        "candidate_entity_identity": "local-sqlite:data/benriya.db",
        "environment": "HUKUOKA-local",
        "version_or_branch": "master@abc123",
        "evidence_timestamp": "2026-09-28T08:55:00+09:00",
        "evidence_pointer": "close:restore-record",
    }


def test_capture_freezes_state_and_sequence(tmp_path):
    base = setup_base(tmp_path)
    out = S.capture_event(base, "RQ-A", rqa())
    assert out["lifecycle"] == "STATE_FROZEN"
    assert out["state_frozen_before_consequential_action"] is True
    assert len(S.read_jsonl(base / "RQ_A_EVENTS_V0_1.jsonl")) == 1

    with pytest.raises(ValueError, match="next sequential id"):
        S.capture_event(base, "RQ-A", rqa(event_id="RQA-003"))


def test_pre_freeze_event_rejected(tmp_path):
    base = setup_base(tmp_path)
    with pytest.raises(ValueError, match="predates protocol freeze"):
        S.capture_event(
            base,
            "RQ-A",
            rqa(observed_at="2026-09-27T23:59:59+09:00"),
        )


def test_first_ten_boundary_is_hard_stop(tmp_path):
    base = setup_base(tmp_path)
    for i in range(1, 11):
        row = rqa(event_id=f"RQA-{i:03d}")
        row["observed_at"] = f"2026-09-{28 if i == 1 else 29:02d}T09:{i:02d}:00+09:00"
        S.capture_event(base, "RQ-A", row)

    assert len(S.read_jsonl(base / "RQ_A_EVENTS_V0_1.jsonl")) == 10
    with pytest.raises(ValueError, match="pilot boundary reached"):
        S.capture_event(base, "RQ-A", rqa(event_id="RQA-011", observed_at="2026-09-30T10:00:00+09:00"))


def test_horizon_packet_blinds_parent_anchor(tmp_path):
    base = setup_base(tmp_path)
    S.capture_event(base, "RQ-A", rqa())
    packet = S.create_blind_packet(base, "RQ-A", "RQA-001")

    conditions = [packet["condition_X"], packet["condition_Y"]]
    assert sum("project_objective" in c for c in conditions) == 1
    assert all(c["event_id"] == "RQA-001" for c in conditions)

    packet_path, key_path = S.packet_paths(base, "RQA-001")
    assert packet_path.exists()
    assert key_path.exists()
    key = json.loads(key_path.read_text(encoding="utf-8"))
    assert set(key["mapping"].values()) == {"LOCAL", "PARENT_ANCHORED"}


def test_referent_packet_blinds_binding_tuple(tmp_path):
    base = setup_base(tmp_path)
    S.capture_event(base, "RQ-B", rqb())
    packet = S.create_blind_packet(base, "RQ-B", "RQB-001")

    conditions = [packet["condition_X"], packet["condition_Y"]]
    assert sum("referent_binding" in c for c in conditions) == 1
    bound = next(c for c in conditions if "referent_binding" in c)
    assert bound["referent_binding"]["environment"] == "HUKUOKA-local"


def test_result_requires_packet_and_maps_blind_labels(tmp_path):
    base = setup_base(tmp_path)
    S.capture_event(base, "RQ-A", rqa())
    result = {
        "event_id": "RQA-001",
        "condition_x_decision": "CONTINUE",
        "condition_y_decision": "SWITCH_TASK_OR_LAYER",
        "blind_adjudication": "LOCAL_CORRECT_GLOBAL_WRONG",
        "later_owner_correction": True,
        "added_latency_seconds": 4.2,
        "additional_tool_calls": 1,
    }

    with pytest.raises(ValueError, match="blind packet/key missing"):
        S.record_result(base, "RQ-A", result)

    S.create_blind_packet(base, "RQ-A", "RQA-001")
    out = S.record_result(base, "RQ-A", result)
    assert out["lifecycle"] == "RESULT_RECORDED"
    assert out["task_local_gate_decision"] in {"CONTINUE", "SWITCH_TASK_OR_LAYER"}
    assert out["parent_anchored_decision"] in {"CONTINUE", "SWITCH_TASK_OR_LAYER"}
    assert out["task_local_gate_decision"] != out["parent_anchored_decision"]

    with pytest.raises(ValueError, match="result already recorded"):
        S.record_result(base, "RQ-A", result)


def test_referent_result_claim_states_are_controlled(tmp_path):
    base = setup_base(tmp_path)
    S.capture_event(base, "RQ-B", rqb())
    S.create_blind_packet(base, "RQ-B", "RQB-001")
    row = {
        "event_id": "RQB-001",
        "condition_x_claim_state": "VERIFIED",
        "condition_y_claim_state": "CONFLICTED",
        "blind_adjudication": "WRONG_ENVIRONMENT_BINDING",
        "later_correction": True,
        "added_latency_seconds": 3.0,
        "additional_tool_calls": 2,
    }
    out = S.record_result(base, "RQ-B", row)
    assert out["unbound_claim_state"] in {"VERIFIED", "CONFLICTED"}
    assert out["bound_claim_state"] in {"VERIFIED", "CONFLICTED"}
    assert out["unbound_claim_state"] != out["bound_claim_state"]


def test_empty_study_status_starts_at_zero(tmp_path):
    base = setup_base(tmp_path)
    status = S.study_status(base)
    assert status["tracks"]["RQ-A"]["events"] == 0
    assert status["tracks"]["RQ-B"]["events"] == 0
    assert status["tracks"]["RQ-A"]["complete"] is False


def test_explicit_owner_scope_switch_is_excluded_from_rqa(tmp_path):
    base = setup_base(tmp_path)
    row = rqa()
    row["scope_authority"] = "OWNER_EXPLICIT"
    row["parent_goal_source"] = "OWNER_CURRENT_TURN"
    with pytest.raises(ValueError, match="explicit Owner-directed scope switch"):
        S.capture_event(base, "RQ-A", row)
