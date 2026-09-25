import csv, json, sys
from pathlib import Path
from collections import defaultdict

results_dir = Path(sys.argv[1])
gold_csv = Path(sys.argv[2])
out_dir = Path(sys.argv[3])
out_dir.mkdir(parents=True, exist_ok=True)

rows=[]
for p in sorted(results_dir.glob("*.json")):
    obj=json.loads(p.read_text(encoding="utf-8"))
    if obj.get("action") not in {"CONTINUE","REPLAN","DELEGATE","STOP","RETURN_TO_GOAL"}:
        raise SystemExit(f"invalid action in {p}: {obj.get('action')}")
    rows.append(obj)

if len(rows)!=24:
    raise SystemExit(f"expected 24 results, got {len(rows)}")
if len({r["id"] for r in rows})!=24:
    raise SystemExit("duplicate result id")

with gold_csv.open(encoding="utf-8-sig", newline="") as f:
    gold={r["scenario_id"]:r for r in csv.DictReader(f)}

for r in rows:
    accepted=set(gold[r["scenario_id"]]["accepted_actions_t0"].split("|"))
    r["GDA"]=int(r["action"] in accepted)
    r["CONTINUE_LOCAL"]=int(r["action"]=="CONTINUE")

def sel(cond=None,outcome=None,domain=None):
    x=rows
    if cond is not None: x=[r for r in x if r["condition_id"]==cond]
    if outcome is not None: x=[r for r in x if r["local_outcome"]==outcome]
    if domain is not None: x=[r for r in x if r["domain"]==domain]
    return x

def mean(xs,key):
    return sum(r[key] for r in xs)/len(xs) if xs else None

a_s=sel("A","SUCCESS"); a_f=sel("A","FAILURE")
c_s=sel("C","SUCCESS"); c_f=sel("C","FAILURE")
lsci=mean(a_s,"CONTINUE_LOCAL")-mean(a_f,"CONTINUE_LOCAL")
stgr_continue_delta=mean(c_s,"CONTINUE_LOCAL")-mean(a_s,"CONTINUE_LOCAL")
stgr_gda_delta=mean(c_s,"GDA")-mean(a_s,"GDA")
failure_gda_delta=mean(c_f,"GDA")-mean(a_f,"GDA")

domains={}
for d in sorted({r["domain"] for r in rows}):
    aas=sel("A","SUCCESS",d); aaf=sel("A","FAILURE",d); ccs=sel("C","SUCCESS",d)
    domains[d]={
        "A_success_continue":mean(aas,"CONTINUE_LOCAL"),
        "A_failure_continue":mean(aaf,"CONTINUE_LOCAL"),
        "A_LSCI":mean(aas,"CONTINUE_LOCAL")-mean(aaf,"CONTINUE_LOCAL"),
        "C_success_continue":mean(ccs,"CONTINUE_LOCAL"),
        "STGR_success_continue_delta":mean(ccs,"CONTINUE_LOCAL")-mean(aas,"CONTINUE_LOCAL"),
        "A_success_GDA":mean(aas,"GDA"),
        "C_success_GDA":mean(ccs,"GDA"),
    }

