from __future__ import annotations
import json
import run_calibration_v03 as base

bank = json.loads(base.BANK.read_text(encoding="utf-8"))
task = next(x for x in bank["tasks"] if x["id"] == "T1")
cond = next(x for x in bank["conditions"] if x["id"] == "GENERIC")
key = base.get_api_key()
if not key:
    raise SystemExit("OPENAI_API_KEY missing")
prompt = base.prompt_for(task["objective"], cond["instruction"])
_, resp = base.call(
    key,
    bank["acting_model"],
    bank["reasoning_effort"],
    8000,
    prompt,
)
print("STATUS=" + str(resp.get("status")))
print("INCOMPLETE=" + str(resp.get("incomplete_details")))
print("OUTPUT_TOKENS=" + str((resp.get("usage") or {}).get("output_tokens")))
print("MODEL=" + str(resp.get("model")))
print("RESPONSE_ID=" + str(resp.get("id")))
