from __future__ import annotations
import json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CFG = json.loads((ROOT / "FEASIBILITY_CONFIG.json").read_text(encoding="utf-8-sig"))

def fetch_json(url):
    with urllib.request.urlopen(url, timeout=30) as h:
        body = json.loads(h.read().decode("utf-8"))
        return body, h.geturl(), dict(h.headers.items())

def main():
    out = {}
    for stage, model_id in CFG["models"].items():
        url = f"https://huggingface.co/{model_id}/resolve/main/config.json"
        config, final_url, headers = fetch_json(url)
        commit = headers.get("X-Repo-Commit") or headers.get("x-repo-commit")
        if not commit and "/api/resolve-cache/models/" in final_url:
            commit = final_url.split("/api/resolve-cache/models/", 1)[1].split("/", 2)[2].split("/", 1)[0]
        out[stage] = {
            "model_id": model_id,
            "resolved_commit": commit,
            "config_etag": headers.get("ETag") or headers.get("etag"),
            "architecture": config.get("architectures"),
            "model_type": config.get("model_type"),
            "hidden_size": config.get("hidden_size"),
            "num_hidden_layers": config.get("num_hidden_layers"),
            "num_attention_heads": config.get("num_attention_heads"),
            "vocab_size": config.get("vocab_size"),
            "max_position_embeddings": config.get("max_position_embeddings"),
            "resolved_url": final_url,
        }
    dims = {
        (
            tuple(v["architecture"] or []),
            v["model_type"],
            v["hidden_size"],
            v["num_hidden_layers"],
            v["num_attention_heads"],
            v["vocab_size"],
            v["max_position_embeddings"],
        )
        for v in out.values()
    }
    result = {
        "status": "PASS" if len(dims) == 1 else "FAIL_ARCHITECTURE_MISMATCH",
        "stages": out,
        "shared_architecture_signature_count": len(dims),
    }
    dest = ROOT / "MODEL_LINEAGE_PROBE.json"
    dest.write_text(json.dumps(result, indent=2), encoding="utf-8")
    print("MODEL_LINEAGE_PROBE=" + result["status"])
    for stage, v in out.items():
        print(stage, v["resolved_commit"], v["hidden_size"], v["num_hidden_layers"])

if __name__ == "__main__":
    main()