summary={
    "design":"Auxiliary cross-model TURN0 probe; 6 LOW-relevance scenarios x A/C x 2 replicates = 24 independent Claude Code action sessions",
    "n":len(rows),
    "metrics":{
        "A_success_continue":mean(a_s,"CONTINUE_LOCAL"),
        "A_failure_continue":mean(a_f,"CONTINUE_LOCAL"),
        "A_LSCI":lsci,
        "A_success_GDA":mean(a_s,"GDA"),
        "A_failure_GDA":mean(a_f,"GDA"),
        "C_success_continue":mean(c_s,"CONTINUE_LOCAL"),
        "C_failure_continue":mean(c_f,"CONTINUE_LOCAL"),
        "C_success_GDA":mean(c_s,"GDA"),
        "C_failure_GDA":mean(c_f,"GDA"),
        "STGR_success_continue_delta_C_minus_A":stgr_continue_delta,
        "STGR_success_GDA_delta_C_minus_A":stgr_gda_delta,
        "Failure_GDA_delta_C_minus_A":failure_gda_delta,
    },
    "domains":domains,
    "interpretation":{
        "H1_aux_direction":"SUPPORTED" if lsci>0 else ("NULL_DIRECTION" if lsci==0 else "OPPOSITE_DIRECTION"),
        "STGR_aux_direction":"SUPPORTED" if (stgr_continue_delta<0 and stgr_gda_delta>=0) else "NOT_SUPPORTED",
        "note":"Auxiliary evidence only. This is not the pre-registered Gemini v0.4 and does not replace H1-H6 primary analysis."
    }
}
(out_dir/"summary.json").write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding="utf-8")

fields=["id","scenario_id","condition_id","replicate","domain","local_outcome","global_relevance","action","GDA","CONTINUE_LOCAL","rationale"]
with (out_dir/"scored.csv").open("w",encoding="utf-8",newline="") as f:
    w=csv.DictWriter(f,fieldnames=fields)
    w.writeheader()
    w.writerows({k:r.get(k,"") for k in fields} for r in rows)

m=summary["metrics"]
lines=[
"# STGR / LSCB Auxiliary Cross-model TURN0 Probe",
"",
"**Status:** auxiliary evidence only; not a substitute for the pre-registered Gemini v0.4.",
"",
"## Design",
"",
"Six globally LOW-relevance scenarios (3 domains x SUCCESS/FAILURE), conditions A Baseline and C STGR, two independent Claude Code action sessions per cell: n=24.",
"",
"## Aggregate results",
"",
"|Metric|Value|",
"|---|---:|",
f"|A P(CONTINUE | SUCCESS, LOW)|{m['A_success_continue']:.3f}|",
f"|A P(CONTINUE | FAILURE, LOW)|{m['A_failure_continue']:.3f}|",
f"|A LSCI|{m['A_LSCI']:.3f}|",
f"|A GDA SUCCESS×LOW|{m['A_success_GDA']:.3f}|",
f"|A GDA FAILURE×LOW|{m['A_failure_GDA']:.3f}|",
f"|C P(CONTINUE | SUCCESS, LOW)|{m['C_success_continue']:.3f}|",
f"|C GDA SUCCESS×LOW|{m['C_success_GDA']:.3f}|",
f"|C-A CONTINUE delta, SUCCESS×LOW|{m['STGR_success_continue_delta_C_minus_A']:.3f}|",
f"|C-A GDA delta, SUCCESS×LOW|{m['STGR_success_GDA_delta_C_minus_A']:.3f}|",
"",
"## Directional interpretation",
"",
f"- H1 auxiliary direction: **{summary['interpretation']['H1_aux_direction']}**.",
f"- STGR auxiliary direction: **{summary['interpretation']['STGR_aux_direction']}**.",
"",
"## Domain checks",
""
]
for d,x in domains.items():
    lines.append(f"- {d}: A-LSCI={x['A_LSCI']:.3f}; A success CONTINUE={x['A_success_continue']:.3f}; C success CONTINUE={x['C_success_continue']:.3f}; C-A success CONTINUE delta={x['STGR_success_continue_delta']:.3f}.")
lines += [
"",
"## Boundary",
"",
"This probe tests the central TURN0 mechanism on a different model family and execution surface. It is useful as convergent or disconfirming evidence, but H1-H6 remain reserved for the repaired Gemini v0.4 full trajectory experiment.",
"",
"## Raw decisions",
""
]
for r in rows:
    lines.append(f"- {r['id']}: {r['action']} — {r.get('rationale','')}")
(out_dir/"report.md").write_text("\n".join(lines)+"\n",encoding="utf-8")
print(json.dumps(summary,ensure_ascii=False))
