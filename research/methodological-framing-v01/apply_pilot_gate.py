from __future__ import annotations
import json
from pathlib import Path

BASE=Path(__file__).resolve().parent
RESULT=BASE/"pilot"/"analysis"/"PILOT_RESULTS.json"
OUTJ=BASE/"pilot"/"analysis"/"PILOT_GATE_RESULT.json"
OUTM=BASE/"pilot"/"analysis"/"PILOT_GATE_RESULT.md"

def bin_gate(r):
    raw=r["raw_agreement"]; k=r["kappa"]
    if k is None:
        status="DEGENERATE" if raw==1 else "RED"
    elif raw>=0.85 and k>=0.65:
        status="GREEN"
    elif raw>=0.75 and k>=0.40:
        status="AMBER"
    else:
        status="RED"
    floor=r["primary_prevalence"]<0.10 or r["primary_prevalence"]>0.90
    return status,floor

def count_gate(r):
    if r["exact"]>=0.70 and r["within_one"]>=0.90: return "GREEN"
    if r["exact"]>=0.50 and r["within_one"]>=0.80: return "AMBER"
    return "RED"

def main():
    x=json.loads(RESULT.read_text(encoding="utf-8"))
    out={"binary":{},"counts":{}}
    for f,r in x["reliability"]["binary"].items():
        s,fc=bin_gate(r); out["binary"][f]={"gate":s,"floor_ceiling_risk":fc,**r}
    for f,r in x["reliability"]["counts"].items():
        out["counts"][f]={"gate":count_gate(r),**r}
    d=x["binary_plan_distance"]["between_minus_within"]
    if d>0.05: sep="USEFUL_PILOT_SEPARABILITY"
    elif d>=0.02: sep="MODEST_REFINE"
    else: sep="TOO_INSENSITIVE"
    out["structural_separability"]={"between_minus_within":d,"gate":sep}
    OUTJ.write_text(json.dumps(out,indent=2),encoding="utf-8")

    lines=["# Pilot Instrument Gate Result","","**NON-COUNTED PILOT.**","",
           f"Structural separability: **{sep}** (between-minus-within = {d:.4f})",
           "","## Binary fields","","| field | gate | floor/ceiling | raw | kappa |","|---|---|---|---:|---:|"]
    for f,r in out["binary"].items():
        k="NA" if r["kappa"] is None else f"{r['kappa']:.3f}"
        lines.append(f"| {f} | {r['gate']} | {str(r['floor_ceiling_risk'])} | {r['raw_agreement']:.3f} | {k} |")
    lines += ["","## Count fields","","| field | gate | exact | within one | MAE |","|---|---|---:|---:|---:|"]
    for f,r in out["counts"].items():
        lines.append(f"| {f} | {r['gate']} | {r['exact']:.3f} | {r['within_one']:.3f} | {r['mae']:.3f} |")
    OUTM.write_text("\n".join(lines)+"\n",encoding="utf-8")
    print("PILOT_GATE_APPLIED")

if __name__=="__main__":
    main()
