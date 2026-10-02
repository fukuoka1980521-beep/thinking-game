from __future__ import annotations
import json, urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent
CFG = json.loads((ROOT / "FEASIBILITY_CONFIG.json").read_text(encoding="utf-8-sig"))

def head(url):
    req = urllib.request.Request(url, method="HEAD")
    with urllib.request.urlopen(req, timeout=30) as h:
        return h.geturl(), dict(h.headers.items())

def commit_from(final_url, headers):
    c = headers.get("X-Repo-Commit") or headers.get("x-repo-commit")
    if c:
        return c
    marker = "/api/resolve-cache/models/"
    if marker in final_url:
        rest = final_url.split(marker, 1)[1]
        return rest.split("/", 3)[2]
    return None

def main():
    rows = {}
    for stage, model_id in CFG["models"].items():
        files = {}
        for name in ["tokenizer.json", "tokenizer_config.json", "special_tokens_map.json"]:
            url = f"https://huggingface.co/{model_id}/resolve/main/{name}"
            try:
                final_url, headers = head(url)
                files[name] = {
                    "etag": headers.get("ETag") or headers.get("etag"),
                    "content_length": headers.get("Content-Length") or headers.get("content-length"),
                    "commit": commit_from(final_url, headers),
                }
            except Exception as e:
                files[name] = {"error": type(e).__name__ + ":" + str(e)}
        rows[stage] = {"model_id": model_id, "files": files}

    tokenizer_etags = {
        v["files"].get("tokenizer.json", {}).get("etag")
        for v in rows.values()
        if v["files"].get("tokenizer.json", {}).get("etag")
    }
    result = {
        "status": "PASS_SAME_TOKENIZER" if len(tokenizer_etags) == 1 else "CHECK_TOKENIZER_DIFFERENCE",
        "tokenizer_json_unique_etags": sorted(tokenizer_etags),
        "stages": rows,
    }
    (ROOT / "TOKENIZER_LINEAGE_PROBE.json").write_text(
        json.dumps(result, indent=2), encoding="utf-8"
    )
    print("TOKENIZER_LINEAGE_PROBE=" + result["status"])
    print("UNIQUE_TOKENIZER_JSON_ETAGS=" + str(len(tokenizer_etags)))
    for stage, row in rows.items():
        print(stage, row["files"].get("tokenizer.json", {}).get("etag"))

if __name__ == "__main__":
    main()
