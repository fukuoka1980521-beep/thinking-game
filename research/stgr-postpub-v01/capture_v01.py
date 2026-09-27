from __future__ import annotations
import argparse, json
from pathlib import Path
from study_lib_v01 import capture_event, study_status

BASE = Path(__file__).resolve().parent

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--track", choices=["RQ-A","RQ-B"], required=True)
    ap.add_argument("--input", required=True)
    args=ap.parse_args()
    row=json.loads(Path(args.input).read_text(encoding="utf-8-sig"))
    out=capture_event(BASE,args.track,row)
    print(json.dumps(out,ensure_ascii=False,indent=2))
    print(json.dumps(study_status(BASE),ensure_ascii=False,indent=2))

if __name__=="__main__":
    main()
