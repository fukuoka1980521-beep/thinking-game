from __future__ import annotations
import json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CFG = json.loads((ROOT / "FEASIBILITY_CONFIG.json").read_text(encoding="utf-8-sig"))

def main():
    out = {}
    for stage, model_id in CFG["models"].items():
        url = "https://huggingface.co/api/models/" + model_id + "?blobs=true"
        with urllib.request.urlopen(url, timeout=30) as h:
            j = json.loads(h.read().decode("utf-8"))
        weights = [
            x for x in j.get("siblings", [])
            if (
                x.get("rfilename", "").endswith(".safetensors")
                or x.get("rfilename", "").endswith(".bin")
            )
            and ".index." not in x.get("rfilename", "")
        ]
        total = sum(int(x.get("size") or 0) for x in weights)
        out[stage] = {
            "model_id": model_id,
            "weight_files": [
                {"name": x["rfilename"], "bytes": x.get("size")} for x in weights
            ],
            "weight_bytes": total,
            "weight_gib": total / (1024 ** 3),
        }
    result = {
        "stages": out,
        "all_four_weight_gib": sum(x["weight_gib"] for x in out.values()),
        "policy": "pilot sequential cache; do not retain all four unless needed",
    }
    (ROOT / "MODEL_STORAGE_PROBE.json").write_text(
        json.dumps(result, indent=2), encoding="utf-8"
    )
    for stage, row in out.items():
        print(stage, f"{row['weight_gib']:.3f} GiB")
    print("ALL_FOUR", f"{result['all_four_weight_gib']:.3f} GiB")

if __name__ == "__main__":
    main()
