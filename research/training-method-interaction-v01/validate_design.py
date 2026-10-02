from __future__ import annotations
import hashlib, json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
PARENT = ROOT.parent
CFG = ROOT / "FEASIBILITY_CONFIG.json"
OLD = PARENT / "methodological-framing-v01"

def sha(path: Path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def main():
    cfg = json.loads(CFG.read_text(encoding="utf-8-sig"))
    assert list(cfg["models"]) == ["BASE", "SFT", "DPO", "RLVR"]
    assert len(set(cfg["models"].values())) == 4
    assert len(cfg["methods"]) == 7
    assert set(cfg["tasks"]) == {"T1", "T2", "T3"}

    mb = json.loads(
        (OLD / "FROZEN_STUDY_A_METHOD_BANK_V1_0.json").read_text(encoding="utf-8-sig")
    )
    prior = {
        x["family"]: x["instruction"]
        for x in mb["conditions"]
        if x["depth"] == "LABEL_ONLY"
    }
    assert cfg["methods"] == prior

    tb = json.loads(
        (OLD / "FROZEN_REPLICATION_R1_TASK_BANK_V1_0.json").read_text(encoding="utf-8-sig")
    )
    prior_tasks = {x["id"]: x["objective"] for x in tb["tasks"]}
    assert cfg["tasks"] == prior_tasks

    runner = (ROOT / "run_feasibility.py").read_text(encoding="utf-8")
    forbidden = [
        "api.openai.com",
        "OPENAI_API_KEY",
        "anthropic",
        "gemini",
    ]
    for item in forbidden:
        assert item not in runner, item

    print("DESIGN_VALIDATION=PASS")
    print("METHODS_EXACT_PRIOR_LABEL_ONLY=TRUE")
    print("TASKS_EXACT_PRIOR_T1_T2_T3=TRUE")
    print("PAID_API_ENDPOINTS_IN_RUNNER=0")
    print("CONFIG_SHA256=" + sha(CFG))
    print("RUNNER_SHA256=" + sha(ROOT / "run_feasibility.py"))

if __name__ == "__main__":
    main()
