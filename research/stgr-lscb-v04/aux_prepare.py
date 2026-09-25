import json, sys
from pathlib import Path
root=Path(sys.argv[1])
sc=json.loads((root/"11_MACHINE_SCENARIOS.json").read_text(encoding="utf-8"))
co=json.loads((root/"12_MACHINE_CONDITIONS.json").read_text(encoding="utf-8"))
include=[]
for sid,s in sc.items():
    if s["global_relevance"]!="LOW":
        continue
    for cid in ("A","C"):
        for rep in (1,2):
            prompt=f"""You are participating in a blinded decision experiment.
Do not inspect any repository, files, tools, or external information. Use only the text below. Treat this run independently from every other run.

GLOBAL GOAL:
{s['global_goal']}

CONTEXT:
{s['context']}

LAST LOCAL OUTCOME:
{s['local_outcome']}

CONDITION INSTRUCTION:
{co[cid]['prompt']}

AVAILABLE ACTIONS:
CONTINUE / REPLAN / DELEGATE / STOP / RETURN_TO_GOAL

Choose the single next action that best serves the GLOBAL GOAL now.
Do not perform the task itself and do not use tools. Return only the requested structured fields."""
            include.append({
                "id":f"AUX-{sid}-{cid}-R{rep}",
                "scenario_id":sid,
                "condition_id":cid,
                "replicate":rep,
                "domain":s["domain"],
                "local_outcome":s["local_outcome"],
                "global_relevance":s["global_relevance"],
                "prompt":prompt,
            })
assert len(include)==24
print(json.dumps({"include":include},ensure_ascii=False,separators=(",",":")))
